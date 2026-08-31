import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import store from './store'
import messages from './locales'
import './assets/styles/genie-theme.css'
import { applyDisplayPrefs } from './utils/displayPrefs'
import './assets/styles/animations.css'

// The app persists the chosen language as 'jinni_language' (and inside
// 'jinni_settings') — read those so views outside JinniChat mount in the
// right language, with the legacy 'lang' key as a fallback.
function savedLocale() {
    try {
        const s = JSON.parse(localStorage.getItem('jinni_settings') || '{}');
        if (s.language) return s.language;
    } catch (e) { /* ignore corrupt settings */ }
    return localStorage.getItem('jinni_language') || localStorage.getItem('lang') || 'en';
}

const i18n = createI18n({
    locale: savedLocale(),
    fallbackLocale: 'en',
    legacy: false,
    globalInjection: true,
    messages
})

applyDisplayPrefs()   // font style + text size, before first paint
createApp(App).use(i18n).use(store).use(router).mount('#app')