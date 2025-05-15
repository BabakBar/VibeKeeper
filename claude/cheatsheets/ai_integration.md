# AI Integration Cheat Sheet for VibeKeeper

## Quick Reference for AI Services

### Entity Extraction

#### Core Prompt Template
```
You are an AI assistant helping to extract structured information about gift ideas from user input.
Extract the following entities if present:

- recipient: Who is this gift for?
- idea: What is the gift idea?
- occasion: What's the occasion? (birthday, anniversary, Christmas, etc.)
- date: When is the occasion? (YYYY-MM-DD format)
- tags: Keywords that describe the gift (comma-separated list)
- budget: How much is the user planning to spend? (numeric value)
- notes: Any additional information

User input: {userInput}

Respond with a JSON object containing the extracted entities and confidence scores.
```

#### Expected JSON Response
```json
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
```

#### Swift Code to Parse Response
```swift
func parseExtractionResponse(_ response: String) throws -> EntityExtractionResult {
    guard let jsonData = extractJSON(from: response)?.data(using: .utf8),
          let json = try? JSONSerialization.jsonObject(with: jsonData) as? [String: Any] else {
        throw ExtractionError.invalidResponse
    }
    
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
    
    // Extract more fields...
    
    result.confidence = confidence
    return result
}

private func extractJSON(from text: String) -> String? {
    if let startIndex = text.firstIndex(of: "{"),
       let endIndex = text.lastIndex(of: "}") {
        return String(text[startIndex...endIndex])
    }
    return nil
}
```

### Voice Transcription

#### Whisper API Implementation
```swift
class TranscriptionService {
    enum TranscriptionError: Error {
        case audioFormatError
        case networkError(Error)
        case processingError(String)
    }
    
    func transcribeAudio(_ audioData: Data) async throws -> String {
        // Convert to supported format if needed (Whisper supports M4A, MP3, MP4, MPEG, MPGA, WAV, WEBM)
        let processedAudioData = try await ensureSupportedFormat(audioData)
        
        // Prepare API request
        let boundary = UUID().uuidString
        var request = URLRequest(url: URL(string: "https://api.openai.com/v1/audio/transcriptions")!)
        request.httpMethod = "POST"
        request.addValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.addValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        // Create multipart form body
        var body = Data()
        
        // Add model parameter
        body.append("--\(boundary)\r\n")
        body.append("Content-Disposition: form-data; name=\"model\"\r\n\r\n")
        body.append("whisper-1\r\n")
        
        // Add language parameter (optional)
        body.append("--\(boundary)\r\n")
        body.append("Content-Disposition: form-data; name=\"language\"\r\n\r\n")
        body.append("en\r\n")
        
        // Add prompt parameter (optional)
        body.append("--\(boundary)\r\n")
        body.append("Content-Disposition: form-data; name=\"prompt\"\r\n\r\n")
        body.append("This is a transcription of a gift idea. Listen for information about recipients, gifts, occasions, dates, and budgets.\r\n")
        
        // Add file data
        body.append("--\(boundary)\r\n")
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"audio.m4a\"\r\n")
        body.append("Content-Type: audio/m4a\r\n\r\n")
        body.append(processedAudioData)
        body.append("\r\n")
        
        // Add final boundary
        body.append("--\(boundary)--\r\n")
        
        request.httpBody = body
        
        // Make the request
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode) else {
                throw TranscriptionError.processingError("Invalid response")
            }
            
            let responseObject = try JSONDecoder().decode(TranscriptionResponse.self, from: data)
            return responseObject.text
        } catch let error as TranscriptionError {
            throw error
        } catch {
            throw TranscriptionError.networkError(error)
        }
    }
    
    // Helper struct for response
    struct TranscriptionResponse: Decodable {
        let text: String
    }
    
    // Helper function to ensure audio format is supported
    private func ensureSupportedFormat(_ audioData: Data) async throws -> Data {
        // In a real implementation, you might need to convert formats
        // For this example, we'll just return the original data
        return audioData
    }
}

// Helper extension for multipart forms
extension Data {
    mutating func append(_ string: String) {
        if let data = string.data(using: .utf8) {
            self.append(data)
        }
    }
}
```

### Image Analysis

