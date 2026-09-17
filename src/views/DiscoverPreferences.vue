<template>
  <div class="onboarding-page" :class="currentTheme">
    <div class="onboarding-wrapper">
      <div class="onboarding-container" :class="{ 'fade-in': isVisible }">
        <div class="header-section">
          <div class="logo-container">
            <img src="/images/bottle.png?v=3" alt="Jinni Logo" class="logo-icon" />
            <h1 class="brand-name">Jinni</h1>
          </div>
          <h2 class="page-title">
            {{ $t('onboarding.edit_title') }}
          </h2>
          <p class="subtitle">
            {{ $t('onboarding.edit_subtitle') }}
          </p>
        </div>
        
        <!-- @submit.prevent with NO handler: saving happens ONLY via the explicit
             MagicButton click. This blocks implicit form submission (iOS keyboard
             "Go"/Enter in any input, or any future button missing type="button")
             from silently running savePreferences — which fires a GPS request
             when useGPS is on and looks like the app froze on iPhones where
             Safari location is disabled in Settings. -->
        <form @submit.prevent class="onboarding-form">
          <!-- Section 1: Interests -->
          <div class="preference-section active">
            <div class="card">
              <div class="section-header">
                <h3>{{ $t('onboarding.interests_title') }}</h3>
                <p class="section-description">{{ $t('onboarding.interests_desc') }}</p>
              </div>
              <div class="interests-grid">
                <div
                    v-for="(interestLabel, interestKey) in interests"
                    :key="interestKey"
                    class="interest-card"
                    :class="{ 'selected': preferences.interests.includes(interestKey) }"
                    @click="toggleInterest(interestKey)"
                >
                  <span>{{ interestLabel }}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- Section 2: Travel Style -->
          <div class="preference-section active">
            <div class="card">
              <div class="section-header">
                <h3>{{ $t('onboarding.style_title') }}</h3>
                <p class="section-description">{{ $t('onboarding.style_desc') }}</p>
              </div>
              <div class="travel-styles-grid">
                <div
                    v-for="(styleLabel, styleKey) in travelStyles"
                    :key="styleKey"
                    class="style-card"
                    :class="{ 'selected': preferences.travelStyle === styleKey }"
                    @click="selectTravelStyle(styleKey)"
                >
                  <span>{{ styleLabel }}</span>
                </div>
              </div>
              <transition name="budget-expand">
                <div class="budget-embed" v-if="preferences.travelStyle === 'budget'">
                  <div class="budget-embed-header">
                    <h4>{{ $t('onboarding.budget_title') }}</h4>
                    <p class="section-description">{{ $t('onboarding.budget_desc') }}</p>
                  </div>
                  <div class="budget-fields">
                    <div class="budget-display">
                      <div class="budget-input">
                        <label>{{ $t('onboarding.min_budget') }}</label>
                        <input
                            type="number"
                            v-model.number="preferences.budget.min"
                            min="0"
                            max="100000000"
                            placeholder="..."
                            @input="budgetInteracted = true"
                            @keypress="validateNumberInput"
                        >
                      </div>
                      <div class="budget-input">
                        <label>{{ $t('onboarding.currency') }}</label>
                        <div
                          class="expandable-selector"
                          :class="{ 'expanded': showCurrencyDropdown }"
                          v-click-outside="closeCurrencyDropdown"
                        >
                          <button 
                            type="button" 
                            @click.stop="toggleCurrencyDropdown" 
                            class="selector-trigger currency-trigger"
                          >
                            <span class="current-selection">
                              <span class="selection-text">
                                {{ preferences.budget.currency }}
                              </span>
                            </span>
                          </button>
                          <transition name="expand">
                            <div 
                              v-if="showCurrencyDropdown" 
                              class="selector-dropdown-inline currency-dropdown"
                              @click.stop
                            >
                              <div class="dropdown-list">
                                <div 
                                  v-for="(currencyName, currencyCode) in currencies" 
                                  :key="currencyCode" 
                                  @click="selectCurrency(currencyCode)" 
                                  class="dropdown-item" 
                                  :class="{ 'selected': preferences.budget.currency === currencyCode }"
                                >
                                  <span class="item-name">{{ currencyCode }}</span>
                                </div>
                              </div>
                            </div>
                          </transition>
                        </div>
                      </div>
                      <div class="budget-input">
                        <label>{{ $t('onboarding.max_budget') }}</label>
                        <input
                            type="number"
                            v-model.number="preferences.budget.max"
                            min="0"
                            max="100000000"
                            placeholder="..."
                            @input="budgetInteracted = true"
                            @keypress="validateNumberInput"
                        >
                      </div>
                    </div>
                    <div v-if="budgetInteracted && !isBudgetValid" class="budget-validation-error">
                      {{ $t('onboarding.budget_validation_error') }}
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <div class="submit-section">
            <MagicButton v-if="progressPercentage === 100" @click.prevent="savePreferences" :disabled="isSaving">
              {{ $t('onboarding.save_preferences') }}
            </MagicButton>
            <div v-else class="completion-required">
              {{ $t('onboarding.complete_warning') }}
            </div>
            <!-- Public page only: the city is one tap away even without choosing. -->
            <button type="button" class="dp-skip" @click="skip">{{ $t('discover.skip') }}</button>
          </div>

          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
            <span class="progress-text">{{ Math.round(progressPercentage) }}{{ $t('onboarding.complete') }}</span>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
