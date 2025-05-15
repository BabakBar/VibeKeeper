# Capture Service Component Documentation

## Purpose
The Capture Service is responsible for processing various input types (text, voice recordings, images) and extracting structured gift idea information. It serves as the bridge between raw user input and the structured data model of the VibeKeeper application. The service combines multi-modal input processing with AI-powered entity extraction to convert unstructured information into gift ideas with proper metadata like recipient, occasion, date, and budget.

## Schema

### Service Architecture
```
┌─────────────────┐     ┌───────────────────┐     ┌────────────────────┐
│                 │     │                   │     │                    │
│  Input Source   │────▶│  Capture Service  │────▶│  Entity Extraction │
│  (Text/Voice/   │     │                   │     │                    │
│   Image)        │     └───────────────────┘     └────────────────────┘
│                 │              │                           │
└─────────────────┘              │                           │
                                 ▼                           ▼
                    ┌─────────────────────┐     ┌────────────────────┐
                    │                     │     │                    │
                    │  Media Processing   │     │  Validation &      │
                    │  & Storage          │     │  Confidence Check  │
                    │                     │     │                    │
                    └─────────────────────┘     └────────────────────┘
                                 │                           │
                                 └───────────────┬───────────┘
                                                 ▼
                                       ┌─────────────────────┐
                                       │                     │
                                       │  Gift Idea Creation │
                                       │                     │
                                       └─────────────────────┘
```

### Core Classes and Interfaces
```swift
// Main service interface
protocol CaptureService {
    func processTextCapture(_ text: String) async throws -> GiftIdea
    func processVoiceCapture(_ audioData: Data) async throws -> GiftIdea
    func processImageCapture(_ imageData: Data, caption: String?) async throws -> GiftIdea
    func processUnifiedCapture(contentType: String, textContent: String?, mediaData: Data?) async throws -> GiftIdea
}

// Entity extraction interface
protocol EntityExtractor {
    func extractFromText(_ text: String) async throws -> EntityExtractionResult
    func extractFromVoiceTranscript(_ transcript: String) async throws -> EntityExtractionResult
    func extractFromImageAnalysis(_ imageDescription: String) async throws -> EntityExtractionResult
}

// Media processing interfaces
protocol TranscriptionService {
    func transcribeAudio(_ audioData: Data) async throws -> String
}

protocol ImageAnalysisService {
    func analyzeImage(_ imageData: Data, caption: String?) async throws -> String
}

protocol StorageService {
    func storeAudioFile(_ audioData: Data) async throws -> URL
    func storeImageFile(_ imageData: Data) async throws -> URL
    func deleteFile(at url: URL) async throws
}

// Entity extraction result
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
        return recipient != nil && idea != nil
    }
}
```

## Patterns

