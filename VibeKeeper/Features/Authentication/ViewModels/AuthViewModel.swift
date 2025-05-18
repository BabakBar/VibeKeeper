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
    private let userIdentifierKey = "com.vibekeeper.userIdentifier"

    init() {
        checkInitialAuthenticationState()
    }

    private func checkInitialAuthenticationState() {
        let appleIDProvider = ASAuthorizationAppleIDProvider()
        appleIDProvider.getCredentialState(forUserID: KeychainHelper.shared.load(key: userIdentifierKey).flatMap { String(data: $0, encoding: .utf8) } ?? "") { [weak self] (credentialState, error) in
            DispatchQueue.main.async {
                switch credentialState {
                case .authorized:
                    if let userIdData = KeychainHelper.shared.load(key: self?.userIdentifierKey ?? "") {
                        self?.userIdentifier = String(data: userIdData, encoding: .utf8)
                        self?.isAuthenticated = true
                    } else {
                        self?.clearAuthData()
                    }
                case .revoked, .notFound:
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
                        self.errorMessage = "Failed to save user identifier. Status: \(status)"
                    }
                }
            } else if let passwordCredential = authorization.credential as? ASPasswordCredential {
                self.userIdentifier = passwordCredential.user
                self.isAuthenticated = true
            }
        case .failure(let error):
            self.errorMessage = "Sign in with Apple failed: \(error.localizedDescription)"
            self.isAuthenticated = false
        }
    }

    func signOut() {
        let status = KeychainHelper.shared.delete(key: userIdentifierKey)
        if status != noErr {
             self.errorMessage = "Failed to clear user identifier from Keychain. Status: \(status)"
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
