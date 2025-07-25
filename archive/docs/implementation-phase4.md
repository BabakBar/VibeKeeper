
### Phase 4: Frontend Components (Day 4)

#### 4.1 Create Login page (pages/login.vue)
```vue
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Sign in to VibeKeeper
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Track and remember special occasions effortlessly
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Test login form for development -->
        <form @submit.prevent="handleTestLogin" class="space-y-6">
          <div>
            <label for="email" class="label">
              Email address
            </label>
            <input
              id="email"
              v-model="testEmail"
              type="email"
              required
              class="input"
              placeholder="test@example.com"
            />
          </div>

          <div>
            <label for="name" class="label">
              Full name
            </label>
            <input
              id="name"
              v-model="testName"
              type="text"
              required
              class="input"
              placeholder="Test User"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full btn btn-primary"
          >
            {{ loading ? 'Signing in...' : 'Sign in (Test)' }}
          </button>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              @click="handleGoogleLogin"
              disabled
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="ml-2">Google</span>
            </button>

            <button
              @click="handleAppleLogin"
              disabled
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span class="ml-2">Apple</span>
            </button>
          </div>
        </div>

        <p class="mt-6 text-center text-xs text-gray-500">
          OAuth login coming soon. Use test login for now.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const loading = ref(false)
const testEmail = ref('test@example.com')
const testName = ref('Test User')

const handleTestLogin = async () => {
  loading.value = true
  try {
    await authStore.login(testEmail.value, testName.value)
    await navigateTo('/app')
  } catch (error) {
    console.error('Login failed:', error)
    // TODO: Show error message
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = () => {
  // TODO: Implement Google OAuth
  console.log('Google login not yet implemented')
}

const handleAppleLogin = () => {
  // TODO: Implement Apple OAuth
  console.log('Apple login not yet implemented')
}
</script>
```

#### 4.2 Create Landing page (pages/index.vue)
```vue
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">VibeKeeper</h1>
          </div>
          <div class="flex items-center">
            <NuxtLink
              to="/login"
              class="btn btn-primary"
            >
              Get Started
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <main>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">
          <h2 class="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Never Forget a
            <span class="text-blue-600"> Special Occasion</span>
          </h2>
          <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Simply type naturally like "Mom's birthday is on April 15th" and let AI do the rest. 
            Track birthdays, anniversaries, and special moments effortlessly.
          </p>
          <div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div class="rounded-md shadow">
              <NuxtLink
                to="/login"
                class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Start Using VibeKeeper
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Features -->
        <div class="mt-24">
          <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div class="pt-6">
              <div class="flow-root bg-white rounded-lg px-6 pb-8">
                <div class="-mt-6">
                  <div class="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <h3 class="mt-8 text-lg font-medium text-gray-900 tracking-tight">Natural Language Input</h3>
                  <p class="mt-5 text-base text-gray-500">
                    Just type as you would speak. Our AI understands phrases like "John's graduation on June 20th" instantly.
                  </p>
                </div>
              </div>
            </div>

            <div class="pt-6">
              <div class="flow-root bg-white rounded-lg px-6 pb-8">
                <div class="-mt-6">
                  <div class="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 class="mt-8 text-lg font-medium text-gray-900 tracking-tight">Smart Organization</h3>
                  <p class="mt-5 text-base text-gray-500">
                    Automatically categorizes occasions, tracks relationships, and shows you what's coming up next.
                  </p>
                </div>
              </div>
            </div>

            <div class="pt-6">
              <div class="flow-root bg-white rounded-lg px-6 pb-8">
                <div class="-mt-6">
                  <div class="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 class="mt-8 text-lg font-medium text-gray-900 tracking-tight">Easy Search & Filter</h3>
                  <p class="mt-5 text-base text-gray-500">
                    Find any occasion instantly. Filter by person, type, or browse upcoming events at a glance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Redirect to app if already logged in
const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isLoggedIn) {
    navigateTo('/app')
  }
})
</script>
```

#### 4.3 Create App Layout component (components/AppLayout.vue)
```vue
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">VibeKeeper</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">
              {{ authStore.currentUser?.full_name }}
            </span>
            <button
              @click="handleLogout"
              class="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
}
</script>
```

