// VibeKeeper/Core/Models/ReminderModel.swift
import Foundation
import SwiftData

@Model
final class ReminderModel {
    @Attribute(.unique) var id: UUID
    @Attribute var title: String
    @Attribute var reminderDate: Date
    @Attribute var notes: String?
    @Attribute var isCompleted: Bool
    @Attribute var createdAt: Date
    @Attribute var updatedAt: Date

    // Relationships
    @Relationship(deleteRule: .nullify)
    var occasionRef: OccasionModel?
    
    @Relationship(deleteRule: .nullify)
    var giftRef: GiftModel?
    
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