// PUBLIC preferences (founder 2026-09-17): the onboarding page itself —
// same header, cards and button — minus the location section. Nothing here
// touches an account: choices live in this browser (localStorage
// jinni_public_prefs) and personalise the public /discover pages the way a
// signed-in user's saved preferences shape Jinni's Discoveries.
import { computed } from 'vue'
import MagicButton from '@/components/ui/MagicButton.vue'
import { useI18n } from 'vue-i18n'
import { isNightTime } from '@/utils/timeUtils'

const STORE_KEY = 'jinni_public_prefs'

export default {
  name: 'DiscoverPreferences',
  components: { MagicButton },
  directives: {
    'click-outside': {
      mounted(el, binding) {
        el.clickOutsideEvent = function(event) { if (!(el === event.target || el.contains(event.target))) { binding.value() } };
        document.body.addEventListener('click', el.clickOutsideEvent);
      },
      unmounted(el) { document.body.removeEventListener('click', el.clickOutsideEvent) }
    }
  },
  setup() {
    const { t, locale, tm } = useI18n()
    const currencies = computed(() => tm('onboarding.currencies'))
    const interests = computed(() => tm('onboarding.interests'))
    const travelStyles = computed(() => tm('onboarding.styles'))
    return { t, locale, currencies, interests, travelStyles }
  },
  data() {
    return {
      isVisible: false,
      budgetInteracted: false,
      isSaving: false,
      showCurrencyDropdown: false,
      preferences: { travelStyle: '', interests: [], budget: { min: 0, max: 0, currency: 'USD' } },
      // Same synchronous theme read as the onboarding page (iPhone Safari
      // bars are tinted from the first paint).
      userSettings: { theme: (() => { try { return JSON.parse(localStorage.getItem('jinni_settings') || '{}').theme || 'auto'; } catch (e) { return 'auto'; } })() },
    }
  },
  computed: {
    currentTheme() {
      if (this.userSettings.theme === 'light') return 'day-mode';
      if (this.userSettings.theme === 'dark') return 'night-mode';
      return isNightTime() ? 'night-mode' : 'day-mode';
    },
    isBudgetValid() {
      if (this.preferences.travelStyle === 'budget') { return this.preferences.budget.min > 0 && this.preferences.budget.max > 0 && this.preferences.budget.min <= this.preferences.budget.max }
      return true
    },
    // Two sections here (no location), so the bar fills in halves.
    progressPercentage() {
      let completed = 0;
      if (this.preferences.travelStyle) completed++;
      if (this.preferences.interests.length > 0) completed++;
      if (this.preferences.travelStyle === 'budget' && !this.isBudgetValid) { completed = Math.max(0, completed - 1) }
      return Math.round((completed / 2) * 100);
    },
    returnTo() {
      const r = String(this.$route.query.returnTo || '');
      return r.startsWith('/discover/') ? r : '/';
    },
  },
  beforeUnmount() { try { document.querySelector('meta[name="robots"][data-discover]')?.remove(); } catch (e) { /* ignore */ } },
  methods: {
    toggleInterest(key) {
      const index = this.preferences.interests.indexOf(key)
      if (index > -1) { this.preferences.interests.splice(index, 1) }
      else { this.preferences.interests.push(key) }
    },
    selectTravelStyle(key) {
      this.preferences.travelStyle = key
      if (key !== 'budget') { this.budgetInteracted = false; this.preferences.budget = { min: 0, max: 0, currency: 'USD' } }
      else { this.budgetInteracted = false }
    },
    toggleCurrencyDropdown() { this.showCurrencyDropdown = !this.showCurrencyDropdown },
    closeCurrencyDropdown() { this.showCurrencyDropdown = false },
    selectCurrency(currencyCode) { this.preferences.budget.currency = currencyCode; this.showCurrencyDropdown = false; },
    validateNumberInput(event) {
      const charCode = event.which ? event.which : event.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) { event.preventDefault() }
    },
    loadPreferences() {
      try {
        const p = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
        if (!p || typeof p !== 'object') return;
        this.preferences = {
          travelStyle: p.travelStyle === 'luxury' || p.travelStyle === 'budget' ? p.travelStyle : '',
          interests: Array.isArray(p.interests) ? p.interests.filter(x => typeof x === 'string') : [],
          budget: {
            min: Number.isFinite(p.budget?.min) ? p.budget.min : 0,
            max: Number.isFinite(p.budget?.max) ? p.budget.max : 0,
            currency: typeof p.budget?.currency === 'string' ? p.budget.currency : 'USD',
          },
        };
      } catch (e) { /* storage unavailable → defaults */ }
    },
    skip() {
      try { if (!localStorage.getItem(STORE_KEY)) localStorage.setItem(STORE_KEY, JSON.stringify({ travelStyle: '', interests: [], budget: { min: 0, max: 0, currency: 'USD' } })); } catch (e) { /* ignore */ }
      this.$router.push(this.returnTo);
    },
    savePreferences() {
      if (this.isSaving) return;
      this.isSaving = true;
      try { localStorage.setItem(STORE_KEY, JSON.stringify(this.preferences)); } catch (e) { /* ignore */ }
      this.$router.push(this.returnTo);
    },
  },
  mounted() {
    // Search engines must index the city pages, never this form.
    try { let m = document.querySelector('meta[name="robots"][data-discover]'); if (!m) { m = document.createElement('meta'); m.name = 'robots'; m.setAttribute('data-discover', '1'); document.head.appendChild(m); } m.content = 'noindex,follow'; } catch (e) { /* ignore */ }
    this.loadPreferences()
    setTimeout(() => { this.isVisible = true }, 500)
  },
}
</script>

