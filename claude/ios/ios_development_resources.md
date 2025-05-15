# iOS Development Resources for VibeKeeper

## Current Best Practices (2024-2025)

### SwiftUI Architecture
1. **Composition over inheritance**
   - Use view composition to build complex interfaces
   - Extract reusable components into separate views
   - Use ViewBuilder for dynamic content construction

2. **State Management**
   - `@State` for simple, view-local state
   - `@StateObject` for view-owned observable objects
   - `@ObservedObject` for externally-owned observable objects
   - `@EnvironmentObject` for dependency injection through the environment
   - `@AppStorage` for persisting simple values to UserDefaults
   - `@SceneStorage` for preserving UI state during scene lifecycle

3. **Navigation**
   - Use `NavigationStack` and `NavigationPath` for programmatic navigation (iOS 16+)
   - Use path-based navigation for complex flows and deep linking
   - Use `fullScreenCover` and `sheet` for modal presentations
   - Build coordinator patterns for complex navigation management

4. **Performance Optimization**
   - Use `LazyVStack` and `LazyHStack` for large collections
   - Implement pagination for large data sets
   - Cache images and expensive computations
   - Use `@ViewBuilder` to conditionally include views
   - Profile with Instruments to identify bottlenecks

## Swift Data Integration (iOS 17+)

Swift Data is Apple's newest persistence framework, ideal for VibeKeeper's data model:

```swift
import SwiftData

// Define models with Swift Data
@Model
class GiftIdea {
    var id: UUID
    var recipient: String
    var idea: String
    var occasion: String?
    var date: Date?
    var tags: [String]
    var budgetAmount: Double?
    var budgetCurrency: String?
    var budgetRangeMin: Double?
    var budgetRangeMax: Double?
    var status: String
    var notes: String?
    var createdAt: Date
    var updatedAt: Date
    
    @Relationship(.cascade) var mediaAssets: [MediaAsset]
    @Relationship(.cascade) var reminders: [Reminder]
    @Relationship var recipient: Contact?
    
    init(id: UUID = UUID(),
         recipient: String,
         idea: String,
         occasion: String? = nil,
         date: Date? = nil,
         tags: [String] = [],
         budgetAmount: Double? = nil,
         budgetCurrency: String? = "USD",
         budgetRangeMin: Double? = nil,
         budgetRangeMax: Double? = nil,
         status: String = "idea",
         notes: String? = nil,
         createdAt: Date = Date(),
         updatedAt: Date = Date()) {
        self.id = id
        self.recipient = recipient
        self.idea = idea
        self.occasion = occasion
        self.date = date
        self.tags = tags
        self.budgetAmount = budgetAmount
        self.budgetCurrency = budgetCurrency
        self.budgetRangeMin = budgetRangeMin
        self.budgetRangeMax = budgetRangeMax
        self.status = status
        self.notes = notes
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

// Set up a Swift Data container
extension ModelContainer {
    static var vibeKeeper: ModelContainer {
        let schema = Schema([
            GiftIdea.self,
            Contact.self,
            MediaAsset.self,
            Reminder.self,
            Occasion.self
        ])
        
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
        
        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }
}

// Example usage in SwiftUI
struct GiftListView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var giftIdeas: [GiftIdea]
    
    var body: some View {
        List {
            ForEach(giftIdeas) { giftIdea in
                GiftIdeaRow(giftIdea: giftIdea)
            }
            .onDelete(perform: deleteGiftIdeas)
        }
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: addGiftIdea) {
                    Label("Add Gift Idea", systemImage: "plus")
                }
            }
        }
    }
    
    private func addGiftIdea() {
        let newGiftIdea = GiftIdea(recipient: "New Recipient", idea: "New Gift Idea")
        modelContext.insert(newGiftIdea)
    }
    
    private func deleteGiftIdeas(offsets: IndexSet) {
        for index in offsets {
            modelContext.delete(giftIdeas[index])
        }
    }
}
```

## AI Integration with Vision Framework

For the image analysis capture method, you can leverage Apple's Vision framework to perform local analysis before sending to GPT-4 Vision:

