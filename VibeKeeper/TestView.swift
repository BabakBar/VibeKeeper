// VibeKeeper/TestView.swift
import SwiftUI
import SwiftData

struct TestView: View {
    @Environment(\.modelContext) private var modelContext
    @StateObject private var giftViewModel: GiftModelViewModel
    @StateObject private var contactViewModel: ContactModelViewModel
    
    init() {
        // For preview only
        let container = try! ModelContainer(for: GiftModel.self, ContactModel.self, OccasionModel.self, ReminderModel.self)
        self._giftViewModel = StateObject(wrappedValue: GiftModelViewModel(modelContext: container.mainContext))
        self._contactViewModel = StateObject(wrappedValue: ContactModelViewModel(modelContext: container.mainContext))
    }
    
    var body: some View {
        NavigationView {
            List {
                Section("Contacts") {
                    ForEach(contactViewModel.contacts) { contact in
                        VStack(alignment: .leading) {
                            Text("\(contact.firstName) \(contact.lastName ?? "")")
                                .font(.headline)
                            if !contact.gifts.isEmpty {
                                Text("Has \(contact.gifts.count) gifts")
                                    .font(.caption)
                            }
                        }
                    }
                    .onDelete(perform: deleteContact)
                    
                    Button("Add Contact") {
                        addNewContact()
                    }
                }
                
                Section("Gifts") {
                    ForEach(giftViewModel.gifts) { gift in
                        VStack(alignment: .leading) {
                            Text(gift.name)
                                .font(.headline)
                            if let contact = gift.contactRef {
                                Text("For: \(contact.firstName)")
                                    .font(.caption)
                            }
                            Text(gift.isPurchased ? "Purchased" : "Not Purchased")
                                .foregroundColor(gift.isPurchased ? .green : .red)
                        }
                    }
                    .onDelete(perform: deleteGift)
                    
                    Button("Add Gift") {
                        addNewGift()
                    }
                }
            }
            .navigationTitle("SwiftData Test")
            .onAppear {
                giftViewModel.updateModelContext(modelContext)
                contactViewModel.updateModelContext(modelContext)
            }
        }
    }
    
    private func addNewContact() {
        let contact = ContactModel(firstName: "New", lastName: "Contact")
        contactViewModel.addContact(contact)
    }
    
    private func deleteContact(at offsets: IndexSet) {
        for index in offsets {
            contactViewModel.deleteContact(contactViewModel.contacts[index])
        }
    }
    
    private func addNewGift() {
        let gift = GiftModel(name: "New Gift", isPurchased: false)
        if !contactViewModel.contacts.isEmpty {
            gift.contactRef = contactViewModel.contacts[0]
        }
        giftViewModel.addGift(gift)
    }
    
    private func deleteGift(at offsets: IndexSet) {
        for index in offsets {
            giftViewModel.deleteGift(giftViewModel.gifts[index])
        }
    }
}

#Preview {
    TestView()
        .modelContainer(for: [GiftModel.self, ContactModel.self, OccasionModel.self, ReminderModel.self])
}