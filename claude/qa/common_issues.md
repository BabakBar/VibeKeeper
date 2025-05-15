# Common Issues and Solutions

## SwiftUI Architecture

### Q1: What's the best state management approach for VibeKeeper?

**Problem Context:**  
Need to determine the optimal state management architecture for the VibeKeeper app that handles complex data flows between different views while ensuring good performance.

**Solution:**  
Use the MVVM pattern with ObservableObject view models:

```swift
// Preferred approach for VibeKeeper
class GiftIdeaViewModel: ObservableObject {
    @Published var giftIdeas: [GiftIdea] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository: GiftIdeaRepository
    
    init(repository: GiftIdeaRepository = GiftIdeaRepository()) {
        self.repository = repository
    }
    
    func loadGiftIdeas() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let ideas = try await repository.fetchGiftIdeas()
                DispatchQueue.main.async {
                    self.giftIdeas = ideas
                    self.isLoading = false
                }
            } catch {
                DispatchQueue.main.async {
                    self.errorMessage = error.localizedDescription
                    self.isLoading = false
                }
            }
        }
    }
}
```

**Reasoning:**  
MVVM is most appropriate for VibeKeeper because:
1. It provides clean separation of concerns
2. SwiftUI's @ObservedObject and @Published work perfectly with MVVM
3. Allows for more testable code with dependency injection
4. Scales well as the app grows more complex
5. Easier to handle the complex gift idea data flow

**References:**  
- `claude/patterns/swiftui_patterns.md` - MVVM pattern implementation

### Q2: How should we handle deep linking in VibeKeeper?

**Problem Context:**  
Need to implement deep linking to specific parts of the app, such as opening a specific gift idea from a notification.

**Solution:**  
Use a coordinator pattern with NavigationPath to handle deep links:

```swift
// AppModel to handle app state including deep linking
class AppModel: ObservableObject {
    @Published var navigationPath = NavigationPath()
    @Published var selectedTab: Tab = .gifts
    
    // Enum for main tabs
    enum Tab {
        case gifts, contacts, capture, reminders, settings
    }
    
    // Handle deep links
    func handleDeepLink(_ url: URL) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: true),
              let host = components.host else {
            return
        }
        
        // Parse path components
        let pathComponents = components.path.split(separator: "/").map(String.init)
        
        switch host {
        case "gift":
            if let giftId = pathComponents.last, !giftId.isEmpty {
                // Navigate to specific gift
                selectedTab = .gifts
                navigationPath.append(DeepLink.gift(id: giftId))
            }
        case "contact":
            if let contactId = pathComponents.last, !contactId.isEmpty {
                // Navigate to specific contact
                selectedTab = .contacts
                navigationPath.append(DeepLink.contact(id: contactId))
            }
        case "capture":
            // Open capture screen
            selectedTab = .capture
        case "reminder":
            if let reminderId = pathComponents.last, !reminderId.isEmpty {
                // Navigate to specific reminder
                selectedTab = .reminders
                navigationPath.append(DeepLink.reminder(id: reminderId))
            }
        default:
            break
        }
    }
}

// Deep link types
enum DeepLink: Hashable {
    case gift(id: String)
    case contact(id: String)
    case reminder(id: String)
}

// Root view with deep link handling
struct RootView: View {
    @StateObject private var appModel = AppModel()
    
    var body: some View {
        TabView(selection: $appModel.selectedTab) {
            NavigationStack(path: $appModel.navigationPath) {
                GiftListView()
                    .navigationDestination(for: DeepLink.self) { deepLink in
                        switch deepLink {
                        case .gift(let id):
                            GiftDetailView(id: id)
                        case .contact(let id):
                            ContactDetailView(id: id)
                        case .reminder(let id):
                            ReminderDetailView(id: id)
                        }
                    }
            }
            .tabItem {
                Label("Gifts", systemImage: "gift")
            }
            .tag(AppModel.Tab.gifts)
            
            // Other tabs...
        }
        .onOpenURL { url in
            appModel.handleDeepLink(url)
        }
    }
}
```