### Multi-Modal Input Processing Pattern
```swift
// Implementation of the CaptureService
class CaptureServiceImpl: CaptureService {
    private let entityExtractor: EntityExtractor
    private let storageService: StorageService
    private let transcriptionService: TranscriptionService
    private let imageAnalysisService: ImageAnalysisService
    
    init(entityExtractor: EntityExtractor,
         storageService: StorageService,
         transcriptionService: TranscriptionService,
         imageAnalysisService: ImageAnalysisService) {
        self.entityExtractor = entityExtractor
        self.storageService = storageService
        self.transcriptionService = transcriptionService
        self.imageAnalysisService = imageAnalysisService
    }
    
    // Process text input
    func processTextCapture(_ text: String) async throws -> GiftIdea {
        guard !text.isEmpty else {
            throw CaptureError.invalidInput("Text input cannot be empty")
        }
        
        do {
            // Extract entities from text
            let extractionResult = try await entityExtractor.extractFromText(text)
            
            // Validate the extraction result
            let validationResult = validateExtraction(extractionResult)
            
            if !validationResult.isValid {
                throw CaptureError.invalidExtraction(validationResult.errors)
            }
            
            // Convert to GiftIdea model
            return createGiftIdeaFromExtraction(validationResult.extractionResult, sourceText: text)
        } catch let error as EntityExtractorError {
            throw CaptureError.aiProcessingFailed(error.localizedDescription)
        } catch {
            throw CaptureError.unknown(error.localizedDescription)
        }
    }
    
    // Process voice recording
    func processVoiceCapture(_ audioData: Data) async throws -> GiftIdea {
        do {
            // Transcribe audio to text
            let transcript = try await transcriptionService.transcribeAudio(audioData)
            
            if transcript.isEmpty {
                throw CaptureError.transcriptionFailed("Could not transcribe audio")
            }
            
            // Store the audio file
            let audioURL = try await storageService.storeAudioFile(audioData)
            
            // Process the transcript
            let extractionResult = try await entityExtractor.extractFromVoiceTranscript(transcript)
            
            // Validate the extraction result
            let validationResult = validateExtraction(extractionResult)
            
            if !validationResult.isValid {
                // Clean up stored audio if extraction failed
                try await storageService.deleteFile(at: audioURL)
                throw CaptureError.invalidExtraction(validationResult.errors)
            }
            
            // Convert to GiftIdea model with audio reference
            var giftIdea = createGiftIdeaFromExtraction(validationResult.extractionResult, sourceText: transcript)
            giftIdea.mediaAssets = [MediaAsset(id: UUID(), url: audioURL, type: .audio, thumbnail: nil, createdAt: Date())]
            
            return giftIdea
        } catch let error as TranscriptionServiceError {
            throw CaptureError.transcriptionFailed(error.localizedDescription)
        } catch let error as StorageServiceError {
            throw CaptureError.storageError(error.localizedDescription)
        } catch {
            throw CaptureError.unknown(error.localizedDescription)
        }
    }
    
    // Process image capture
    func processImageCapture(_ imageData: Data, caption: String? = nil) async throws -> GiftIdea {
        do {
            // Analyze the image
            let imageDescription = try await imageAnalysisService.analyzeImage(imageData, caption: caption)
            
            if imageDescription.isEmpty {
                throw CaptureError.imageAnalysisFailed("Could not analyze image")
            }
            
            // Store the image file
            let imageURL = try await storageService.storeImageFile(imageData)
            
            // Generate thumbnail
            let thumbnailURL = try await generateThumbnail(from: imageData)
            
            // Process the image description
            let extractionResult = try await entityExtractor.extractFromImageAnalysis(imageDescription)
            
            // Validate the extraction result
            let validationResult = validateExtraction(extractionResult)
            
            if !validationResult.isValid {
                // Clean up stored image if extraction failed
                try await storageService.deleteFile(at: imageURL)
                try await storageService.deleteFile(at: thumbnailURL)
                throw CaptureError.invalidExtraction(validationResult.errors)
            }
            
            // Convert to GiftIdea model with image reference
            var giftIdea = createGiftIdeaFromExtraction(validationResult.extractionResult, sourceText: imageDescription)
            giftIdea.mediaAssets = [MediaAsset(id: UUID(), url: imageURL, type: .image, thumbnail: thumbnailURL, createdAt: Date())]
            
            return giftIdea
        } catch let error as ImageAnalysisServiceError {
            throw CaptureError.imageAnalysisFailed(error.localizedDescription)
        } catch let error as StorageServiceError {
            throw CaptureError.storageError(error.localizedDescription)
        } catch {
            throw CaptureError.unknown(error.localizedDescription)
        }
    }
    
    // Unified capture method
    func processUnifiedCapture(contentType: String, textContent: String?, mediaData: Data?) async throws -> GiftIdea {
        switch contentType.lowercased() {
        case "text":
            guard let text = textContent, !text.isEmpty else {
                throw CaptureError.invalidInput("Text content is required for text capture")
            }
            return try await processTextCapture(text)
            
        case "voice":
            guard let audioData = mediaData else {
                throw CaptureError.invalidInput("Audio data is required for voice capture")
            }
            return try await processVoiceCapture(audioData)
            
        case "image":
            guard let imageData = mediaData else {
                throw CaptureError.invalidInput("Image data is required for image capture")
            }
            return try await processImageCapture(imageData, caption: textContent)
            
        default:
            throw CaptureError.invalidInput("Unsupported content type: \(contentType)")
        }
    }
    
    // Helper methods
    private func validateExtraction(_ extraction: EntityExtractionResult) -> ValidationResult {
        var errors: [String] = []
        var validatedExtraction = extraction
        
        // Check required fields
        if validatedExtraction.recipient == nil {
            errors.append("Could not determine who the gift is for")
        }
        
        if validatedExtraction.idea == nil {
            errors.append("Could not determine what the gift idea is")
        }
        
        // Check date validity if present
        if let date = validatedExtraction.date {
            // Ensure the date is not in the distant past
            if date.timeIntervalSinceNow < -365*24*60*60 { // More than a year ago
                // Try to fix by assuming it's next year
                let calendar = Calendar.current
                if let nextYearDate = calendar.date(byAdding: .year, value: 1, to: date) {
                    validatedExtraction.date = nextYearDate
                } else {
                    errors.append("Invalid date: date appears to be in the distant past")
                }
            }
        }
        
        return ValidationResult(
            isValid: errors.isEmpty,
            errors: errors,
            extractionResult: validatedExtraction
        )
    }
    
    private func createGiftIdeaFromExtraction(_ extraction: EntityExtractionResult, sourceText: String) -> GiftIdea {
        // Create budget if available
        var budget: Budget? = nil
        if let amount = extraction.budget {
            budget = Budget(
                amount: amount,
                currency: extraction.currency ?? "USD",
                rangeMin: extraction.budgetRange?.lowerBound,
                rangeMax: extraction.budgetRange?.upperBound
            )
        } else if let range = extraction.budgetRange {
            // Use range midpoint as amount
            let amount = (range.lowerBound + range.upperBound) / 2
            budget = Budget(
                amount: amount,
                currency: extraction.currency ?? "USD",
                rangeMin: range.lowerBound,
                rangeMax: range.upperBound
            )
        }
        
        return GiftIdea(
            id: UUID(),
            recipient: extraction.recipient ?? "Unknown",
            idea: extraction.idea ?? "Unknown",
            occasion: extraction.occasion,
            date: extraction.date,
            tags: extraction.tags ?? [],
            budget: budget,
            status: .idea,
            notes: extraction.notes ?? sourceText,
            mediaAssets: [],
            reminders: [],
            createdAt: Date(),
            updatedAt: Date()
        )
    }
    
    private func generateThumbnail(from imageData: Data) async throws -> URL {
        // In a real implementation, resize the image to thumbnail size
        // For this example, just return a mock URL
        return URL(string: "https://storage.example.com/thumbnails/thumb-\(UUID().uuidString).jpg")!
    }
}

// Supporting types
struct ValidationResult {
    let isValid: Bool
    let errors: [String]
    let extractionResult: EntityExtractionResult
}

enum CaptureError: Error, LocalizedError {
    case invalidInput(String)
    case aiProcessingFailed(String)
    case transcriptionFailed(String)
    case imageAnalysisFailed(String)
    case invalidExtraction([String])
    case storageError(String)
    case unknown(String)
    
    var errorDescription: String? {
        switch self {
        case .invalidInput(let message):
            return "Invalid input: \(message)"
        case .aiProcessingFailed(let message):
            return "AI processing failed: \(message)"
        case .transcriptionFailed(let message):
            return "Failed to transcribe audio: \(message)"
        case .imageAnalysisFailed(let message):
            return "Failed to analyze image: \(message)"
        case .invalidExtraction(let errors):
            return "Invalid extraction: \(errors.joined(separator: ", "))"
        case .storageError(let message):
            return "Storage error: \(message)"
        case .unknown(let message):
            return "Unknown error: \(message)"
        }
    }
}

enum EntityExtractorError: Error {
    case processingError(String)
    case invalidPrompt
    case aiServiceUnavailable
}

enum TranscriptionServiceError: Error {
    case processingFailed(String)
    case unsupportedFormat
    case fileTooLarge
}

enum ImageAnalysisServiceError: Error {
    case processingFailed(String)
    case unsupportedFormat
    case fileTooLarge
}

enum StorageServiceError: Error {
    case uploadFailed(String)
    case deleteFailed(String)
    case fileNotFound
}
```

