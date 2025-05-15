# VibeKeeper Foundation Plan: Step-by-Step Implementation

This document outlines the foundational steps for building the VibeKeeper iOS application.

## 1. Repository Setup & Branching Strategy

- **Goal:** Establish a clean and manageable Git repository.
- **Steps:**
  - Initialize the Git repository if not already done.
  - Define the branching strategy:
    - `main`: Production releases.
    - `develop`: Integration branch for features, latest development version.
    - `feature/<feature-name>`: For new feature development.
    - `bugfix/<issue-id>`: For bug fixes.
    - `release/<version>`: For release preparation.
  - Ensure `.gitignore` is configured for Xcode and Swift projects (e.g., ignoring `xcuserdata`, `DerivedData`, `.DS_Store`).

## 2. Xcode Project Configuration

- **Goal:** Set up the Xcode project with the correct settings and capabilities.
- **Steps:**
  - Target iOS 18.
  - Set the App Name: VibeKeeper.
  - Set the Bundle Identifier.
  - Enable "Sign in with Apple" capability in the "Signing & Capabilities" tab.
  - Configure project settings for SwiftData.

## 3. Theming and UI Foundation

- **Goal:** Implement the application\'s visual theme.
- **Steps:**
  - Confirm Persian Green (`#00A693`) is set as the `AccentColor` in `Assets.xcassets`.
  - Create `VibeKeeper/Core/Extensions/Color+Theme.swift` for custom color definitions and theme utilities.

    ```swift
    // VibeKeeper/Core/Extensions/Color+Theme.swift
    import SwiftUI

    extension Color {
        static let persianGreen = Color(hex: "#00A693")
        // Add other theme-specific colors here
    }

    extension Color {
        init(hex: String) {
            let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
            var int: UInt64 = 0
            Scanner(string: hex).scanHexInt64(&int)
            let a, r, g, b: UInt64
            switch hex.count {
            case 3: // RGB (12-bit)
                (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
            case 6: // RGB (24-bit)
                (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
            case 8: // ARGB (32-bit)
                (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
            default:
                (a, r, g, b) = (1, 1, 1, 0) // Default to black, though an error or clear color might be better
            }
            self.init(
                .sRGB,
                red: Double(r) / 255,
                green: Double(g) / 255,
                blue: Double(b) / 255,
                opacity: Double(a) / 255
            )
        }
    }
    ```

  - Define basic UI components or styles if needed early on.

## 4. Data Persistence with SwiftData

