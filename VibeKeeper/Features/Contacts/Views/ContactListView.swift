// VibeKeeper/Features/Contacts/Views/ContactListView.swift
import SwiftUI
import SwiftData

struct ContactListView: View {
    @EnvironmentObject private var contactViewModel: ContactViewModel
    @EnvironmentObject private var giftViewModel: GiftViewModel
    @State private var isAddingContact = false
    @State private var searchText = ""
    @State private var sortOption: SortOption = .firstName
    
    enum SortOption {
        case firstName
        case lastName
        case relationship
        case birthday
    }
    
    var body: some View {
        NavigationView {
            VStack {
                // Search bar
                SearchBar(text: $searchText, placeholder: "Search contacts...")
                
                // Sort options
                sortOptionsBar
                
                if contactViewModel.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if filteredContacts.isEmpty {
                    emptyStateView
                } else {
                    contactsList
                }
            }
            .navigationTitle("Contacts")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        isAddingContact = true
                    }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $isAddingContact) {
                // We'll implement the ContactFormView later
                Text("Add Contact Form")
                    .presentationDetents([.medium, .large])
            }
            .onAppear {
                contactViewModel.loadContacts()
                giftViewModel.loadGifts()
            }
        }
    }
    
    // MARK: - Filtered and Sorted Contacts
    
    private var filteredContacts: [Contact] {
        var contacts = contactViewModel.contacts.filter { contact in
            // Apply search filter
            searchText.isEmpty ||
                contact.firstName.localizedCaseInsensitiveContains(searchText) ||
                (contact.lastName?.localizedCaseInsensitiveContains(searchText) ?? false) ||
                (contact.relationship?.localizedCaseInsensitiveContains(searchText) ?? false)
        }
        
        // Apply sorting
        switch sortOption {
        case .firstName:
            contacts.sort { $0.firstName.lowercased() < $1.firstName.lowercased() }
        case .lastName:
            contacts.sort { ($0.lastName ?? "").lowercased() < ($1.lastName ?? "").lowercased() }
        case .relationship:
            contacts.sort { ($0.relationship ?? "").lowercased() < ($1.relationship ?? "").lowercased() }
        case .birthday:
            contacts.sort { (a, b) -> Bool in
                guard let birthdayA = a.birthday else { return false }
                guard let birthdayB = b.birthday else { return true }
                return birthdayA < birthdayB
            }
        }
        
        return contacts
    }
    
    // MARK: - Subviews
    
    private var sortOptionsBar: some View {
        HStack {
            Text("Sort by:")
                .font(.caption)
                .foregroundColor(.secondary)
            
            SortButton(title: "Name", isSelected: sortOption == .firstName) {
                sortOption = .firstName
            }
            
            SortButton(title: "Last Name", isSelected: sortOption == .lastName) {
                sortOption = .lastName
            }
            
            SortButton(title: "Relationship", isSelected: sortOption == .relationship) {
                sortOption = .relationship
            }
            
            SortButton(title: "Birthday", isSelected: sortOption == .birthday) {
                sortOption = .birthday
            }
            
            Spacer()
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
    }
    
    private var contactsList: some View {
        List {
            ForEach(filteredContacts) { contact in
                ContactRowView(contact: contact)
                    .swipeActions {
                        Button(role: .destructive) {
                            contactViewModel.deleteContact(contact)
                        } label: {
                            Label("Delete", systemImage: "trash")
                        }
                    }
            }
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "person.2")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("No contacts yet")
                .font(.headline)
            
            Text("Tap the + button to add your first contact")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            Button("Add Contact") {
                isAddingContact = true
            }
            .buttonStyle(.borderedProminent)
            .padding(.top)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemGroupedBackground))
    }
}

// MARK: - Helper Views

struct ContactRowView: View {
    let contact: Contact
    
    var body: some View {
        NavigationLink(destination: ContactDetailView(contact: contact)) {
            HStack {
                contactInitialsView
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("\(contact.firstName) \(contact.lastName ?? "")")
                        .font(.headline)
                    
                    if let relationship = contact.relationship {
                        Text(relationship)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    if let birthday = contact.birthday {
                        Text("Birthday: \(birthdayFormatter.string(from: birthday))")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                let giftCount = contact.giftIdeas.count
                if giftCount > 0 {
                    Text("\(giftCount) gift\(giftCount == 1 ? "" : "s")")
                        .font(.caption)
                        .padding(6)
                        .background(Color.accentColor.opacity(0.2))
                        .foregroundColor(.accentColor)
                        .cornerRadius(4)
                }
            }
        }
    }
    
    private var contactInitialsView: some View {
        ZStack {
            Circle()
                .fill(Color.accentColor)
                .frame(width: 40, height: 40)
            
            Text(getInitials())
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.white)
        }
    }
    
    private func getInitials() -> String {
        let firstInitial = contact.firstName.prefix(1).uppercased()
        let lastInitial = (contact.lastName?.prefix(1) ?? "").uppercased()
        return firstInitial + (lastInitial.isEmpty ? "" : lastInitial)
    }
    
    private var birthdayFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter
    }
}