**Reasoning:**  
This approach is optimal because:
1. It centralizes deep link handling in a single coordinator
2. Works well with SwiftUI's NavigationStack
3. Separates navigation logic from view code
4. Can handle complex navigation paths
5. Scales well when adding new deep link types

## Core Data Integration

### Q3: How to structure Core Data models for VibeKeeper gift ideas?

**Problem Context:**  
Need to design a Core Data model for gift ideas that supports relationships, searching, and efficient data access.

**Solution:**  
Create data models with proper relationships and fetched properties:

```swift
// 1. Define Core Data model entities
// GiftIdea.swift
import CoreData

class GiftIdea: NSManagedObject, Identifiable {
    @NSManaged public var id: UUID
    @NSManaged public var idea: String
    @NSManaged public var occasion: String?
    @NSManaged public var dateRaw: Date?
    @NSManaged public var budgetAmount: NSDecimalNumber?
    @NSManaged public var budgetCurrency: String?
    @NSManaged public var status: String
    @NSManaged public var notes: String?
    @NSManaged public var createdAt: Date
    @NSManaged public var updatedAt: Date
    @NSManaged public var recipientRaw: Contact?
    @NSManaged public var tagsRaw: NSSet?
    @NSManaged public var mediaAssetsRaw: NSSet?
    @NSManaged public var remindersRaw: NSSet?
    
    // Computed properties
    var date: Date? {
        get { return dateRaw }
        set { dateRaw = newValue }
    }
    
    var recipient: Contact? {
        get { return recipientRaw }
        set { recipientRaw = newValue }
    }
    
    var tags: [Tag] {
        get {
            let set = tagsRaw as? Set<Tag> ?? []
            return set.sorted { $0.name ?? "" < $1.name ?? "" }
        }
        set {
            tagsRaw = NSSet(array: newValue)
        }
    }
    
    var mediaAssets: [MediaAsset] {
        get {
            let set = mediaAssetsRaw as? Set<MediaAsset> ?? []
            return set.sorted { $0.createdAt ?? Date.distantPast < $1.createdAt ?? Date.distantPast }
        }
        set {
            mediaAssetsRaw = NSSet(array: newValue)
        }
    }
    
    var reminders: [Reminder] {
        get {
            let set = remindersRaw as? Set<Reminder> ?? []
            return set.sorted { $0.scheduledFor ?? Date.distantFuture < $1.scheduledFor ?? Date.distantFuture }
        }
        set {
            remindersRaw = NSSet(array: newValue)
        }
    }
}

// 2. Create a Core Data helper class
class CoreDataStack {
    static let shared = CoreDataStack()
    
    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "VibeKeeper")
        
        // Enable automatic cloud sync with CloudKit
        if let description = container.persistentStoreDescriptions.first {
            description.setOption(true as NSNumber, forKey: NSPersistentStoreRemoteChangeNotificationPostOptionKey)
            description.cloudKitContainerOptions = NSPersistentCloudKitContainerOptions(containerIdentifier: "iCloud.com.example.VibeKeeper")
        }
        
        container.loadPersistentStores { _, error in
            if let error = error as NSError? {
                fatalError("Failed to load Core Data: \(error), \(error.userInfo)")
            }
        }
        
        // Observe remote changes
        NotificationCenter.default.addObserver(self, selector: #selector(processRemoteChanges), name: .NSPersistentStoreRemoteChange, object: nil)
        
        container.viewContext.automaticallyMergesChangesFromParent = true
        container.viewContext.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy
        
        return container
    }()
    
    var viewContext: NSManagedObjectContext {
        return persistentContainer.viewContext
    }
    
    func newBackgroundContext() -> NSManagedObjectContext {
        return persistentContainer.newBackgroundContext()
    }
    
    @objc func processRemoteChanges(_ notification: Notification) {
        // Handle remote changes from CloudKit
        persistentContainer.viewContext.perform {
            self.persistentContainer.viewContext.refreshAllObjects()
        }
    }
    
    // Helper method to save context
    func saveContext() {
        let context = persistentContainer.viewContext
        if context.hasChanges {
            do {
                try context.save()
            } catch {
                let error = error as NSError
                print("Failed to save context: \(error), \(error.userInfo)")
            }
        }
    }
}

// 3. Repository pattern for data access
class GiftIdeaRepository {
    private let context: NSManagedObjectContext
    
    init(context: NSManagedObjectContext? = nil) {
        self.context = context ?? CoreDataStack.shared.viewContext
    }
    
    func fetchGiftIdeas(matching query: String? = nil) async throws -> [GiftIdea] {
        return try await withCheckedThrowingContinuation { continuation in
            let fetchRequest: NSFetchRequest<GiftIdea> = GiftIdea.fetchRequest()
            
            // Add sorting
            fetchRequest.sortDescriptors = [
                NSSortDescriptor(keyPath: \GiftIdea.dateRaw, ascending: true),
                NSSortDescriptor(keyPath: \GiftIdea.createdAt, ascending: false)
            ]
            
            // Add search predicate if query provided
            if let query = query, !query.isEmpty {
                fetchRequest.predicate = NSPredicate(
                    format: "idea CONTAINS[cd] %@ OR occasion CONTAINS[cd] %@ OR notes CONTAINS[cd] %@",
                    query, query, query
                )
            }
            
            do {
                let results = try context.fetch(fetchRequest)
                continuation.resume(returning: results)
            } catch {
                continuation.resume(throwing: error)
            }
        }
    }
    
    // Other repository methods...
}
```

