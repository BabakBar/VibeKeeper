// VibeKeeper/Core/Models/Contact.swift
import Foundation
import SwiftData

@Model
final class Contact {
    @Attribute(.unique) var id: UUID
    var firstName: String
    var lastName: String?
    var relationship: String?
    var notes: String?
    var birthday: Date?
    var createdAt: Date
    var updatedAt: Date

    // Relationships
    @Relationship(deleteRule: .cascade, inverse: \GiftIdea.contact)
    var giftIdeas: [GiftIdea] = []
    
    @Relationship(deleteRule: .cascade, inverse: \Occasion.contact)
    var occasions: [Occasion] = []

    init(id: UUID = UUID(), firstName: String = "", lastName: String? = nil, relationship: String? = nil, notes: String? = nil, birthday: Date? = nil, createdAt: Date = Date(), updatedAt: Date = Date()) {
        self.id = id
        self.firstName = firstName
        self.lastName = lastName
        self.relationship = relationship
        self.notes = notes
        self.birthday = birthday
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}