- **Goal:** Set up local data storage using SwiftData.
- **Steps:**
  - Create the directory `VibeKeeper/Core/Models/`.
  - Define SwiftData models:
    - `VibeKeeper/Core/Models/GiftIdea.swift`

      ```swift
      // VibeKeeper/Core/Models/GiftIdea.swift
      import Foundation
      import SwiftData

      @Model
      final class GiftIdea {
          @Attribute(.unique) var id: UUID
          var name: String
          var descriptionText: String?
          var price: Double?
          var sourceURL: String?
          var photoPath: String? // Path to locally stored image or URL string
          var isPurchased: Bool
          var createdAt: Date
          var updatedAt: Date

          // Relationships (to be fully defined with inverse if needed)
          // var contact: Contact?
          // var occasion: Occasion?

          init(id: UUID = UUID(), name: String = "", descriptionText: String? = nil, price: Double? = nil, sourceURL: String? = nil, photoPath: String? = nil, isPurchased: Bool = false, createdAt: Date = Date(), updatedAt: Date = Date()) {
              self.id = id
              self.name = name
              self.descriptionText = descriptionText
              self.price = price
              self.sourceURL = sourceURL
              self.photoPath = photoPath
              self.isPurchased = isPurchased
              self.createdAt = createdAt
              self.updatedAt = updatedAt
          }
      }
      ```

    - `VibeKeeper/Core/Models/Contact.swift`

      ```swift
      // VibeKeeper/Core/Models/Contact.swift
      import Foundation
      import SwiftData

      @Model
      final class Contact {
          @Attribute(.unique) var id: UUID
          var firstName: String
          var lastName: String?
          var relationship: String?
          var notes: String?
          var birthday: Date?
          var createdAt: Date
          var updatedAt: Date

          // Example of a potential relationship
          // @Relationship(deleteRule: .cascade, inverse: \GiftIdea.contact) 
          // var giftIdeas: [GiftIdea]? = []

          init(id: UUID = UUID(), firstName: String = "", lastName: String? = nil, relationship: String? = nil, notes: String? = nil, birthday: Date? = nil, createdAt: Date = Date(), updatedAt: Date = Date()) {
              self.id = id
              self.firstName = firstName
              self.lastName = lastName
              self.relationship = relationship
              self.notes = notes
              self.birthday = birthday
              self.createdAt = createdAt
              self.updatedAt = updatedAt
          }
      }
      ```

    - `VibeKeeper/Core/Models/Occasion.swift`

      ```swift
      // VibeKeeper/Core/Models/Occasion.swift
      import Foundation
      import SwiftData

      @Model
      final class Occasion {
          @Attribute(.unique) var id: UUID
          var name: String
          var date: Date
          var isRecurring: Bool
          var notes: String?
          var createdAt: Date
          var updatedAt: Date

          init(id: UUID = UUID(), name: String = "", date: Date = Date(), isRecurring: Bool = false, notes: String? = nil, createdAt: Date = Date(), updatedAt: Date = Date()) {
              self.id = id
              self.name = name
              self.date = date
              self.isRecurring = isRecurring
              self.notes = notes
              self.createdAt = createdAt
              self.updatedAt = updatedAt
          }
      }
      ```

    - `VibeKeeper/Core/Models/Reminder.swift`

      ```swift
      // VibeKeeper/Core/Models/Reminder.swift
      import Foundation
      import SwiftData

      @Model
      final class Reminder {
          @Attribute(.unique) var id: UUID
          var title: String
          var reminderDate: Date
          var notes: String?
          var isCompleted: Bool
          var createdAt: Date
          var updatedAt: Date

          // var occasion: Occasion? // Link to an occasion

          init(id: UUID = UUID(), title: String = "", reminderDate: Date = Date(), notes: String? = nil, isCompleted: Bool = false, createdAt: Date = Date(), updatedAt: Date = Date()) {
              self.id = id
              self.title = title
              self.reminderDate = reminderDate
              self.notes = notes
              self.isCompleted = isCompleted
              self.createdAt = createdAt
              self.updatedAt = updatedAt
          }
      }
      ```

  - Set up the `ModelContainer` in `VibeKeeper/VibeKeeperApp.swift`:

    ```swift
    // VibeKeeper/VibeKeeperApp.swift
    import SwiftUI
    import SwiftData

    @main
    struct VibeKeeperApp: App {
        var sharedModelContainer: ModelContainer = {
            let schema = Schema([
                GiftIdea.self,
                Contact.self,
                Occasion.self,
                Reminder.self,
            ])
            let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

            do {
                return try ModelContainer(for: schema, configurations: [modelConfiguration])
            } catch {
                fatalError("Could not create ModelContainer: \\(error)")
            }
        }()

        var body: some Scene {
            WindowGroup {
                ContentView() // Replace with initial view (e.g., conditional view based on auth state)
            }
            .modelContainer(sharedModelContainer)
        }
    }
    ```

## 5. Authentication Service (Sign in with Apple)

