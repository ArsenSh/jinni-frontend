<template>
  <div class="legal-page" :class="currentTheme">
    <DesertSky v-if="currentTheme === 'day-mode'" />
    <header class="legal-header">
      <div class="header-top" style="justify-content:center">
        <button @click="goBack" class="back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="currentTheme === 'night-mode' ? '#c084fc' : '#8B4513'" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {{ $t('legal.back_to_home') }}
        </button>
      </div>
      <div class="header-content">
        <h1 class="page-title">{{ $t('terms.title') }}</h1>
        <p class="page-subtitle">{{ $t('terms.last_updated') }}</p>
        <div class="lang-selector">
          <div v-if="langOpen" class="lang-backdrop" @click="langOpen = false"></div>
          <button class="lang-trigger" @click="langOpen = !langOpen">
            {{ currentLangLabel }}
          </button>
          <div class="lang-dropdown" v-if="langOpen"
            :style="{ background: currentTheme === 'night-mode' ? '#1e1438' : '#fff8f0' }">
            <button
              v-for="lang in languages"
              :key="lang.code"
              class="lang-option"
              :class="{ active: $i18n.locale === lang.code }"
              :style="$i18n.locale === lang.code
                ? { background: currentTheme === 'night-mode' ? '#2a1550' : '#ffe4c4', color: currentTheme === 'night-mode' ? '#c084fc' : '#A0522D' }
                : { background: currentTheme === 'night-mode' ? '#1e1438' : '#fff8f0', color: currentTheme === 'night-mode' ? '#e2e8f0' : '#3c2a1e' }"
              @click="selectLang(lang.code)"
            >{{ lang.label }}</button>
          </div>
        </div>
      </div>
    </header>

    <main class="legal-main">
      <div class="legal-container">
        <div class="legal-content">
          <!-- Acceptance of Terms -->
          <section class="legal-section">
            <h2>{{ $t('terms.sections.acceptance.title') }}</h2>
            <p>{{ $t('terms.sections.acceptance.content') }}</p>
          </section>
          <!-- Service Description -->
          <section class="legal-section">
            <h2>{{ $t('terms.sections.description.title') }}</h2>
            <p>{{ $t('terms.sections.description.content') }}</p>
          </section>
          <!-- Account Registration -->
          <section class="legal-section">
            <h2>{{ $t('terms.sections.account.title') }}</h2>
            <p>{{ $t('terms.sections.account.content') }}</p>
            <ul class="legal-list">
              <li v-for="(point, index) in $tm('terms.sections.account.points')" :key="index">{{ point }}</li>
            </ul>
          </section>
          <!-- Acceptable Use -->
          <section class="legal-section">
            <h2>{{ $t('terms.sections.use.title') }}</h2>
            <p>{{ $t('terms.sections.use.content') }}</p>
            <div class="subsection">
              <h3>{{ $t('terms.sections.use.subsections.permitted.title') }}</h3>
              <ul class="legal-list">
                <li v-for="(point, index) in $tm('terms.sections.use.subsections.permitted.points')" :key="index">{{ point }}</li>
              </ul>
            </div>
            <div class="subsection">
              <h3>{{ $t('terms.sections.use.subsections.prohibited.title') }}</h3>
              <ul class="legal-list">
                <li v-for="(point, index) in $tm('terms.sections.use.subsections.prohibited.points')" :key="index">{{ point }}</li>
              </ul>
            </div>
          </section>
          <!-- User Content -->
          <section class="legal-section">
            <h2>{{ $t('terms.sections.content.title') }}</h2>
            <p>{{ $t('terms.sections.content.content') }}</p>
          </section>
          <!-- AI-Generated Recommendations -->
          <section class="legal-section">
            <h2>{{ $t('terms.sections.ai.title') }}</h2>
            <p>{{ $t('terms.sections.ai.content') }}</p>
          </section>
          <!-- Premium Services -->
          <section class="legal-section">
            <h2>{{ $t('terms.sections.premium.title') }}</h2>
            <p>{{ $t('terms.sections.premium.content') }}</p>
            <div class="subsection">
              <h3>{{ $t('terms.sections.premium.subsections.billing.title') }}</h3>
              <p>{{ $t('terms.sections.premium.subsections.billing.content') }}</p>
            </div>
            <div class="subsection">
              <h3>{{ $t('terms.sections.premium.subsections.cancellation.title') }}</h3>
              <p>{{ $t('terms.sections.premium.subsections.cancellation.content') }}</p>
            </div>
          </section>
          <!-- Usage Limits -->
          <section class="legal-section">
            <h2>{{ $t('terms.sections.limits.title') }}</h2>
            <p>{{ $t('terms.sections.limits.content') }}</p>
          </section>
          <!-- Intellectual Property -->
          <section class="legal-section">
            <h2>{{ $t('terms.sections.ip.title') }}</h2>
            <p>{{ $t('terms.sections.ip.content') }}</p>
          </section>
          <!-- Privacy -->
          <section class="legal-section">
            <h2>{{ $t('terms.sections.privacy.title') }}</h2>
            <p>{{ $t('terms.sections.privacy.content') }}</p>
          </section>
          <!-- Termination -->
          <section class="legal-section">
            <h2>{{ $t('terms.sections.termination.title') }}</h2>
            <div class="subsection">
              <h3>{{ $t('terms.sections.termination.subsections.by_us.title') }}</h3>
              <p>{{ $t('terms.sections.termination.subsections.by_us.content') }}</p>
            </div>
            <div class="subsection">
              <h3>{{ $t('terms.sections.termination.subsections.by_you.title') }}</h3>
              <p>{{ $t('terms.sections.termination.subsections.by_you.content') }}</p>
            </div>
            <div class="subsection">
              <h3>{{ $t('terms.sections.termination.subsections.effect.title') }}</h3>
              <p>{{ $t('terms.sections.termination.subsections.effect.content') }}</p>
            </div>
          </section>
          <!-- Disclaimer of Warranties -->
          <section class="legal-section">
            <h2>{{ $t('terms.sections.disclaimer.title') }}</h2>
            <p>{{ $t('terms.sections.disclaimer.content') }}</p>
          </section>
          <!-- Limitation of Liability -->
          <section class="legal-section">
            <h2>{{ $t('terms.sections.limitation.title') }}</h2>
            <p>{{ $t('terms.sections.limitation.content') }}</p>
          </section>
          <!-- Governing Law -->
          <section class="legal-section">
            <h2>{{ $t('terms.sections.governing.title') }}</h2>
            <p>{{ $t('terms.sections.governing.content') }}</p>
          </section>
          <!-- Changes to Terms -->
          <section class="legal-section">
            <h2>{{ $t('terms.sections.changes.title') }}</h2>
            <p>{{ $t('terms.sections.changes.content') }}</p>
          </section>
          <!-- Contact -->
          <section class="legal-section">
            <h2>{{ $t('terms.sections.contact.title') }}</h2>
            <p>{{ $t('terms.sections.contact.content') }}</p>
          </section>
        </div>
      </div>
    </main>

    <footer class="legal-footer">
      <div class="footer-content">
        <div class="footer-logo">
          <span class="logo-text">Jinni</span>
        </div>
        <div class="footer-links">
          <a href="/privacy" class="footer-link">{{ $t('landing.footer.privacy') }}</a>
        </div>
        <p class="copyright">{{ $t('landing.footer.copyright') }}</p>
      </div>
    </footer>
  </div>