struct SortButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.caption)
                .padding(.vertical, 4)
                .padding(.horizontal, 8)
                .background(isSelected ? Color.accentColor : Color(.systemGray5))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(4)
        }
    }
}

// MARK: - Placeholder Detail View (to be implemented later)

struct ContactDetailView: View {
    let contact: Contact
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Contact header
                HStack {
                    ZStack {
                        Circle()
                            .fill(Color.accentColor)
                            .frame(width: 80, height: 80)
                        
                        Text(getInitials())
                            .font(.system(size: 32, weight: .semibold))
                            .foregroundColor(.white)
                    }
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text("\(contact.firstName) \(contact.lastName ?? "")")
                            .font(.title)
                            .fontWeight(.bold)
                        
                        if let relationship = contact.relationship {
                            Text(relationship)
                                .font(.headline)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.leading, 8)
                    
                    Spacer()
                }
                
                // Birthday
                if let birthday = contact.birthday {
                    HStack {
                        Image(systemName: "gift")
                        Text("Birthday: \(birthdayFormatter.string(from: birthday))")
                    }
                    .padding(.top, 4)
                }
                
                // Notes
                if let notes = contact.notes, !notes.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Notes")
                            .font(.headline)
                        
                        Text(notes)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                    }
                }
                
                // Gift ideas section
                VStack(alignment: .leading, spacing: 8) {
                    Text("Gift Ideas")
                        .font(.headline)
                    
                    if !contact.giftIdeas.isEmpty {
                        ForEach(contact.giftIdeas) { gift in
                            HStack {
                                VStack(alignment: .leading) {
                                    Text(gift.name)
                                        .font(.subheadline)
                                    
                                    if let price = gift.price {
                                        Text("$\(String(format: "%.2f", price))")
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                }
                                
                                Spacer()
                                
                                if gift.isPurchased {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundColor(.green)
                                } else {
                                    Image(systemName: "circle")
                                        .foregroundColor(.secondary)
                                }
                            }
                            .padding(12)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                        }
                    } else {
                        Text("No gift ideas yet")
                            .foregroundColor(.secondary)
                            .padding()
                            .frame(maxWidth: .infinity, alignment: .center)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                    }
                    
                    Button(action: {
                        // Action to add gift for this contact
                    }) {
                        Label("Add Gift Idea", systemImage: "plus")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                    .padding(.top, 8)
                }
            }
            .padding()
        }
        .navigationTitle("Contact Details")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private func getInitials() -> String {
        let firstInitial = contact.firstName.prefix(1).uppercased()
        let lastInitial = (contact.lastName?.prefix(1) ?? "").uppercased()
        return firstInitial + (lastInitial.isEmpty ? "" : lastInitial)
    }
    
    private var birthdayFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateStyle = .long
        formatter.timeStyle = .none
        return formatter
    }
}

#Preview {
    let previewContainer = try! ModelContainer(for: GiftIdea.self, Contact.self, Occasion.self, Reminder.self)
    
    // Add some sample data
    let context = previewContainer.mainContext
    let contact1 = Contact(firstName: "John", lastName: "Doe", relationship: "Friend", birthday: Date())
    let contact2 = Contact(firstName: "Jane", lastName: "Smith", relationship: "Family", birthday: Date().addingTimeInterval(86400 * 30))
    
    let gift1 = GiftIdea(name: "Wireless Headphones", descriptionText: "Noise cancelling", price: 199.99, isPurchased: false)
    let gift2 = GiftIdea(name: "Smart Watch", descriptionText: "Health tracking features", price: 349.99, isPurchased: true)
    
    gift1.contact = contact1
    gift2.contact = contact1
    
    context.insert(contact1)
    context.insert(contact2)
    context.insert(gift1)
    context.insert(gift2)
    
    ContactListView()
        .environmentObject(ContactViewModel(modelContext: context))
        .environmentObject(GiftViewModel(modelContext: context))
        .modelContainer(previewContainer)
}