- **Goal:** Implement user authentication using Apple\'s native solution.
- **Steps:**
  - Create `VibeKeeper/Core/Helpers/KeychainHelper.swift` for secure storage of user identifiers or tokens.

    ```swift
    // VibeKeeper/Core/Helpers/KeychainHelper.swift
    import Foundation
    import Security

    class KeychainHelper {
        static let shared = KeychainHelper()
        private init() {}

        func save(key: String, data: Data) -> OSStatus {
            let query = [
                kSecClass: kSecClassGenericPassword,
                kSecAttrAccount: key,
                kSecValueData: data,
                kSecAttrAccessible: kSecAttrAccessibleWhenUnlockedThisDeviceOnly // Or kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
            ] as [String: Any]

            SecItemDelete(query as CFDictionary) // Delete any existing item.
            return SecItemAdd(query as CFDictionary, nil)
        }

        func load(key: String) -> Data? {
            let query = [
                kSecClass: kSecClassGenericPassword,
                kSecAttrAccount: key,
                kSecReturnData: kCFBooleanTrue!,
                kSecMatchLimit: kSecMatchLimitOne
            ] as [String: Any]

            var dataTypeRef: AnyObject?
            let status: OSStatus = SecItemCopyMatching(query as CFDictionary, &dataTypeRef)

            if status == noErr {
                return dataTypeRef as? Data
            } else {
                // Consider logging error for debugging: print("Keychain load error: \\(status)")
                return nil
            }
        }

        func delete(key: String) -> OSStatus {
            let query = [
                kSecClass: kSecClassGenericPassword,
                kSecAttrAccount: key
            ] as [String: Any]
            return SecItemDelete(query as CFDictionary)
        }
    }
    ```

  - Create `VibeKeeper/Features/Authentication/ViewModels/AuthViewModel.swift` to handle authentication logic.

    ```swift
    // VibeKeeper/Features/Authentication/ViewModels/AuthViewModel.swift
    import SwiftUI
    import Combine
    import AuthenticationServices

    class AuthViewModel: ObservableObject {
        @Published var isAuthenticated: Bool = false
        @Published var userIdentifier: String?
        @Published var userFullName: PersonNameComponents?
        @Published var userEmail: String?
        @Published var errorMessage: String?

        private var cancellables = Set<AnyCancellable>()
        private let userIdentifierKey = "com.vibekeeper.userIdentifier" // Ensure this is unique

        init() {
            checkInitialAuthenticationState()
        }

        private func checkInitialAuthenticationState() {
            // This attempts to get the user identifier from Apple's services
            // This is more about checking if the app has a current ASAuthorizationAppleIDProvider credential state
            let appleIDProvider = ASAuthorizationAppleIDProvider()
            appleIDProvider.getCredentialState(forUserID: KeychainHelper.shared.load(key: userIdentifierKey).flatMap { String(data: $0, encoding: .utf8) } ?? "") { [weak self] (credentialState, error) in
                DispatchQueue.main.async {
                    switch credentialState {
                    case .authorized:
                        // User is authorized, load details from Keychain
                        if let userIdData = KeychainHelper.shared.load(key: self?.userIdentifierKey ?? "") {
                            self?.userIdentifier = String(data: userIdData, encoding: .utf8)
                            self?.isAuthenticated = true
                            // Optionally load name/email if stored, though these are usually for initial setup
                        } else {
                            // Keychain data missing, treat as logged out
                            self?.clearAuthData()
                        }
                    case .revoked, .notFound:
                        // User revoked access or not found, clear local data
                        self?.clearAuthData()
                    default:
                        self?.clearAuthData()
                        break
                    }
                }
            }
        }
        
        func handleSignInWithAppleRequest(_ request: ASAuthorizationAppleIDRequest) {
            request.requestedScopes = [.fullName, .email]
        }

        func handleSignInWithAppleCompletion(_ result: Result<ASAuthorization, Error>) {
            switch result {
            case .success(let authorization):
                if let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential {
                    let userId = appleIDCredential.user
                    
                    self.userIdentifier = userId
                    self.userFullName = appleIDCredential.fullName
                    self.userEmail = appleIDCredential.email
                    self.isAuthenticated = true
                    self.errorMessage = nil

                    if let userIdData = userId.data(using: .utf8) {
                        let status = KeychainHelper.shared.save(key: userIdentifierKey, data: userIdData)
                        if status != noErr {
                            self.errorMessage = "Failed to save user identifier. Status: \\(status)"
                            // Potentially clear auth data if save fails critically
                        }
                    }
                    // Note: fullName and email are typically only provided on the first sign-in.
                    // You should securely transmit them to your backend if you have one, or store them if needed by the app.
                    // For subsequent sign-ins, they will likely be nil.
                } else if let passwordCredential = authorization.credential as? ASPasswordCredential {
                    // Handle sign in with an existing iCloud Keychain credential (less common for "Sign in with Apple" button)
                    self.userIdentifier = passwordCredential.user
                    self.isAuthenticated = true
                    // Store passwordCredential.password securely if needed by your app's logic
                }
            case .failure(let error):
                self.errorMessage = "Sign in with Apple failed: \\(error.localizedDescription)"
                self.isAuthenticated = false
            }
        }

        func signOut() {
            let status = KeychainHelper.shared.delete(key: userIdentifierKey)
            if status != noErr {
                 self.errorMessage = "Failed to clear user identifier from Keychain. Status: \\(status)"
            }
            clearAuthData()
        }

        private func clearAuthData() {
            DispatchQueue.main.async {
                self.userIdentifier = nil
                self.userFullName = nil
                self.userEmail = nil
                self.isAuthenticated = false
            }
        }
    }
    ```

  - Implement the UI for "Sign in with Apple" button (e.g., `SignInWithAppleButton`) and related flow in `VibeKeeper/Features/Authentication/Views/`.

