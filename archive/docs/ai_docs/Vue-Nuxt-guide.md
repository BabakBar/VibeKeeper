# Vue 3 / Nuxt 3 Guide for Personal Occasion/birthday Tracker App

* The latest Vue.js and Nuxt 3 features, best practices, and ecosystem tools
* API integration strategies between Nuxt and FastAPI
* Authentication approaches (OAuth, JWT) for web and mobile
* UI/UX design patterns for productivity apps
* PWA support and push notifications
* Design token synchronization between SwiftUI and Vue/Nuxt
* Recommended AI tools for voice/text/image capture and entity extraction
* Component libraries (Vuetify, TailwindCSS) and integration advice
* Accessibility and internationalization practices
* Related open-source projects or templates for inspiration

In case of any issues or questions, please refer to the official documentation of Vue 3, Nuxt 3, and FastAPI using web search or the respective GitHub repositories.

# 1. Vue 3 / Nuxt 3 (v3) Fundamentals

Modern Nuxt 3 is built on Vue 3 and includes all Vue 3 features: the Composition API (`<script setup>`), reactivity (`ref`, `reactive`, `computed`), and new component features.  Use **file-based routing**: pages and layouts in the `pages/` directory automatically become routes (e.g. `pages/users/[id].vue` yields `/users/123`).  In templates, employ `<script setup>` to leverage Composition API patterns, Pinia for state management, and scoped CSS modules or global CSS via Nuxt’s CSS config.

For fetching data, use Nuxt’s composables.  **`useFetch`** and **`useAsyncData`** are built-in utilities for SSR-friendly data fetching.  For example:

```js
<script setup>
const { data: user, error } = await useAsyncData(`user:${id}`, () => $fetch(`/api/users/${id}`))
</script>
```

Nuxt automatically forwards server-fetched data to the client to avoid double-fetching.  `useFetch(url)` is shorthand for `useAsyncData(url, () => $fetch(url))`.  Use **`useFetch`** when fetching external APIs with automatic keying by URL, or **`useAsyncData`** for more control (e.g. custom keys, multiple requests).  Pass `{ headers: useRequestHeaders(['cookie']) }` if you need to forward cookies/JWT from the browser to your backend.