#### Vision API Implementation
```swift
class ImageAnalysisService {
    enum AnalysisError: Error {
        case invalidImageFormat
        case networkError(Error)
        case processingError(String)
    }
    
    func analyzeImage(_ imageData: Data, caption: String? = nil) async throws -> String {
        // Prepare API request
        var request = URLRequest(url: URL(string: "https://api.openai.com/v1/chat/completions")!)
        request.httpMethod = "POST"
        request.addValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Convert image to base64
        let base64Image = imageData.base64EncodedString()
        
        // Create the prompt
        let promptText = """
        You are an AI assistant analyzing an image of a potential gift.
        Describe what you see in the image, focusing on:
        - What the item appears to be
        - Visual characteristics (color, shape, size if apparent)
        - Any text visible in the image
        - Brand names or identifiable features
        - What kind of gift this might be and who it might be suitable for
        """
        
        // Create the message array for GPT-4 Vision
        var messages: [[String: Any]] = [
            ["role": "system", "content": promptText]
        ]
        
        // Add the user message with image
        var userContent: [Any] = [
            ["type": "image_url", "image_url": ["url": "data:image/jpeg;base64,\(base64Image)"]]
        ]
        
        // Add caption if provided
        if let caption = caption, !caption.isEmpty {
            userContent.append(["type": "text", "text": caption])
        }
        
        messages.append(["role": "user", "content": userContent])
        
        // Create the request body
        let requestBody: [String: Any] = [
            "model": "gpt-4-vision-preview",
            "messages": messages,
            "max_tokens": 300
        ]
        
        // Serialize to JSON
        let jsonData = try JSONSerialization.data(withJSONObject: requestBody)
        request.httpBody = jsonData
        
        // Make the request
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode) else {
                if let responseString = String(data: data, encoding: .utf8) {
                    throw AnalysisError.processingError("Invalid response: \(responseString)")
                } else {
                    throw AnalysisError.processingError("Invalid response")
                }
            }
            
            // Parse the response
            if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
               let choices = json["choices"] as? [[String: Any]],
               let firstChoice = choices.first,
               let message = firstChoice["message"] as? [String: Any],
               let content = message["content"] as? String {
                return content
            } else {
                throw AnalysisError.processingError("Failed to parse response")
            }
        } catch let error as AnalysisError {
            throw error
        } catch {
            throw AnalysisError.networkError(error)
        }
    }
}
```

## Common AI Integration Issues

### 1. Inconsistent JSON Format in Responses

**Problem:** AI model doesn't consistently return valid JSON

**Solution:**
```swift
func extractJSONFromText(_ text: String) -> String? {
    // Look for JSON pattern with regex
    let pattern = "\\{[\\s\\S]*?\\}"
    if let regex = try? NSRegularExpression(pattern: pattern),
       let match = regex.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)) {
        if let range = Range(match.range, in: text) {
            return String(text[range])
        }
    }
    return nil
}

func parseWithFallback(_ response: String) -> EntityExtractionResult {
    // Try to parse as JSON first
    if let jsonString = extractJSONFromText(response),
       let data = jsonString.data(using: .utf8),
       let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
        // Normal parsing
        return parseJSON(json)
    } else {
        // Fallback to regex-based extraction
        return extractWithRegex(response)
    }
}
```

### 2. Handling Incomplete Extractions

**Problem:** Some required fields might be missing in extraction

**Solution:**
```swift
func validateAndFixExtraction(_ result: EntityExtractionResult, originalInput: String) -> EntityExtractionResult {
    var fixedResult = result
    
    // Check for required fields and prompt for clarification if needed
    if fixedResult.recipient == nil {
        // Try to extract with more specific prompt
        if let extractedRecipient = extractRecipientWithFallback(originalInput) {
            fixedResult.recipient = extractedRecipient
            fixedResult.confidence["recipient"] = 0.5 // Lower confidence for fallback
        }
    }
    
    // Similar checks for other required fields
    
    return fixedResult
}

func extractRecipientWithFallback(_ text: String) -> String? {
    // Pattern for "for [Name]" or similar
    let patterns = [
        "for\\s+([A-Z][a-z]+)",
        "give\\s+([A-Z][a-z]+)\\s+a",
        "([A-Z][a-z]+)'s\\s+gift"
    ]
    
    for pattern in patterns {
        if let regex = try? NSRegularExpression(pattern: pattern),
           let match = regex.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)),
           let range = Range(match.range(at: 1), in: text) {
            return String(text[range])
        }
    }
    
    return nil
}
```

### 3. Date Parsing Ambiguities

**Problem:** Date formats can be ambiguous (mm/dd vs dd/mm)

**Solution:**
```swift
func parseDate(_ dateString: String) -> Date? {
    let dateFormatters = [
        "yyyy-MM-dd",
        "MM/dd/yyyy",
        "dd/MM/yyyy",
        "MMMM d, yyyy",
        "d MMMM yyyy"
    ].map { format -> DateFormatter in
        let formatter = DateFormatter()
        formatter.dateFormat = format
        return formatter
    }
    
    // Try all formatters
    for formatter in dateFormatters {
        if let date = formatter.date(from: dateString) {
            return date
        }
    }
    
    // Natural language parsing fallback
    let naturalLanguageDateFormatter = DateFormatter()
    naturalLanguageDateFormatter.dateStyle = .long
    naturalLanguageDateFormatter.timeStyle = .none
    
    // Common patterns
    let patterns = [
        "next ([A-Za-z]+)",
        "([A-Za-z]+) (\\d{1,2})(?:st|nd|rd|th)?",
        "([A-Za-z]+) (\\d{1,2})(?:st|nd|rd|th)?, (\\d{4})"
    ]
    
    // Implementation of natural language parsing would go here
    
    return nil
}
```

