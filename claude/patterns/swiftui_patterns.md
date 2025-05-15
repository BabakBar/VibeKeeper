# SwiftUI Patterns for VibeKeeper

## MVVM Pattern

### Pattern Description
The Model-View-ViewModel (MVVM) pattern separates UI, presentation logic, and business logic:
- **Model**: Data structures and business logic
- **View**: UI components that display data
- **ViewModel**: Transforms Model data for View consumption and handles user actions

### Implementation Example

```swift
// Model
struct GiftIdea: Identifiable {
    let id: UUID = UUID()
    var recipient: String
    var idea: String
    var occasion: String
    var date: Date
    var tags: [String]
    var budget: Double
    var notes: String?
}

// ViewModel
class GiftIdeaViewModel: ObservableObject {
    @Published var giftIdeas: [GiftIdea] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let apiClient: APIClient
    
    init(apiClient: APIClient = APIClient()) {
        self.apiClient = apiClient
    }
    
    func fetchGiftIdeas() {
        isLoading = true
        errorMessage = nil
        
        // In a real implementation, this would call an API or local database
        Task {
            do {
                let ideas = try await apiClient.getGiftIdeas()
                DispatchQueue.main.async {
                    self.giftIdeas = ideas
                    self.isLoading = false
                }
            } catch {
                DispatchQueue.main.async {
                    self.errorMessage = "Failed to load gift ideas: \(error.localizedDescription)"
                    self.isLoading = false
                }
            }
        }
    }
    
    func addGiftIdea(_ idea: GiftIdea) {
        // Implementation
    }
    
    func updateGiftIdea(_ idea: GiftIdea) {
        // Implementation
    }
    
    func deleteGiftIdea(at indexSet: IndexSet) {
        // Implementation
    }
}

// View
struct GiftIdeaListView: View {
    @StateObject private var viewModel = GiftIdeaViewModel()
    
    var body: some View {
        NavigationView {
            ZStack {
                if viewModel.isLoading {
                    ProgressView("Loading gift ideas...")
                } else if let errorMessage = viewModel.errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                } else {
                    List {
                        ForEach(viewModel.giftIdeas) { idea in
                            NavigationLink(destination: GiftIdeaDetailView(idea: idea)) {
                                GiftIdeaRow(idea: idea)
                            }
                        }
                        .onDelete(perform: viewModel.deleteGiftIdea)
                    }
                }
            }
            .navigationTitle("Gift Ideas")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        // Show add gift idea form
                    }) {
                        Image(systemName: "plus")
                    }
                }
                ToolbarItem(placement: .navigationBarLeading) {
                    EditButton()
                }
            }
        }
        .onAppear {
            viewModel.fetchGiftIdeas()
        }
    }
}

struct GiftIdeaRow: View {
    let idea: GiftIdea
    
    var body: some View {
        VStack(alignment: .leading) {
            Text(idea.recipient)
                .font(.headline)
            Text(idea.idea)
                .font(.subheadline)
            Text("For: \(idea.occasion)")
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}
```

### Uncertainty Handling
Proper uncertainty handling is implemented through:
1. Loading state indicators
2. Error messages for failed operations
3. Task-based async/await with explicit error handling
4. UI feedback for long-running operations

## Multi-Modal Capture Pattern

### Pattern Description
A pattern for capturing input from multiple sources (text, voice, image) with a unified processing pipeline.

### Implementation Example

