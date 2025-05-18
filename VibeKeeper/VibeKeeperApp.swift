//
//  VibeKeeperApp.swift
//  VibeKeeper
//
//  Created by Sia on 14/5/25.
//

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
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(sharedModelContainer)
    }
}
