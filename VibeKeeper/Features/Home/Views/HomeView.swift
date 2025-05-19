// VibeKeeper/Features/Home/Views/HomeView.swift
import SwiftUI
import SwiftData

struct HomeView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @EnvironmentObject private var contactViewModel: ContactViewModel
    @EnvironmentObject private var giftViewModel: GiftViewModel
    @EnvironmentObject private var occasionViewModel: OccasionViewModel
    @EnvironmentObject private var reminderViewModel: ReminderViewModel
    
    @State private var showingAddGiftSheet = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Section for upcoming occasions
                    if !upcomingOccasions.isEmpty {
                        upcomingOccasionsSection
                    }
                    
                    // Section for upcoming birthdays
                    if !upcomingBirthdays.isEmpty {
                        upcomingBirthdaysSection
                    }
                    
                    // Section for reminders
                    if !reminderViewModel.upcomingReminders().isEmpty {
                        remindersSection
                    }
                    
                    // Section for gift ideas
                    giftIdeasSection
                    
                    // Button for quick add
                    quickAddButton
                        .padding(.top, 20)
                }
                .padding()
            }
            .navigationTitle("Home")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        showingAddGiftSheet = true
                    }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddGiftSheet) {
                // This will be replaced with a proper gift creation view
                Text("Add Gift View")
            }
            .background(Color.background.ignoresSafeArea())
        }
        .onAppear {
            contactViewModel.loadContacts()
            giftViewModel.loadGifts()
            occasionViewModel.loadOccasions()
            reminderViewModel.loadReminders()
        }
    }
    
    private var upcomingOccasions: [Occasion] {
        return occasionViewModel.upcomingOccasions(within: 30)
    }
    
    private var upcomingBirthdays: [Contact] {
        return contactViewModel.upcomingBirthdays(within: 30)
    }
    
    private var upcomingOccasionsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            sectionHeader(title: "Upcoming Occasions")
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 15) {
                    ForEach(upcomingOccasions) { occasion in
                        VStack(alignment: .leading) {
                            Text(occasion.name)
                                .font(.headline)
                            
                            if let contact = occasion.contact {
                                Text(contactViewModel.fullName(for: contact))
                                    .font(.subheadline)
                            }
                            
                            Text("\(occasionViewModel.daysUntil(occasion)) days away")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .padding()
                        .cardStyle()
                        .frame(width: 150)
                    }
                }
            }
        }
    }
    
    private var upcomingBirthdaysSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            sectionHeader(title: "Upcoming Birthdays")
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 15) {
                    ForEach(upcomingBirthdays) { contact in
                        VStack(alignment: .leading) {
                            Text(contactViewModel.fullName(for: contact))
                                .font(.headline)
                            
                            if let birthday = contact.birthday {
                                Text("Birthday: \(formattedDate(birthday))")
                                    .font(.subheadline)
                            }
                            
                            if let relationship = contact.relationship {
                                Text(relationship)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding()
                        .cardStyle()
                        .frame(width: 150)
                    }
                }
            }
        }
    }
    
    private var remindersSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            sectionHeader(title: "Upcoming Reminders")
            
            ForEach(reminderViewModel.upcomingReminders().prefix(3)) { reminder in
                HStack {
                    VStack(alignment: .leading) {
                        Text(reminder.title)
                            .font(.headline)
                        
                        if let notes = reminder.notes {
                            Text(notes)
                                .font(.subheadline)
                                .lineLimit(1)
                        }
                        
                        Text(formattedDate(reminder.reminderDate))
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    Button(action: {
                        reminderViewModel.markAsCompleted(reminder)
                    }) {
                        Image(systemName: "checkmark.circle")
                            .foregroundColor(.persianGreen)
                    }
                }
                .padding()
                .cardStyle()
            }
            
            if reminderViewModel.upcomingReminders().count > 3 {
                Button("Show all reminders") {
                    // Navigate to reminders view (to be implemented)
                }
                .font(.subheadline)
                .foregroundColor(.persianGreen)
                .padding(.top, 5)
            }
        }
    }
    
    private var giftIdeasSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            sectionHeader(title: "Recent Gift Ideas")
            
            if giftViewModel.gifts.isEmpty {
                Text("No gift ideas yet. Tap the + button to add one!")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .center)
            } else {
                ForEach(giftViewModel.gifts.prefix(3)) { gift in
                    HStack {
                        VStack(alignment: .leading) {
                            Text(gift.name)
                                .font(.headline)
                            
                            if let description = gift.descriptionText {
                                Text(description)
                                    .font(.subheadline)
                                    .lineLimit(1)
                            }
                            
                            if let contact = gift.contact {
                                Text("For: \(contactViewModel.fullName(for: contact))")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                        
                        Spacer()
                        
                        if let price = gift.price {
                            Text("$\(price, specifier: "%.2f")")
                                .font(.headline)
                                .foregroundColor(gift.isPurchased ? .success : .textPrimary)
                        }
                    }
                    .padding()
                    .cardStyle()
                }
                
                if giftViewModel.gifts.count > 3 {
                    Button("Show all gift ideas") {
                        // Navigate to gifts view (to be implemented)
                    }
                    .font(.subheadline)
                    .foregroundColor(.persianGreen)
                    .padding(.top, 5)
                }
            }
        }
    }
    
    private var quickAddButton: some View {
        Button(action: {
            showingAddGiftSheet = true
        }) {
            HStack {
                Image(systemName: "plus.circle.fill")
                Text("Quick Add Gift Idea")
            }
        }
        .primaryButtonStyle()
        .padding(.horizontal)
    }
    
    private func sectionHeader(title: String) -> some View {
        Text(title)
            .font(.title2)
            .fontWeight(.bold)
            .foregroundColor(.textPrimary)
    }
    
    private func formattedDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
}

#Preview {
    HomeView()
        .environmentObject(AuthViewModel())
        .environmentObject(GiftViewModel(modelContext: try! ModelContainer(for: GiftIdea.self, Contact.self, Occasion.self, Reminder.self).mainContext))
        .environmentObject(ContactViewModel(modelContext: try! ModelContainer(for: GiftIdea.self, Contact.self, Occasion.self, Reminder.self).mainContext))
        .environmentObject(OccasionViewModel(modelContext: try! ModelContainer(for: GiftIdea.self, Contact.self, Occasion.self, Reminder.self).mainContext))
        .environmentObject(ReminderViewModel(modelContext: try! ModelContainer(for: GiftIdea.self, Contact.self, Occasion.self, Reminder.self).mainContext))
}