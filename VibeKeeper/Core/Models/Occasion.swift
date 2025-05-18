// VibeKeeper/Core/Models/Occasion.swift
import Foundation
import SwiftData

@Model
final class Occasion {
    @Attribute(.unique) var id: UUID
    var name: String
    var date: Date
    var isRecurring: Bool
    var notes: String?
    var createdAt: Date
    var updatedAt: Date

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