### Entity Extraction Pattern with Confidence Scoring
```swift
class EntityExtractorImpl: EntityExtractor {
    private let aiService: AIService
    
    init(aiService: AIService) {
        self.aiService = aiService
    }
    
    func extractFromText(_ text: String) async throws -> EntityExtractionResult {
        let prompt = createEntityExtractionPrompt(input: text)
        
        do {
            let response = try await aiService.generateCompletion(prompt)
            return try parseEntityExtractionResponse(response)
        } catch {
            throw EntityExtractorError.processingError("Failed to extract entities: \(error.localizedDescription)")
        }
    }
    
    func extractFromVoiceTranscript(_ transcript: String) async throws -> EntityExtractionResult {
        // For voice transcripts, we can usually just process them as text
        // But we could enhance the prompt with voice-specific context if needed
        return try await extractFromText(transcript)
    }
    
    func extractFromImageAnalysis(_ imageDescription: String) async throws -> EntityExtractionResult {
        // For image analysis results, use a slightly modified prompt
        let prompt = createImageContextPrompt(description: imageDescription)
        
        do {
            let response = try await aiService.generateCompletion(prompt)
            return try parseEntityExtractionResponse(response)
        } catch {
            throw EntityExtractorError.processingError("Failed to extract entities from image analysis: \(error.localizedDescription)")
        }
    }
    
    private func createEntityExtractionPrompt(input: String) -> String {
        return """
        You are an AI assistant helping to extract structured information about gift ideas from user input.
        Extract the following entities if present:
        
        - recipient: Who is this gift for?
        - idea: What is the gift idea?
        - occasion: What's the occasion? (birthday, anniversary, Christmas, etc.)
        - date: When is the occasion? (YYYY-MM-DD format)
        - tags: Keywords that describe the gift (comma-separated list)
        - budget: How much is the user planning to spend? (numeric value)
        - notes: Any additional information
        
        For each extracted entity, also provide a confidence score between 0 and 1.
        
        User input: \(input)
        
        Respond with a JSON object containing the extracted entities and confidence scores.
        """
    }
    
    private func createImageContextPrompt(description: String) -> String {
        return """
        You are an AI assistant helping to extract structured information about gift ideas.
        The following text is a description of an image that might contain a gift item.
        
        Image description: \(description)
        
        Based on this description, extract the following entities if present:
        
        - recipient: Who might this gift be for?
        - idea: What is the gift idea shown in the image?
        - occasion: What occasion might this gift be for?
        - tags: Keywords that describe the gift (comma-separated list)
        - budget: Estimated price range for this item
        - notes: Any additional observations from the image
        
        For each extracted entity, also provide a confidence score between 0 and 1.
        
        Respond with a JSON object containing the extracted entities and confidence scores.
        """
    }
    
    private func parseEntityExtractionResponse(_ response: String) throws -> EntityExtractionResult {
        // Try to extract JSON from the response
        guard let jsonData = extractJSON(from: response)?.data(using: .utf8) else {
            throw EntityExtractorError.processingError("Failed to extract JSON from response")
        }
        
        do {
            let json = try JSONSerialization.jsonObject(with: jsonData) as? [String: Any]
            
            var result = EntityExtractionResult(confidence: [:])
            var confidence: [String: Double] = [:]
            
            // Extract recipient
            if let recipient = json?["recipient"] as? String {
                result.recipient = recipient
                confidence["recipient"] = json?["recipient_confidence"] as? Double ?? 1.0
            }
            
            // Extract idea
            if let idea = json?["idea"] as? String {
                result.idea = idea
                confidence["idea"] = json?["idea_confidence"] as? Double ?? 1.0
            }
            
            // Extract occasion
            if let occasion = json?["occasion"] as? String {
                result.occasion = occasion
                confidence["occasion"] = json?["occasion_confidence"] as? Double ?? 1.0
            }
            
            // Extract date
            if let dateString = json?["date"] as? String {
                let dateFormatter = DateFormatter()
                dateFormatter.dateFormat = "yyyy-MM-dd"
                result.date = dateFormatter.date(from: dateString)
                confidence["date"] = json?["date_confidence"] as? Double ?? 1.0
            }
            
            // Extract tags
            if let tagsString = json?["tags"] as? String {
                result.tags = tagsString.components(separatedBy: ",").map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
                confidence["tags"] = json?["tags_confidence"] as? Double ?? 1.0
            } else if let tags = json?["tags"] as? [String] {
                result.tags = tags
                confidence["tags"] = json?["tags_confidence"] as? Double ?? 1.0
            }
            
            // Extract budget
            if let budgetDict = json?["budget"] as? [String: Any] {
                if let amount = budgetDict["amount"] as? Double {
                    result.budget = amount
                }
                
                if let rangeArray = budgetDict["range"] as? [Double], rangeArray.count == 2 {
                    result.budgetRange = rangeArray[0]...rangeArray[1]
                }
                
                if let currency = budgetDict["currency"] as? String {
                    result.currency = currency
                }
                
                confidence["budget"] = json?["budget_confidence"] as? Double ?? 1.0
            } else if let budget = json?["budget"] as? Double {
                result.budget = budget
                confidence["budget"] = json?["budget_confidence"] as? Double ?? 1.0
            } else if let budgetString = json?["budget"] as? String, let budget = Double(budgetString) {
                result.budget = budget
                confidence["budget"] = json?["budget_confidence"] as? Double ?? 1.0
            }
            
            // Extract notes
            if let notes = json?["notes"] as? String {
                result.notes = notes
                confidence["notes"] = json?["notes_confidence"] as? Double ?? 1.0
            }
            
            result.confidence = confidence
            return result
        } catch {
            throw EntityExtractorError.processingError("Failed to parse entity extraction result: \(error.localizedDescription)")
        }
    }
    
    private func extractJSON(from text: String) -> String? {
        // Simple heuristic: find text between first { and last }
        if let startIndex = text.firstIndex(of: "{"),
           let endIndex = text.lastIndex(of: "}") {
            return String(text[startIndex...endIndex])
        }
        return nil
    }
}

// Mock AIService for example
class AIService {
    func generateCompletion(_ prompt: String) async throws -> String {
        // In a real implementation, this would call an AI API
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

## Interfaces

### CaptureViewModel
```swift
class CaptureViewModel: ObservableObject {
    enum CaptureMode {
        case text
        case voice
        case image
    }
    