## 6. Application Architecture (MVVM)

- **Goal:** Define a scalable and maintainable application structure.
- **Steps:**
  - Adopt Model-View-ViewModel (MVVM) architecture.
  - Establish the directory structure:

    ```text
    VibeKeeper/
    ├── App/
    │   ├── VibeKeeperApp.swift
    │   └── ContentView.swift  // Initial root view
    ├── Core/
    │   ├── Extensions/
    │   │   └── Color+Theme.swift
    │   ├── Helpers/
    │   │   └── KeychainHelper.swift
    │   ├── Models/
    │   │   ├── GiftIdea.swift
    │   │   ├── Contact.swift
    │   │   ├── Occasion.swift
    │   │   └── Reminder.swift
    │   ├── Services/
    │   │   └── NetworkClient.swift (stubbed)
    │   └── Utils/ // For other general utilities
    ├── Features/
    │   ├── Authentication/
    │   │   ├── Views/
    │   │   │   └── SignInView.swift // Example view for sign-in
    │   │   └── ViewModels/
    │   │       └── AuthViewModel.swift
    │   ├── Gifts/      // Example feature module
    │   │   ├── Views/
    │   │   ├── ViewModels/
    │   │   └── Models/ // Feature-specific models if not in Core
    │   └── ... (other feature modules like Contacts, Occasions)
    └── Resources/
        └── Assets.xcassets/
    ```

  - Ensure clear separation of concerns.

## 7. Networking Layer (Stubbed)