```swift
import Vision
import UIKit

class ImageAnalysisService {
    func analyzeImageLocally(_ image: UIImage) async throws -> String {
        guard let cgImage = image.cgImage else {
            throw ImageAnalysisError.invalidImage
        }
        
        return try await withCheckedThrowingContinuation { continuation in
            // Create VNImageRequestHandler
            let requestHandler = VNImageRequestHandler(cgImage: cgImage, options: [:])
            
            // Create a batch of requests
            let textRecognitionRequest = VNRecognizeTextRequest { request, error in
                if let error = error {
                    continuation.resume(throwing: ImageAnalysisError.visionError(error))
                    return
                }
                
                guard let observations = request.results as? [VNRecognizedTextObservation] else {
                    continuation.resume(returning: "")
                    return
                }
                
                // Extract text from observations
                let recognizedText = observations.compactMap { observation in
                    observation.topCandidates(1).first?.string
                }.joined(separator: " ")
                
                continuation.resume(returning: recognizedText)
            }
            
            // Set properties for text recognition
            textRecognitionRequest.recognitionLevel = .accurate
            textRecognitionRequest.usesLanguageCorrection = true
            
            // Create object recognition request
            let objectRecognitionRequest = VNClassifyImageRequest { request, error in
                // Implementation for object recognition
            }
            
            // Perform requests
            do {
                try requestHandler.perform([textRecognitionRequest, objectRecognitionRequest])
            } catch {
                continuation.resume(throwing: ImageAnalysisError.visionError(error))
            }
        }
    }
    
    enum ImageAnalysisError: Error {
        case invalidImage
        case visionError(Error)
    }
}
```

## Latest iOS 17 Features to Leverage

### 1. Interactive Widgets
Use interactive widgets to let users quickly access recent gift ideas or upcoming occasions:

```swift
import WidgetKit
import SwiftUI

struct UpcomingOccasionsWidget: Widget {
    let kind: String = "UpcomingOccasionsWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: kind,
            provider: OccasionsWidgetProvider()
        ) { entry in
            OccasionsWidgetView(entry: entry)
        }
        .configurationDisplayName("Upcoming Occasions")
        .description("Shows your upcoming occasions")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct OccasionsWidgetView: View {
    var entry: OccasionsEntry
    
    var body: some View {
        VStack {
            Text("Upcoming Occasions")
                .font(.headline)
            
            if entry.occasions.isEmpty {
                Text("No upcoming occasions")
                    .font(.caption)
            } else {
                ForEach(entry.occasions.prefix(3)) { occasion in
                    HStack {
                        Text(occasion.contactName)
                            .font(.subheadline)
                        Spacer()
                        Text(formatDate(occasion.date))
                            .font(.caption)
                    }
                    .padding(.vertical, 2)
                }
            }
        }
        .padding()
        .widgetURL(URL(string: "vibekeeper://occasions"))
    }
    
    private func formatDate(_ date: Date?) -> String {
        guard let date = date else { return "Unknown" }
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        return formatter.string(from: date)
    }
}
```

### 2. App Intents
Use App Intents for Siri integration and Shortcuts support:

```swift
import AppIntents

struct AddGiftIdeaIntent: AppIntent {
    static var title: LocalizedStringResource = "Add Gift Idea"
    
    @Parameter(title: "Recipient")
    var recipient: String
    
    @Parameter(title: "Gift Idea")
    var idea: String
    
    @Parameter(title: "Occasion", default: "")
    var occasion: String
    
    static var parameterSummary: some ParameterSummary {
        Summary("Add \(\.$idea) for \(\.$recipient) for \(\.$occasion)")
    }
    
    func perform() async throws -> some IntentResult {
        // Implementation to add gift idea
        let giftIdeaService = GiftIdeaService()
        try await giftIdeaService.addGiftIdea(recipient: recipient, idea: idea, occasion: occasion)
        return .result()
    }
}

struct VibeKeeperAppShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: AddGiftIdeaIntent(),
            phrases: [
                "Add gift idea with \(.applicationName)",
                "Save gift idea with \(.applicationName)",
                "Remember gift for \(\.$recipient) with \(.applicationName)"
            ]
        )
    }
}
```