    enum CaptureState {
        case ready
        case recording
        case processing
        case success(GiftIdea)
        case needsConfirmation(EntityExtractionResult, [String])
        case failure(Error)
    }
    
    @Published var captureMode: CaptureMode = .text
    @Published var captureState: CaptureState = .ready
    @Published var textInput: String = ""
    @Published var capturedImage: UIImage?
    @Published var imageCaption: String = ""
    @Published var processingProgress: Double = 0
    @Published var extractedGiftIdea: GiftIdea?
    
    // Voice recording properties
    private var audioRecorder: AVAudioRecorder?
    private var recordingURL: URL?
    
    // Dependencies
    private let captureService: CaptureService
    
    init(captureService: CaptureService) {
        self.captureService = captureService
        setupAudioRecording()
    }
    
    // Text capture methods
    func captureText() {
        guard !textInput.isEmpty else { return }
        
        captureState = .processing
        
        Task {
            do {
                let giftIdea = try await captureService.processTextCapture(textInput)
                
                DispatchQueue.main.async {
                    self.extractedGiftIdea = giftIdea
                    self.captureState = .success(giftIdea)
                }
            } catch let error as CaptureError where case .invalidExtraction(let errors) = error {
                DispatchQueue.main.async {
                    if let result = try? await self.captureService.processTextCapture(self.textInput) {
                        self.captureState = .needsConfirmation(result, errors)
                    } else {
                        self.captureState = .failure(error)
                    }
                }
            } catch {
                DispatchQueue.main.async {
                    self.captureState = .failure(error)
                }
            }
        }
    }
    
