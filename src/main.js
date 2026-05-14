import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'
import router from './router'
import App from './App.vue'
import './assets/main.css'

// Dark mode is toggled per-route via the router guard in router/index.js

const TradingPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#e0fff8',
      100: '#aafded',
      200: '#6af9dc',
      300: '#25f0ca',
      400: '#00e0b5',
      500: '#00c9a0',
      600: '#00b388',
      700: '#009872',
      800: '#007d5c',
      900: '#006048',
      950: '#003d2e',
    },
    colorScheme: {
      dark: {
        surface: {
          0:   '#ffffff',
          50:  '#f0f4ff',
          100: '#c8d4e8',
          200: '#9aaac4',
          300: '#6b7a9a',
          400: '#4a556a',
          500: '#2a3550',
          600: '#1e293b',
          700: '#182030',
          800: '#121a28',
          900: '#0e1520',
          950: '#090d18',
        },
      },
    },
  },
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: TradingPreset,
    options: {
      darkModeSelector: '.dark',
      cssLayer: false,
    },
  },
})
app.use(ToastService)
app.mount('#app')