To optimize performance, take advantage of Nuxt features: static site generation or full SSR, automatic code-splitting, and lazy-loading components. Use Nuxt’s `<Suspense>` component and `<NuxtLink>` prefetching.  Minimize bundle size by only importing needed component libraries.  Configure [Nitro server](https://nuxt.com/docs/getting-started/performance) and cache API responses as appropriate.  Follow official Nuxt docs and tips (e.g. [Data Fetching guide](https://nuxt.com/docs/getting-started/data-fetching) and [Routing guide](https://nuxt.com/docs/getting-started/routing)) for up-to-date best practices.

# 2. Nuxt–FastAPI Integration

**Architecture:** Treat Nuxt 3 as a separate frontend and FastAPI as an API server.  In Nuxt, configure proxy or rewrites so that calls to `/api/...` go to FastAPI (e.g. on development, set `server.proxy` or Vite’s rewrite; on deployment use path rewriting).  For example, the [TutorFx/nuxtjs-fastapi](https://github.com/tutorfx/nuxtjs-fastapi) boilerplate rewrites `^/api/(.*)$` to the FastAPI server (running on `localhost:8000`).  In production (e.g. Vercel or Docker), you can host FastAPI as a separate service or serverless function; Nuxt’s Nitro server can proxy to it via a rewrite rule.

**API Design:** Use RESTful endpoints in FastAPI (or GraphQL if preferred).  Define clear resources (e.g. `/recipients`, `/gifts`, `/events`).  Use Pydantic models for request/response validation.  Employ versioning (e.g. `/api/v1/`).  For example, FastAPI code might look like:

```python
@app.get("/api/recipients/{recipient_id}", response_model=Recipient)
async def get_recipient(recipient_id: int):
    # fetch from DB
    return recipient
```

In Nuxt, call these with `$fetch` or `useFetch`/`useAsyncData`.  For instance:

```js
const { data: events } = await useFetch('/api/events/upcoming')
```

Nuxt will handle SSR or CSR as needed.  To pass authentication tokens or cookies, use Nuxt’s `useRequestFetch` or `useRequestHeaders`.  E.g. in a server-side call, forward the cookie:

```js
const headers = useRequestHeaders(['cookie'])
const user = await $fetch('/api/me', { headers })  // fastapi reads cookie
```

FastAPI can access the cookie via `request.cookies`.

**CORS:** If Nuxt and FastAPI are on different origins (e.g. frontend at `example.com` and API at `api.example.com`), enable CORS in FastAPI.  Use FastAPI’s `CORSMiddleware`:

```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

This aligns origins, methods, and credentials (cookies).  FastAPI’s docs explain this setup in detail.  Make sure `allow_credentials` is true if you send cookies/JWT.

**Async Communication:** Both Nuxt’s `$fetch` and FastAPI’s endpoints are async-friendly.  FastAPI endpoints can be `async def`.  In Nuxt, you can trigger multiple fetches concurrently (e.g. `await Promise.all([fetchA(), fetchB()])`) inside `useAsyncData`.  Leverage this for parallel API calls.  On the backend, use async DB libraries (like databases or ORM with async support) and any async I/O.  For background tasks (e.g. sending emails, scheduling reminders), use FastAPI’s `BackgroundTasks` or a Celery worker.

# 3. Authentication Strategies (Web/Mobile)

For this app, we want to only use the 3rd party logins like google and apple id.

🔐 **Authentication Overview**

Clients (web/PWA, iOS) will sign in via Google or Apple.
The Nuxt frontend handles the OAuth flow, obtains an ID token, and passes it to FastAPI.
FastAPI verifies the ID token, optionally creates/updates a user record, issues a backend JWT or session cookie.
All downstream API calls (reminders, gift data) are authenticated via this FastAPI-issued session token.

* **JWT (JSON Web Tokens):** Issue a signed JWT on login; store it as an **HTTP-only cookie** for web SSR, or in secure storage for mobile apps. FastAPI’s [OAuth2PasswordBearer](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/) (password grant) can generate JWTs using PyJWT. These tokens carry user ID and expiry.  Example: `access_token = jwt.encode({"sub": user_id, "exp": ...}, SECRET_KEY)`.  On each request, FastAPI’s dependency (e.g. `oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")`) decodes the JWT and authenticates the user.  Since JWTs are stateless, you don’t need server sessions, but be mindful to **expire/refresh** tokens. FastAPI docs show how signing and checking tokens works.

* **OAuth2 / Third-Party:** Support logging in via Google/Apple (OAuth2) if needed. Use something like FastAPI-Users library or Authlib to handle OAuth flows, exchanging codes for tokens.  Mobile clients can use standard OAuth2 PKCE.  On web, the backend can handle redirect flows.

* **Cookie vs Header:** For web with SSR, use Secure, HttpOnly cookies (SameSite=strict/lax) to store JWT or session ID. Nuxt will send them automatically. For mobile or API-only clients, send JWT in `Authorization: Bearer <token>` header.  FastAPI can accept either; ensure CORS allows credentials if using cookies.  If using headers, Nuxt calls can include `headers: { Authorization: Bearer ${token} }`.

* **Refresh tokens:** Optionally implement refresh tokens in an HttpOnly cookie to renew JWTs without forcing login.

In all cases, protect APIs with dependencies that verify tokens (e.g. FastAPI’s `Depends(oauth2_scheme)`).  For example:

```python
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(403, "Invalid token")
    return get_user(user_id)
```

This pattern (OAuth2 with Bearer JWT) is illustrated in the FastAPI tutorial.

# 4. UI/UX Patterns for Productivity & Reminders

Design the UI for **ease of quick capture and recall**:

* **Quick Add:** Provide a prominent “Add Gift/Reminder” button (e.g. a FAB or header action). Support immediate input via text, voice, or image. For voice, include a mic icon that starts recording; for image, a camera icon to snap a photo. Clear labels like “New Gift Idea” or “Add Reminder” reduce friction.

* **Minimal Input Forms:** On the capture screen, use minimal fields with sensible defaults. For example, an “Add Item” form might auto-fill today’s date and allow free-text description. Use dropdowns or autocomplete for existing recipients/occasions (birthday, anniversary, etc.).

* **Natural Language Processing:** If using AI, allow free-form input (“Gift: organic coffee for Alice’s birthday next month”) and parse it. But still show structured fields after parsing (recipient, occasion, tags, budget). The AI-extracted fields can be confirmed by the user.

* **Organization Views:** Offer a calendar or list view of upcoming dates (birthdays, anniversaries) and associated gift ideas. For example, a timeline/calendar showing upcoming events, with quick “Remind me” toggles. A dashboard at login could show “Upcoming: Bob’s birthday in 3 days – pending gifts?

* **Reminders & Notifications:** Let users set reminders per item (e.g. 1 week before event). Visually highlight overdue or upcoming tasks (e.g. color-coding soon dates in red). Provide notification settings in-app.

* **User-friendly Interactions:** Use native-like interactions (swipe to delete on mobile, drag-and-drop to reorder, long-press for actions). Provide confirmations (snackbars/toasts) on actions like “Gift saved!” or “Reminder set”.

* **Consistency:** Use consistent icons (calendar for dates, gift icon for ideas), fonts, and color schemes. See apps like *Todoist* or *Monica CRM* (which tracks gifts and birthdays) for inspiration on clean, uncluttered layouts.  Monica’s open-source UI lists “Reminders” and “Gift ideas or gifts you’ve made” as core features, highlighting these should be front-and-center.

* **Multi-modal Input:** On mobile, integrate device capabilities: camera permission to OCR gift descriptions or images of items, microphone for voice entry (see §8 AI tools). Immediately transcribe and parse these inputs into the form.

# 5. Nuxt 3 Progressive Web App (PWA) Support

Turn the web app into a PWA for installability and offline use:

* **Nuxt PWA Module:** Use the official [`@vite-pwa/nuxt`](https://nuxt.com/modules/vite-pwa-nuxt) module.  Install with:

```bash
npx nuxi@latest module add @vite-pwa/nuxt
```

and add to `nuxt.config.ts`:

```js
export default defineNuxtConfig({
  modules: ['@vite-pwa/nuxt'],
  pwa: {
    manifest: { name: 'Gift Tracker', short_name: 'Gifts', /* ... */ },
    workbox: { /* caching strategies */ }
  }
})
```

This auto-generates `manifest.json` and sets up a service worker for offline support.

* **Offline Caching:** Configure Workbox strategies for caching static assets and dynamic data. For example, use “NetworkFirst” for API calls (fallback to cache) and “StaleWhileRevalidate” for images. Precache critical pages (e.g. home, events list) so the app shell loads offline.  Note: completely offline personal data (like gifts) requires storing them locally (IndexedDB or local storage). You could combine PWA with local storage for entries created offline, then sync to backend when online.

* **Manifest & Icons:** Define app name, icons, theme colors in `manifest.json`. The PWA module can auto-generate icons from a source image. Ensure proper mobile viewport `<meta>` tags.

* **Deployment:** Host on HTTPS (PWAs require secure context). If using Nuxt’s Nitro/serverless build, any static hosting (Vercel, Netlify, AWS S3 + CloudFront) works. Ensure the service worker is registered (the module does this). After building, test with:

```bash
nr dev:preview:generate
```

as documented.

* **Add-to-Home-Screen:** The PWA will prompt (or allow manual install) on supported devices. Customize the install prompt message if needed.

# 6. Notifications & Scheduling

Implement push notifications and reminders:

* **Web Notifications API:** Use the [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API) to show local alerts.  First, request permission on a user gesture (MDN warns against unsolicited prompts).  Once granted, the service worker can show notifications even when the app is closed. For example:

```js
Notification.requestPermission().then(status => {
  if (status === 'granted') {
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification("Gift Reminder", { body: "Bob's birthday is tomorrow!" });
    });
  }
});
```

The MDN docs note that the API works in a secure context and can display system-level notifications even when the app is idle.

* **Push API & Service Worker:** For server-scheduled pushes, use the [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API). On login, subscribe the user’s browser via `serviceWorkerRegistration.pushManager.subscribe()`, obtaining an endpoint and keys.  Store this on your backend. Use a push service (e.g. WebPush libraries, Firebase Cloud Messaging, or OneSignal) to send messages at scheduled times. The Push API allows messages from your server to reach the client even if the app isn’t open. In your service worker:

```js
self.addEventListener('push', event => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, { body: data.body })
  );
});
```

As MDN explains, the service worker will wake on push events and show notifications.

* **Scheduling Reminders:** Browsers don’t have a reliable local “schedule this notification at X time” yet (the proposed Notification Triggers API is experimental). Instead, schedule reminders on the server.  For example, when a user sets a reminder (e.g. 3 days before a birthday), store that timestamp in the database. Have a background task (Celery, cron, or FastAPI BackgroundTasks) that checks due reminders and uses the Push API to notify each user’s subscribed browser or mobile client.  For mobile, you can also use native local notifications via SwiftUI’s `UNUserNotificationCenter`.

* **Fallbacks:** If push isn’t supported, fall back to in-app reminders (e.g. alerts on app open). Always let users opt in/out of notifications.

# 7. Shared Design Tokens & Theming (Web + SwiftUI)

To maintain a consistent look between the Vue/Nuxt web app and a SwiftUI iOS client, share a **design token system**:

* **Design Tokens:** Define colors, typography, spacing, etc. as tokens (in JSON/YAML). For example:

```json
{
  "color": {
    "primary": { "value": "#4A90E2" },
    "secondary": { "value": "#F5A623" }
  },
  "font": {
    "baseSize": { "value": "16px" },
    "large": { "value": "24px" }
  }
}
```

* **Style Dictionary:** Use a tool like [Amazon Style Dictionary](https://amzn.github.io/style-dictionary/) to compile these tokens into platform-specific outputs.  For instance, generate a Swift file (`.swift`) with `UIColor` or `Color` constants, and generate a CSS/JS file or Tailwind config for the web.  As one guide notes, *“Style Dictionary takes these tokens and processes them using transformers to generate different output files specific to a platform”*.

* **Example (SwiftUI):** A token like `color.base.gray.dark = #111111` can become `UIColor` in iOS:

```swift
internal static let colorBaseGrayDark = UIColor(red: 0.067, green: 0.067, blue: 0.067, alpha: 1.000)
```

(See how Style Dictionary generated `StyleDictionaryStruct` in Swift in [27†L94-L103].)

* **Example (Web):** Generate a Tailwind theme override or CSS variables. For instance, output a `tailwind.config.js` that uses the same hex values.  Tools exist to convert Style Dictionary tokens into a Tailwind preset.

* **Practical Tip:** Keep the tokens repo separate and versioned. CI can rebuild both the Swift package and the npm package on changes. This ensures iOS and web always use the same palette, spacings, etc.

# 8. AI Tool Integrations

Enhance the app with AI for parsing and transcription:

* **LiteLLM:** To be able to use all the AI LLMs with ease. Use it for **entity extraction** and natural language understanding. For example, send a gift description or note to a GPT model with a prompt like: *“Extract recipient, occasion, date, tags, budget, and notes from: ‘Gift: Handmade soap for Sarah on 2023-07-15 (Sarah’s birthday), budget $20’.”* The model can return structured JSON.  Use [OpenAI’s API](https://platform.openai.com/docs/guides/gpt) or Azure OpenAI with structured output mode for reliability. GPT-4’s vision model can even **read text in images** or describe images, though for simply extracting printed text an OCR is lighter.

* **Whisper (Speech-to-Text):** For voice input, use [OpenAI’s Whisper](https://github.com/openai/whisper).  It can transcribe audio in many languages.  The Python example shows how simple it is:

```python
import whisper
model = whisper.load_model("small")
result = model.transcribe("voice-note.m4a")
print(result["text"])
```

This library runs locally or on a server (requires >2GB RAM for medium models).  In the FastAPI backend, you could accept audio uploads and process them through Whisper to text, then feed to GPT or parse with regex.

* **OCR (Image-to-Text):** For images (e.g. photo of a gift flyer or handwritten note), use OCR. OpenAI GPT-4o has limited OCR, but better to use specialized tools: Google Cloud Vision API, AWS Textract, or open-source Tesseract (via `pytesseract` in Python).  These convert images to raw text.  You can then pass that text to your extraction pipeline or store it as a note.

* **Other AI:** Consider using an image recognition model (e.g. CLIP or Vision API) to tag photos of potential gifts (e.g. classify an image as “toy” or “jewelry”).  This could auto-assign tags to an “image-based idea”.

* **Integration:** Connect these via REST/HTTP. For example, create FastAPI endpoints `/api/ai/extract` that call OpenAI, and `/api/ai/whisper` that accepts `multipart/form-data` audio files. Secure these endpoints (they could be heavy). Provide loading spinners in UI.

* **Recommendation:** Start with Whisper and a GPT model. Whisper is free/open-source; GPT requires API keys. Ensure user prompts sent to AI are well-formed. Refer to OpenAI docs for [structured outputs](https://platform.openai.com/docs/guides/structured-output) to reliably extract fields.

# 9. UI Component Strategy: Nuxt UI + Selective Vuetify

🛠 **Nuxt UI (v3)**

What is it?

Nuxt UI is Nuxt’s official component library built on Vue 3, Tailwind CSS v4, and Reka UI—offering ~55 accessible, type-safe primitives like buttons, forms, modals, toasts, and timelines.

**Strengths**

* Lightweight and modern—bundles only used components, optimized by Tailwind v4.
* Full accessibility support and ARIA baked in.
* Powerful theming via CSS-first @theme in main.css and optional overrides in app.config.ts.
* Excellent developer experience: auto-import, type safety, and dynamic dark/light mode support.

**Trade-offs**

* Rich enough for most use cases, but lacks a few specialized components (like advanced date pickers or data tables).

📦 **Selective Vuetify Components**

What is it?

Vuetify v3 is a comprehensive Material Design component library with full support in Nuxt via vuetify-nuxt-module. It includes advanced UI controls like date pickers, data tables, pickers, calendars.

**Strengths**

* Feature-rich and mature: many pre-built components.
* Tight integration with Material UI, great for rapid prototyping in web contexts.

**Trade-offs**

* Opinionated Material look can reduce design flexibility.
* Larger bundle size, though tree-shakable.
* Requires wrapping your app in `<v-app>` and using its grid, theming, styles.

✅ **Recommended Hybrid Approach**

Use Nuxt UI for most core UI elements (buttons, forms, modals, toast, timelines)—giving your app a sleek, brand-aligned, accessible, and performant foundation.

Add Vuetify only where you need functionality not present in Nuxt UI, such as:

* `<v-date-picker>` for selecting occasion/event dates.
* `<v-data-table>` for detailed gift history views or budgets.
* Potentially `<v-calendar>` for calendar-style overview of events.

Wrap these in a custom Nuxt plugin to import only the necessary Vuetify components.

---

### 🔧 Setup Example

**Nuxt UI Configuration:**

Install:

```bash
npm install @nuxt/ui @nuxtjs/tailwindcss @nuxtjs/color-mode
```

Configure in `nuxt.config.ts`, include Tailwind and theming:

```ts
modules: ['@nuxt/ui', '@nuxtjs/tailwindcss', '@nuxtjs/color-mode'],
css: ['~/assets/css/main.css'],
```

In `main.css`, set design tokens:

```css
@import "tailwindcss" theme(static);
@import "@nuxt/ui";

@theme {
  --color-primary-500: #4A90E2;
  --font-sans: 'Inter', sans-serif;
}
```

**Selective Vuetify Integration:**

Install module:

```bash
npx nuxi@latest module add vuetify-nuxt-module
```

Add to config:

```ts
modules: ['vuetify-nuxt-module'],
vuetify: {
  vuetifyOptions: { theme: { defaultTheme: 'light' } }
}
```

In your page/component, import required component:

```vue
<template>
  <UButton @click="show = true">Pick Date</UButton>
  <v-dialog v-model="show">
    <v-date-picker v-model="selectedDate" />
  </v-dialog>
</template>
```

This way, Material components are scoped to where they're needed.

---

👁‍🗨 **Why This Works for You**

* **Balanced UX:** Nuxt UI ensures a clean, accessible, customizable core, aligned with your branding and design tokens.
* **Full functionality:** Vuetify fills gaps where complex components are needed, without overwhelming your app with Material styling everywhere.
* **Performance:** Tailored bundle size via tree-shaking and component-level imports.
* **Consistency:** Shared theming across Nuxt UI and Vuetify via your CSS tokens.

# 10. Accessibility & Internationalization

* **Accessibility (a11y):** Follow WCAG 2.1 guidelines: make the app perceivable, operable, understandable, and robust. Use semantic HTML (`<header>`, `<main>`, `<button>`). Provide `alt` text for images (especially gift photos). Use ARIA labels for interactive icons (e.g. `<button aria-label="Add gift">`). Ensure color contrast (e.g. light text on dark background). Test with screen readers (NVDA, VoiceOver) and keyboard-only navigation (Tab order).  In Vue components, bind `:aria-label`, `aria-describedby`, and use `<label>` with form inputs. Avoid dynamic content changes without notifying (use `aria-live`). The Vue accessibility guide notes using `aria-hidden` to hide decorative elements. Also, Nuxt generates SEO-friendly tags; use `<nuxt-head>` to add meta tags.

  Use automated tools (Lighthouse, AXE) and manual testing. The [Vue best practices on accessibility](https://vuejs.org/guide/best-practices/accessibility.html) and WAI-ARIA practices are good references. Remember that accessible design often improves UX for all.

* **Internationalization (i18n):** Use the [`@nuxtjs/i18n`](https://i18n.nuxtjs.org/) module for multilingual support. Install with:

```bash
npx nuxi@latest module add i18n
```

Configure in `nuxt.config.ts`:

```js
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'en', language: 'en-US' },
      { code: 'fr', language: 'fr-FR' }
    ],
    defaultLocale: 'en',
    lazy: true,
    langDir: 'lang/'
  }
})
```

Then create translation files (`lang/en.js`, `lang/fr.js`) exporting strings. The module auto-generates localized routes (e.g. `/fr/`). For dynamic text (like gift descriptions), use ICU formatting or key-based messages. Ensure date formatting (use Intl API or Vue I18n) and currency symbols (for budgets) adapt to locale.

Also, design UI with ample space for text expansion (German or French text is often longer than English). Test RTL languages if needed. The i18n module handles SEO tags translation and route aliases.

# 11. Example Open-Source Projects & Templates

* **Monica CRM:** An open-source *personal CRM* (PHP backend, Vue frontend) that manages contacts, birthdays, and gifts. It includes features like “Reminders about important dates” and “Gift ideas or gifts you’ve made”. Studying Monica’s UI/UX can inspire your own (e.g. how it lists upcoming birthdays, logs gifts, and sends reminders).

* **Gnothi:** An AI-powered journaling app (Nuxt + AWS) focusing on self-discovery. It uses AI to identify themes and suggests resources from user journal entries. While its domain is different, it’s a similar stack (Vue/Nuxt frontend + Python backend + AI). Its open repo (ocdevel/gnothi) illustrates using AI and could be a reference for structured data extraction and UI.

* **Nuxt + FastAPI Starters:**
  * [TutorFx/nuxtjs-fastapi](https://github.com/tutorfx/nuxtjs-fastapi) – a simple Nuxt.js boilerplate with FastAPI backend. It shows how to configure rewrites so `nuxt` proxies `/api` to FastAPI.
  * [fastapi-fullstack](https://github.com/tiangolo/full-stack-fastapi-postgresql) – (by Tiangolo) although this uses Vue 2, it’s a full-stack template with best practices (Docker, migrations, tests).
  * [testdriven.io’s Tutorial](https://testdriven.io/blog/full-stack-fastapi-nuxt/) – guides on creating a CRUD app with FastAPI, Nuxt, and Tailwind.

* **Gift & Wish-list Apps:**
  * *GiveSpace* by CakeCrusher – an open Android wish-list app (GitHub).
  * *TimeBorn* – a GitHub birthday tracker (Vue.js frontend).

* **UI Libraries / Themes:** Look at example Nuxt 3 starter kits: [*Nuxt 3 Template*](https://github.com/nuxt/starter) with Tailwind, or theme pack demos from Vuetify.

These examples provide code patterns and design ideas. Cloning a boilerplate (e.g. `npx create-nuxt-app --example nuxtjs-fastapi`) can jumpstart your project.

**Sources:** Official docs (Nuxt, FastAPI, MDN) and relevant examples were used above. These include up-to-date guidance on all topics.
