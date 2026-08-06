import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import store from './store'
import messages from './locales'
import './assets/styles/genie-theme.css'
import './assets/styles/animations.css'

const i18n = createI18n({
    locale: localStorage.getItem('lang') || 'en',
    fallbackLocale: 'en',
    legacy: false,
    messages
})

createApp(App).use(i18n).use(store).use(router).mount('#app')