# AI Integration Patterns for VibeKeeper

## Entity Extraction Pattern

### Pattern Description
This pattern describes how to extract structured data from unstructured inputs (text, voice transcripts, image descriptions) using AI services.

### Implementation Example

```swift
// Core/AI/EntityExtractor.swift
import Foundation

struct EntityExtractionResult {
    var recipient: String?
    var idea: String?
    var occasion: String?
    var date: Date?
    var tags: [String]?
    var budget: Double?
    var budgetRange: ClosedRange<Double>?
    var currency: String?
    var notes: String?
    
    var confidence: [String: Double]
    
    var isValid: Bool {
        // A valid extraction must have at least these core fields
        return recipient != nil && idea != nil
    }
}

class EntityExtractor {
    enum ExtractionError: Error {
        case processingError(String)
        case invalidResponse
        case missingRequiredFields
    }
    
    private let aiService: AIService
    
    init(aiService: AIService = AIService()) {
        self.aiService = aiService
    }
    
    func extractFromText(_ text: String) async throws -> EntityExtractionResult {
        // Create the prompt for entity extraction
        let prompt = """
        You are an AI assistant helping to extract structured information about gift ideas from user input.
        Extract the following entities if present:
        
        - recipient: Who is this gift for?
        - idea: What is the gift idea?
        - occasion: What's the occasion? (birthday, anniversary, Christmas, etc.)
        - date: When is the occasion? (YYYY-MM-DD format)
        - tags: Keywords that describe the gift (comma-separated list)
        - budget: How much is the user planning to spend? (numeric value)
        - notes: Any additional information
        
        User input: \(text)
        
        Respond with a JSON object containing the extracted entities and confidence scores.
        """
        
        // Make the AI request
        let response = try await aiService.generateCompletion(prompt: prompt)
        
        // Parse the response
        return try parseExtractionResponse(response)
    }
    
    func extractFromVoiceTranscript(_ transcript: String) async throws -> EntityExtractionResult {
        // For voice, we can use the same processing as text
        return try await extractFromText(transcript)
    }
    
    func extractFromImageAnalysis(_ imageDescription: String) async throws -> EntityExtractionResult {
        // For image descriptions, we can use the same processing as text
        // but might want to adjust the prompt to account for the visual context
        let promptWithContext = """
        You are an AI assistant helping to extract structured information about gift ideas from a description of an image.
        The image description is: \(imageDescription)
        
        Based on this description, extract the following entities if present:
        
        - recipient: Who might this gift be for?
        - idea: What is the gift idea shown in the image?
        - occasion: What occasion might this gift be for?
        - tags: Keywords that describe the gift (comma-separated list)
        - budget: Estimated price range for this item
        - notes: Any additional information
        
        Respond with a JSON object containing the extracted entities and confidence scores.
        """
        
        // Make the AI request
        let response = try await aiService.generateCompletion(prompt: promptWithContext)
        
        // Parse the response
        return try parseExtractionResponse(response)
    }
    
    private func parseExtractionResponse(_ response: String) throws -> EntityExtractionResult {
        // Try to extract JSON from the response
        guard let jsonData = extractJSON(from: response)?.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: jsonData) as? [String: Any] else {
            throw ExtractionError.invalidResponse
        }
        
        // Extract values with confidence scores
        var result = EntityExtractionResult(confidence: [:])
        var confidence: [String: Double] = [:]
        
        if let recipient = json["recipient"] as? String {
            result.recipient = recipient
            confidence["recipient"] = json["recipient_confidence"] as? Double ?? 1.0
        }
        
        if let idea = json["idea"] as? String {
            result.idea = idea
            confidence["idea"] = json["idea_confidence"] as? Double ?? 1.0
        }
        
        if let occasion = json["occasion"] as? String {
            result.occasion = occasion
            confidence["occasion"] = json["occasion_confidence"] as? Double ?? 1.0
        }
        
        if let dateString = json["date"] as? String {
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "yyyy-MM-dd"
            result.date = dateFormatter.date(from: dateString)
            confidence["date"] = json["date_confidence"] as? Double ?? 1.0
        }
        
        if let tagsString = json["tags"] as? String {
            result.tags = tagsString.components(separatedBy: ",").map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            confidence["tags"] = json["tags_confidence"] as? Double ?? 1.0
        } else if let tags = json["tags"] as? [String] {
            result.tags = tags
            confidence["tags"] = json["tags_confidence"] as? Double ?? 1.0
        }
        
        if let budget = json["budget"] as? Double {
            result.budget = budget
            confidence["budget"] = json["budget_confidence"] as? Double ?? 1.0
        } else if let budgetString = json["budget"] as? String, let budget = Double(budgetString) {
            result.budget = budget
            confidence["budget"] = json["budget_confidence"] as? Double ?? 1.0
        } else if let budgetDict = json["budget"] as? [String: Any] {
            if let amount = budgetDict["amount"] as? Double {
                result.budget = amount
            }
            
            if let rangeArray = budgetDict["range"] as? [Double], rangeArray.count == 2 {
                result.budgetRange = rangeArray[0]...rangeArray[1]
            }
            
            if let currency = budgetDict["currency"] as? String {
                result.currency = currency
            }
            
            confidence["budget"] = json["budget_confidence"] as? Double ?? 1.0
        }
        
        if let notes = json["notes"] as? String {
            result.notes = notes
            confidence["notes"] = json["notes_confidence"] as? Double ?? 1.0
        }
        
        result.confidence = confidence
        
        // Validate that we have the minimum required fields
        if !result.isValid {
            throw ExtractionError.missingRequiredFields
        }
        
        return result
    }
    
    private func extractJSON(from text: String) -> String? {
        // Try to find JSON-like structure in the text
        if let startIndex = text.firstIndex(of: "{"),
           let endIndex = text.lastIndex(of: "}") {
            return String(text[startIndex...endIndex])
        }
        return nil
    }
}

// Mock AIService for the example
class AIService {
    func generateCompletion(prompt: String) async throws -> String {
        // In a real implementation, this would call an AI API like OpenAI
        // This is just a mock response
        return """
        {
            "recipient": "Sarah",
            "recipient_confidence": 0.95,
            "idea": "knitted scarf",
            "idea_confidence": 0.97,
            "occasion": "birthday",
            "occasion_confidence": 0.92,
            "date": "2024-02-15",
            "date_confidence": 0.85,
            "tags": "knitted,scarf,blue,purple,winter,accessories",
            "tags_confidence": 0.88,
            "budget": {
                "amount": 45,
                "range": [40, 50],
                "currency": "USD"
            },
            "budget_confidence": 0.82,
            "notes": "She likes blue and purple colors.",
            "notes_confidence": 0.75
        }
        """
    }
}
```