**Reasoning:**  
This approach offers several benefits:
1. Proper entity relationships improve data integrity
2. Computed properties provide a clean API over the Core Data entities
3. Repository pattern isolates Core Data implementation details
4. CloudKit integration enables cross-device syncing
5. Background context operations prevent UI blocking
6. Proper error handling with async/await pattern

**References:**  
- `claude/code_index/semantic_structure.json` - Data model structure

## AI Integration

### Q4: How to handle varying quality in AI entity extraction?

**Problem Context:**  
The AI entity extraction from user input sometimes produces incomplete or low-confidence results.

**Solution:**  
Implement a confidence-based validation system with fallbacks:

```swift
class EntityValidator {
    // Confidence thresholds
    private let highConfidence: Double = 0.85
    private let mediumConfidence: Double = 0.70
    private let lowConfidence: Double = 0.50
    
    func validateExtraction(_ result: EntityExtractionResult) -> ValidationResult {
        var missingFields: [String] = []
        var lowConfidenceFields: [(field: String, confidence: Double)] = []
        var validatedResult = result
        
        // Check for missing required fields
        if result.recipient == nil {
            missingFields.append("recipient")
        } else if let confidence = result.confidence["recipient"], confidence < mediumConfidence {
            lowConfidenceFields.append(("recipient", confidence))
        }
        
        if result.idea == nil {
            missingFields.append("idea")
        } else if let confidence = result.confidence["idea"], confidence < mediumConfidence {
            lowConfidenceFields.append(("idea", confidence))
        }
        
        // Apply fixes for common extraction issues
        if let date = result.date, let confidence = result.confidence["date"], confidence < mediumConfidence {
            // Validate date is in the future
            if date < Date() && !Calendar.current.isDateInToday(date) {
                // Date might be wrong, try to fix by assuming it's next year
                let calendar = Calendar.current
                if let nextYearDate = calendar.date(byAdding: .year, value: 1, to: date) {
                    validatedResult.date = nextYearDate
                    lowConfidenceFields.append(("date", confidence))
                }
            }
        }
        
        // Determine validation status
        var status: ValidationStatus
        if !missingFields.isEmpty {
            status = .invalid(missingFields: missingFields)
        } else if !lowConfidenceFields.isEmpty {
            status = .needsConfirmation(lowConfidenceFields: lowConfidenceFields)
        } else {
            status = .valid
        }
        
        return ValidationResult(
            status: status,
            validatedResult: validatedResult
        )
    }
    
    // Handle user confirmation for low confidence fields
    func applyUserConfirmation(
        to result: EntityExtractionResult,
        confirmations: [String: String]
    ) -> EntityExtractionResult {
        var updatedResult = result
        
        for (field, value) in confirmations {
            switch field {
            case "recipient":
                updatedResult.recipient = value
                updatedResult.confidence["recipient"] = highConfidence
            case "idea":
                updatedResult.idea = value
                updatedResult.confidence["idea"] = highConfidence
            case "occasion":
                updatedResult.occasion = value
                updatedResult.confidence["occasion"] = highConfidence
            case "date":
                let dateFormatter = DateFormatter()
                dateFormatter.dateFormat = "yyyy-MM-dd"
                updatedResult.date = dateFormatter.date(from: value)
                updatedResult.confidence["date"] = highConfidence
            default:
                break
            }
        }
        
        return updatedResult
    }
}

// Supporting types
enum ValidationStatus {
    case valid
    case needsConfirmation(lowConfidenceFields: [(field: String, confidence: Double)])
    case invalid(missingFields: [String])
}

struct ValidationResult {
    let status: ValidationStatus
    let validatedResult: EntityExtractionResult
}

// Usage in UI
struct ConfirmExtractionView: View {
    @State private var extraction: EntityExtractionResult
    @State private var validationResult: ValidationResult
    @State private var confirmations: [String: String] = [:]
    
    private let validator = EntityValidator()
    
    init(extraction: EntityExtractionResult) {
        self._extraction = State(initialValue: extraction)
        self._validationResult = State(initialValue: 
            EntityValidator().validateExtraction(extraction))
    }
    
    var body: some View {
        Form {
            Section(header: Text("Gift Idea Details")) {
                if case .needsConfirmation(let lowConfidenceFields) = validationResult.status {
                    Text("Please confirm these details:")
                        .font(.caption)
                        .foregroundColor(.orange)
                    
                    ForEach(lowConfidenceFields, id: \.field) { field, confidence in
                        switch field {
                        case "recipient":
                            HStack {
                                Text("Recipient:")
                                TextField("Who is this for?", 
                                    text: Binding(
                                        get: { confirmations["recipient"] ?? extraction.recipient ?? "" },
                                        set: { confirmations["recipient"] = $0 }
                                    )
                                )
                            }
                        case "idea":
                            HStack {
                                Text("Gift idea:")
                                TextField("What is the gift?", 
                                    text: Binding(
                                        get: { confirmations["idea"] ?? extraction.idea ?? "" },
                                        set: { confirmations["idea"] = $0 }
                                    )
                                )
                            }
                        // Other fields...
                        default:
                            EmptyView()
                        }
                    }
                }
                
                // Other fields display...
            }
            
            Section {
                Button("Save Gift Idea") {
                    let finalResult = validator.applyUserConfirmation(
                        to: extraction,
                        confirmations: confirmations
                    )
                    
                    // Save the validated result
                    saveGiftIdea(finalResult)
                }
                .disabled(validationResult.status.isInvalid)
            }
        }
    }
    
    private func saveGiftIdea(_ extraction: EntityExtractionResult) {
        // Implementation
    }
}

extension ValidationStatus {
    var isInvalid: Bool {
        if case .invalid = self {
            return true
        }
        return false
    }
}
```

