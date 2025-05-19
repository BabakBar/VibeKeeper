// VibeKeeper/Features/Gifts/ViewModels/GiftViewModel.swift
import Foundation
import SwiftUI
import SwiftData
import Combine

@MainActor
class GiftViewModel: ObservableObject {
    @Published var gifts: [GiftIdea] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private var cancellables = Set<AnyCancellable>()
    private var modelContext: ModelContext
    
    init(modelContext: ModelContext) {
        self.modelContext = modelContext
        self.loadGifts()
    }
    
    func loadGifts() {
        isLoading = true
        
        do {
            let descriptor = FetchDescriptor<GiftIdea>(sortBy: [SortDescriptor(\.createdAt, order: .reverse)])
            gifts = try modelContext.fetch(descriptor)
            isLoading = false
        } catch {
            errorMessage = "Failed to load gifts: \(error.localizedDescription)"
            isLoading = false
        }
    }
    
    func addGift(_ gift: GiftIdea) {
        modelContext.insert(gift)
        
        do {
            try modelContext.save()
            loadGifts()
        } catch {
            errorMessage = "Failed to save gift: \(error.localizedDescription)"
        }
    }
    
    func updateGift(_ gift: GiftIdea) {
        do {
            try modelContext.save()
            loadGifts()
        } catch {
            errorMessage = "Failed to update gift: \(error.localizedDescription)"
        }
    }
    
    func deleteGift(_ gift: GiftIdea) {
        modelContext.delete(gift)
        
        do {
            try modelContext.save()
            loadGifts()
        } catch {
            errorMessage = "Failed to delete gift: \(error.localizedDescription)"
        }
    }
    
    func giftsByContact(_ contact: Contact) -> [GiftIdea] {
        return gifts.filter { $0.contact?.id == contact.id }
    }
    
    func giftsByOccasion(_ occasion: Occasion) -> [GiftIdea] {
        return gifts.filter { $0.occasion?.id == occasion.id }
    }
    
    func purchasedGifts() -> [GiftIdea] {
        return gifts.filter { $0.isPurchased }
    }
    
    func unpurchasedGifts() -> [GiftIdea] {
        return gifts.filter { !$0.isPurchased }
    }
}