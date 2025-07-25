
### Phase 3: Frontend Setup (Day 3)

#### 3.1 Configure Nuxt (frontend/nuxt.config.ts)
```typescript
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:8001'
    }
  },

  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:8001/api',
        changeOrigin: true
      }
    }
  },

  ssr: false, // SPA mode for simplicity
  
  typescript: {
    strict: true
  }
})
```

#### 3.2 Create Tailwind CSS config
```css
/* frontend/assets/css/main.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200;
  }
  
  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400;
  }
  
  .btn-danger {
    @apply bg-red-600 text-white hover:bg-red-700 active:bg-red-800;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow;
  }
  
  .input {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  }
  
  .label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }
}
```

#### 3.3 Create TypeScript types (types/index.ts)
```typescript
// User types
export interface User {
  id: number
  email: string
  full_name: string
  created_at: string
}

export interface AuthToken {
  access_token: string
  token_type: string
  user: User
}

// Occasion types
export type OccasionStatus = 'active' | 'completed' | 'dismissed'

export interface Occasion {
  id: number
  owner_id: number
  person: string
  occasion_type: string
  occasion_date: string
  relationship?: string
  notes?: string
  status: OccasionStatus
  confidence_score?: number
  days_until: number
  is_upcoming: boolean
  created_at: string
  updated_at: string
}

export interface OccasionCreate {
  raw_input: string
}

export interface OccasionExtracted {
  person: string
  occasion_type: string
  occasion_date: string
  relationship?: string
  notes?: string
  confidence_score: number
  raw_input: string
}

export interface OccasionUpdate {
  person?: string
  occasion_type?: string
  occasion_date?: string
  relationship?: string
  notes?: string
  status?: OccasionStatus
}

// API types
export interface ApiError {
  detail: string
}

export interface PaginationParams {
  skip?: number
  limit?: number
}

export interface OccasionFilters extends PaginationParams {
  person?: string
  occasion_type?: string
  upcoming_only?: boolean
}
```

#### 3.4 Create API composable (composables/useApi.ts)
```typescript
import type { $Fetch } from 'ofetch'

export const useApi = () => {
  const config = useRuntimeConfig()
  
  // Create a custom $fetch instance with auth headers
  const api: $Fetch = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ request, options }) {
      // Add auth header if token exists
      const token = useCookie('auth-token').value
      if (token) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        }
      }
    },
    onResponseError({ response }) {
      // Handle 401 errors
      if (response.status === 401) {
        // Clear auth and redirect to login
        const authStore = useAuthStore()
        authStore.logout()
        navigateTo('/login')
      }
    }
  })

  return { api }
}
```

#### 3.5 Create Auth store (stores/auth.ts)
```typescript
import { defineStore } from 'pinia'
import type { User, AuthToken } from '~/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isAuthenticated: false
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated
  },

  actions: {
    async login(email: string, fullName: string) {
      const { api } = useApi()
      
      try {
        // For development, use test login
        const response = await api<AuthToken>('/api/auth/login/test', {
          method: 'POST',
          body: {
            email,
            full_name: fullName,
            provider: 'test'
          }
        })

        // Store token and user
        this.token = response.access_token
        this.user = response.user
        this.isAuthenticated = true

        // Save token to cookie
        const tokenCookie = useCookie('auth-token', {
          httpOnly: false,
          secure: false, // Set to true in production
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 // 24 hours
        })
        tokenCookie.value = response.access_token

        return response
      } catch (error) {
        throw error
      }
    },

    async fetchCurrentUser() {
      const { api } = useApi()
      
      try {
        const user = await api<User>('/api/auth/me')
        this.user = user
        this.isAuthenticated = true
        return user
      } catch (error) {
        this.logout()
        throw error
      }
    },

    logout() {
      // Clear state
      this.user = null
      this.token = null
      this.isAuthenticated = false

      // Clear cookie
      const tokenCookie = useCookie('auth-token')
      tokenCookie.value = null

      // Redirect to login
      navigateTo('/login')
    },

    async initAuth() {
      // Check for existing token
      const tokenCookie = useCookie('auth-token')
      if (tokenCookie.value) {
        this.token = tokenCookie.value
        try {
          await this.fetchCurrentUser()
        } catch {
          // Token invalid, clear it
          this.logout()
        }
      }
    }
  }
})
```

#### 3.6 Create Auth middleware (middleware/auth.ts)
```typescript
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // Protected routes that require authentication
  const protectedRoutes = ['/app']
  
  if (protectedRoutes.includes(to.path) && !authStore.isLoggedIn) {
    return navigateTo('/login')
  }
})
```

#### 3.7 Create app.vue
```vue
<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// Initialize auth on app mount
const authStore = useAuthStore()

onMounted(async () => {
  await authStore.initAuth()
})
</script>
```

---