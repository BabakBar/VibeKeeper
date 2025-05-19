// VibeKeeper/Core/Models/GiftModel.swift
import Foundation
import SwiftData

@Model
final class GiftModel {
    @Attribute(.unique) var id: UUID
    @Attribute var name: String
    @Attribute var descriptionText: String?
    @Attribute var price: Double?
    @Attribute var sourceURL: String?
    @Attribute var photoPath: String?
    @Attribute var isPurchased: Bool
    @Attribute var createdAt: Date
    @Attribute var updatedAt: Date

    // Relationships
    @Relationship(deleteRule: .cascade) var contactRef: ContactModel?
    @Relationship(deleteRule: .nullify) var occasionRef: OccasionModel?
    
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