    // Voice capture methods
    func startVoiceRecording() {
        guard audioRecorder != nil, captureState == .ready else { return }
        
        captureState = .recording
        audioRecorder?.record()
    }
    
    func stopVoiceRecording() {
        guard captureState == .recording else { return }
        
        audioRecorder?.stop()
        captureState = .processing
        
        // Process the recorded audio
        Task {
            do {
                guard let url = recordingURL, 
                      let audioData = try? Data(contentsOf: url) else {
                    throw CaptureError.invalidInput("Failed to read recording data")
                }
                
                let giftIdea = try await captureService.processVoiceCapture(audioData)
                
                DispatchQueue.main.async {
                    self.extractedGiftIdea = giftIdea
                    self.captureState = .success(giftIdea)
                }
            } catch let error as CaptureError where case .invalidExtraction(let errors) = error {
                DispatchQueue.main.async {
                    // Handle confirmation needed case
                    self.captureState = .failure(error) // Simplified for example
                }
            } catch {
                DispatchQueue.main.async {
                    self.captureState = .failure(error)
                }
            }
        }
    }
    
    // Image capture methods
    func captureImage(image: UIImage) {
        capturedImage = image
    }
    
    func processImageCapture() {
        guard let image = capturedImage, let imageData = image.jpegData(compressionQuality: 0.8) else {
            captureState = .failure(CaptureError.invalidInput("Invalid image data"))
            return
        }
        
        captureState = .processing
        
        Task {
            do {
                let giftIdea = try await captureService.processImageCapture(imageData, caption: imageCaption.isEmpty ? nil : imageCaption)
                
                DispatchQueue.main.async {
                    self.extractedGiftIdea = giftIdea
                    self.captureState = .success(giftIdea)
                }
            } catch let error as CaptureError where case .invalidExtraction(let errors) = error {
                DispatchQueue.main.async {
                    // Handle confirmation needed case
                    self.captureState = .failure(error) // Simplified for example
                }
            } catch {
                DispatchQueue.main.async {
                    self.captureState = .failure(error)
                }
            }
        }
    }
    