## Multi-Modal Processing Pipeline

### Pattern Description
This pattern demonstrates how to process different types of input (text, voice, image) with a unified pipeline.

### Implementation Example

```swift
// Core/Capture/CaptureService.swift
import Foundation
import AVFoundation
import UIKit

enum CaptureError: Error {
    case invalidInput
    case processingFailed(String)
    case aiServiceError(Error)
    case storageError(Error)
    case transcriptionError(Error)
    case imageAnalysisError(Error)
}

class CaptureService {
    private let entityExtractor: EntityExtractor
    private let storageService: StorageService
    private let transcriptionService: TranscriptionService
    private let imageAnalysisService: ImageAnalysisService
    
    init(entityExtractor: EntityExtractor = EntityExtractor(),
         storageService: StorageService = StorageService(),
         transcriptionService: TranscriptionService = TranscriptionService(),
         imageAnalysisService: ImageAnalysisService = ImageAnalysisService()) {
        self.entityExtractor = entityExtractor
        self.storageService = storageService
        self.transcriptionService = transcriptionService
        self.imageAnalysisService = imageAnalysisService
    }
    
    // Process text input
    func processTextCapture(_ text: String) async throws -> GiftIdea {
        guard !text.isEmpty else {
            throw CaptureError.invalidInput
        }
        
        do {
            // Extract entities from text
            let extractionResult = try await entityExtractor.extractFromText(text)
            
            // Convert to GiftIdea model
            return createGiftIdeaFromExtraction(extractionResult, sourceText: text)
        } catch let error as EntityExtractor.ExtractionError {
            throw CaptureError.processingFailed("Entity extraction failed: \(error)")
        } catch {
            throw CaptureError.aiServiceError(error)
        }
    }
    
    // Process voice recording
    func processVoiceCapture(_ audioData: Data) async throws -> GiftIdea {
        do {
            // Transcribe audio to text
            let transcript = try await transcriptionService.transcribeAudio(audioData)
            
            // Store the audio file
            let audioURL = try await storageService.storeAudioFile(audioData)
            
            // Process the transcript
            let extractionResult = try await entityExtractor.extractFromVoiceTranscript(transcript)
            
            // Convert to GiftIdea model with audio reference
            var giftIdea = createGiftIdeaFromExtraction(extractionResult, sourceText: transcript)
            giftIdea.mediaAssets = [MediaAsset(url: audioURL, type: "audio")]
            
            return giftIdea
        } catch let error as TranscriptionService.TranscriptionError {
            throw CaptureError.transcriptionError(error)
        } catch let error as StorageService.StorageError {
            throw CaptureError.storageError(error)
        } catch {
            throw CaptureError.processingFailed("Voice processing failed: \(error.localizedDescription)")
        }
    }
    
    // Process image capture
    func processImageCapture(_ imageData: Data, caption: String? = nil) async throws -> GiftIdea {
        do {
            // Analyze the image
            let imageDescription = try await imageAnalysisService.analyzeImage(imageData, caption: caption)
            
            // Store the image file
            let imageURL = try await storageService.storeImageFile(imageData)
            
            // Process the image description
            let extractionResult = try await entityExtractor.extractFromImageAnalysis(imageDescription)
            
            // Convert to GiftIdea model with image reference
            var giftIdea = createGiftIdeaFromExtraction(extractionResult, sourceText: imageDescription)
            giftIdea.mediaAssets = [MediaAsset(url: imageURL, type: "image")]
            
            return giftIdea
        } catch let error as ImageAnalysisService.AnalysisError {
            throw CaptureError.imageAnalysisError(error)
        } catch let error as StorageService.StorageError {
            throw CaptureError.storageError(error)
        } catch {
            throw CaptureError.processingFailed("Image processing failed: \(error.localizedDescription)")
        }
    }
    
    // Unified capture method
    func processCapture(contentType: String, textContent: String?, mediaData: Data?) async throws -> GiftIdea {
        switch contentType {
        case "text":
            guard let text = textContent, !text.isEmpty else {
                throw CaptureError.invalidInput
            }
            return try await processTextCapture(text)
            
        case "voice":
            guard let audioData = mediaData else {
                throw CaptureError.invalidInput
            }
            return try await processVoiceCapture(audioData)
            
        case "image":
            guard let imageData = mediaData else {
                throw CaptureError.invalidInput
            }
            return try await processImageCapture(imageData, caption: textContent)
            
        default:
            throw CaptureError.invalidInput
        }
    }
    
    // Helper method to convert extraction result to GiftIdea model
    private func createGiftIdeaFromExtraction(_ extraction: EntityExtractionResult, sourceText: String) -> GiftIdea {
        return GiftIdea(
            id: UUID().uuidString,
            recipient: extraction.recipient ?? "Unknown",
            idea: extraction.idea ?? "Unknown",
            occasion: extraction.occasion ?? "Other",
            date: extraction.date,
            tags: extraction.tags ?? [],
            budget: extraction.budget,
            budgetCurrency: extraction.currency ?? "USD",
            budgetRangeMin: extraction.budgetRange?.lowerBound,
            budgetRangeMax: extraction.budgetRange?.upperBound,
            status: "idea",
            notes: extraction.notes ?? sourceText,
            mediaAssets: []
        )
    }
}

// Supporting service classes
struct GiftIdea {
    var id: String
    var recipient: String
    var idea: String
    var occasion: String
    var date: Date?
    var tags: [String]
    var budget: Double?
    var budgetCurrency: String
    var budgetRangeMin: Double?
    var budgetRangeMax: Double?
    var status: String
    var notes: String?
    var mediaAssets: [MediaAsset]
}

struct MediaAsset {
    var url: URL
    var type: String // "image", "audio", etc.
}

class TranscriptionService {
    enum TranscriptionError: Error {
        case processingFailed(String)
    }
    
    func transcribeAudio(_ audioData: Data) async throws -> String {
        // In a real implementation, this would use Whisper API or similar
        // Mock implementation
        return "I want to get Sarah a knitted scarf for her birthday on February 15th. Budget around $40-50. She likes blue and purple colors."
    }
}

class ImageAnalysisService {
    enum AnalysisError: Error {
        case processingFailed(String)
    }
    
    func analyzeImage(_ imageData: Data, caption: String? = nil) async throws -> String {
        // In a real implementation, this would use Vision API or similar
        // Mock implementation
        let baseDescription = "Image shows a blue and purple knitted scarf with a price tag showing $45."
        if let caption = caption, !caption.isEmpty {
            return "\(baseDescription) User caption: \(caption)"
        }
        return baseDescription
    }
}

class StorageService {
    enum StorageError: Error {
        case storageFailed(String)
    }
    
    func storeAudioFile(_ audioData: Data) async throws -> URL {
        // Mock implementation
        return URL(string: "https://storage.example.com/audio/recording-\(UUID().uuidString).m4a")!
    }
    
    func storeImageFile(_ imageData: Data) async throws -> URL {
        // Mock implementation
        return URL(string: "https://storage.example.com/images/image-\(UUID().uuidString).jpg")!
    }
}
```

