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
        // Initialize ViewModels with the model context
        let context = try! ModelContainer(for: GiftIdea.self, Contact.self, Occasion.self, Reminder.self).mainContext
        self._giftViewModel = StateObject(wrappedValue: GiftViewModel(modelContext: context))
        self._contactViewModel = StateObject(wrappedValue: ContactViewModel(modelContext: context))
        self._occasionViewModel = StateObject(wrappedValue: OccasionViewModel(modelContext: context))
        self._reminderViewModel = StateObject(wrappedValue: ReminderViewModel(modelContext: context))
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

// Placeholder views - these will be implemented in separate files
// HomeView is already implemented in Features/Home/Views/HomeView.swift

struct GiftListView: View {
    var body: some View {
        NavigationView {
            Text("Gift Ideas")
                .navigationTitle("Gift Ideas")
        }
    }
}

struct ContactListView: View {
    var body: some View {
        NavigationView {
            Text("Contacts")
                .navigationTitle("Contacts")
        }
    }
}

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