</template>




<script>
import { isNightTime } from '@/utils/timeUtils';
import DesertSky from '@/components/ui/DesertSky.vue';
export default {
  name: 'TermsOfService',
  components: { DesertSky },
  data() {
    return {
      langOpen: false,
      languages: [
        { code: 'en', label: 'English' },
        { code: 'fr', label: 'Français' },
        { code: 'ru', label: 'Русский' },
        { code: 'zh', label: '中文' },
        { code: 'ar', label: 'العربية' }
      ]
    }
  },
  mounted() { this.loadLanguage() },
  computed: {
    currentLangLabel() {
      const lang = this.languages.find(l => l.code === this.$i18n.locale)
      return lang ? lang.label : 'English'
    },
    currentTheme() {
      const savedSettings = localStorage.getItem('jinni_settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          if (settings.theme === 'light') return 'day-mode';
          if (settings.theme === 'dark') return 'night-mode';
          return isNightTime() ? 'night-mode' : 'day-mode';
        } catch (error) { console.error('Failed to parse settings:', error) }
      }
      return isNightTime() ? 'night-mode' : 'day-mode';
    }
  },
  methods: {
    goBack() { this.$router.go(-1) },
    closeLangDropdown() { this.langOpen = false },
    selectLang(code) {
      this.$i18n.locale = code
      this.langOpen = false
      try {
        const savedSettings = localStorage.getItem('jinni_settings')
        const settings = savedSettings ? JSON.parse(savedSettings) : {}
        settings.language = code
        localStorage.setItem('jinni_settings', JSON.stringify(settings))
      } catch (error) { console.error('Failed to save language:', error) }
    },
    loadLanguage() {
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        const savedSettings = localStorage.getItem('jinni_settings');
        if (savedSettings) {
          try {
            const settings = JSON.parse(savedSettings);
            if (settings.language && this.$i18n.locale !== settings.language) { this.$i18n.locale = settings.language }
          } catch (error) { console.error('Failed to load language:', error) }
        }
      } else {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0];
        if (['en', 'ru'].includes(langCode) && this.$i18n.locale !== langCode) { this.$i18n.locale = langCode }
      }
    }
  }
}
</script>




