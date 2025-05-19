// VibeKeeper/Features/Contacts/ViewModels/ContactModelViewModel.swift
import Foundation
import SwiftData
import Combine

class ContactModelViewModel: ObservableObject {
    @Published var contacts: [ContactModel] = []
    @Published var isLoading: Bool = false
    @Published var error: Error?
    
    private var modelContext: ModelContext
    private var cancellables = Set<AnyCancellable>()
    
    init(modelContext: ModelContext) {
        self.modelContext = modelContext
        loadContacts()
    }
    
    func updateModelContext(_ context: ModelContext) {
        self.modelContext = context
        loadContacts()
    }
    
    func loadContacts() {
        isLoading = true
        
        do {
            let descriptor = FetchDescriptor<ContactModel>(sortBy: [SortDescriptor(\.firstName)])
            self.contacts = try modelContext.fetch(descriptor)
            self.isLoading = false
        } catch {
            self.error = error
            self.isLoading = false
        }
    }
    
    func addContact(_ contact: ContactModel) {
        modelContext.insert(contact)
        saveContext()
        loadContacts()
    }
    
    func updateContact(_ contact: ContactModel) {
        saveContext()
        loadContacts()
    }
    
    func deleteContact(_ contact: ContactModel) {
        modelContext.delete(contact)
        saveContext()
        loadContacts()
    }
    
    private func saveContext() {
        do {
            try modelContext.save()
        } catch {
            self.error = error
        }
    }
}