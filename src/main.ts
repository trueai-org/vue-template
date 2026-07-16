import { createApp } from 'vue'
import '@unocss/reset/tailwind-v4.css'
import './style.css'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import 'virtual:uno.css'

createApp(App).use(pinia).use(router).mount('#app')
