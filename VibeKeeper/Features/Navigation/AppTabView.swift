// VibeKeeper/Features/Navigation/AppTabView.swift
import SwiftUI
import SwiftData

struct AppTabView: View {
    @Environment(\.modelContext) private var modelContext
    @StateObject private var authViewModel = AuthViewModel()
    @StateObject private var giftViewModel: GiftViewModel
    @StateObject private var contactViewModel: ContactViewModel
    @StateObject private var occasionViewModel: OccasionViewModel
    @StateObject private var reminderViewModel: ReminderViewModel
    
    init() {
        // Note: Model context will be obtained from the environment once the view is instantiated
        // For Preview purposes, we'll initialize with a placeholder context
        // The actual context will be set in the onAppear modifier
        let previewContext = try! ModelContainer(for: GiftIdea.self, Contact.self, Occasion.self, Reminder.self).mainContext
        self._giftViewModel = StateObject(wrappedValue: GiftViewModel(modelContext: previewContext))
        self._contactViewModel = StateObject(wrappedValue: ContactViewModel(modelContext: previewContext))
        self._occasionViewModel = StateObject(wrappedValue: OccasionViewModel(modelContext: previewContext))
        self._reminderViewModel = StateObject(wrappedValue: ReminderViewModel(modelContext: previewContext))
    }
    
    var body: some View {
        Group {
            if authViewModel.isAuthenticated {
                mainTabView
            } else {
                AuthenticationView()
                    .environmentObject(authViewModel)
            }
        }
        .onAppear {
            // Update ViewModels with the actual model context from the environment
            giftViewModel.updateModelContext(modelContext)
            contactViewModel.updateModelContext(modelContext)
            occasionViewModel.updateModelContext(modelContext)
            reminderViewModel.updateModelContext(modelContext)
        }
    }
    
    private var mainTabView: some View {
        TabView {
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .environmentObject(giftViewModel)
                .environmentObject(contactViewModel)
                .environmentObject(occasionViewModel)
                .environmentObject(reminderViewModel)
            
            GiftListView()
                .tabItem {
                    Label("Gifts", systemImage: "gift.fill")
                }
                .environmentObject(giftViewModel)
                .environmentObject(contactViewModel)
            
            ContactListView()
                .tabItem {
                    Label("Contacts", systemImage: "person.2.fill")
                }
                .environmentObject(contactViewModel)
                .environmentObject(giftViewModel)
            
            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gear")
                }
                .environmentObject(reminderViewModel)
        }
        .accentColor(.persianGreen)
        .environmentObject(authViewModel)
    }
}

// Only keep the SettingsView as a placeholder
struct SettingsView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    
    var body: some View {
        NavigationView {
            List {
                Section {
                    Button(action: {
                        authViewModel.signOut()
                    }) {
                        Text("Sign Out")
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Settings")
        }
    }
}

#Preview {
    AppTabView()
}