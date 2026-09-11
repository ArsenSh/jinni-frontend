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

// The only right-to-left locale Jinni ships. Add to this set, not to a
// condition scattered through a view.
const RTL_LOCALES = new Set(['ar'])

const i18n = createI18n({
    locale: savedLocale(),
    fallbackLocale: 'en',
    legacy: false,
    globalInjection: true,
    messages
})

// <html lang> must state the language actually rendered: index.html ships
// lang="en" statically, so every non-English visitor was served English-tagged
// markup — wrong for search engines, screen readers and Safari's translation
// prompt. Kept in sync on every language change (see the watcher in App.vue).
document.documentElement.setAttribute('lang', i18n.global.locale.value || 'en')
// <html dir> belongs next to <html lang>, and for the same reason: it has to
// describe what is actually rendered. It used to be set only inside JinniChat,
// so an Arabic visitor who never opened the chat got Arabic copy laid out
// left-to-right — correct words, wrong page. Setting it here covers every
// route at once, including the two landing pages, and survives the reload that
// changeLanguage performs.
document.documentElement.setAttribute('dir', RTL_LOCALES.has(i18n.global.locale.value) ? 'rtl' : 'ltr')

applyDisplayPrefs()   // font style + text size, before first paint
createApp(App).use(i18n).use(store).use(router).mount('#app')