### 4. Budget Range Extraction

**Problem:** Budget might be a range or approximate value

**Solution:**
```swift
func extractBudget(_ text: String) -> (amount: Double?, range: ClosedRange<Double>?, currency: String?) {
    var amount: Double? = nil
    var range: ClosedRange<Double>? = nil
    var currency: String? = "USD"
    
    // Check for range pattern like "$40-50" or "between $40 and $50"
    let rangePattern = "\\$(\\d+)\\s*-\\s*\\$(\\d+)|\\$(\\d+)\\s*-\\s*(\\d+)|between\\s+\\$(\\d+)\\s+and\\s+\\$(\\d+)"
    
    if let regex = try? NSRegularExpression(pattern: rangePattern),
       let match = regex.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)) {
        
        var lowerBound: Double?
        var upperBound: Double?
        
        // Extract the numbers based on which pattern matched
        if let range1 = Range(match.range(at: 1), in: text),
           let range2 = Range(match.range(at: 2), in: text) {
            lowerBound = Double(text[range1])
            upperBound = Double(text[range2])
        } else if let range3 = Range(match.range(at: 3), in: text),
                  let range4 = Range(match.range(at: 4), in: text) {
            lowerBound = Double(text[range3])
            upperBound = Double(text[range4])
        } else if let range5 = Range(match.range(at: 5), in: text),
                  let range6 = Range(match.range(at: 6), in: text) {
            lowerBound = Double(text[range5])
            upperBound = Double(text[range6])
        }
        
        if let lower = lowerBound, let upper = upperBound {
            range = lower...upper
            amount = (lower + upper) / 2 // Average as the amount
        }
    } else {
        // Look for single amount with currency symbols
        let amountPattern = "\\$(\\d+(?:\\.\\d{2})?)|€(\\d+(?:\\.\\d{2})?)|£(\\d+(?:\\.\\d{2})?)|\\b(\\d+(?:\\.\\d{2})?)\\s*(?:dollars|USD|EUR|GBP)\\b"
        
        if let regex = try? NSRegularExpression(pattern: amountPattern),
           let match = regex.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)) {
            
            if let range1 = Range(match.range(at: 1), in: text) {
                amount = Double(text[range1])
                currency = "USD"
            } else if let range2 = Range(match.range(at: 2), in: text) {
                amount = Double(text[range2])
                currency = "EUR"
            } else if let range3 = Range(match.range(at: 3), in: text) {
                amount = Double(text[range3])
                currency = "GBP"
            } else if let range4 = Range(match.range(at: 4), in: text) {
                amount = Double(text[range4])
                // Currency determined by the word after the amount
            }
        }
    }
    
    return (amount, range, currency)
}
```

### 5. Image Analysis Quality Issues

**Problem:** Image analysis might not capture all gift details

**Solution:**
```swift
func enhanceImageAnalysisWithCaption(_ imageDescription: String, userCaption: String?) -> String {
    guard let caption = userCaption, !caption.isEmpty else {
        return imageDescription
    }
    
    // Combine user caption with image description for better context
    let enhancedContext = """
    Image description: \(imageDescription)
    
    User caption: \(caption)
    
    Based on both the image and the user's caption, provide a comprehensive description
    of this potential gift, focusing on specific details that might help identify
    the recipient, occasion, price range, and key features.
    """
    
    // In a real implementation, you would send this to the AI model again
    // for a more refined analysis
    return enhancedContext
}
```

## API Endpoints Reference

### OpenAI APIs

#### GPT Text Completion
```
POST https://api.openai.com/v1/chat/completions
Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json
Body:
{
  "model": "gpt-4",
  "messages": [
    {"role": "system", "content": "Your system prompt"},
    {"role": "user", "content": "User input"}
  ]
}
```

#### Whisper Transcription
```
POST https://api.openai.com/v1/audio/transcriptions
Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: multipart/form-data
Body (multipart form):
  model: whisper-1
  file: [audio file data]
  language: en (optional)
  prompt: [prompt text] (optional)
```

#### GPT-4 Vision
```
POST https://api.openai.com/v1/chat/completions
Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json
Body:
{
  "model": "gpt-4-vision-preview",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Describe this image"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/jpeg;base64,BASE64_ENCODED_IMAGE"
          }
        }
      ]
    }
  ]
}
```