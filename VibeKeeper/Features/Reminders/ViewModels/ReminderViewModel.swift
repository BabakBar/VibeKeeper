// VibeKeeper/Features/Reminders/ViewModels/ReminderViewModel.swift
import Foundation
import SwiftUI
import SwiftData
import Combine
import UserNotifications

@MainActor
class ReminderViewModel: ObservableObject {
    @Published var reminders: [Reminder] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var notificationPermissionGranted: Bool = false
    
    private var cancellables = Set<AnyCancellable>()
    private var modelContext: ModelContext
    
    init(modelContext: ModelContext) {
        self.modelContext = modelContext
        self.loadReminders()
        self.checkNotificationPermission()
    }
    
    func loadReminders() {
        isLoading = true
        
        do {
            let descriptor = FetchDescriptor<Reminder>(sortBy: [SortDescriptor(\.reminderDate)])
            reminders = try modelContext.fetch(descriptor)
            isLoading = false
        } catch {
            errorMessage = "Failed to load reminders: \(error.localizedDescription)"
            isLoading = false
        }
    }
    
    func addReminder(_ reminder: Reminder) {
        modelContext.insert(reminder)
        
        do {
            try modelContext.save()
            loadReminders()
            scheduleNotification(for: reminder)
        } catch {
            errorMessage = "Failed to save reminder: \(error.localizedDescription)"
        }
    }
    
    func updateReminder(_ reminder: Reminder) {
        do {
            try modelContext.save()
            loadReminders()
            updateNotification(for: reminder)
        } catch {
            errorMessage = "Failed to update reminder: \(error.localizedDescription)"
        }
    }
    
    func deleteReminder(_ reminder: Reminder) {
        modelContext.delete(reminder)
        
        do {
            try modelContext.save()
            loadReminders()
            cancelNotification(for: reminder)
        } catch {
            errorMessage = "Failed to delete reminder: \(error.localizedDescription)"
        }
    }
    
    func markAsCompleted(_ reminder: Reminder) {
        reminder.isCompleted = true
        updateReminder(reminder)
        cancelNotification(for: reminder)
    }
    
    func upcomingReminders() -> [Reminder] {
        return reminders.filter { !$0.isCompleted && $0.reminderDate > Date() }
            .sorted { $0.reminderDate < $1.reminderDate }
    }
    
    func overdueReminders() -> [Reminder] {
        return reminders.filter { !$0.isCompleted && $0.reminderDate <= Date() }
            .sorted { $0.reminderDate < $1.reminderDate }
    }
    
    func completedReminders() -> [Reminder] {
        return reminders.filter { $0.isCompleted }
            .sorted { $0.reminderDate > $1.reminderDate }
    }
    
    // MARK: - Notification Management
    
    func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            DispatchQueue.main.async {
                self.notificationPermissionGranted = granted
                if let error = error {
                    self.errorMessage = "Notification permission error: \(error.localizedDescription)"
                }
            }
        }
    }
    
    private func checkNotificationPermission() {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            DispatchQueue.main.async {
                self.notificationPermissionGranted = settings.authorizationStatus == .authorized
            }
        }
    }
    
    private func scheduleNotification(for reminder: Reminder) {
        guard notificationPermissionGranted, !reminder.isCompleted else { return }
        
        let content = UNMutableNotificationContent()
        content.title = reminder.title
        if let notes = reminder.notes {
            content.body = notes
        } else {
            content.body = "It's time for your reminder!"
        }
        content.sound = .default
        
        // Add the reminder ID to the notification for identification
        content.userInfo = ["reminderID": reminder.id.uuidString]
        
        // Create trigger based on date
        let triggerDate = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: reminder.reminderDate)
        let trigger = UNCalendarNotificationTrigger(dateMatching: triggerDate, repeats: false)
        
        // Create request
        let identifier = "reminder-\(reminder.id.uuidString)"
        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)
        
        // Schedule notification
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                DispatchQueue.main.async {
                    self.errorMessage = "Failed to schedule notification: \(error.localizedDescription)"
                }
            }
        }
    }
    
    private func updateNotification(for reminder: Reminder) {
        // Cancel existing notification and schedule a new one
        cancelNotification(for: reminder)
        scheduleNotification(for: reminder)
    }
    
    private func cancelNotification(for reminder: Reminder) {
        let identifier = "reminder-\(reminder.id.uuidString)"
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [identifier])
    }
}