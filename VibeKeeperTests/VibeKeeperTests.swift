//
//  VibeKeeperTests.swift
//  VibeKeeperTests
//
//  Created by Sia on 14/5/25.
//

import Testing
import SwiftData
@testable import VibeKeeper

struct VibeKeeperTests {
    
    @Test("Contact Creation")
    func testContactCreation() async throws {
        // Create an in-memory model container for testing
        let schema = Schema([
            GiftIdea.self,
            Contact.self,
            Occasion.self,
            Reminder.self,
        ])
        
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        let container = try ModelContainer(for: schema, configurations: [modelConfiguration])
        let modelContext = ModelContext(container)
        
        // Create a contact
        let contact = Contact(
            firstName: "John",
            lastName: "Doe",
            relationship: "Friend",
            notes: "Testing contact",
            birthday: Date(),
            createdAt: Date(),
            updatedAt: Date()
        )
        
        // Insert into the context
        modelContext.insert(contact)
        
        // Try to save
        try modelContext.save()
        
        // Verify it was saved correctly
        let descriptor = FetchDescriptor<Contact>()
        let contacts = try modelContext.fetch(descriptor)
        
        #expect(contacts.count == 1)
        #expect(contacts.first?.firstName == "John")
        #expect(contacts.first?.lastName == "Doe")
    }
    
    @Test("Gift Idea Creation")
    func testGiftIdeaCreation() async throws {
        // Create an in-memory model container for testing
        let schema = Schema([
            GiftIdea.self,
            Contact.self,
            Occasion.self,
            Reminder.self,
        ])
        
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        let container = try ModelContainer(for: schema, configurations: [modelConfiguration])
        let modelContext = ModelContext(container)
        
        // Create a gift idea
        let giftIdea = GiftIdea(
            name: "Test Gift",
            descriptionText: "A test gift idea",
            price: 29.99,
            isPurchased: false
        )
        
        // Insert into the context
        modelContext.insert(giftIdea)
        
        // Try to save
        try modelContext.save()
        
        // Verify it was saved correctly
        let descriptor = FetchDescriptor<GiftIdea>()
        let gifts = try modelContext.fetch(descriptor)
        
        #expect(gifts.count == 1)
        #expect(gifts.first?.name == "Test Gift")
        #expect(gifts.first?.price == 29.99)
    }
    
    @Test("Relationship Between Models")
    func testRelationship() async throws {
        // Create an in-memory model container for testing
        let schema = Schema([
            GiftIdea.self,
            Contact.self,
            Occasion.self,
            Reminder.self,
        ])
        
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        let container = try ModelContainer(for: schema, configurations: [modelConfiguration])
        let modelContext = ModelContext(container)
        
        // Create a contact
        let contact = Contact(firstName: "Jane", lastName: "Smith")
        modelContext.insert(contact)
        
        // Create a gift idea linked to the contact
        let giftIdea = GiftIdea(name: "Birthday Present")
        giftIdea.contact = contact
        modelContext.insert(giftIdea)
        
        // Try to save
        try modelContext.save()
        
        // Verify the relationship was created correctly
        let descriptor = FetchDescriptor<Contact>()
        let contacts = try modelContext.fetch(descriptor)
        
        #expect(contacts.count == 1)
        #expect(contacts.first?.giftIdeas?.count == 1)
        #expect(contacts.first?.giftIdeas?.first?.name == "Birthday Present")
        
        // Verify the reverse relationship
        let giftDescriptor = FetchDescriptor<GiftIdea>()
        let gifts = try modelContext.fetch(giftDescriptor)
        
        #expect(gifts.count == 1)
        #expect(gifts.first?.contact?.firstName == "Jane")
    }
}