- **Goal:** Define a basic structure for API communication.
- **Steps:**
  - Create `VibeKeeper/Core/Services/NetworkClient.swift`.

    ```swift
    // VibeKeeper/Core/Services/NetworkClient.swift
    import Foundation
    import Combine

    enum APIError: Error, LocalizedError {
        case invalidURL
        case requestFailed(Error)
        case decodingFailed(Error)
        case statusCode(Int, Data?) // Include status code and potential error data
        case unknown(Error? = nil)

        var errorDescription: String? {
            switch self {
            case .invalidURL: return "Invalid URL encountered."
            case .requestFailed(let error): return "Request failed: \\(error.localizedDescription)"
            case .decodingFailed(let error): return "Failed to decode response: \\(error.localizedDescription)"
            case .statusCode(let code, _): return "Received HTTP status code \\(code)."
            case .unknown(let error): return "An unknown error occurred: \\(error?.localizedDescription ?? "No details")"
            }
        }
    }

    protocol APIEndpoint {
        var baseURL: URL { get }
        var path: String { get }
        var method: String { get } // "GET", "POST", "PUT", "DELETE"
        var headers: [String: String]? { get }
        var parameters: [String: Any]? { get } // For query parameters or body
    }

    extension APIEndpoint {
        var urlRequest: URLRequest? {
            guard var components = URLComponents(url: baseURL.appendingPathComponent(path), resolvingAgainstBaseURL: true) else {
                return nil
            }

            if method == "GET", let parameters = parameters as? [String: String] {
                components.queryItems = parameters.map { URLQueryItem(name: $0.key, value: $0.value) }
            }
            
            guard let url = components.url else { return nil }
            
            var request = URLRequest(url: url)
            request.httpMethod = method
            request.allHTTPHeaderFields = headers
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue("application/json", forHTTPHeaderField: "Accept")

            if method != "GET", let parameters = parameters {
                request.httpBody = try? JSONSerialization.data(withJSONObject: parameters)
            }
            return request
        }
    }

    protocol NetworkClientProtocol {
        func request<T: Decodable>(_ endpoint: APIEndpoint) -> AnyPublisher<T, APIError>
    }

    class NetworkClient: NetworkClientProtocol {
        static let shared = NetworkClient()
        private let session: URLSession
        private let decoder: JSONDecoder

        private init(session: URLSession = .shared, decoder: JSONDecoder = JSONDecoder()) {
            self.session = session
            self.decoder = decoder
            self.decoder.dateDecodingStrategy = .iso8601 // Or your preferred strategy
        }

        func request<T: Decodable>(_ endpoint: APIEndpoint) -> AnyPublisher<T, APIError> {
            guard let urlRequest = endpoint.urlRequest else {
                return Fail(error: APIError.invalidURL).eraseToAnyPublisher()
            }

            return session.dataTaskPublisher(for: urlRequest)
                .tryMap { data, response -> Data in
                    guard let httpResponse = response as? HTTPURLResponse else {
                        throw APIError.unknown()
                    }
                    guard (200..<300).contains(httpResponse.statusCode) else {
                        throw APIError.statusCode(httpResponse.statusCode, data)
                    }
                    return data
                }
                .decode(type: T.self, decoder: decoder)
                .mapError { error -> APIError in
                    if let apiError = error as? APIError {
                        return apiError
                    } else if error is DecodingError {
                        return APIError.decodingFailed(error)
                    } else {
                        return APIError.requestFailed(error)
                    }
                }
                .receive(on: DispatchQueue.main) // Ensure delivery on main thread for UI updates
                .eraseToAnyPublisher()
        }
    }

    // Example API Endpoint Definition (can be an enum for different endpoints)
    // enum VibeKeeperAPI: APIEndpoint {
    //     case getGifts
    //     case addGift(giftData: Data)
    //
    //     var baseURL: URL { return URL(string: "https://your.backend.api/v1")! }
    //
    //     var path: String {
    //         switch self {
    //         case .getGifts, .addGift: return "/gifts"
    //         }
    //     }
    //
    //     var method: String {
    //         switch self {
    //         case .getGifts: return "GET"
    //         case .addGift: return "POST"
    //         }
    //     }
    //
    //     var headers: [String : String]? {
    //         // Add auth tokens etc.
    //         return ["Authorization": "Bearer YOUR_TOKEN"]
    //     }
    //
    //     var parameters: [String : Any]? {
    //         switch self {
    //         case .getGifts: return nil
    //         case .addGift(let giftData):
    //             // This example assumes giftData is already JSON Data.
    //             // If it's a struct, you'd convert it to [String: Any] or use Encodable for httpBody.
    //             return nil // httpBody will be set directly for POST if using Data
    //         }
    //     }
    // }
    ```

## 8. Testing Strategy

- **Goal:** Ensure code quality and reliability.
- **Steps:**
  - **Unit Tests (`VibeKeeperTests`):**
    - Test ViewModels (e.g., `AuthViewModel` state changes, logic).
    - Test Helpers (e.g., `KeychainHelper` save/load/delete).
    - Test SwiftData model logic (if any complex methods are added).
    - Use an in-memory `ModelContainer` for SwiftData tests:

      ```swift
      // In your test setup:
      // let config = ModelConfiguration(isStoredInMemoryOnly: true)
      // let container = try ModelContainer(for: GiftIdea.self, Contact.self, configurations: config)
      // let context = ModelContext(container)
      ```

  - **UI Tests (`VibeKeeperUITests`):**
    - Test key user flows: Sign In/Out, adding/editing items.
    - Verify navigation and UI element states.
    - Use accessibility identifiers for robust element querying.