<style scoped>
.market-notice { margin: 10px 0 4px; padding: 11px 14px; border-radius: 12px; background: rgba(212,175,55,0.16); font-size: 13.5px; line-height: 1.5; }
.market-notice--blocked { background: rgba(220,80,80,0.14); color: #c0504d; }
.onboarding-page{min-height:100vh;display:flex;justify-content:center;padding:20px;position:relative;overflow-x:hidden}
.onboarding-wrapper{width:100%;max-width:647px;margin:auto}
.onboarding-container{opacity:0;}
.onboarding-container.fade-in{opacity:1;}
.header-section{text-align:center;margin-bottom:30px}
.logo-container{display:flex;align-items:center;justify-content:center;gap:5px;}
.logo-icon{width:80px;height:80px;object-fit:contain;filter:drop-shadow(0 5px 15px rgba(0,0,0,0.1))}
.brand-name{font-size:2.4rem;font-weight:700;margin:0;background:linear-gradient(45deg,#D4AF37,#FF8C00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;}
.page-title{font-size:1.8rem;margin-bottom:15px;font-weight:600}
.subtitle{font-size:1.1rem;max-width:600px;margin:0 auto;line-height:1.6}
.progress-container{margin-bottom:20px;text-align:center}
.progress-bar{width:100%;height:8px;border-radius:4px;overflow:hidden;margin-bottom:10px}
.progress-fill{height:100%;background:linear-gradient(90deg, #D4AF37, #C19A6B);border-radius:4px;}
.progress-text{font-size:0.9rem;font-weight:500}
.preference-section{margin-bottom:25px;}
.preference-section.active{opacity:1;}
.card{border-radius:12px;padding:25px;position:relative;backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);}
.card:hover{box-shadow:0 0 35px rgba(0,0,0,0.3)}
.section-header{margin-bottom:25px}
.section-header h3{font-size:1.4rem;margin:0 0 8px 0;font-weight:600}
.section-description{font-size:0.95rem;margin:0}
.interests-grid,.travel-styles-grid{display:flex;flex-wrap:wrap;justify-content:center;gap:12px}
.interest-card,.style-card{flex:0 1 140px;border-radius:14px;padding:15px 10px;text-align:center;cursor:pointer;transition:all 0.2s ease;font-weight:500;position:relative;overflow:hidden;display:flex;justify-content:center;align-items:center;gap:8px;border:none;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.interest-card.selected,.style-card.selected{background:linear-gradient(45deg,#D4AF37,#FF8C00);color:white;border-color:transparent;box-shadow:0 0 15px rgba(212,175,55,0.5)}
.budget-input{display:flex;flex-direction:column;align-items:center;flex:1;max-width:180px}
.budget-input label{margin-bottom:8px;font-weight:500;font-size:0.95rem}
.budget-input input{border:none;padding:12px 16px;border-radius:12px;width:100%;box-sizing:border-box;min-height:44px;text-align:center;font-size:1rem;max-width:200px;transition:box-shadow 0.25s ease;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%);}
.budget-input input::-webkit-outer-spin-button, .budget-input input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.budget-input input:focus{outline:none}
.submit-section{text-align:center;margin-bottom:30px}
.completion-required{padding:15px 20px;border-radius:12px;text-align:center;font-weight:500;animation:fadeIn 0.5s ease}
.budget-toggle-container{display:flex;justify-content:center;margin-top:-20px;}
.budget-toggle-btn{color:white;border:none;padding:12px 24px;border-radius:20px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all 0.3s ease;font-size:0.95rem}
.budget-validation-error{font-size:0.9rem;margin-top: 5px;margin-bottom: -15px;text-align:center}
.budget-fields{width:100%;display:flex;flex-direction:column;align-items:center}
.budget-embed{margin-top:28px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08)}
.budget-embed-header{text-align:center;margin-bottom:14px}
.budget-embed-header h4{font-size:1.1rem;margin:0 0 6px 0;font-weight:600}

/* Location Section Styles */
.location-mode-toggle{display:flex;gap:12px}
.mode-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:10px;padding:16px 20px;border-radius:14px;border:none;font-size:15px;font-weight:500;cursor:pointer;transition:all 0.3s ease;background:transparent;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.mode-btn svg{flex-shrink:0}
.mode-btn.active{font-weight:600}

.mode-btn.disabled {opacity: 0.5;cursor: not-allowed}
.mode-btn:disabled {pointer-events: none}

.mode-btn:active,.map-selector-btn:active{filter:brightness(0.96)}
.permit-link {cursor: pointer;text-decoration: underline;font-style: italic;font-weight: 500}
.permit-link:hover {opacity: 0.7}

.map-selector-btn{display:flex;align-items:center;justify-content:center;gap:12px;padding:14px 18px;border-radius:14px;border:none;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s ease;background:transparent;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.map-selector-btn:hover{box-shadow:0 4px 12px rgba(0,0,0,0.15)}
.map-selector-btn svg{flex-shrink:0}
.desktop-location-section{margin-top:20px}
.location-selector-group{display:grid;grid-template-columns:1fr 1fr;gap:15px;}
.selector-item label{display:block;margin-bottom:8px;font-weight:500;font-size:0.9rem}
.expandable-selector{position:relative}
.selector-trigger{width:100%;display:flex;align-items:center;justify-content:space-between;padding: 12px 22px;border-radius:12px;border:none;cursor:pointer;background:transparent;transition:all 0.2s;font-size: 14px;min-height: 44px;box-sizing:border-box;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%);}
.selector-trigger:disabled{opacity:0.6}
.selector-dropdown-inline{position:absolute;top:calc(100% + 4px);left:0;right:0;border-radius:14px;border:none;height:280px;z-index:100;display:flex;flex-direction:column;overflow:hidden;backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%)}
.dropdown-search{width:100%;padding:10px;border:none;outline:none;font-size:14px;flex-shrink:0;box-shadow:inset 0 -1px 0 rgba(128,128,128,0.18)}
.dropdown-list{flex:1;overflow-y:auto}
.dropdown-item{padding:10px 14px;cursor:pointer;display:flex;align-items:center;gap:8px;transition:background 0.2s;font-size: 14px;}
.dropdown-item .flag{font-size:1.2em}
.dropdown-item .item-name{flex:1}
.dropdown-item .item-region{opacity:0.6;font-size:0.85em}
.currency-dropdown .dropdown-item{justify-content:center;text-align:center}
.checkmark{flex-shrink:0}
.map-selector-option{text-align:center;margin-top:10px}
.or-divider{display:block;margin-bottom:10px;font-size:0.9em}
.desktop-map-btn{padding:10px 16px;font-size:0.9em;display: inline-flex;}
.mobile-map-btn{padding:14px 18px}
.current-selection {display: flex;align-items: center;gap: 8px;flex: 1;text-align: left;}
.selection-text {font-size: 14px;line-height: 1.4;}
.dropdown-arrow {flex-shrink: 0;transition: transform 0.2s}
.dropdown-arrow.rotated {transform: rotate(180deg)}
.spinner {animation: spin 1s linear infinite}
.destination-selection{min-height:auto}
.expand-enter-active{transition:all 0.3s ease-out}
.expand-leave-active{transition:all 0.3s ease-in}
.expand-enter-from{max-height:0;opacity:0;overflow:hidden}
.expand-enter-to{max-height:400px;opacity:1;overflow:visible}
.expand-leave-from{max-height:400px;opacity:1;overflow:visible}
.expand-leave-to{max-height:0;opacity:0;overflow:hidden}
.fade-slide-enter-active,.fade-slide-leave-active{transition:none}
.fade-slide-enter-from,.fade-slide-leave-to{opacity:0;display:none}
.fade-slide-enter-to,.fade-slide-leave-from{opacity:1}
.budget-expand-enter-active{transition:all 0.3s ease-out}
.budget-expand-leave-active{transition:all 0.3s ease-in}
.budget-expand-enter-from{max-height:0;opacity:0;overflow:hidden}
.budget-expand-enter-to{max-height:460px;opacity:1;overflow:visible}
.budget-expand-leave-from{max-height:460px;opacity:1;overflow:visible}
.budget-expand-leave-to{max-height:0;opacity:0;overflow:hidden}
.budget-display{display:grid;grid-template-columns:0.6fr 0.2fr 0.6fr;width:100%;max-width:650px;margin-top:10px}
.budget-row{display:grid;grid-template-columns:1fr 1fr;gap:15px}
.currency-selector-container{max-width:200px;align-self:center}
.budget-input{max-width:none}
.currency-trigger{min-height:44px}
.currency-dropdown{top:auto;bottom:calc(100% + 4px);height:auto;max-height:320px}
.currency-dropdown .dropdown-list{scrollbar-width:none;-ms-overflow-style:none}
.currency-dropdown .dropdown-list::-webkit-scrollbar{width:0;height:0;display:none}
.mobile-location-section {display: flex;justify-content: center;margin-top: 10px}
.location-permission-warning {margin-left: auto;margin-right: auto;text-align: center;padding: 12px 16px;border-radius: 8px;font-style: italic;margin-top: -20px;margin-bottom: 10px;}
.location-denied-warning {font-style: normal;font-size: 0.88em;line-height: 1.5;}

@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@media (max-width:768px){
  .onboarding-page{padding:20px}
  .brand-name{font-size:1.8rem}
  .page-title{font-size:1.5rem}
  .subtitle{font-size:1rem}
  .budget-display{grid-template-columns:1fr 0.5fr 1fr;gap:15px}
  .budget-input{max-width:100%}
  .interests-grid,.travel-styles-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
  .interest-card,.style-card{flex:initial;width:auto;min-height:56px;padding:16px 12px;font-size:0.95rem}
  .card{padding:20px 15px}
}

/* ========== DAY MODE ========== */
.day-mode{background:#f9f5eb;color:#3c2a1e}
.day-mode .page-title{color:#3c2a1e}
.day-mode .subtitle{color:#5c3f2e}
.day-mode .card{background:rgba(255,255,255,0.5);box-shadow:0 2px 10px rgba(139,69,19,0.05),inset 0 1px 0 rgba(255,255,255,0.6)}
.day-mode .card:hover{box-shadow:0 4px 16px rgba(139,69,19,0.08),inset 0 1px 0 rgba(255,255,255,0.6)}
.day-mode .section-header h3{color:#A0522D}
.day-mode .section-description{color:#5c3f2e}
.day-mode .interest-card,.day-mode .style-card{background:rgba(255,255,255,0.45);color:#3c2a1e;box-shadow:inset 0 1px 0 rgba(255,255,255,0.6)}
.day-mode .interest-card:hover,.day-mode .style-card:hover{background:rgba(212,175,55,0.16);box-shadow:0 2px 8px rgba(139,69,19,0.08),inset 0 1px 0 rgba(255,255,255,0.6)}
.day-mode .interest-card.selected,.day-mode .style-card.selected{background: linear-gradient(45deg, #D4AF37, #C19A6B) !important;color:white!important;box-shadow:0 2px 10px rgba(212,175,55,0.28),inset 0 1px 0 rgba(255,255,255,0.45)!important}
.day-mode .progress-text{color:#3c2a1e;font-weight:600}
.day-mode .progress-bar{background:rgba(212,175,55,0.2)}
.day-mode .budget-input label{color:#A0522D;font-weight:600}
.day-mode .budget-embed{border-top-color:rgba(212,175,55,0.25)}
.day-mode .budget-embed-header h4{color:#A0522D}
.day-mode .budget-input input{background:rgba(255,255,255,0.5);color:#3c2a1e;box-shadow:inset 0 1px 0 rgba(255,255,255,0.55)}
.day-mode .budget-input input:focus{background:rgba(255,255,255,0.62);box-shadow:inset 0 1px 0 rgba(255,255,255,0.55)}
.day-mode .budget-input input::placeholder{color:rgba(92,74,66,0.7)}
.day-mode .budget-toggle-btn{background:rgba(255,255,255,0.9);border:1px solid rgba(212,175,55,0.3);color:#3c2a1e}
.day-mode .budget-toggle-btn:hover{background:rgba(212,175,55,0.1);}
.day-mode .completion-required{background:rgba(229,62,62,0.1);color:#e53e3e}
.day-mode .budget-validation-error{color:#e53e3e}
.day-mode .logo-icon{filter:drop-shadow(0 5px 15px rgba(212,175,55,0.3))}
.day-mode .map-selector-btn{background:rgba(255,255,255,0.45);color:#3c2a1e;box-shadow:inset 0 1px 0 rgba(255,255,255,0.6)}
.day-mode .map-selector-btn:hover{background:rgba(212,175,55,0.16);box-shadow:0 0 8px rgba(139,69,19,0.10),inset 0 0 1px rgba(255,255,255,0.6)}
.day-mode .map-selector-btn svg{color:#A0522D}
.day-mode .selector-trigger{background:rgba(255,255,255,0.5);color:#3c2a1e;box-shadow:inset 0 1px 0 rgba(255,255,255,0.55)}
.day-mode .selector-dropdown-inline{background:rgba(255,255,255,0.72);box-shadow:0 18px 44px rgba(0,0,0,0.14),inset 0 1px 0 rgba(255,255,255,0.6)}
.day-mode .dropdown-search{border-bottom-color:rgba(212,175,55,0.3)}
.day-mode .dropdown-item:hover{background:rgba(212,175,55,0.1)}
.day-mode .dropdown-item.selected{background:rgba(212,175,55,0.15)}
.day-mode .mode-btn{background:rgba(255,255,255,0.5);color:#3c2a1e;box-shadow:inset 0 1px 0 rgba(255,255,255,0.55)}
.day-mode .mode-btn:hover{background:rgba(212,175,55,0.16);box-shadow:0 2px 8px rgba(139,69,19,0.10),inset 0 1px 0 rgba(255,255,255,0.55)}
.day-mode .mode-btn.active{background: linear-gradient(45deg, #D4AF37, #C19A6B);color:white;box-shadow:0 2px 10px rgba(212,175,55,0.25),inset 0 1px 0 rgba(255,255,255,0.45)}
.day-mode .mode-btn.active svg{stroke:white}
.day-mode .magic-button {background: linear-gradient(45deg, #D4AF37, #C19A6B);color:white}
.day-mode .magic-button:hover {box-shadow:0 0 12px rgba(212,175,55,0.5)}
.day-mode .location-permission-warning {background: rgba(212, 175, 55, 0.1);border-color: rgba(247, 216, 114, 0.3);color: #A0522D}
@media (max-width:768px){.day-mode .card{background:rgba(255,255,255,0.62);box-shadow:0 2px 10px rgba(139,69,19,0.07),inset 0 1px 0 rgba(255,255,255,0.6)}}

/* ========== NIGHT MODE ========== */
.night-mode{background:linear-gradient(180deg, #0a0118 0%, #1a0b2e 45%, #141031 78%, #0a0118 100%);color:#e2e8f0}
.night-mode .page-title{color:#e2e8f0}
.night-mode .subtitle{color:#94a3b8}
.night-mode .card{background:rgba(139,92,246,0.07);box-shadow:0 0 3px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.10)}
.night-mode .section-header h3{color:#c084fc}
.night-mode .section-description{color:#e2e8f0}
.night-mode .interest-card,.night-mode .style-card,.night-mode .language-card{background:rgba(255,255,255,0.05);color:#e2e8f0;box-shadow:inset 0 1px 0 rgba(255,255,255,0.08)}
.night-mode .interest-card:hover,.night-mode .style-card:hover,.night-mode .language-card:hover{background:rgba(139,92,246,0.18);box-shadow:0 0 7px rgba(139,92,246,0.28),inset 0 1px 0 rgba(255,255,255,0.10)}
.night-mode .interest-card.selected,.night-mode .style-card.selected,.night-mode .language-card.selected{background:linear-gradient(135deg,#8b5cf6,#a855f7)!important;color:white!important;box-shadow:0 0 6px rgba(139,92,246,0.5),inset 0 1px 0 rgba(255,255,255,0.30)!important}
.night-mode .progress-text{color:#c084fc;font-weight:600}
.night-mode .progress-bar{background:rgba(139,92,246,0.2)}
.night-mode .progress-fill{background:linear-gradient(90deg,#8b5cf6,#a855f7,#c084fc)}
.night-mode .budget-input label{color:#c084fc;font-weight:600}
.night-mode .budget-embed{border-top-color:rgba(139,92,246,0.25)}
.night-mode .budget-embed-header h4{color:#c084fc}
.night-mode .budget-input input{background:rgba(255,255,255,0.05);color:#e2e8f0;box-shadow:inset 0 1px 0 rgba(255,255,255,0.08)}
.night-mode .budget-input input:focus{background:rgba(255,255,255,0.09);box-shadow:inset 0 1px 0 rgba(255,255,255,0.08)}
.night-mode .budget-input input::placeholder{color:rgba(226,232,240,0.5)}
.night-mode .budget-toggle-btn{background:#241845;border:1px solid rgba(139,92,246,0.3);color:#e2e8f0}
.night-mode .budget-toggle-btn:hover{background:rgba(139,92,246,0.1);}
.night-mode .completion-required{background:rgba(255,107,107,0.15);color:#ff6b6b}
.night-mode .budget-validation-error{color:#ff6b6b;opacity:0.8}
.night-mode .logo-icon{filter:drop-shadow(0 5px 15px rgba(139,92,246,0.3))}
.night-mode .map-selector-btn{background:rgba(255,255,255,0.05);color:#e2e8f0;box-shadow:inset 0 1px 0 rgba(255,255,255,0.08)}
.night-mode .map-selector-btn:hover{background:rgba(139,92,246,0.18);box-shadow:0 0 7px rgba(139,92,246,0.28),inset 0 1px 0 rgba(255,255,255,0.10)}
.night-mode .map-selector-btn svg{color:#c084fc}
.night-mode .selector-trigger{background:rgba(255,255,255,0.05);color:#e2e8f0;box-shadow:inset 0 1px 0 rgba(255,255,255,0.08)}
.night-mode .selector-dropdown-inline{background:rgba(20,14,40,0.9);box-shadow:0 20px 50px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.08)}
.night-mode .dropdown-search{background:rgba(255,255,255,0.04);color:#e2e8f0}
.night-mode .dropdown-item:hover{background:rgba(139,92,246,0.1)}
.night-mode .dropdown-item.selected{background:rgba(139,92,246,0.15)}
.night-mode .mode-btn{background:rgba(255,255,255,0.05);color:#e2e8f0;box-shadow:inset 0 1px 0 rgba(255,255,255,0.08)}
.night-mode .mode-btn:hover{background:rgba(139,92,246,0.18);box-shadow:0 0 7px rgba(139,92,246,0.28),inset 0 1px 0 rgba(255,255,255,0.10)}
.night-mode .mode-btn.active{background:linear-gradient(135deg,#8b5cf6,#a855f7);color:white;box-shadow:0 0 9px rgba(139,92,246,0.45),inset 0 1px 0 rgba(255,255,255,0.28)}
.night-mode .mode-btn.active svg{stroke:white}
.night-mode .magic-button {background: linear-gradient(135deg, #8b5cf6, #a855f7)}
.night-mode .magic-button:hover {background: linear-gradient(135deg, #7c3aed, #9333ea);box-shadow: 0 0 4px rgba(139, 92, 246, 0.5)}
.night-mode .location-permission-warning{background:rgba(139,92,246,0.15);border-color:rgba(139,92,246,0.3);color:#c084fc}
/* Themed scrollbar for night mode (page + scrollable areas, excluding the currency dropdown) */
.night-mode{scrollbar-width:thin;scrollbar-color:#8b5cf6 rgba(139,92,246,0.12)}
.night-mode ::-webkit-scrollbar{width:10px;height:10px}
.night-mode ::-webkit-scrollbar-track{background:rgba(139,92,246,0.12);border-radius:8px}
.night-mode ::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#8b5cf6,#a855f7);border-radius:8px;border:2px solid transparent;background-clip:padding-box}
.night-mode ::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,#7c3aed,#9333ea);background-clip:padding-box}

/* GPS-tap acknowledgment (founder 2026-09-07): light/color only, no motion */
.gps-confirm{margin:8px 2px 0;font-size:0.82rem;color:#1e7d4a;opacity:0.9}
.gps-city-title{display:flex;align-items:center;gap:7px}
.gps-title-icon{color:#A0522D;flex:none}
.night-mode .gps-title-icon{color:#c084fc}
.night-mode .gps-confirm,[data-theme="night"] .gps-confirm{color:#9fe8bb}
.mode-btn--flash{animation:gps-glow 1.2s ease-out}
@keyframes gps-glow{0%{box-shadow:0 0 0 0 rgba(212,175,55,0.55)}100%{box-shadow:0 0 14px 6px rgba(212,175,55,0)}}
.fade-enter-active,.fade-leave-active{transition:opacity 0.3s ease}
.fade-enter-from,.fade-leave-to{opacity:0}
.dp-skip { display: block; margin: 14px auto 0; background: none; border: none; cursor: pointer; font: inherit; font-size: 0.92rem; text-decoration: underline; text-underline-offset: 3px; opacity: 0.75; color: inherit }
.dp-skip:hover { opacity: 1 }
.day-mode .dp-skip { color: #5c3f2e }
.night-mode .dp-skip { color: #e2e8f0 }
</style>