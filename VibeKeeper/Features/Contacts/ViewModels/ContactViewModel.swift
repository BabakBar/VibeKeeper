// VibeKeeper/Features/Contacts/ViewModels/ContactViewModel.swift
import Foundation
import SwiftUI
import SwiftData
import Combine

@MainActor
class ContactViewModel: ObservableObject {
    @Published var contacts: [Contact] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private var cancellables = Set<AnyCancellable>()
    private var modelContext: ModelContext
    
    init(modelContext: ModelContext) {
        self.modelContext = modelContext
        self.loadContacts()
    }
    
    func loadContacts() {
        isLoading = true
        
        do {
            let descriptor = FetchDescriptor<Contact>(sortBy: [SortDescriptor(\.firstName)])
            contacts = try modelContext.fetch(descriptor)
            isLoading = false
        } catch {
            errorMessage = "Failed to load contacts: \(error.localizedDescription)"
            isLoading = false
        }
    }
    
    func addContact(_ contact: Contact) {
        modelContext.insert(contact)
        
        do {
            try modelContext.save()
            loadContacts()
        } catch {
            errorMessage = "Failed to save contact: \(error.localizedDescription)"
        }
    }
    
    func updateContact(_ contact: Contact) {
        do {
            try modelContext.save()
            loadContacts()
        } catch {
            errorMessage = "Failed to update contact: \(error.localizedDescription)"
        }
    }
    
    func deleteContact(_ contact: Contact) {
        modelContext.delete(contact)
        
        do {
            try modelContext.save()
            loadContacts()
        } catch {
            errorMessage = "Failed to delete contact: \(error.localizedDescription)"
        }
    }
    
    func upcomingBirthdays(within days: Int = 30) -> [Contact] {
        let calendar = Calendar.current
        let today = Date()
        let thirtyDaysLater = calendar.date(byAdding: .day, value: days, to: today)!
        
        return contacts.filter { contact in
            guard let birthday = contact.birthday else { return false }
            
            // Get this year's birthday
            let birthdayComponents = calendar.dateComponents([.month, .day], from: birthday)
            let thisYearComponents = DateComponents(
                year: calendar.component(.year, from: today),
                month: birthdayComponents.month,
                day: birthdayComponents.day
            )
            
            guard let thisYearBirthday = calendar.date(from: thisYearComponents) else { return false }
            
            // If birthday has passed this year, check next year's birthday
            if thisYearBirthday < today {
                let nextYearComponents = DateComponents(
                    year: calendar.component(.year, from: today) + 1,
                    month: birthdayComponents.month,
                    day: birthdayComponents.day
                )
                guard let nextYearBirthday = calendar.date(from: nextYearComponents) else { return false }
                return nextYearBirthday <= thirtyDaysLater
            }
            
            return thisYearBirthday <= thirtyDaysLater
        }
    }
    
    func fullName(for contact: Contact) -> String {
        if let lastName = contact.lastName, !lastName.isEmpty {
            return "\(contact.firstName) \(lastName)"
        }
        return contact.firstName
    }
}