```swift
// ViewModels/CaptureViewModel.swift
class CaptureViewModel: ObservableObject {
    enum CaptureMode {
        case text, voice, image
    }
    
    enum CaptureState {
        case ready, recording, processing, success, failure(Error)
    }
    
    @Published var captureMode: CaptureMode = .text
    @Published var captureState: CaptureState = .ready
    @Published var textInput: String = ""
    @Published var capturedImage: UIImage?
    @Published var processingProgress: Double = 0
    
    private let apiClient: APIClient
    
    init(apiClient: APIClient = APIClient()) {
        self.apiClient = apiClient
    }
    
    func processTextInput() {
        guard !textInput.isEmpty else { return }
        captureState = .processing
        
        Task {
            do {
                let result = try await apiClient.processTextCapture(text: textInput)
                DispatchQueue.main.async {
                    // Handle successful result
                    self.captureState = .success
                }
            } catch {
                DispatchQueue.main.async {
                    self.captureState = .failure(error)
                }
            }
        }
    }
    
    func startVoiceRecording() {
        // Implementation
    }
    
    func stopVoiceRecording() {
        // Implementation
    }
    
    func captureImage(_ image: UIImage) {
        self.capturedImage = image
        processImageCapture()
    }
    
    private func processImageCapture() {
        guard let image = capturedImage else { return }
        captureState = .processing
        
        Task {
            do {
                // Convert image to data
                guard let imageData = image.jpegData(compressionQuality: 0.8) else {
                    throw NSError(domain: "CaptureError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to convert image to data"])
                }
                
                let result = try await apiClient.processImageCapture(imageData: imageData)
                DispatchQueue.main.async {
                    // Handle successful result
                    self.captureState = .success
                }
            } catch {
                DispatchQueue.main.async {
                    self.captureState = .failure(error)
                }
            }
        }
    }
}

// Views/CaptureView.swift
struct CaptureView: View {
    @StateObject private var viewModel = CaptureViewModel()
    
    var body: some View {
        VStack {
            // Mode selector
            Picker("Capture Mode", selection: $viewModel.captureMode) {
                Text("Text").tag(CaptureViewModel.CaptureMode.text)
                Text("Voice").tag(CaptureViewModel.CaptureMode.voice)
                Text("Image").tag(CaptureViewModel.CaptureMode.image)
            }
            .pickerStyle(SegmentedPickerStyle())
            .padding()
            
            // Capture content based on mode
            switch viewModel.captureMode {
            case .text:
                TextCaptureView(viewModel: viewModel)
            case .voice:
                VoiceCaptureView(viewModel: viewModel)
            case .image:
                ImageCaptureView(viewModel: viewModel)
            }
            
            // Processing state
            switch viewModel.captureState {
            case .ready:
                EmptyView()
            case .recording:
                Text("Recording...")
                    .foregroundColor(.red)
            case .processing:
                VStack {
                    ProgressView(value: viewModel.processingProgress)
                    Text("Processing...")
                }
            case .success:
                Text("Capture successful!")
                    .foregroundColor(.green)
            case .failure(let error):
                Text("Error: \(error.localizedDescription)")
                    .foregroundColor(.red)
            }
        }
        .padding()
    }
}

struct TextCaptureView: View {
    @ObservedObject var viewModel: CaptureViewModel
    
    var body: some View {
        VStack {
            TextField("Enter gift idea", text: $viewModel.textInput)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .padding()
            
            Button("Process") {
                viewModel.processTextInput()
            }
            .disabled(viewModel.textInput.isEmpty || viewModel.captureState == .processing)
        }
    }
}
```

### Error Handling with Context Preservation

```swift
// APIClient.swift
class APIClient {
    enum APIError: Error, LocalizedError {
        case networkError(Error)
        case serverError(Int, String)
        case processingFailed(String)
        case authorizationError(String)
        
        var errorDescription: String? {
            switch self {
            case .networkError(let error):
                return "Network error: \(error.localizedDescription)"
            case .serverError(let code, let message):
                return "Server error (\(code)): \(message)"
            case .processingFailed(let reason):
                return "Processing failed: \(reason)"
            case .authorizationError(let reason):
                return "Authorization error: \(reason)"
            }
        }
    }
    
    func processTextCapture(text: String) async throws -> GiftIdeaResponse {
        guard let url = URL(string: "https://api.example.com/capture/text") else {
            throw APIError.processingFailed("Invalid URL")
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Create request body
        let body = ["text_content": text]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.processingFailed("Invalid response")
            }
            
            switch httpResponse.statusCode {
            case 200...299:
                let decoder = JSONDecoder()
                do {
                    return try decoder.decode(GiftIdeaResponse.self, from: data)
                } catch {
                    throw APIError.processingFailed("Failed to decode response: \(error.localizedDescription)")
                }
            case 401, 403:
                throw APIError.authorizationError("Not authorized to make this request")
            default:
                let message = String(data: data, encoding: .utf8) ?? "Unknown error"
                throw APIError.serverError(httpResponse.statusCode, message)
            }
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.networkError(error)
        }
    }
}
```