<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span class="text-white font-bold text-lg">VK</span>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">VibeKeeper</h1>
              <p class="text-sm text-gray-500">AI-powered occasion tracking</p>
            </div>
          </div>
          <div class="text-sm text-gray-500">
            {{ occasions.length }} occasions tracked
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 py-8">
      <!-- Add New Occasion Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Add New Occasion</h2>
        
        <form @submit.prevent="addOccasion" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Describe the occasion (e.g., "Sarah's birthday is on March 15th")
            </label>
            <textarea
              v-model="newOccasionText"
              placeholder="Enter a natural description of the occasion..."
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              rows="3"
              :disabled="isLoading"
            ></textarea>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">
              <span class="inline-flex items-center">
                <svg class="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
                AI will extract person, occasion type, and date
              </span>
            </div>
            <button
              type="submit"
              :disabled="!newOccasionText.trim() || isLoading"
              class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center space-x-2"
            >
              <svg v-if="isLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isLoading ? 'Processing...' : 'Add Occasion' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Search & Filter -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search occasions, people, or dates..."
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
          </div>
          <select
            v-model="filterType"
            class="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">All Types</option>
            <option value="birthday">Birthday</option>
            <option value="anniversary">Anniversary</option>
            <option value="meeting">Meeting</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <!-- Occasions List -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Your Occasions</h2>
        
        <div v-if="filteredOccasions.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No occasions yet</h3>
          <p class="text-gray-500">Start by adding your first occasion above!</p>
        </div>

        <div v-else class="grid gap-4">
          <div
            v-for="occasion in filteredOccasions"
            :key="occasion.id"
            class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-3">
                  <div class="w-3 h-3 rounded-full" :class="getOccasionColor(occasion.occasion_type)"></div>
                  <span class="text-sm font-medium text-gray-600 capitalize">{{ occasion.occasion_type }}</span>
                  <span v-if="occasion.confidence_score" class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {{ Math.round(occasion.confidence_score * 100) }}% confidence
                  </span>
                </div>
                
                <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ occasion.person }}</h3>
                <p class="text-gray-600 mb-3">{{ occasion.notes || 'No additional notes' }}</p>
                
                <div class="flex items-center text-sm text-gray-500">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  {{ formatDate(occasion.occasion_date) }}
                </div>
              </div>
              
              <button
                @click="deleteOccasion(occasion.id)"
                class="text-gray-400 hover:text-red-500 transition-colors duration-200"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="mt-16 py-8 border-t border-gray-100">
      <div class="max-w-4xl mx-auto px-4 text-center text-gray-500">
        <p>&copy; 2025 VibeKeeper. Made with ❤️ for better occasion tracking.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Reactive data
const occasions = ref([])
const newOccasionText = ref('')
const searchQuery = ref('')
const filterType = ref('')
const isLoading = ref(false)
const authToken = ref(null)
const user = ref(null)

// API Configuration
const API_BASE = 'http://localhost:8001/api'

// API Helper Functions
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  if (authToken.value) {
    headers.Authorization = `Bearer ${authToken.value}`
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  })
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

// Authentication
const login = async () => {
  try {
    const result = await apiCall('/auth/login/test', {
      method: 'POST',
      body: JSON.stringify({
        email: 'dev@vibekeeper.com',
        full_name: 'Dev User',
        provider: 'dev'
      })
    })
    
    authToken.value = result.access_token
    user.value = result.user
    localStorage.setItem('authToken', authToken.value)
    
    console.log('Logged in successfully')
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  }
}

// Computed properties
const filteredOccasions = computed(() => {
  let filtered = occasions.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(occasion =>
      occasion.person.toLowerCase().includes(query) ||
      (occasion.notes && occasion.notes.toLowerCase().includes(query)) ||
      occasion.occasion_type.toLowerCase().includes(query)
    )
  }

  if (filterType.value) {
    filtered = filtered.filter(occasion => occasion.occasion_type === filterType.value)
  }

  return filtered.sort((a, b) => new Date(a.occasion_date) - new Date(b.occasion_date))
})

// Methods
const addOccasion = async () => {
  if (!newOccasionText.value.trim()) return

  isLoading.value = true
  try {
    // Ensure we're authenticated
    if (!authToken.value) {
      await login()
    }
    
    // Extract occasion data using AI
    const extracted = await apiCall('/occasions/extract', {
      method: 'POST',
      body: JSON.stringify({
        raw_input: newOccasionText.value
      })
    })
    
    // Create the occasion
    const newOccasion = await apiCall('/occasions/', {
      method: 'POST',
      body: JSON.stringify(extracted)
    })
    
    occasions.value.push(newOccasion)
    newOccasionText.value = ''
  } catch (error) {
    console.error('Error adding occasion:', error)
    alert('Failed to add occasion. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const loadOccasions = async () => {
  try {
    // Ensure we're authenticated
    if (!authToken.value) {
      await login()
    }
    
    const result = await apiCall('/occasions/')
    occasions.value = result
  } catch (error) {
    console.error('Error loading occasions:', error)
  }
}

const deleteOccasion = (id) => {
  occasions.value = occasions.value.filter(occasion => occasion.id !== id)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getOccasionColor = (type) => {
  const colors = {
    birthday: 'bg-pink-400',
    anniversary: 'bg-purple-400',
    meeting: 'bg-blue-400',
    other: 'bg-gray-400'
  }
  return colors[type] || colors.other
}


// Load occasions on mount
onMounted(async () => {
  // Try to restore auth token from localStorage
  const savedToken = localStorage.getItem('authToken')
  if (savedToken) {
    authToken.value = savedToken
  }
  
  // Load occasions from API
  await loadOccasions()
})
</script>
