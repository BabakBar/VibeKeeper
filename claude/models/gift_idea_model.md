# GiftIdea Component Documentation

## Purpose
The GiftIdea component represents a potential or purchased gift for a specific person and occasion. It stores comprehensive information about a gift idea including what the item is, who it's for, when it's needed, budget considerations, and related assets or reminders. This component serves as a core entity in the VibeKeeper application, enabling users to track and manage gift ideas for various contacts and occasions.

## Schema

### Core Properties
```swift
struct GiftIdea: Identifiable, Codable {
    var id: UUID
    var recipient: String           // Who the gift is for
    var idea: String                // What the gift is
    var occasion: String?           // What the occasion is (e.g., birthday, Christmas)
    var date: Date?                 // When the occasion is
    var tags: [String]              // Keywords/categories for the gift
    var budget: Budget?             // Budget information
    var status: GiftStatus          // Current status (idea, purchased, given)
    var notes: String?              // Additional notes or information
    var mediaAssets: [MediaAsset]   // Associated images or recordings
    var reminders: [Reminder]       // Associated reminders
    var createdAt: Date             // When the gift idea was created
    var updatedAt: Date             // When the gift idea was last updated
}

enum GiftStatus: String, Codable {
    case idea       // Just an idea, not purchased yet
    case purchased  // Purchased but not given
    case given      // Given to the recipient
    case cancelled  // No longer planning to give
}

struct Budget: Codable {
    var amount: Double?             // Exact or approximate amount
    var currency: String            // Currency code (e.g., USD, EUR)
    var rangeMin: Double?           // Minimum budget range
    var rangeMax: Double?           // Maximum budget range
}

struct MediaAsset: Identifiable, Codable {
    var id: UUID
    var url: URL                    // URL to the media file
    var type: MediaType             // Type of media asset
    var thumbnail: URL?             // Optional thumbnail for images
    var createdAt: Date             // When the asset was created
}

enum MediaType: String, Codable {
    case image
    case audio
    case video
    case link
}
```

### Relationships
- **User**: One-to-many (User has many GiftIdeas)
- **Contact/Recipient**: Many-to-one (Contact has many GiftIdeas)
- **MediaAsset**: One-to-many (GiftIdea has many MediaAssets)
- **Reminder**: One-to-many (GiftIdea has many Reminders)
- **Tag**: Many-to-many (GiftIdea has many Tags, Tags belong to many GiftIdeas)

## Patterns

### Creation Pattern
Gift ideas can be created through multiple input methods:

1. **Direct user input**:
```swift
// User manually fills in a form with gift details
let giftIdea = GiftIdea(
    id: UUID(),
    recipient: "Sarah",
    idea: "Knitted scarf",
    occasion: "Birthday",
    date: dateFormatter.date(from: "2024-02-15"),
    tags: ["winter", "accessories", "handmade"],
    budget: Budget(amount: 45.0, currency: "USD", rangeMin: 40, rangeMax: 50),
    status: .idea,
    notes: "She likes blue and purple colors",
    mediaAssets: [],
    reminders: [],
    createdAt: Date(),
    updatedAt: Date()
)
```

2. **AI-powered extraction**:
```swift
// Text input processed by AI
let userInput = "I want to get Sarah a knitted scarf for her birthday on February 15th. Budget around $40-50. She likes blue and purple colors."

// Extract entities with AI
let extractionResult = try await entityExtractor.extractFromText(userInput)

// Convert to GiftIdea model
let giftIdea = GiftIdea(
    id: UUID(),
    recipient: extractionResult.recipient ?? "Unknown",
    idea: extractionResult.idea ?? "Unknown",
    occasion: extractionResult.occasion,
    date: extractionResult.date,
    tags: extractionResult.tags ?? [],
    budget: createBudgetFromExtraction(extractionResult),
    status: .idea,
    notes: extractionResult.notes,
    mediaAssets: [],
    reminders: [],
    createdAt: Date(),
    updatedAt: Date()
)
```

### Query Patterns
Common query patterns for gift ideas:

1. **By recipient**:
```swift
func giftIdeasForRecipient(recipientId: UUID) -> [GiftIdea] {
    return giftIdeas.filter { $0.recipientId == recipientId }
}
```

2. **By occasion and timeframe**:
```swift
func upcomingGiftIdeas(within days: Int = 30) -> [GiftIdea] {
    let cutoffDate = Calendar.current.date(byAdding: .day, value: days, to: Date())!
    return giftIdeas.filter { 
        guard let date = $0.date else { return false }
        return date <= cutoffDate && date >= Date() && $0.status == .idea
    }
}
```

3. **By budget range**:
```swift
func giftIdeasInBudgetRange(min: Double, max: Double, currency: String = "USD") -> [GiftIdea] {
    return giftIdeas.filter {
        guard let budget = $0.budget, budget.currency == currency else { return false }
        
        if let amount = budget.amount {
            return amount >= min && amount <= max
        } else if let rangeMin = budget.rangeMin, let rangeMax = budget.rangeMax {
            return rangeMax >= min && rangeMin <= max // Overlapping ranges
        }
        
        return false
    }
}
```

4. **By tags**:
```swift
func giftIdeasWithTags(_ tags: [String]) -> [GiftIdea] {
    return giftIdeas.filter { idea in
        !Set(idea.tags).intersection(Set(tags)).isEmpty
    }
}
```

