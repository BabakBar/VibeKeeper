
### Phase 5: Testing & Launch (Day 5)

#### 5.1 Backend Testing Checklist
```bash
cd backend

# 1. Run all tests
uv run pytest -v

# 2. Test API manually
uv run uvicorn main:app --reload --port 8001

# 3. Check API docs
# Visit http://localhost:8001/docs

# 4. Test each endpoint:
# - POST /api/auth/login/test
# - POST /api/occasions/extract
# - POST /api/occasions/
# - GET /api/occasions/
# - PUT /api/occasions/{id}
# - DELETE /api/occasions/{id}
```

#### 5.2 Frontend Testing Checklist
```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Manual testing flow:
# - Visit http://localhost:3000
# - Click "Get Started"
# - Login with test credentials
# - Add an occasion: "Mom's birthday is on April 15th"
# - Verify extraction works
# - Save the occasion
# - Test search/filter
# - Test delete
```

#### 5.3 Integration Testing

1. **Full Flow Test**:
   - Start backend: `cd backend && uv run uvicorn main:app --reload`
   - Start frontend: `cd frontend && npm run dev`
   - Complete user journey from login to occasion management

2. **Error Handling**:
   - Test with invalid API key
   - Test with malformed input
   - Test network errors

3. **Performance**:
   - Add 50+ occasions
   - Test search/filter performance
   - Check loading states

---
