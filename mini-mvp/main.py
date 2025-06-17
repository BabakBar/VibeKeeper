from fasthtml.common import *
from datetime import datetime, date
import os
from models import Occasion, create_tables, get_db, SessionLocal
from ai_extractor import OccasionExtractor

app, rt = fast_app()

extractor = OccasionExtractor()

@app.on_event("startup")
async def startup_event():
    create_tables()

@rt("/")
def get():
    return Titled("VibeKeeper - Occasion Tracker",
        Div(
            H1("VibeKeeper", cls="text-3xl font-bold mb-6 text-center text-blue-600"),
            P("Track important occasions with natural language", cls="text-center text-gray-600 mb-8"),
            
            Form(
                Div(
                    Label("Tell me about an occasion:", cls="block text-sm font-medium text-gray-700 mb-2"),
                    Input(
                        type="text", 
                        name="occasion_text", 
                        placeholder="e.g., 'Bahar birthday is on 04/04'",
                        cls="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    ),
                    cls="mb-4"
                ),
                Button(
                    "Add Occasion", 
                    type="submit",
                    cls="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                ),
                hx_post="/add_occasion",
                hx_target="#occasions-list",
                hx_swap="afterbegin"
            ),
            
            Div(
                Input(
                    type="text",
                    placeholder="Search occasions...",
                    cls="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
                    hx_post="/search",
                    hx_target="#occasions-list",
                    hx_trigger="keyup changed delay:300ms"
                ),
                cls="mt-6 mb-2"
            ),
            
            Div(id="occasions-list", cls="mt-8"),
            
            Script("""
                // Load all occasions on page load
                htmx.onLoad(function(content) {
                    htmx.ajax('GET', '/occasions', {target: '#occasions-list'});
                });
            """),
            
            cls="max-w-2xl mx-auto p-6"
        )
    )

@rt("/add_occasion")
def post(occasion_text: str):
    if not occasion_text.strip():
        return P("Please enter some text", cls="text-red-500")
    
    extracted_data = extractor.extract_occasion_data(occasion_text)
    
    if not extracted_data:
        return P("Sorry, I couldn't extract occasion information from that text. Please try again with something like 'John's birthday is on March 15th'", cls="text-red-500 p-4 bg-red-50 rounded-lg mb-4")
    
    db = SessionLocal()
    try:
        occasion = Occasion(
            person=extracted_data["person"],
            occasion_type=extracted_data["occasion_type"],
            occasion_date=datetime.strptime(extracted_data["date"], "%Y-%m-%d").date(),
            raw_input=occasion_text
        )
        db.add(occasion)
        db.commit()
        db.refresh(occasion)
        
        return occasion_card(occasion)
        
    except Exception as e:
        db.rollback()
        return P(f"Error saving occasion: {str(e)}", cls="text-red-500")
    finally:
        db.close()

def occasion_card(occasion):
    return Div(
        Div(
            H3(f"{occasion.person}'s {occasion.occasion_type.title()}", cls="text-lg font-semibold text-gray-800"),
            P(f"Date: {occasion.occasion_date.strftime('%B %d, %Y')}", cls="text-gray-600"),
            P(f"Added: {occasion.created_at.strftime('%m/%d/%Y at %I:%M %p')}", cls="text-sm text-gray-500"),
            Small(f"Original: \"{occasion.raw_input}\"", cls="text-xs text-gray-400 italic"),
            cls="p-4"
        ),
        cls="bg-white border border-gray-200 rounded-lg shadow-sm mb-4 hover:shadow-md transition-shadow"
    )

@rt("/occasions")
def get_occasions():
    db = SessionLocal()
    try:
        occasions = db.query(Occasion).order_by(Occasion.created_at.desc()).all()
        return Div(
            *[occasion_card(occasion) for occasion in occasions],
            cls="space-y-4"
        )
    finally:
        db.close()

@rt("/search")
def post_search(request):
    search_term = request.form.get("", "").strip()
    
    db = SessionLocal()
    try:
        if not search_term:
            occasions = db.query(Occasion).order_by(Occasion.created_at.desc()).all()
        else:
            occasions = db.query(Occasion).filter(
                (Occasion.person.ilike(f"%{search_term}%")) |
                (Occasion.occasion_type.ilike(f"%{search_term}%")) |
                (Occasion.raw_input.ilike(f"%{search_term}%"))
            ).order_by(Occasion.created_at.desc()).all()
        
        return Div(
            *[occasion_card(occasion) for occasion in occasions],
            cls="space-y-4"
        )
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)