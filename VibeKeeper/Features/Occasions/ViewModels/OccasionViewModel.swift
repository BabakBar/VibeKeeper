// VibeKeeper/Features/Occasions/ViewModels/OccasionViewModel.swift
import Foundation
import SwiftUI
import SwiftData
import Combine

@MainActor
class OccasionViewModel: ObservableObject {
    @Published var occasions: [Occasion] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private var cancellables = Set<AnyCancellable>()
    private var modelContext: ModelContext
    
    init(modelContext: ModelContext) {
        self.modelContext = modelContext
        self.loadOccasions()
    }
    
    func updateModelContext(_ newModelContext: ModelContext) {
        self.modelContext = newModelContext
        self.loadOccasions()
    }
    
    func loadOccasions() {
        isLoading = true
        
        do {
            let descriptor = FetchDescriptor<Occasion>(sortBy: [SortDescriptor(\.date)])
            occasions = try modelContext.fetch(descriptor)
            isLoading = false
        } catch {
            errorMessage = "Failed to load occasions: \(error.localizedDescription)"
            isLoading = false
        }
    }
    
    func addOccasion(_ occasion: Occasion) {
        modelContext.insert(occasion)
        
        do {
            try modelContext.save()
            loadOccasions()
        } catch {
            errorMessage = "Failed to save occasion: \(error.localizedDescription)"
        }
    }
    
    func updateOccasion(_ occasion: Occasion) {
        do {
            try modelContext.save()
            loadOccasions()
        } catch {
            errorMessage = "Failed to update occasion: \(error.localizedDescription)"
        }
    }
    
    func deleteOccasion(_ occasion: Occasion) {
        modelContext.delete(occasion)
        
        do {
            try modelContext.save()
            loadOccasions()
        } catch {
            errorMessage = "Failed to delete occasion: \(error.localizedDescription)"
        }
    }
    
    func upcomingOccasions(within days: Int = 30) -> [Occasion] {
        let calendar = Calendar.current
        let today = Date()
        let endDate = calendar.date(byAdding: .day, value: days, to: today)!
        
        return occasions.filter { occasion in
            let nextOccurrenceDate = getNextOccurrenceDate(for: occasion, from: today)
            return nextOccurrenceDate <= endDate
        }.sorted { 
            getNextOccurrenceDate(for: $0, from: today) < getNextOccurrenceDate(for: $1, from: today)
        }
    }
    
    private func getNextOccurrenceDate(for occasion: Occasion, from date: Date) -> Date {
        let calendar = Calendar.current
        let occasionDate = occasion.date
        
        // If occasion is not recurring, simply return its date
        if !occasion.isRecurring {
            return occasionDate
        }
        
        // For recurring events, we need to find the next occurrence
        let occasionComponents = calendar.dateComponents([.month, .day], from: occasionDate)
        let currentYear = calendar.component(.year, from: date)
        
        // Try this year's date
        var components = DateComponents(
            year: currentYear,
            month: occasionComponents.month,
            day: occasionComponents.day
        )
        
        guard let thisYearDate = calendar.date(from: components) else {
            return occasionDate
        }
        
        // If this year's date is in the past, calculate next year's date
        if thisYearDate < date {
            components.year = currentYear + 1
            if let nextYearDate = calendar.date(from: components) {
                return nextYearDate
            }
        }
        
        return thisYearDate
    }
    
    func daysUntil(_ occasion: Occasion) -> Int {
        let calendar = Calendar.current
        let today = Date()
        let nextDate = getNextOccurrenceDate(for: occasion, from: today)
        
        let components = calendar.dateComponents([.day], from: today, to: nextDate)
        return components.day ?? 0
    }
}