    // Reset capture state
    func resetCapture() {
        captureState = .ready
        textInput = ""
        capturedImage = nil
        imageCaption = ""
        extractedGiftIdea = nil
        processingProgress = 0
    }
    
    // Audio recording setup
    private func setupAudioRecording() {
        // Implementation for setting up the audio recorder
    }
}
```

## Invariants

1. A successful capture operation must always produce a valid GiftIdea with at least recipient and idea fields
2. Voice captures must always save the audio file before attempting entity extraction
3. Image captures must always save the image file before attempting entity extraction
4. All extracted entities must have confidence scores between 0 and 1
5. Captured media (images, audio) must never be lost even if processing fails
6. Error handling must be comprehensive and provide meaningful error messages
7. Each media asset must have a valid URL and type after successful processing
8. Entity extraction must be idempotent - processing the same input multiple times should produce equivalent results
9. The capture service must handle different input formats and variations gracefully
10. The capture service must validate extraction results before returning them

## Error States

### Possible Error Conditions

1. **Invalid Input Errors**
   - Empty text input
   - Corrupted audio data
   - Unsupported image format
   - File size too large

2. **AI Processing Errors**
   - AI service unavailable
   - Rate limiting or quota exceeded
   - Unexpected AI response format
   - Invalid or ambiguous extraction results

3. **Media Processing Errors**
   - Failed to transcribe audio
   - Failed to analyze image
   - Failed to store media files
   - Unsupported media format

4. **Validation Errors**
   - Missing required fields
   - Low confidence in extracted entities
   - Invalid or unrealistic extracted data
   - Contradictory entities

### Error Handling

The service follows these error handling principles:
1. All errors are categorized into specific error types
2. Errors include detailed descriptions for debugging
3. User-friendly error messages are provided
4. Cleanup operations are performed when errors occur
5. Recovery mechanisms are available for certain error conditions

For example, when extraction results have low confidence or missing fields:
```swift
func handleLowConfidenceExtraction(_ result: EntityExtractionResult, originalInput: String) async throws -> GiftIdea {
    var corrections: [String: String] = [:]
    var missingFields: [String] = []
    
    // Check for missing required fields
    if result.recipient == nil {
        missingFields.append("recipient")
    }
    
    if result.idea == nil {
        missingFields.append("idea")
    }
    
    // Check for low confidence fields
    for (field, confidence) in result.confidence {
        if confidence < 0.5 {
            var fieldValue: String? = nil
            
            switch field {
            case "recipient":
                fieldValue = result.recipient
            case "idea":
                fieldValue = result.idea
            case "occasion":
                fieldValue = result.occasion
            case "date":
                if let date = result.date {
                    let formatter = DateFormatter()
                    formatter.dateFormat = "yyyy-MM-dd"
                    fieldValue = formatter.string(from: date)
                }
            default:
                continue
            }
            
            if let value = fieldValue {
                corrections[field] = value
            }
        }
    }
    
    // If there are missing fields or corrections needed, throw an error
    if !missingFields.isEmpty || !corrections.isEmpty {
        throw CaptureError.needsUserConfirmation(result, missingFields, corrections)
    }
    
    // If we got here, we have a valid extraction result
    return createGiftIdeaFromExtraction(result, sourceText: originalInput)
}

// Custom error for user confirmation
extension CaptureError {
    static func needsUserConfirmation(_ result: EntityExtractionResult, _ missingFields: [String], _ corrections: [String: String]) -> CaptureError {
        var errors: [String] = []
        
        for field in missingFields {
            errors.append("Could not determine \(field)")
        }
        
        for (field, value) in corrections {
            errors.append("Low confidence in \(field): \(value)")
        }
        
        return .invalidExtraction(errors)
    }
}
```

## Memory Anchor Points

### UUID-based Anchors

```
// CaptureService_MultiModal_Processing (MA-101)
The Capture Service provides a unified interface for processing text, voice, and image inputs.

// EntityExtraction_Confidence_Scoring (MA-102)
Entity extraction includes confidence scores to assess the reliability of extracted information.

// MediaProcessing_Storage_Pipeline (MA-103)
The media processing pipeline handles transcription, analysis, and storage of user-provided media.

// CaptureViewModel_State_Management (MA-104)
The CaptureViewModel manages complex state transitions during the capture process.

// ValidationResult_Error_Detection (MA-105)
The validation process identifies missing fields, low confidence extractions, and other potential issues.
```