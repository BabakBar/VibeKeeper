// VibeKeeper/Core/Models/Reminder.swift
import Foundation
import SwiftData

@Model
final class Reminder {
    @Attribute(.unique) var id: UUID
    var title: String
    var reminderDate: Date
    var notes: String?
    var isCompleted: Bool
    var createdAt: Date
    var updatedAt: Date

    // Relationships
    @Relationship(deleteRule: .nullify)
    var occasion: Occasion?
    
    @Relationship(deleteRule: .nullify)
    var giftIdea: GiftIdea?

    init(id: UUID = UUID(), title: String = "", reminderDate: Date = Date(), notes: String? = nil, isCompleted: Bool = false, createdAt: Date = Date(), updatedAt: Date = Date()) {
        self.id = id
        self.title = title
        self.reminderDate = reminderDate
        self.notes = notes
        self.isCompleted = isCompleted
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}
