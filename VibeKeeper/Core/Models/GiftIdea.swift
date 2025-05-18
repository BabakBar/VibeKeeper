// VibeKeeper/Core/Models/GiftIdea.swift
import Foundation
import SwiftData

@Model
final class GiftIdea {
    @Attribute(.unique) var id: UUID
    var name: String
    var descriptionText: String?
    var price: Double?
    var sourceURL: String?
    var photoPath: String?
    var isPurchased: Bool
    var createdAt: Date
    var updatedAt: Date

    // Relationships (to be fully defined with inverse if needed)
    // var contact: Contact?
    // var occasion: Occasion?

    init(id: UUID = UUID(), name: String = "", descriptionText: String? = nil, price: Double? = nil, sourceURL: String? = nil, photoPath: String? = nil, isPurchased: Bool = false, createdAt: Date = Date(), updatedAt: Date = Date()) {
        self.id = id
        self.name = name
        self.descriptionText = descriptionText
        self.price = price
        self.sourceURL = sourceURL
        self.photoPath = photoPath
        self.isPurchased = isPurchased
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}