### 3. StoreKit Testing
For future in-app purchases, use StoreKit testing framework:

```swift
import StoreKit

// Define product IDs
enum StoreProduct: String, CaseIterable {
    case premium = "com.example.vibekeeper.premium"
    case unlock = "com.example.vibekeeper.allfeatures"
}

// StoreKit 2 product management
class StoreManager: ObservableObject {
    @Published private(set) var products: [Product] = []
    @Published private(set) var purchasedProductIDs = Set<String>()
    
    private let productIDs = StoreProduct.allCases.map { $0.rawValue }
    
    init() {
        // Start a transaction listener as early as possible in your app
        Task {
            await updatePurchasedProducts()
            await requestProducts()
            
            // Listen for transactions
            for await result in Transaction.updates {
                await handleTransactionResult(result)
            }
        }
    }
    
    @MainActor
    func requestProducts() async {
        do {
            products = try await Product.products(for: productIDs)
        } catch {
            print("Failed to request products: \(error)")
        }
    }
    
    func purchase(_ product: Product) async throws -> Transaction? {
        do {
            let result = try await product.purchase()
            
            switch result {
            case .success(let verification):
                let transaction = try checkVerified(verification)
                await updatePurchasedProducts()
                return transaction
            case .userCancelled, .pending:
                return nil
            default:
                return nil
            }
        } catch {
            throw error
        }
    }
    
    func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified:
            throw StoreError.failedVerification
        case .verified(let safe):
            return safe
        }
    }
    
    @MainActor
    func updatePurchasedProducts() async {
        for await result in Transaction.currentEntitlements {
            do {
                let transaction = try checkVerified(result)
                purchasedProductIDs.insert(transaction.productID)
            } catch {
                print("Transaction failed verification")
            }
        }
    }
    
    private func handleTransactionResult(_ result: VerificationResult<Transaction>) async {
        do {
            let transaction = try checkVerified(result)
            await updatePurchasedProducts()
            await transaction.finish()
        } catch {
            print("Transaction failed verification")
        }
    }
    
    enum StoreError: Error {
        case failedVerification
    }
}
```

## SwiftUI Design Patterns for Complex Apps

### 1. MVVM with Coordinators
```swift
// Coordinator-based navigation for complex flows
class MainCoordinator: ObservableObject {
    @Published var navigationPath = NavigationPath()
    @Published var activeSheet: Sheet?
    @Published var activeFullScreenCover: FullScreenCover?
    
    enum Sheet: Identifiable {
        case newGiftIdea
        case newContact
        case settings
        
        var id: Int {
            switch self {
            case .newGiftIdea: return 1
            case .newContact: return 2
            case .settings: return 3
            }
        }
    }
    
    enum FullScreenCover: Identifiable {
        case onboarding
        case capture
        
        var id: Int {
            switch self {
            case .onboarding: return 1
            case .capture: return 2
            }
        }
    }
    
    enum Destination: Hashable {
        case giftIdeaDetail(UUID)
        case contactDetail(UUID)
        case occasionDetail(UUID)
        case search(String)
        case reminder(UUID)
    }
    
    // Navigation methods
    func showGiftIdeaDetail(id: UUID) {
        navigationPath.append(Destination.giftIdeaDetail(id))
    }
    
    func showContactDetail(id: UUID) {
        navigationPath.append(Destination.contactDetail(id))
    }
    
    func showNewGiftIdeaSheet() {
        activeSheet = .newGiftIdea
    }
    
    func dismissSheet() {
        activeSheet = nil
    }
    
    func showCapture() {
        activeFullScreenCover = .capture
    }
    
    func dismissFullScreenCover() {
        activeFullScreenCover = nil
    }
    
    func navigateBack() {
        if !navigationPath.isEmpty {
            navigationPath.removeLast()
        }
    }
    
    func popToRoot() {
        navigationPath = NavigationPath()
    }
}

// Usage in AppView
struct AppView: View {
    @StateObject private var coordinator = MainCoordinator()
    
    var body: some View {
        TabView {
            NavigationStack(path: $coordinator.navigationPath) {
                GiftIdeaListView()
                    .navigationDestination(for: MainCoordinator.Destination.self) { destination in
                        switch destination {
                        case .giftIdeaDetail(let id):
                            GiftIdeaDetailView(id: id)
                        case .contactDetail(let id):
                            ContactDetailView(id: id)
                        case .occasionDetail(let id):
                            OccasionDetailView(id: id)
                        case .search(let query):
                            SearchResultsView(query: query)
                        case .reminder(let id):
                            ReminderDetailView(id: id)
                        }
                    }
            }
            .tabItem {
                Label("Gifts", systemImage: "gift")
            }
            
            // Other tabs...
        }
        .sheet(item: $coordinator.activeSheet) { sheet in
            switch sheet {
            case .newGiftIdea:
                NewGiftIdeaView()
            case .newContact:
                NewContactView()
            case .settings:
                SettingsView()
            }
        }
        .fullScreenCover(item: $coordinator.activeFullScreenCover) { cover in
            switch cover {
            case .onboarding:
                OnboardingView()
            case .capture:
                CaptureView()
            }
        }
        .environmentObject(coordinator)
    }
}
```