**Reasoning:**  
This approach provides a robust solution because:
1. It uses confidence scores to identify potentially problematic extractions
2. Provides user interface for confirming uncertain fields
3. Handles common error patterns like dates in the past
4. Maintains the original extraction as a fallback
5. Separates validation logic from UI code

**References:**  
- `claude/patterns/ai_integration_patterns.md` - Entity extraction pattern
- `claude/cheatsheets/ai_integration.md` - Error handling

## Performance Optimization

### Q5: How to optimize image loading and caching in VibeKeeper?

**Problem Context:**  
Loading and displaying gift idea images causes UI stuttering, especially when scrolling through a list of gift ideas.

**Solution:**  
Implement an efficient image loading and caching system:

```swift
// 1. Create an image cache
actor ImageCache {
    static let shared = ImageCache()
    
    private var cache: [URL: ImageState] = [:]
    private let memoryLimit: Int = 100 * 1024 * 1024 // 100 MB limit
    private var currentMemoryUsage: Int = 0
    
    enum ImageState {
        case loading
        case loaded(UIImage)
        case failed(Error)
    }
    
    func image(for url: URL) -> ImageState? {
        return cache[url]
    }
    
    func setImage(_ image: UIImage, for url: URL) {
        guard let imageSize = image.jpegData(compressionQuality: 1.0)?.count else {
            return
        }
        
        // Check if we need to clear cache
        if currentMemoryUsage + imageSize > memoryLimit {
            clearCache()
        }
        
        cache[url] = .loaded(image)
        currentMemoryUsage += imageSize
    }
    
    func setLoading(for url: URL) {
        cache[url] = .loading
    }
    
    func setFailed(_ error: Error, for url: URL) {
        cache[url] = .failed(error)
    }
    
    func removeImage(for url: URL) {
        if case .loaded(let image) = cache[url],
           let imageSize = image.jpegData(compressionQuality: 1.0)?.count {
            currentMemoryUsage -= imageSize
        }
        cache[url] = nil
    }
    
    func clearCache() {
        cache.removeAll()
        currentMemoryUsage = 0
    }
}

// 2. Create an AsyncImage view with caching
struct CachedAsyncImage<Content: View, Placeholder: View>: View {
    private let url: URL?
    private let scale: CGFloat
    private let content: (Image) -> Content
    private let placeholder: () -> Placeholder
    
    @State private var imageState: ImageCache.ImageState?
    
    init(url: URL?,
         scale: CGFloat = 1.0,
         @ViewBuilder content: @escaping (Image) -> Content,
         @ViewBuilder placeholder: @escaping () -> Placeholder) {
        self.url = url
        self.scale = scale
        self.content = content
        self.placeholder = placeholder
    }
    
    var body: some View {
        ZStack {
            if let imageState = imageState {
                switch imageState {
                case .loading:
                    placeholder()
                case .loaded(let uiImage):
                    content(Image(uiImage: uiImage))
                case .failed:
                    placeholder()
                }
            } else {
                placeholder()
                    .onAppear {
                        loadImage()
                    }
            }
        }
        .task(id: url) {
            loadImage()
        }
    }
    
    private func loadImage() {
        guard let url = url else {
            return
        }
        
        Task {
            // Check cache first
            if let cachedState = await ImageCache.shared.image(for: url) {
                await MainActor.run {
                    imageState = cachedState
                }
                return
            }
            
            // Mark as loading
            await ImageCache.shared.setLoading(for: url)
            await MainActor.run {
                imageState = .loading
            }
            
            do {
                // Load image
                let (data, _) = try await URLSession.shared.data(from: url)
                guard let uiImage = UIImage(data: data) else {
                    throw URLError(.cannotDecodeContentData)
                }
                
                // Cache image
                await ImageCache.shared.setImage(uiImage, for: url)
                
                await MainActor.run {
                    imageState = .loaded(uiImage)
                }
            } catch {
                await ImageCache.shared.setFailed(error, for: url)
                
                await MainActor.run {
                    imageState = .failed(error)
                }
            }
        }
    }
}

// 3. Use in list views
struct GiftIdeaRow: View {
    let giftIdea: GiftIdea
    
    var body: some View {
        HStack {
            // If there's an image, show it with caching
            if let firstImageURL = giftIdea.mediaAssets.first(where: { $0.type == "image" })?.url {
                CachedAsyncImage(url: firstImageURL) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 60, height: 60)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                } placeholder: {
                    Rectangle()
                        .foregroundColor(.gray.opacity(0.2))
                        .frame(width: 60, height: 60)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
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
            }
            
            VStack(alignment: .leading) {
                Text(giftIdea.idea)
                    .font(.headline)
                
                if let recipient = giftIdea.recipient?.name {
                    Text("For: \(recipient)")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                if let date = giftIdea.date {
                    Text(dateFormatter.string(from: date))
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
        }
        .padding(.vertical, 4)
    }
    
    private var dateFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter
    }
}
```