#### 4.4 Create Occasions composable (composables/useOccasions.ts)
```typescript
import type { 
  Occasion, 
  OccasionCreate, 
  OccasionExtracted, 
  OccasionUpdate,
  OccasionFilters 
} from '~/types'

export const useOccasions = () => {
  const { api } = useApi()
  
  // Extract occasion data from text
  const extractOccasion = async (rawInput: string) => {
    return await api<OccasionExtracted>('/api/occasions/extract', {
      method: 'POST',
      body: { raw_input: rawInput }
    })
  }
  
  // Create a new occasion
  const createOccasion = async (data: OccasionExtracted) => {
    return await api<Occasion>('/api/occasions/', {
      method: 'POST',
      body: data
    })
  }
  
  // List occasions with filters
  const listOccasions = async (filters?: OccasionFilters) => {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
    }
    
    return await api<Occasion[]>(`/api/occasions/?${params}`)
  }
  
  // Get single occasion
  const getOccasion = async (id: number) => {
    return await api<Occasion>(`/api/occasions/${id}`)
  }
  
  // Update occasion
  const updateOccasion = async (id: number, data: OccasionUpdate) => {
    return await api<Occasion>(`/api/occasions/${id}`, {
      method: 'PUT',
      body: data
    })
  }
  
  // Delete occasion
  const deleteOccasion = async (id: number) => {
    await api(`/api/occasions/${id}`, {
      method: 'DELETE'
    })
  }
  
  // Search occasions
  const searchOccasions = async (query: string) => {
    return await api<Occasion[]>(`/api/occasions/search/?q=${encodeURIComponent(query)}`)
  }
  
  return {
    extractOccasion,
    createOccasion,
    listOccasions,
    getOccasion,
    updateOccasion,
    deleteOccasion,
    searchOccasions
  }
}
```

#### 4.5 Create Occasion Input component (components/OccasionInput.vue)
```vue
<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-lg font-medium text-gray-900 mb-4">Add New Occasion</h2>
    
    <!-- Input Form -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="occasion-input" class="label">
          Tell me about an occasion
        </label>
        <textarea
          id="occasion-input"
          v-model="inputText"
          rows="3"
          class="input"
          placeholder="E.g., Bahar's birthday is on April 4th, Mom's anniversary December 15th..."
          :disabled="loading"
        />
      </div>
      
      <button
        type="submit"
        :disabled="loading || !inputText.trim()"
        class="btn btn-primary"
      >
        {{ loading ? 'Processing...' : 'Extract & Save' }}
      </button>
    </form>

    <!-- Extraction Result -->
    <div v-if="extractedData && !saved" class="mt-6 p-4 bg-blue-50 rounded-lg">
      <h3 class="text-sm font-medium text-gray-900 mb-2">Extracted Information</h3>
      
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">Person:</span>
          <span class="font-medium">{{ extractedData.person }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Occasion:</span>
          <span class="font-medium">{{ extractedData.occasion_type }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Date:</span>
          <span class="font-medium">{{ formatDate(extractedData.occasion_date) }}</span>
        </div>
        <div v-if="extractedData.relationship" class="flex justify-between">
          <span class="text-gray-600">Relationship:</span>
          <span class="font-medium">{{ extractedData.relationship }}</span>
        </div>
        <div v-if="extractedData.notes" class="flex justify-between">
          <span class="text-gray-600">Notes:</span>
          <span class="font-medium">{{ extractedData.notes }}</span>
        </div>
      </div>

      <!-- Confidence Score -->
      <div class="mt-3">
        <ConfidenceScore :score="extractedData.confidence_score" />
      </div>

      <!-- Actions -->
      <div class="mt-4 flex space-x-2">
        <button
          @click="handleSave"
          :disabled="saving"
          class="btn btn-primary"
        >
          {{ saving ? 'Saving...' : 'Save' }}
        </button>
        <button
          @click="handleCancel"
          class="btn btn-secondary"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="saved" class="mt-4 p-4 bg-green-50 rounded-lg">
      <p class="text-sm text-green-800">
        ✓ Occasion saved successfully!
      </p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-4 p-4 bg-red-50 rounded-lg">
      <p class="text-sm text-red-800">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OccasionExtracted } from '~/types'
import dayjs from 'dayjs'

const emit = defineEmits<{
  created: [occasion: Occasion]
}>()

const { extractOccasion, createOccasion } = useOccasions()

const inputText = ref('')
const loading = ref(false)
const saving = ref(false)
const saved = ref(false)
const extractedData = ref<OccasionExtracted | null>(null)
const error = ref('')

const formatDate = (date: string) => {
  return dayjs(date).format('MMMM D, YYYY')
}

const handleSubmit = async () => {
  if (!inputText.value.trim()) return
  
  loading.value = true
  error.value = ''
  saved.value = false
  extractedData.value = null
  
  try {
    const result = await extractOccasion(inputText.value)
    extractedData.value = result
  } catch (err: any) {
    error.value = err.data?.detail || 'Failed to extract occasion information'
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!extractedData.value) return
  
  saving.value = true
  error.value = ''
  
  try {
    const occasion = await createOccasion(extractedData.value)
    saved.value = true
    emit('created', occasion)
    
    // Reset form after delay
    setTimeout(() => {
      inputText.value = ''
      extractedData.value = null
      saved.value = false
    }, 2000)
  } catch (err: any) {
    error.value = err.data?.detail || 'Failed to save occasion'
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  extractedData.value = null
  error.value = ''
}
</script>
```