### 2. Dependency Injection with Environment
```swift
// Service container for dependency injection
class ServiceContainer {
    let giftIdeaService: GiftIdeaService
    let contactService: ContactService
    let captureService: CaptureService
    let reminderService: ReminderService
    let analyticsService: AnalyticsService
    
    init(giftIdeaService: GiftIdeaService = GiftIdeaService(),
         contactService: ContactService = ContactService(),
         captureService: CaptureService = CaptureService(),
         reminderService: ReminderService = ReminderService(),
         analyticsService: AnalyticsService = AnalyticsService()) {
        self.giftIdeaService = giftIdeaService
        self.contactService = contactService
        self.captureService = captureService
        self.reminderService = reminderService
        self.analyticsService = analyticsService
    }
}

// Environment key for service container
private struct ServiceContainerKey: EnvironmentKey {
    static let defaultValue = ServiceContainer()
}

extension EnvironmentValues {
    var services: ServiceContainer {
        get { self[ServiceContainerKey.self] }
        set { self[ServiceContainerKey.self] = newValue }
    }
}

// Usage in app
struct VibeKeeperApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.services, ServiceContainer())
        }
    }
}

// Usage in views
struct GiftIdeaDetailView: View {
    @Environment(\.services) private var services
    let id: UUID
    
    @State private var giftIdea: GiftIdea?
    @State private var isLoading = false
    @State private var error: Error?
    
    var body: some View {
        Group {
            if isLoading {
                ProgressView("Loading gift idea...")
            } else if let giftIdea = giftIdea {
                // Display gift idea details
            } else if let error = error {
                ErrorView(error: error)
            } else {
                Text("Gift idea not found")
            }
        }
        .onAppear {
            loadGiftIdea()
        }
    }
    
    private func loadGiftIdea() {
        isLoading = true
        
        Task {
            do {
                let idea = try await services.giftIdeaService.getGiftIdea(id: id)
                
                await MainActor.run {
                    self.giftIdea = idea
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.error = error
                    self.isLoading = false
                }
            }
        }
    }
}
```

## Accessibility Best Practices