**Reasoning:**  
This implementation is optimal because:
1. Uses Swift actor for thread-safe image caching
2. Implements memory usage limits to prevent OOM issues
3. Handles loading, success, and error states
4. Uses task-based asynchronous loading
5. Integrates well with SwiftUI lists
6. Preloads images when they appear in views
7. Intelligently reuses cached images

**References:**  
- `claude/cheatsheets/swiftui_basics.md` - AsyncImage reference

## Notifications and Reminders

### Q6: How to implement reliable reminder notifications?

**Problem Context:**  
Need to set up a reliable system for scheduling reminders and sending notifications for gift occasions.

**Solution:**  
Implement a robust notification system with background refresh and redundancy:

```swift
// 1. Reminder scheduler service
class ReminderScheduler {
    private let notificationCenter = UNUserNotificationCenter.current()
    private let persistenceManager: CoreDataStack
    private let bgTaskIdentifier = "com.vibekeeper.refreshReminders"
    
    init(persistenceManager: CoreDataStack = .shared) {
        self.persistenceManager = persistenceManager
        registerBackgroundTask()
    }
    
    // Set up background refresh task
    private func registerBackgroundTask() {
        BGTaskScheduler.shared.register(
            forTaskWithIdentifier: bgTaskIdentifier,
            using: nil
        ) { task in
            self.handleBackgroundRefresh(task: task as! BGAppRefreshTask)
        }
    }
    
    // Schedule the next background refresh
    func scheduleBackgroundRefresh() {
        let request = BGAppRefreshTaskRequest(identifier: bgTaskIdentifier)
        request.earliestBeginDate = Date(timeIntervalSinceNow: 1 * 60 * 60) // 1 hour from now
        
        do {
            try BGTaskScheduler.shared.submit(request)
        } catch {
            print("Could not schedule app refresh: \(error)")
        }
    }
    
    // Handle the background refresh task
    private func handleBackgroundRefresh(task: BGAppRefreshTask) {
        // Schedule the next background refresh
        scheduleBackgroundRefresh()
        
        // Create a task to refresh reminders that will be cancelled if we run out of time
        let refreshTask = Task {
            do {
                try await refreshReminders()
            } catch {
                print("Failed to refresh reminders: \(error)")
            }
        }
        
        // Set task expiration handler
        task.expirationHandler = {
            refreshTask.cancel()
        }
        
        // Inform the system when done
        Task {
            await refreshTask.value
            task.setTaskCompleted(success: true)
        }
    }
    
    // Refresh reminders
    func refreshReminders() async throws {
        // Check notification authorization
        let settings = await notificationCenter.notificationSettings()
        guard settings.authorizationStatus == .authorized else {
            throw ReminderError.notificationsDisabled
        }
        
        // Get upcoming occasions
        let occasions = try await fetchUpcomingOccasions()
        
        // Schedule reminders for each occasion
        for occasion in occasions {
            try await scheduleRemindersForOccasion(occasion)
        }
        
        // Check for pending reminders that need to be delivered
        try await deliverPendingReminders()
    }
    
    // Fetch upcoming occasions
    private func fetchUpcomingOccasions() async throws -> [Occasion] {
        let context = persistenceManager.viewContext
        
        return try await context.perform {
            let fetchRequest: NSFetchRequest<Occasion> = Occasion.fetchRequest()
            
            // Get occasions in the next 30 days
            let calendar = Calendar.current
            let now = Date()
            guard let thirtyDaysLater = calendar.date(byAdding: .day, value: 30, to: now) else {
                return []
            }
            
            fetchRequest.predicate = NSPredicate(format: "date >= %@ AND date <= %@", now as NSDate, thirtyDaysLater as NSDate)
            fetchRequest.sortDescriptors = [NSSortDescriptor(keyPath: \Occasion.date, ascending: true)]
            
            return try context.fetch(fetchRequest)
        }
    }
    
    // Schedule reminders for an occasion
    private func scheduleRemindersForOccasion(_ occasion: Occasion) async throws {
        guard let date = occasion.date else { return }
        
        // Get user preferences for lead time
        let leadTime = 7 // Default 7 days
        
        // Calculate reminder dates
        let calendar = Calendar.current
        let reminderDates = [
            calendar.date(byAdding: .day, value: -leadTime, to: date), // Lead time before
            calendar.date(byAdding: .day, value: -1, to: date),       // Day before
            calendar.date(bySettingHour: 9, minute: 0, second: 0, of: date) // Day of (9 AM)
        ].compactMap { $0 }
        
        // Filter out dates in the past
        let now = Date()
        let futureDates = reminderDates.filter { $0 > now }
        
        // Create notification requests for each date
        for reminderDate in futureDates {
            let identifier = "\(occasion.id)_\(reminderDate.timeIntervalSince1970)"
            
            // Check if this notification already exists
            let pendingRequests = await notificationCenter.pendingNotificationRequests()
            if pendingRequests.contains(where: { $0.identifier == identifier }) {
                continue // Skip if already scheduled
            }
            
            // Create notification content
            let content = UNMutableNotificationContent()
            let daysUntil = calendar.dateComponents([.day], from: now, to: date).day ?? 0
            
            if reminderDate == futureDates.last {
                // Day of notification
                content.title = "Today is \(occasion.contactName)'s \(occasion.name)!"
            } else if reminderDate == futureDates.dropLast().last {
                // Day before notification
                content.title = "Tomorrow is \(occasion.contactName)'s \(occasion.name)!"
            } else {
                // Lead time notification
                content.title = "\(occasion.contactName)'s \(occasion.name) is coming up"
                content.subtitle = "\(daysUntil) days until \(occasion.name) (\(formatDate(date)))"
            }
            
            // Add gift ideas if any
            if let contact = occasion.contact, !contact.giftIdeas.isEmpty {
                let giftIdeasText = contact.giftIdeas
                    .filter { $0.status == "idea" }
                    .prefix(3)
                    .map { "• \($0.idea)" }
                    .joined(separator: "\n")
                
                if !giftIdeasText.isEmpty {
                    content.body = "Gift ideas:\n\(giftIdeasText)"
                } else {
                    content.body = "Don't forget to get a gift!"
                }
            } else {
                content.body = "Don't forget to get a gift!"
            }
            
            content.sound = .default
            content.userInfo = ["occasionId": occasion.id]
            content.categoryIdentifier = "OCCASION_REMINDER"
            
            // Create trigger
            let components = calendar.dateComponents([.year, .month, .day, .hour, .minute], from: reminderDate)
            let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
            
            // Create and add request
            let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)
            try await notificationCenter.add(request)
        }
    }
    
    // Deliver any pending reminders that are due
    private func deliverPendingReminders() async throws {
        let context = persistenceManager.viewContext
        
        try await context.perform {
            let fetchRequest: NSFetchRequest<Reminder> = Reminder.fetchRequest()
            fetchRequest.predicate = NSPredicate(format: "scheduledFor <= %@ AND status == %@", 
                                               Date() as NSDate, "pending")
            
            let dueReminders = try context.fetch(fetchRequest)
            
            for reminder in dueReminders {
                // Create a local notification for each due reminder
                let content = UNMutableNotificationContent()
                content.title = "Gift Reminder"
                content.body = reminder.message
                content.sound = .default
                
                if let giftIdeaId = reminder.giftIdea?.id.uuidString {
                    content.userInfo = ["giftIdeaId": giftIdeaId]
                }
                
                // Use a time interval trigger with minimal delay
                let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
                
                // Create and schedule the notification
                let request = UNNotificationRequest(
                    identifier: "due_reminder_\(reminder.id)",
                    content: content,
                    trigger: trigger
                )
                
                try await self.notificationCenter.add(request)
                
                // Update reminder status
                reminder.status = "sent"
            }
            
            if !dueReminders.isEmpty {
                try context.save()
            }
        }
    }
    
    // Format date to string
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }
    
    // Handle notification settings
    func requestNotificationPermissions() async -> Bool {
        do {
            return try await notificationCenter.requestAuthorization(options: [.alert, .sound, .badge])
        } catch {
            print("Failed to request notification permissions: \(error)")
            return false
        }
    }
    
    // Clear all scheduled reminders
    func clearAllScheduledReminders() async {
        await notificationCenter.removeAllPendingNotificationRequests()
    }
    
    // Error types
    enum ReminderError: Error {
        case notificationsDisabled
        case failedToScheduleReminder(Error)
        case invalidDate
    }
}

// 2. Notification service in AppDelegate
class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    let reminderScheduler = ReminderScheduler()
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        // Set up notification delegate
        UNUserNotificationCenter.current().delegate = self
        
        // Configure categories for notification actions
        configureNotificationCategories()
        
        // Request permissions and schedule initial refresh
        Task {
            _ = await reminderScheduler.requestNotificationPermissions()
            reminderScheduler.scheduleBackgroundRefresh()
            try? await reminderScheduler.refreshReminders()
        }
        
        return true
    }
    
    // Configure notification categories
    private func configureNotificationCategories() {
        // "Mark as Done" action
        let markAsDoneAction = UNNotificationAction(
            identifier: "MARK_AS_DONE",
            title: "Mark as Done",
            options: [.authenticationRequired]
        )
        
        // "View Details" action
        let viewDetailsAction = UNNotificationAction(
            identifier: "VIEW_DETAILS",
            title: "View Details",
            options: [.foreground]
        )
        
        // Create category
        let occasionCategory = UNNotificationCategory(
            identifier: "OCCASION_REMINDER",
            actions: [markAsDoneAction, viewDetailsAction],
            intentIdentifiers: [],
            options: []
        )
        
        // Register the category
        UNUserNotificationCenter.current().setNotificationCategories([occasionCategory])
    }
    
    // Handle notification response
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        // Extract data from notification
        let userInfo = response.notification.request.content.userInfo
        
        switch response.actionIdentifier {
        case "MARK_AS_DONE":
            // Handle marking reminder as done
            if let occasionId = userInfo["occasionId"] as? String {
                Task {
                    try await markOccasionAsHandled(occasionId)
                    completionHandler()
                }
            } else {
                completionHandler()
            }
            
        case "VIEW_DETAILS":
            // Handle deep linking to details view
            if let occasionId = userInfo["occasionId"] as? String {
                NotificationCenter.default.post(
                    name: NSNotification.Name("ViewOccasionDetails"),
                    object: nil,
                    userInfo: ["occasionId": occasionId]
                )
            } else if let giftIdeaId = userInfo["giftIdeaId"] as? String {
                NotificationCenter.default.post(
                    name: NSNotification.Name("ViewGiftIdeaDetails"),
                    object: nil,
                    userInfo: ["giftIdeaId": giftIdeaId]
                )
            }
            completionHandler()
            
        default:
            // Default action (notification tapped)
            completionHandler()
        }
    }
    
    private func markOccasionAsHandled(_ occasionId: String) async throws {
        // Implementation to mark the occasion as handled
    }
    
    // Refresh reminders when app becomes active
    func applicationDidBecomeActive(_ application: UIApplication) {
        Task {
            try? await reminderScheduler.refreshReminders()
        }
    }
    
    func applicationDidEnterBackground(_ application: UIApplication) {
        reminderScheduler.scheduleBackgroundRefresh()
    }
}
```

**Reasoning:**  
This implementation provides a reliable notification system because:
1. Uses background tasks to ensure reminders are refreshed regularly
2. Implements multiple reminder points (lead time, day before, day of)
3. Prevents duplicate notifications with identifier checks
4. Handles both scheduled reminders and immediate "due" reminders
5. Provides interactive notification actions
6. Implements deep linking to relevant screens
7. Refreshes the schedule when the app becomes active

**References:**  
- `claude/patterns/ai_integration_patterns.md` - Reminder system pattern