<style scoped>
.legal-page{min-height:100vh;transition:background 0.5s ease,color 0.3s ease;font-family:'Segoe UI',system-ui,-apple-system,'Noto Sans Armenian',sans-serif;display:flex;flex-direction:column;position:relative;z-index:1}
.legal-header{display:flex;flex-direction:column;padding:2rem 2rem 0 2rem;max-width:1400px;margin:0 auto;width:100%;position:relative;z-index:10}
.header-top{width:100%;display:flex;justify-content:flex-start}
.back-btn{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;border:none;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s ease;background:transparent}
.header-content{text-align:center;width:100%;margin-top:2rem}
.page-title{font-size:2.5rem;font-weight:700;margin-bottom:0.5rem}
.page-subtitle{font-size:0.95rem;opacity:0.8}
.legal-main{flex:1;max-width:900px;margin:0 auto;padding:1rem 2rem;width:100%;position:relative;z-index:2}
.legal-container{width:100%}
.legal-content{background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);border-radius:16px;padding:2.5rem;box-shadow:0 4px 20px rgba(0,0,0,0.1)}
.legal-section{margin-bottom:2.5rem}
.legal-section:last-child{margin-bottom:0}
.legal-section h2{font-size:1.4rem;font-weight:600;margin-bottom:1rem;line-height:1.4}
.legal-section p{line-height:1.8;margin-bottom:1rem;font-size:1rem}
.legal-section p:last-child{margin-bottom:0}
.subsection{margin-top:1.5rem;padding-left:1rem;border-left:3px solid rgba(139,92,246,0.3)}
.subsection h3{font-size:1.15rem;font-weight:600;margin-bottom:0.75rem}
.subsection p{font-size:0.98rem;line-height:1.7}
.legal-list{margin:1rem 0;padding-left:1.5rem;line-height:1.8}
.legal-list li{margin-bottom:0.75rem;font-size:1rem}
.legal-list li:last-child{margin-bottom:0}
.legal-footer{margin-top:auto;padding:1rem;position:relative;z-index:2}
.footer-content{max-width:1400px;margin:0 auto;text-align:center}
.footer-logo{font-size:1.5rem;font-weight:700;margin-bottom:0.75rem}
.footer-links{display:flex;justify-content:center;gap:2rem;margin-bottom:0.5rem;flex-wrap:wrap}
.footer-link{text-decoration:none;font-weight:500;transition:all 0.3s}
.copyright{font-size:0.9rem;opacity:0.8}
.lang-selector{position:relative;display:inline-flex;justify-content:center;margin-top:0.6rem}
.lang-backdrop{position:fixed;inset:0;z-index:9998}
.lang-trigger{display:inline-flex;align-items:center;gap:5px;background:transparent;border:none;cursor:pointer;font-size:0.85rem;font-weight:500;padding:4px 8px;border-radius:6px;text-decoration:underline;text-underline-offset:3px}
.lang-trigger:hover{opacity:0.75}
.lang-dropdown{position:absolute;top:calc(100% + 6px);left:50%;transform:translateX(-50%);min-width:150px;border-radius:10px;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,0.25);z-index:9999;display:flex;flex-direction:column}
.lang-option{padding:10px 18px;font-size:0.9rem;font-weight:500;cursor:pointer;border:none;text-align:left;transition:background 0.15s,color 0.15s;width:100%;opacity:1 !important;pointer-events:all !important}
.night-mode .lang-trigger{color:#c084fc}
.night-mode .lang-dropdown{background:#1e1438}
.night-mode .lang-option{background:#1e1438;color:#e2e8f0}
.night-mode .lang-option:hover{background:#2a1550!important;color:#fff}
.night-mode .lang-option.active{color:#c084fc;background:#2a1550;font-weight:600}
.day-mode .lang-trigger{color:#A0522D}
.day-mode .lang-dropdown{background:#fff8f0}
.day-mode .lang-option{background:#fff8f0;color:#3c2a1e}
.day-mode .lang-option:hover{background:#ffe4c4!important;color:#3c2a1e}
.day-mode .lang-option.active{color:#A0522D;background:#ffe4c4;font-weight:600}
.legal-page.night-mode{background:linear-gradient(180deg,#0a0118 0%,#1a0b2e 40%,#16213e 100%);color:#e2e8f0}
.night-mode .back-btn{color:#c084fc;opacity:0.7}
.night-mode .back-btn:hover{background:rgba(139,92,246,0.1);opacity:1}
.night-mode .page-title{color:#c084fc}
.night-mode .page-subtitle{color:#94a3b8}
.night-mode .legal-content{background:rgba(30,20,56,0.6);box-shadow:0 0 10px rgba(139,92,246,0.15)}
.night-mode .legal-section h2{color:#c084fc}
.night-mode .legal-section p{color:#e2e8f0}
.night-mode .subsection{border-left-color:rgba(139,92,246,0.4)}
.night-mode .subsection h3{color:#c084fc}
.night-mode .subsection p{color:#e2e8f0}
.night-mode .legal-list li{color:#e2e8f0}
.night-mode .footer-logo{color:#c084fc}
.night-mode .footer-link{color:#94a3b8}
.night-mode .footer-link:hover{color:#c084fc}
.night-mode .copyright{color:#94a3b8}
.legal-page.day-mode{color:#3c2a1e}
.day-mode .back-btn{color:#A0522D;opacity:0.8}
.day-mode .back-btn:hover{background:rgba(212,175,55,0.1);opacity:1}
.day-mode .page-title{color:#A0522D}
.day-mode .page-subtitle{color:#5c3f2e}
.day-mode .legal-content{background:rgba(255,255,255,0.9);box-shadow:0 0 10px rgba(139,69,19,0.1)}
.day-mode .legal-section h2{color:#A0522D}
.day-mode .legal-section p{color:#3c2a1e}
.day-mode .subsection{border-left-color:rgba(212,175,55,0.5)}
.day-mode .subsection h3{color:#A0522D}
.day-mode .subsection p{color:#3c2a1e}
.day-mode .legal-list li{color:#3c2a1e}
.day-mode .footer-logo{color:#A0522D}
.day-mode .footer-link{color:#5c3f2e}
.day-mode .footer-link:hover{color:#A0522D}
.day-mode .copyright{color:#5c3f2e}
@media (max-width:768px){
  .legal-header{padding:2rem 1.5rem 0 1.5rem}
  .page-title{font-size:2rem}
  .page-subtitle{font-size:0.85rem}
  .legal-main{padding:1rem 1.5rem 2rem}
  .legal-content{padding:1.5rem}
  .legal-section h2{font-size:1.2rem}
  .legal-section p{font-size:0.95rem}
  .subsection{padding-left:0.75rem}
  .subsection h3{font-size:1.05rem}
  .legal-list{padding-left:1.25rem}
  .legal-list li{font-size:0.95rem}
}
@media (max-width:480px){
  .legal-header{padding:2rem 1rem 0 1rem}
  .page-title{font-size:1.75rem}
  .legal-main{padding:1rem 1rem}
  .legal-content{padding:1.25rem}
  .legal-section{margin-bottom:2rem}
  .legal-section h2{font-size:1.1rem}
  .subsection{margin-top:1rem}
  .subsection h3{font-size:1rem}
  .back-btn{padding:8px 0}
  .footer-links{gap:1rem;font-size:0.9rem}
  .copyright{font-size:0.85rem}
}
</style>