```swift
// Accessibility improvements for VibeKeeper
struct AccessibleGiftIdeaRow: View {
    let giftIdea: GiftIdea
    
    var body: some View {
        HStack {
            // Gift icon or image
            if let firstImageURL = giftIdea.mediaAssets.first(where: { $0.type == .image })?.url {
                AsyncImage(url: firstImageURL) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 60, height: 60)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                        .accessibilityHidden(true) // Hide decorative image from screen readers
                } placeholder: {
                    Rectangle()
                        .foregroundColor(.gray.opacity(0.2))
                        .frame(width: 60, height: 60)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                        .accessibilityHidden(true)
                }
            } else {
                Image(systemName: "gift")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 40, height: 40)
                    .padding(10)
                    .foregroundColor(.accentColor)
                    .background(Color.accentColor.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                    .accessibilityHidden(true)
            }
            
            // Gift details
            VStack(alignment: .leading) {
                Text(giftIdea.idea)
                    .font(.headline)
                
                if let recipient = giftIdea.recipient {
                    Text("For: \(recipient)")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                if let date = giftIdea.date {
                    Text(formatDate(date))
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            // Status indicator
            StatusIndicator(status: giftIdea.status)
                .accessibilityHidden(true) // Hide from screen readers as status is included in label
        }
        .padding(.vertical, 4)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(accessibilityLabel)
        .accessibilityHint("Double tap to view details")
    }
    
    private var accessibilityLabel: String {
        var label = "Gift idea: \(giftIdea.idea)"
        
        if let recipient = giftIdea.recipient {
            label.append(", for \(recipient)")
        }
        
        if let date = giftIdea.date {
            label.append(", on \(formatDate(date))")
        }
        
        label.append(", status: \(giftIdea.status.rawValue)")
        
        return label
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }
}

// Dynamic Type support
struct DynamicTypeCompatibleView: View {
    var body: some View {
        VStack(spacing: 16) {
            Text("Gift Ideas")
                .font(.largeTitle)
                .bold()
                .dynamicTypeSize(.large ... .accessibility3) // Support range of sizes
            
            Text("Find the perfect present for everyone on your list")
                .font(.body)
                .dynamicTypeSize(.small ... .accessibility5)
                .multilineTextAlignment(.center)
                .lineLimit(nil) // Allow unlimited lines for large text
                .fixedSize(horizontal: false, vertical: true) // Allow vertical growth
        }
        .padding()
    }
}
```

## Latest Apple Resources

### WWDC24 Sessions to Watch
1. "What's new in SwiftUI" - WWDC24
2. "Advances in Swift Data" - WWDC24 
3. "Build an app with SwiftData" - WWDC24
4. "Integrate Swift Data with your UI" - WWDC24
5. "What's new in iPad app development" - WWDC24
6. "Make your app more accessible with UIKit and SwiftUI" - WWDC24
7. "Enhance your app with Vision framework" - WWDC24
8. "Create seamless animations in SwiftUI" - WWDC24
9. "What's new in background tasks" - WWDC24
10. "Add widgets to your app" - WWDC24

### iOS Design Inspirations (2024)
1. **Text Input**
   - Use the improved TextEditor with formatting and alignments
   - Implement natural language suggestions for gift ideas
   - Support speech-to-text with the updated Dictation API

2. **List & Grid Layouts**
   - Use the new SwiftUI Grid component for gift galleries
   - Implement pinned sections for important occasions
   - Add pull-to-refresh with custom animations

3. **Animations & Transitions**
   - Implement spring animations for delightful interactions
   - Use matchedGeometryEffect for shared element transitions
   - Implement phased animations for sequential effects

4. **Micro-interactions**
   - Add haptic feedback for important actions
   - Use subtle animations for state changes
   - Implement progress indicators for multi-step operations

5. **Visualization**
   - Use Swift Charts for budget and gift statistics
   - Implement timeline views for occasion planning
   - Create interactive calendars for gift scheduling

### New AI Integration Approaches (2024-2025)
1. **On-Device ML**
   - Use Core ML for local entity extraction
   - Implement image recognition with Vision framework
   - Use NLP for smart categorization of gift ideas

2. **Multi-Modal Input**
   - Voice transcription with improved accuracy
   - Image analysis with object recognition
   - Combined text + image processing for rich inputs

3. **Personalization**
   - Train custom ML models based on user preferences
   - Use clustering to suggest gift categories
   - Implement recommendation engines for similar gifts

4. **Privacy-Focused AI**
   - Implement Private On-Device Processing
   - Use differential privacy for analytics
   - Support local ML model updates

## Memory Anchor: iOS_Dev_Resources_20240516 (MA-301)
This document was last updated on May 16, 2024 with the latest SwiftUI, Swift Data, and AI integration practices for iOS development.