### Update Pattern
```swift
func updateGiftIdea(_ giftIdea: GiftIdea) throws {
    // Validate the gift idea
    guard !giftIdea.idea.isEmpty else {
        throw GiftIdeaError.invalidIdea("Gift idea cannot be empty")
    }
    
    guard !giftIdea.recipient.isEmpty else {
        throw GiftIdeaError.invalidRecipient("Recipient cannot be empty")
    }
    
    // Update the gift idea
    var updatedGiftIdea = giftIdea
    updatedGiftIdea.updatedAt = Date()
    
    // Save to repository
    try giftIdeaRepository.update(updatedGiftIdea)
    
    // Update reminders if date changed
    if let date = updatedGiftIdea.date, 
       let originalIdea = giftIdeaRepository.get(id: giftIdea.id),
       originalIdea.date != date {
        try reminderService.regenerateReminders(for: updatedGiftIdea)
    }
}
```

## Interfaces

### GiftIdeaRepository
```swift
protocol GiftIdeaRepository {
    func getAll() throws -> [GiftIdea]
    func get(id: UUID) throws -> GiftIdea?
    func search(query: String) throws -> [GiftIdea]
    func create(_ giftIdea: GiftIdea) throws -> GiftIdea
    func update(_ giftIdea: GiftIdea) throws
    func delete(id: UUID) throws
    func getByRecipient(recipientId: UUID) throws -> [GiftIdea]
    func getByTags(tags: [String]) throws -> [GiftIdea]
    func getUpcoming(days: Int) throws -> [GiftIdea]
}
```

### GiftIdeaViewModel
```swift
class GiftIdeaViewModel: ObservableObject {
    @Published var giftIdeas: [GiftIdea] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    func loadGiftIdeas()
    func createGiftIdea(_ giftIdea: GiftIdea) async throws
    func updateGiftIdea(_ giftIdea: GiftIdea) async throws
    func deleteGiftIdea(id: UUID) async throws
    func searchGiftIdeas(query: String) async throws -> [GiftIdea]
    func filterGiftIdeas(recipient: UUID?, occasion: String?, tags: [String]?, status: GiftStatus?) -> [GiftIdea]
    func markAsPurchased(id: UUID) async throws
    func markAsGiven(id: UUID) async throws
}
```

## Invariants

1. A gift idea must always have a non-empty `idea` value
2. A gift idea must always have a non-empty `recipient` value
3. A gift idea's `id` must be unique within the system
4. A gift idea's `status` must be one of the predefined GiftStatus values
5. A gift idea's `date` must be a valid date (if provided)
6. If budget range is provided, `rangeMin` must be less than or equal to `rangeMax`
7. `createdAt` must be a valid date and cannot be modified after creation
8. `updatedAt` must be updated whenever any property of the gift idea changes
9. Creation time (`createdAt`) must not be later than update time (`updatedAt`)
10. Each media asset must have a valid URL and type

## Error States

### Possible Error Conditions
1. **Invalid Gift Idea**
   - Empty idea description
   - Missing recipient information
   - Invalid date format
   - Budget range where minimum exceeds maximum

2. **Data Persistence Errors**
   - Failed to save gift idea to database
   - Failed to retrieve gift idea from database
   - Concurrent modification conflicts

3. **Media Asset Errors**
   - Failed to upload or attach media
   - Invalid media format
   - Media exceeds size limit
   - Media URL no longer accessible

4. **Sync Errors**
   - Conflict between local and remote versions
   - Failed to sync with cloud storage
   - Offline creation/modification conflicts

### Error Handling
```swift
enum GiftIdeaError: Error {
    case invalidIdea(String)
    case invalidRecipient(String)
    case invalidDate(String)
    case invalidBudget(String)
    case persistenceError(String)
    case notFound(UUID)
    case mediaError(String)
    case syncError(String)
    case networkError(String)
    case unknown(String)
}

// Error handling example
func saveGiftIdea(_ giftIdea: GiftIdea) -> Result<GiftIdea, GiftIdeaError> {
    // Validate gift idea
    if giftIdea.idea.isEmpty {
        return .failure(.invalidIdea("Gift idea cannot be empty"))
    }
    
    if giftIdea.recipient.isEmpty {
        return .failure(.invalidRecipient("Recipient cannot be empty"))
    }
    
    if let budgetMin = giftIdea.budget?.rangeMin,
       let budgetMax = giftIdea.budget?.rangeMax,
       budgetMin > budgetMax {
        return .failure(.invalidBudget("Budget minimum cannot exceed maximum"))
    }
    
    // Attempt to save
    do {
        let savedGiftIdea = try giftIdeaRepository.create(giftIdea)
        return .success(savedGiftIdea)
    } catch {
        return .failure(.persistenceError("Failed to save gift idea: \(error.localizedDescription)"))
    }
}
```

## Memory Anchor Points

### UUID-based Anchors

```
// GiftIdea_Core_Properties (MA-01)
The GiftIdea model's core properties include id, recipient, idea, occasion, date, and tags.

// GiftIdea_Status_Workflow (MA-02)
The workflow for gift status transitions follows: idea -> purchased -> given

// GiftIdea_Budget_Structure (MA-03)
Budget structure includes both exact amount and min-max range to handle different input patterns.

// GiftIdea_MediaAsset_Integration (MA-04)
MediaAssets capture multi-modal input (images, audio recordings) related to gift ideas.

// GiftIdea_Repository_Interface (MA-05)
The repository interface handles CRUD operations and specialized queries for gift ideas.
```