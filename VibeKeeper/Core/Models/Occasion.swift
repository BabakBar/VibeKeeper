// VibeKeeper/Core/Models/Occasion.swift
import Foundation
import SwiftData

@Model
final class Occasion {
    @Attribute(.unique) var id: UUID
    @Attribute var name: String
    @Attribute var date: Date
    @Attribute var isRecurring: Bool
    @Attribute var notes: String?
    @Attribute var createdAt: Date
    @Attribute var updatedAt: Date
    
    // Relationships
    @Relationship(deleteRule: .nullify, inverse: \GiftIdea.occasion)
    var giftIdeas: [GiftIdea] = []
    
    @Relationship(deleteRule: .nullify, inverse: \Contact.occasions)
    var contact: Contact?

    init(id: UUID = UUID(), name: String = "", date: Date = Date(), isRecurring: Bool = false, notes: String? = nil, createdAt: Date = Date(), updatedAt: Date = Date()) {
        self.id = id
        self.name = name
        self.date = date
        self.isRecurring = isRecurring
        self.notes = notes
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}
