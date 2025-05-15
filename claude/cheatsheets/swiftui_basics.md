# SwiftUI Basics Cheat Sheet

## Key View Components

### Text Views
```swift
// Basic text
Text("Hello, world!")
    .font(.title)
    .fontWeight(.bold)
    .foregroundColor(.blue)
    .padding()
    .background(Color.yellow)
    .cornerRadius(10)

// Text field
TextField("Enter your name", text: $name)
    .textFieldStyle(RoundedBorderTextFieldStyle())
    .padding()
    .autocapitalization(.none)
    .disableAutocorrection(true)

// Secure field
SecureField("Enter password", text: $password)
    .textFieldStyle(RoundedBorderTextFieldStyle())
    .padding()
```

### Buttons & Controls
```swift
// Basic button
Button("Click Me") {
    // Action here
}
.buttonStyle(.borderedProminent)

// Button with icon and text
Button(action: {
    // Action here
}) {
    Label("Add Gift", systemImage: "plus")
}
.buttonStyle(.bordered)

// Icon button
Button(action: {
    // Action here
}) {
    Image(systemName: "heart.fill")
        .foregroundColor(.red)
        .font(.title)
}

// Toggle
Toggle("Notifications", isOn: $notificationsEnabled)
    .toggleStyle(SwitchToggleStyle())
    .padding()

// Slider
Slider(value: $budget, in: 10...100, step: 5)
    .padding()
```

### Container Views
```swift
// VStack (vertical)
VStack(alignment: .leading, spacing: 10) {
    Text("Title")
    Text("Subtitle")
}

// HStack (horizontal)
HStack(spacing: 20) {
    Image(systemName: "gift")
    Text("Gift Idea")
}

// ZStack (depth)
ZStack {
    Color.blue.opacity(0.3)
    Text("Overlaid text")
}

// LazyVStack (lazy loading vertical)
ScrollView {
    LazyVStack {
        ForEach(items) { item in
            ItemView(item: item)
        }
    }
}

// Spacers and Dividers
VStack {
    Text("Top")
    Spacer() // Flexible space
    Divider() // Thin line divider
    Text("Bottom")
}
```

### List & Grid Views
```swift
// Basic List
List {
    Text("Item 1")
    Text("Item 2")
    Text("Item 3")
}

// List with data
List(giftIdeas) { giftIdea in
    GiftIdeaRow(giftIdea: giftIdea)
}

// List with sections
List {
    Section(header: Text("Upcoming")) {
        ForEach(upcomingGifts) { gift in
            GiftRow(gift: gift)
        }
    }
    
    Section(header: Text("Past")) {
        ForEach(pastGifts) { gift in
            GiftRow(gift: gift)
        }
    }
}

// Grid (iOS 16+)
Grid {
    GridRow {
        Text("Name")
        Text("Price")
    }
    .bold()
    
    Divider()
    
    ForEach(items) { item in
        GridRow {
            Text(item.name)
            Text("$\(item.price, specifier: "%.2f")")
        }
    }
}
```

## State Management

### Property Wrappers
```swift
// @State - Simple view-local state
@State private var name: String = ""

// @Binding - Receives state from parent
@Binding var isOn: Bool

// @StateObject - Instantiates observable object
@StateObject private var viewModel = GiftIdeaViewModel()

// @ObservedObject - Receives observable object
@ObservedObject var viewModel: GiftIdeaViewModel

// @EnvironmentObject - Receives env object from ancestor
@EnvironmentObject var userManager: UserManager

// @Environment - Reads environment values
@Environment(\.colorScheme) var colorScheme

// @AppStorage - Persists in UserDefaults
@AppStorage("username") private var username: String = ""

// @SceneStorage - Persists during scene lifetime
@SceneStorage("selectedTab") private var selectedTab: String = "home"

// @FetchRequest - CoreData fetch request
@FetchRequest(
    entity: GiftIdea.entity(),
    sortDescriptors: [NSSortDescriptor(keyPath: \GiftIdea.date, ascending: true)]
) var giftIdeas: FetchedResults<GiftIdea>
```

## Navigation

### NavigationView & NavigationLink
```swift
NavigationView {
    List(contacts) { contact in
        NavigationLink(destination: ContactDetailView(contact: contact)) {
            Text(contact.name)
        }
    }
    .navigationTitle("Contacts")
    .navigationBarItems(
        trailing: Button(action: {
            // Add new contact
        }) {
            Image(systemName: "plus")
        }
    )
}
```

