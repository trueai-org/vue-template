import { createApp } from 'vue'
// @option:css.unocss
import '@unocss/reset/tailwind-v4.css'
// @end
import './style.css'
import App from './App.vue'
import router from './router'
import pinia from './stores'
// @option:css.unocss
import 'virtual:uno.css'
// @end

createApp(App).use(pinia).use(router).mount('#app')