## Reminder System Pattern

### Pattern Description
A pattern for scheduling and managing notifications based on specific dates and user preferences.

### Implementation Example

```swift
// Core/Notifications/ReminderService.swift
import Foundation
import UserNotifications

class ReminderService {
    enum ReminderError: Error {
        case schedulingFailed(String)
        case notificationPermissionDenied
        case invalidReminderData
    }
    
    private let notificationCenter = UNUserNotificationCenter.current()
    
    // Request notification permissions
    func requestNotificationPermissions() async throws -> Bool {
        let options: UNAuthorizationOptions = [.alert, .sound, .badge]
        return try await notificationCenter.requestAuthorization(options: options)
    }
    
    // Schedule a new reminder
    func scheduleReminder(_ reminder: Reminder) async throws {
        // Validate reminder data
        guard let scheduledDate = reminder.scheduledFor, scheduledDate > Date() else {
            throw ReminderError.invalidReminderData
        }
        
        // Check if we have notification permissions
        let authorizationStatus = await notificationCenter.notificationSettings()
        guard authorizationStatus.authorizationStatus == .authorized else {
            throw ReminderError.notificationPermissionDenied
        }
        
        // Create notification content
        let content = UNMutableNotificationContent()
        content.title = "Gift Reminder"
        content.body = reminder.message
        content.sound = .default
        
        // Add user info for deep linking
        if let giftIdeaId = reminder.giftIdeaId {
            content.userInfo = ["gift_idea_id": giftIdeaId]
        }
        
        // Create trigger
        let components = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: scheduledDate)
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
        
        // Create request
        let request = UNNotificationRequest(identifier: reminder.id, content: content, trigger: trigger)
        
        // Schedule notification
        do {
            try await notificationCenter.add(request)
        } catch {
            throw ReminderError.schedulingFailed("Failed to schedule notification: \(error.localizedDescription)")
        }
    }
    
    // Cancel a reminder
    func cancelReminder(_ reminderId: String) {
        notificationCenter.removePendingNotificationRequests(withIdentifiers: [reminderId])
        notificationCenter.removeDeliveredNotifications(withIdentifiers: [reminderId])
    }
    
    // Generate optimal reminder times based on occasion date
    func generateOptimalReminders(for occasion: Occasion, userLeadTime: Int = 7) -> [Reminder] {
        var reminders: [Reminder] = []
        
        guard let occasionDate = occasion.date else {
            return reminders
        }
        
        // Generate reminder for lead time days before
        if let leadTimeDate = Calendar.current.date(byAdding: .day, value: -userLeadTime, to: occasionDate) {
            if leadTimeDate > Date() {
                let message = "Don't forget \(occasion.contactName)'s \(occasion.name) on \(formatDate(occasionDate))"
                let reminder = Reminder(
                    id: UUID().uuidString,
                    giftIdeaId: nil, // This is for the occasion, not a specific gift idea
                    scheduledFor: leadTimeDate,
                    message: message,
                    channel: "push",
                    status: "pending"
                )
                reminders.append(reminder)
            }
        }
        
        // Generate day-before reminder
        if let dayBeforeDate = Calendar.current.date(byAdding: .day, value: -1, to: occasionDate) {
            if dayBeforeDate > Date() {
                let message = "Tomorrow is \(occasion.contactName)'s \(occasion.name)!"
                let reminder = Reminder(
                    id: UUID().uuidString,
                    giftIdeaId: nil,
                    scheduledFor: dayBeforeDate,
                    message: message,
                    channel: "push",
                    status: "pending"
                )
                reminders.append(reminder)
            }
        }
        
        // Generate day-of reminder
        let dayOfDate = Calendar.current.date(bySettingHour: 9, minute: 0, second: 0, of: occasionDate)!
        if dayOfDate > Date() {
            let message = "Today is \(occasion.contactName)'s \(occasion.name)!"
            let reminder = Reminder(
                id: UUID().uuidString,
                giftIdeaId: nil,
                scheduledFor: dayOfDate,
                message: message,
                channel: "push",
                status: "pending"
            )
            reminders.append(reminder)
        }
        
        return reminders
    }
    
    // Private helper method to format dates
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }
}

// Supporting model structs
struct Reminder {
    var id: String
    var giftIdeaId: String?
    var scheduledFor: Date?
    var message: String
    var channel: String
    var status: String
}

struct Occasion {
    var id: String
    var contactId: String
    var contactName: String
    var name: String
    var date: Date?
    var recurring: Bool
}
```