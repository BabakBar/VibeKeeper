// VibeKeeper/Features/Authentication/Views/AuthenticationView.swift
import SwiftUI
import AuthenticationServices

struct AuthenticationView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @State private var showingAlert = false
    
    var body: some View {
        VStack(spacing: 20) {
            Spacer()
            
            // Logo and app name
            Image(systemName: "gift.fill")
                .resizable()
                .scaledToFit()
                .frame(width: 100, height: 100)
                .foregroundColor(.persianGreen)
            
            Text("VibeKeeper")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            Text("Never forget a gift idea again")
                .font(.subheadline)
                .padding(.bottom, 50)
            
            // Sign in with Apple button
            SignInWithAppleButton(
                .signIn,
                onRequest: { request in
                    authViewModel.handleSignInWithAppleRequest(request)
                },
                onCompletion: { result in
                    authViewModel.handleSignInWithAppleCompletion(result)
                    if authViewModel.errorMessage != nil {
                        showingAlert = true
                    }
                }
            )
            .frame(height: 50)
            .padding(.horizontal, 40)
            
            Spacer()
            
            // Footer text
            Text("By signing in, you agree to our Terms of Service and Privacy Policy.")
                .font(.footnote)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
                .foregroundColor(.secondary)
                .padding(.bottom, 20)
        }
        .padding()
        .alert(isPresented: $showingAlert) {
            Alert(
                title: Text("Sign In Error"),
                message: Text(authViewModel.errorMessage ?? "An unknown error occurred"),
                dismissButton: .default(Text("OK"))
            )
        }
    }
}

struct SignInWithAppleButton: UIViewRepresentable {
    let type: ASAuthorizationAppleIDButton.ButtonType
    let onRequest: ((ASAuthorizationAppleIDRequest) -> Void)
    let onCompletion: ((Result<ASAuthorization, Error>) -> Void)
    
    init(_ type: ASAuthorizationAppleIDButton.ButtonType, onRequest: @escaping ((ASAuthorizationAppleIDRequest) -> Void), onCompletion: @escaping ((Result<ASAuthorization, Error>) -> Void)) {
        self.type = type
        self.onRequest = onRequest
        self.onCompletion = onCompletion
    }
    
    func makeUIView(context: Context) -> ASAuthorizationAppleIDButton {
        let button = ASAuthorizationAppleIDButton(type: type, style: .black)
        button.addTarget(context.coordinator, action: #selector(Coordinator.buttonTapped), for: .touchUpInside)
        return button
    }
    
    func updateUIView(_ uiView: ASAuthorizationAppleIDButton, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
        let parent: SignInWithAppleButton
        
        init(_ parent: SignInWithAppleButton) {
            self.parent = parent
        }
        
        @objc func buttonTapped() {
            let provider = ASAuthorizationAppleIDProvider()
            let request = provider.createRequest()
            
            parent.onRequest(request)
            
            let controller = ASAuthorizationController(authorizationRequests: [request])
            controller.delegate = self
            controller.presentationContextProvider = self
            controller.performRequests()
        }
        
        func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
            parent.onCompletion(.success(authorization))
        }
        
        func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
            parent.onCompletion(.failure(error))
        }
        
        func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
            let scenes = UIApplication.shared.connectedScenes
            let windowScene = scenes.first as? UIWindowScene
            let window = windowScene?.windows.first
            return window ?? UIWindow()
        }
    }
}

#Preview {
    AuthenticationView()
        .environmentObject(AuthViewModel())
}