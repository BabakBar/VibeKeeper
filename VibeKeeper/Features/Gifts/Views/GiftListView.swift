// VibeKeeper/Features/Gifts/Views/GiftListView.swift
import SwiftUI
import SwiftData

struct GiftListView: View {
    @EnvironmentObject private var giftViewModel: GiftViewModel
    @EnvironmentObject private var contactViewModel: ContactViewModel
    @State private var isAddingGift = false
    @State private var searchText = ""
    @State private var filterPurchased: Bool? = nil
    
    var body: some View {
        NavigationView {
            VStack {
                // Search and filter options
                searchAndFilterBar
                
                if giftViewModel.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if filteredGifts.isEmpty {
                    emptyStateView
                } else {
                    giftsList
                }
            }
            .navigationTitle("Gift Ideas")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        isAddingGift = true
                    }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $isAddingGift) {
                // We'll implement the GiftFormView later
                Text("Add Gift Form")
                    .presentationDetents([.medium, .large])
            }
            .onAppear {
                giftViewModel.loadGifts()
                contactViewModel.loadContacts()
            }
        }
    }
    
    // MARK: - Filtered Gifts
    
    private var filteredGifts: [GiftIdea] {
        giftViewModel.gifts.filter { gift in
            // Apply search filter
            let searchMatches = searchText.isEmpty ||
                gift.name.localizedCaseInsensitiveContains(searchText) ||
                (gift.descriptionText?.localizedCaseInsensitiveContains(searchText) ?? false)
            
            // Apply purchased filter
            let purchasedMatches = filterPurchased == nil || gift.isPurchased == filterPurchased
            
            return searchMatches && purchasedMatches
        }
    }
    
    // MARK: - Subviews
    
    private var searchAndFilterBar: some View {
        VStack {
            SearchBar(text: $searchText, placeholder: "Search gifts...")
            
            HStack {
                FilterChip(
                    title: "All",
                    isSelected: filterPurchased == nil,
                    action: { filterPurchased = nil }
                )
                
                FilterChip(
                    title: "To Buy",
                    isSelected: filterPurchased == false,
                    action: { filterPurchased = false }
                )
                
                FilterChip(
                    title: "Purchased",
                    isSelected: filterPurchased == true,
                    action: { filterPurchased = true }
                )
                
                Spacer()
            }
            .padding(.horizontal)
        }
    }
    
    private var giftsList: some View {
        List {
            ForEach(filteredGifts) { gift in
                GiftRowView(gift: gift)
                    .swipeActions {
                        Button(role: .destructive) {
                            giftViewModel.deleteGift(gift)
                        } label: {
                            Label("Delete", systemImage: "trash")
                        }
                        
                        Button {
                            giftViewModel.togglePurchased(gift)
                        } label: {
                            Label(
                                gift.isPurchased ? "Mark as Unpurchased" : "Mark as Purchased",
                                systemImage: gift.isPurchased ? "circle" : "checkmark.circle"
                            )
                        }
                        .tint(.green)
                    }
            }
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "gift")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("No gift ideas yet")
                .font(.headline)
            
            Text("Tap the + button to add your first gift idea")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            Button("Add Gift Idea") {
                isAddingGift = true
            }
            .buttonStyle(.borderedProminent)
            .padding(.top)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemGroupedBackground))
    }
}

// MARK: - Helper Views

struct GiftRowView: View {
    let gift: GiftIdea
    
    var body: some View {
        NavigationLink(destination: GiftDetailView(gift: gift)) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(gift.name)
                        .font(.headline)
                    
                    if let contact = gift.contact {
                        Text("For: \(contact.firstName) \(contact.lastName ?? "")")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    if let price = gift.price {
                        Text("$\(String(format: "%.2f", price))")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                if gift.isPurchased {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                }
            }
        }
    }
}

struct SearchBar: View {
    @Binding var text: String
    var placeholder: String
    
    var body: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.secondary)
            
            TextField(placeholder, text: $text)
                .disableAutocorrection(true)
            
            if !text.isEmpty {
                Button(action: {
                    text = ""
                }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(8)
        .background(Color(.systemGray6))
        .cornerRadius(10)
        .padding(.horizontal)
    }
}

struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .padding(.vertical, 6)
                .padding(.horizontal, 12)
                .background(isSelected ? Color.accentColor : Color(.systemGray5))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(8)
        }
    }
}

// MARK: - Placeholder Detail View (to be implemented later)

struct GiftDetailView: View {
    let gift: GiftIdea
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text(gift.name)
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                if let description = gift.descriptionText {
                    Text(description)
                        .padding(.top, 4)
                }
                
                if let price = gift.price {
                    HStack {
                        Text("Price:")
                            .fontWeight(.semibold)
                        Text("$\(String(format: "%.2f", price))")
                    }
                    .padding(.top, 4)
                }
                
                if let url = gift.sourceURL {
                    HStack {
                        Text("Source:")
                            .fontWeight(.semibold)
                        Link(url, destination: URL(string: url) ?? URL(string: "https://apple.com")!)
                    }
                    .padding(.top, 4)
                }
                
                if let contact = gift.contact {
                    HStack {
                        Text("For:")
                            .fontWeight(.semibold)
                        Text("\(contact.firstName) \(contact.lastName ?? "")")
                    }
                    .padding(.top, 4)
                }
                
                if let occasion = gift.occasion {
                    HStack {
                        Text("Occasion:")
                            .fontWeight(.semibold)
                        Text(occasion.name)
                    }
                    .padding(.top, 4)
                }
                
                HStack {
                    Text("Status:")
                        .fontWeight(.semibold)
                    Text(gift.isPurchased ? "Purchased" : "Not Purchased")
                        .foregroundColor(gift.isPurchased ? .green : .red)
                }
                .padding(.top, 4)
            }
            .padding()
        }
        .navigationTitle("Gift Details")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    let previewContainer = try! ModelContainer(for: GiftIdea.self, Contact.self, Occasion.self, Reminder.self)
    
    // Add some sample data
    let context = previewContainer.mainContext
    let contact = Contact(firstName: "John", lastName: "Doe")
    let gift1 = GiftIdea(name: "Wireless Headphones", descriptionText: "Noise cancelling", price: 199.99, isPurchased: false)
    let gift2 = GiftIdea(name: "Smart Watch", descriptionText: "Health tracking features", price: 349.99, isPurchased: true)
    gift1.contact = contact
    
    context.insert(contact)
    context.insert(gift1)
    context.insert(gift2)
    
    GiftListView()
        .environmentObject(GiftViewModel(modelContext: context))
        .environmentObject(ContactViewModel(modelContext: context))
        .modelContainer(previewContainer)
}