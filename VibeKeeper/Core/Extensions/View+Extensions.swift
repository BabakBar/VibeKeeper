// VibeKeeper/Core/Extensions/View+Extensions.swift
import SwiftUI

extension View {
    // Add primary styling to a button
    func primaryButtonStyle() -> some View {
        self.modifier(PrimaryButtonModifier())
    }
    
    // Add secondary styling to a button
    func secondaryButtonStyle() -> some View {
        self.modifier(SecondaryButtonModifier())
    }
    
    // Card styling for items
    func cardStyle() -> some View {
        self.modifier(CardModifier())
    }
    
    // Add consistent shadow to views
    func standardShadow() -> some View {
        self.shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
}

// Button modifiers
struct PrimaryButtonModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(.headline)
            .foregroundColor(.white)
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color.persianGreen)
            .cornerRadius(10)
            .standardShadow()
    }
}

struct SecondaryButtonModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(.headline)
            .foregroundColor(.persianGreen)
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color.white)
            .cornerRadius(10)
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(Color.persianGreen, lineWidth: 2)
            )
            .standardShadow()
    }
}

// Card modifier
struct CardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding()
            .background(Color.white)
            .cornerRadius(10)
            .standardShadow()
    }
}

// Example reusable components
struct RoundedTextField: View {
    var placeholder: String
    @Binding var text: String
    var keyboardType: UIKeyboardType = .default
    
    var body: some View {
        TextField(placeholder, text: $text)
            .keyboardType(keyboardType)
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(8)
            .padding(.horizontal)
    }
}

struct SecureRoundedTextField: View {
    var placeholder: String
    @Binding var text: String
    
    var body: some View {
        SecureField(placeholder, text: $text)
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(8)
            .padding(.horizontal)
    }
}