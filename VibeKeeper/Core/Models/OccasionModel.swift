// VibeKeeper/Core/Models/OccasionModel.swift
import Foundation
import SwiftData

@Model
final class OccasionModel {
    @Attribute(.unique) var id: UUID
    @Attribute var name: String
    @Attribute var date: Date
    @Attribute var isRecurring: Bool
    @Attribute var notes: String?
    @Attribute var createdAt: Date
    @Attribute var updatedAt: Date
    
    // Relationships
    @Relationship(deleteRule: .nullify, inverse: \GiftModel.occasionRef)
    var gifts: [GiftModel] = []
    
    @Relationship(deleteRule: .nullify)
    var contactRef: ContactModel?
    
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