### TabView
```swift
TabView(selection: $selectedTab) {
    GiftIdeaListView()
        .tabItem {
            Label("Gifts", systemImage: "gift")
        }
        .tag("gifts")
    
    ContactListView()
        .tabItem {
            Label("Contacts", systemImage: "person.2")
        }
        .tag("contacts")
    
    ReminderListView()
        .tabItem {
            Label("Reminders", systemImage: "bell")
        }
        .tag("reminders")
}
```

### Sheets & Modals
```swift
// Present sheet
@State private var showingSheet = false

Button("Add Gift") {
    showingSheet = true
}
.sheet(isPresented: $showingSheet) {
    NewGiftView()
}

// Present full-screen modal
@State private var showingModal = false

Button("Settings") {
    showingModal = true
}
.fullScreenCover(isPresented: $showingModal) {
    SettingsView()
}

// Confirmation dialog
@State private var showingConfirmation = false

Button("Delete") {
    showingConfirmation = true
}
.confirmationDialog(
    "Are you sure you want to delete this gift idea?",
    isPresented: $showingConfirmation
) {
    Button("Delete", role: .destructive) {
        // Delete action
    }
    Button("Cancel", role: .cancel) {}
}
```

## Common Gotchas

### 1. ForEach requires Identifiable items
```swift
// Fix: Make your model conform to Identifiable
struct GiftIdea: Identifiable {
    var id = UUID()
    var name: String
    // Other properties
}

// Or provide explicit id
ForEach(items, id: \.someUniqueProperty) { item in
    // View
}
```

### 2. Mutating @State inside view body
```swift
// Wrong:
var body: some View {
    Button("Click") {
        if name.isEmpty {
            name = "Guest" // Error if this runs during view body evaluation
        }
    }
}

// Fix - Use onAppear or similar:
var body: some View {
    Button("Click") {
        checkName()
    }
    .onAppear {
        if name.isEmpty {
            name = "Guest"
        }
    }
}

func checkName() {
    if name.isEmpty {
        name = "Guest"
    }
}
```

### 3. Nested ObservableObject changes not triggering view updates
```swift
// Problem:
class Child: ObservableObject {
    @Published var name = "Child"
}

class Parent: ObservableObject {
    // Changes to child won't trigger view updates
    var child = Child()
}

// Fix:
class Parent: ObservableObject {
    @Published var child = Child()
}
```

### 4. Memory leaks in closures
```swift
// Potential memory leak:
.onAppear {
    Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
        self.updateCounter()
    }
}

// Fix - store and invalidate:
@State private var timer: Timer?

.onAppear {
    timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
        self?.updateCounter()
    }
}
.onDisappear {
    timer?.invalidate()
    timer = nil
}
```

## Quick References

### Common View Modifiers
```swift
// Appearance
.font(.title)
.foregroundColor(.blue)
.background(Color.red)
.cornerRadius(8)
.shadow(radius: 3)
.opacity(0.8)
.padding()
.frame(width: 200, height: 100)
.aspectRatio(contentMode: .fit)

// Layout
.padding(.horizontal, 20)
.frame(maxWidth: .infinity, alignment: .leading)
.fixedSize(horizontal: false, vertical: true)
.layoutPriority(1)
.position(x: 100, y: 100)
.offset(x: 10, y: 10)
.edgesIgnoringSafeArea(.all)

// Animation
.animation(.easeInOut, value: animationValue)
.transition(.scale)
.rotationEffect(.degrees(45))
.scaleEffect(1.2)

// Interaction
.onTapGesture { /* action */ }
.gesture(LongPressGesture().onEnded { _ in /* action */ })
.allowsHitTesting(false)
.disabled(isDisabled)
```

### Date Formatting
```swift
// Format a date
func formatDate(_ date: Date) -> String {
    let formatter = DateFormatter()
    formatter.dateStyle = .medium  // .short, .medium, .long, .full
    formatter.timeStyle = .none
    return formatter.string(from: date)
}

// Relative date formatting
func formatRelativeDate(_ date: Date) -> String {
    let formatter = RelativeDateTimeFormatter()
    formatter.unitsStyle = .full
    return formatter.localizedString(for: date, relativeTo: Date())
}
```

### Number Formatting
```swift
// Format currency
func formatCurrency(_ amount: Double, currency: String = "USD") -> String {
    let formatter = NumberFormatter()
    formatter.numberStyle = .currency
    formatter.currencyCode = currency
    return formatter.string(from: NSNumber(value: amount)) ?? "$\(amount)"
}

// Format with decimals
func formatNumber(_ number: Double, decimals: Int = 2) -> String {
    let formatter = NumberFormatter()
    formatter.numberStyle = .decimal
    formatter.minimumFractionDigits = decimals
    formatter.maximumFractionDigits = decimals
    return formatter.string(from: NSNumber(value: number)) ?? "\(number)"
}
```