#### 4.6 Create Confidence Score component (components/ConfidenceScore.vue)
```vue
<template>
  <div class="flex items-center space-x-2">
    <span class="text-sm text-gray-600">Confidence:</span>
    <div class="flex-1 bg-gray-200 rounded-full h-2">
      <div
        class="h-2 rounded-full transition-all duration-300"
        :class="barColorClass"
        :style="{ width: `${score * 100}%` }"
      />
    </div>
    <span class="text-sm font-medium" :class="textColorClass">
      {{ Math.round(score * 100) }}%
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  score: number
}

const props = defineProps<Props>()

const barColorClass = computed(() => {
  if (props.score >= 0.9) return 'bg-green-500'
  if (props.score >= 0.7) return 'bg-yellow-500'
  return 'bg-red-500'
})

const textColorClass = computed(() => {
  if (props.score >= 0.9) return 'text-green-700'
  if (props.score >= 0.7) return 'text-yellow-700'
  return 'text-red-700'
})
</script>
```

#### 4.7 Create Occasion Card component (components/OccasionCard.vue)
```vue
<template>
  <div class="card hover:shadow-xl transition-all duration-200">
    <!-- Header -->
    <div class="flex justify-between items-start mb-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">
          {{ occasion.person }}
        </h3>
        <p class="text-sm text-gray-600">
          {{ occasion.occasion_type }}
          <span v-if="occasion.relationship" class="text-gray-500">
            • {{ occasion.relationship }}
          </span>
        </p>
      </div>
      
      <!-- Status Badge -->
      <span
        v-if="occasion.is_upcoming"
        class="px-2 py-1 text-xs font-medium rounded-full"
        :class="statusClass"
      >
        {{ daysText }}
      </span>
    </div>

    <!-- Date -->
    <div class="mb-3">
      <p class="text-sm font-medium text-gray-900">
        {{ formatDate(occasion.occasion_date) }}
      </p>
    </div>

    <!-- Notes -->
    <p v-if="occasion.notes" class="text-sm text-gray-600 mb-4">
      {{ occasion.notes }}
    </p>

    <!-- Actions -->
    <div class="flex justify-between items-center pt-4 border-t border-gray-100">
      <div class="flex space-x-2">
        <button
          @click="emit('edit', occasion)"
          class="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Edit
        </button>
        <button
          @click="handleDelete"
          class="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Delete
        </button>
      </div>
      
      <!-- Confidence indicator -->
      <div v-if="occasion.confidence_score" class="text-xs text-gray-500">
        AI: {{ Math.round(occasion.confidence_score * 100) }}%
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Occasion } from '~/types'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

interface Props {
  occasion: Occasion
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [occasion: Occasion]
  delete: [id: number]
}>()

const formatDate = (date: string) => {
  return dayjs(date).format('MMMM D, YYYY')
}

const daysText = computed(() => {
  const days = props.occasion.days_until
  
  if (days === 0) return 'Today!'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'
  if (days > 0) return `In ${days} days`
  return `${Math.abs(days)} days ago`
})

const statusClass = computed(() => {
  const days = props.occasion.days_until
  
  if (days === 0) return 'bg-red-100 text-red-800'
  if (days > 0 && days <= 7) return 'bg-yellow-100 text-yellow-800'
  if (days > 7 && days <= 30) return 'bg-blue-100 text-blue-800'
  if (days > 30) return 'bg-gray-100 text-gray-800'
  return 'bg-gray-100 text-gray-600'
})

const handleDelete = () => {
  if (confirm('Are you sure you want to delete this occasion?')) {
    emit('delete', props.occasion.id)
  }
}
</script>
```