## 9. Continuous Integration (CI) with GitHub Actions

- **Goal:** Automate build, test, and validation.
- **Steps:**
  - Create `.github/workflows/ci.yml`.
  - Configure workflow:

    ```yaml
    # .github/workflows/ci.yml
    name: VibeKeeper CI

    on:
      push:
        branches: [ main, develop ]
      pull_request:
        branches: [ main, develop ]
      workflow_dispatch: # Allows manual triggering

    jobs:
      build_and_test:
        name: Build and Test iOS
        runs-on: macos-14 # Or macos-latest, specify Ventura or Sonoma if needed for Xcode version
        
        steps:
        - name: Checkout repository
          uses: actions/checkout@v4

        # Cache SPM dependencies
        - name: Cache Swift Package Manager dependencies
          uses: actions/cache@v3
          with:
            path: .build
            key: ${{ runner.os }}-spm-${{ hashFiles('**/Package.resolved') }}
            restore-keys: |
              ${{ runner.os }}-spm-

        # Select appropriate Xcode version (if multiple are available on runner)
        # Example: /Applications/Xcode_15.3.app or /Applications/Xcode_16.0.app (beta)
        # This step might not be needed if the default Xcode on macos-latest is sufficient.
        # - name: Select Xcode version
        #   run: sudo xcode-select -s /Applications/Xcode_15.3.app/Contents/Developer
        #   # Check available Xcode versions on GitHub Actions runners documentation

        - name: Build Application
          run: |
            xcodebuild build -scheme VibeKeeper \
                             -destination 'platform=iOS Simulator,name=iPhone 15,OS=18.0' \
                             CODE_SIGN_IDENTITY="" \
                             CODE_SIGNING_REQUIRED=NO
          # Note: Adjust iPhone model and OS version as needed.
          # For real device builds or distribution, signing configuration is essential.
          # DEVELOPMENT_TEAM can be passed as an env var if needed for simulator builds with certain capabilities.

        - name: Run Unit and UI Tests
          run: |
            xcodebuild test -scheme VibeKeeper \
                            -destination 'platform=iOS Simulator,name=iPhone 15,OS=18.0' \
                            CODE_SIGN_IDENTITY="" \
                            CODE_SIGNING_REQUIRED=NO
          # Ensure your scheme has tests enabled and configured.
    ```

    *Note: `CODE_SIGN_IDENTITY=""` and `CODE_SIGNING_REQUIRED=NO` are often used for simulator builds on CI where actual code signing isn\'t necessary. If your project requires specific provisioning for capabilities even on simulators, you might need to manage certificates and profiles (e.g., using `fastlane match` or manual setup with GitHub secrets).*

## 10. Development Best Practices

- **Goal:** Maintain a high-quality, accessible, and maintainable codebase.
- **Steps:**
  - **SwiftLint:** Integrate for code style consistency. Add `.swiftlint.yml`.
  - **SPM:** Manage all dependencies via Swift Package Manager.
  - **Error Handling:** Use Swift\'s `Error` protocol, `Result` type, and specific error enums. Provide clear error messages to the user where appropriate.
  - **Accessibility (A11y):** Design with accessibility in mind (VoiceOver labels, dynamic type, sufficient contrast).
  - **Localization (L10n):** Use `String(localized:)` or `Text(_:tableName:bundle:comment:)` for all user-facing strings.
  - **Documentation:** Comment complex logic and public APIs. Consider DocC for generating documentation.
  - **Code Reviews:** Enforce pull requests and code reviews for `develop` and `main` branches.
  - **Logging:** Implement a basic logging strategy (e.g., `OSLog`) for debugging, and integrate Sentry as planned.

This step-by-step plan will guide the initial development phase of VibeKeeper.
