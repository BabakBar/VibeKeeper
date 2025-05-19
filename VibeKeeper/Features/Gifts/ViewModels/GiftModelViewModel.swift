// VibeKeeper/Features/Gifts/ViewModels/GiftModelViewModel.swift
import Foundation
import SwiftData
import Combine

class GiftModelViewModel: ObservableObject {
    @Published var gifts: [GiftModel] = []
    @Published var isLoading: Bool = false
    @Published var error: Error?
    
    private var modelContext: ModelContext
    private var cancellables = Set<AnyCancellable>()
    
    init(modelContext: ModelContext) {
        self.modelContext = modelContext
        loadGifts()
    }
    
    func updateModelContext(_ context: ModelContext) {
        self.modelContext = context
        loadGifts()
    }
    
    func loadGifts() {
        isLoading = true
        
        do {
            let descriptor = FetchDescriptor<GiftModel>(sortBy: [SortDescriptor(\.name)])
            self.gifts = try modelContext.fetch(descriptor)
            self.isLoading = false
        } catch {
            self.error = error
            self.isLoading = false
        }
    }
    
    func addGift(_ gift: GiftModel) {
        modelContext.insert(gift)
        saveContext()
        loadGifts()
    }
    
    func updateGift(_ gift: GiftModel) {
        saveContext()
        loadGifts()
    }
    
    func deleteGift(_ gift: GiftModel) {
        modelContext.delete(gift)
        saveContext()
        loadGifts()
    }
    
    func togglePurchased(_ gift: GiftModel) {
        gift.isPurchased.toggle()
        saveContext()
        loadGifts()
    }
    
    private func saveContext() {
        do {
            try modelContext.save()
        } catch {
            self.error = error
        }
    }
}