#### 4.8 Create Search Filter component (components/SearchFilter.vue)
```vue
<template>
  <div class="bg-white rounded-lg shadow p-4">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Search Input -->
      <div class="md:col-span-2">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Search by name or type..."
          class="input"
          @input="debouncedEmit"
        />
      </div>
      
      <!-- Occasion Type Filter -->
      <div>
        <select
          v-model="filters.occasion_type"
          class="input"
          @change="handleChange"
        >
          <option value="">All Types</option>
          <option value="birthday">Birthday</option>
          <option value="anniversary">Anniversary</option>
          <option value="graduation">Graduation</option>
          <option value="wedding">Wedding</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <!-- Upcoming Only Toggle -->
      <div class="flex items-center">
        <label class="flex items-center cursor-pointer">
          <input
            v-model="filters.upcoming_only"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            @change="handleChange"
          />
          <span class="ml-2 text-sm text-gray-700">Upcoming only</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { debounce } from 'lodash-es'

interface Filters {
  search: string
  occasion_type: string
  upcoming_only: boolean
}

const emit = defineEmits<{
  change: [filters: Filters]
}>()

const filters = reactive<Filters>({
  search: '',
  occasion_type: '',
  upcoming_only: false
})

const handleChange = () => {
  emit('change', { ...filters })
}

const debouncedEmit = debounce(handleChange, 300)
</script>
```

#### 4.9 Create Main App page (pages/app.vue)
```vue
<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Page Title -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Your Occasions</h1>
        <p class="mt-1 text-sm text-gray-600">
          Track and remember all your special moments
        </p>
      </div>

      <!-- Add Occasion Form -->
      <OccasionInput @created="handleOccasionCreated" />

      <!-- Search and Filters -->
      <SearchFilter @change="handleFilterChange" />

      <!-- Occasions List -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-flex items-center">
          <svg class="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="ml-2 text-gray-600">Loading occasions...</span>
        </div>
      </div>

      <div v-else-if="occasions.length === 0" class="text-center py-8">
        <p class="text-gray-500">No occasions found. Add your first one above!</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <OccasionCard
          v-for="occasion in occasions"
          :key="occasion.id"
          :occasion="occasion"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- Edit Modal (placeholder for now) -->
    <div v-if="editingOccasion" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-medium mb-4">Edit Occasion</h3>
        <p class="text-sm text-gray-600 mb-4">
          Edit functionality coming soon...
        </p>
        <button
          @click="editingOccasion = null"
          class="btn btn-secondary"
        >
          Close
        </button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import type { Occasion } from '~/types'

// Protect this route
definePageMeta({
  middleware: 'auth'
})

const { listOccasions, deleteOccasion, searchOccasions } = useOccasions()

const occasions = ref<Occasion[]>([])
const loading = ref(true)
const editingOccasion = ref<Occasion | null>(null)
const currentFilters = ref({
  search: '',
  occasion_type: '',
  upcoming_only: false
})

// Load occasions on mount
const loadOccasions = async () => {
  loading.value = true
  try {
    if (currentFilters.value.search) {
      // Use search endpoint
      occasions.value = await searchOccasions(currentFilters.value.search)
    } else {
      // Use list with filters
      occasions.value = await listOccasions({
        person: currentFilters.value.search,
        occasion_type: currentFilters.value.occasion_type || undefined,
        upcoming_only: currentFilters.value.upcoming_only
      })
    }
  } catch (error) {
    console.error('Failed to load occasions:', error)
  } finally {
    loading.value = false
  }
}

// Handle filter changes
const handleFilterChange = async (filters: any) => {
  currentFilters.value = filters
  await loadOccasions()
}

// Handle occasion created
const handleOccasionCreated = async (occasion: Occasion) => {
  await loadOccasions()
}

// Handle edit
const handleEdit = (occasion: Occasion) => {
  editingOccasion.value = occasion
  // TODO: Implement edit modal
}

// Handle delete
const handleDelete = async (id: number) => {
  try {
    await deleteOccasion(id)
    await loadOccasions()
  } catch (error) {
    console.error('Failed to delete occasion:', error)
  }
}

// Load on mount
onMounted(() => {
  loadOccasions()
})
</script>
```

---