<template>
  <div class="onboarding-page" :class="currentTheme">
    <div class="onboarding-wrapper">
      <div class="onboarding-container" :class="{ 'fade-in': isVisible }">
        <div class="header-section">
          <div class="logo-container">
            <img src="/images/bottle.png" alt="Jinni Logo" class="logo-icon" />
            <h1 class="brand-name">Jinni</h1>
          </div>
          <h2 class="page-title">
            {{$t('onboarding.edit_title')}}
          </h2>
          <p class="subtitle">
            {{ isEditing ? $t('onboarding.edit_subtitle') : $t('onboarding.subtitle') }}
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
          <!-- Section 4: Location/Destination -->
          <div class="preference-section active">
            <div class="card">
              <div class="section-header">
                <h3>{{ locationMode === 'destination' && preferences.destination.city ? `${preferences.destination.city}, ${preferences.destination.countryName}` : $t('onboarding.location_title') }}</h3>
                <p class="section-description">{{ $t('onboarding.location_desc') }}</p>
              </div>
              <div v-if="marketNotice" class="market-notice" :class="{ 'market-notice--blocked': marketBlocked }">{{ marketNotice }}</div>
              <div v-if="locationDenied" class="location-permission-warning location-denied-warning">
                <span>{{ $t(locationHelpKey) }}</span>
              </div>
              <!-- Deliberate in-app switch-off is its own story: telling this user
                   "GPS permission required" (OS phrasing) sends them hunting through
                   iPhone Settings for a permission that is still granted. autoDetect
                   defaults to true, so an explicit false can only mean the app-level
                   toggle — Permit restores both flags, no OS prompt involved. -->
              <div v-else-if="gpsManuallyDisabled" class="location-permission-warning">
                <span>{{ $t('onboarding.location_app_toggle_off') }}
                  <span class="permit-link" @click="requestLocationPermission">{{ $t('onboarding.location_permission_grant') }}</span>
                </span>
              </div>
              <div v-else-if="!hasLocationPermission" class="location-permission-warning">
                <span>{{ $t('onboarding.location_permission_required') }}
                  <span class="permit-link" @click="requestLocationPermission">{{ $t('onboarding.location_permission_grant') }}</span>
                </span>
              </div>
              <div class="location-mode-toggle">
                <button 
                  type="button" 
                  @click="activateLocationMode('gps')" 
                  class="mode-btn" 
                  :class="{ 'active': locationMode === 'gps', 'disabled': !hasLocationPermission }"
                  :disabled="!hasLocationPermission"
                  :title="locationDenied ? $t('onboarding.location_denied_btn_title') : (!hasLocationPermission ? $t('onboarding.location_permission_required') : '')"
                >
                  <span>{{ $t('onboarding.use_current_location') }}</span>
                </button>
                <button
                  v-if="isDesktop"
                  type="button"
                  @click="activateLocationMode('destination')"
                  :class="{ 'active': locationMode === 'destination' }"
                  class="mode-btn destination-btn"
                >
                  <span>{{ $t('onboarding.choose_destination') }}</span>
                </button>
                <button
                  v-else
                  type="button"
                  @click="chooseDestinationOnMap"
                  :class="{ 'active': locationMode === 'destination' }"
                  class="mode-btn destination-btn"
                >
                  <span>{{ $t('onboarding.select_on_map') }}</span>
                </button>
              </div>
              <transition name="expand">
                <div v-if="locationMode === 'destination' && isDesktop" class="destination-selection" :key="locationMode">
                  <div v-if="isDesktop" class="desktop-location-section">
                    <div class="location-selector-group">
                      <div class="selector-item">
                        <label>{{ $t('onboarding.country') }}</label>
                        <div class="expandable-selector" :class="{ 'expanded': showCountryDropdown }">
                          <button 
                            type="button" 
                            @click.stop="toggleCountryDropdown" 
                            class="selector-trigger"
                          >
                            <span class="current-selection">
                              <span v-if="preferences.destination.country && getCountryFlag(preferences.destination.country)" class="flag">
                                {{ getCountryFlag(preferences.destination.country) }}
                              </span>
                              <span class="selection-text">
                                {{ preferences.destination.countryName || $t('onboarding.select_country') }}
                              </span>
                            </span>
                            <svg 
                              class="dropdown-arrow" 
                              :class="{ 'rotated': showCountryDropdown }"
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              stroke-width="2"
                            >
                              <path d="M6 9l6 6 6-6"/>
                            </svg>
                          </button>
                          <transition name="expand">
                            <div 
                              v-if="showCountryDropdown" 
                              class="selector-dropdown-inline"
                              @click.stop
                            >
                              <input 
                                ref="countrySearchInput" 
                                v-model="countrySearch" 
                                :placeholder="$t('onboarding.search_countries')"
                                class="dropdown-search"
                                @click.stop
                              >
                              <div class="dropdown-list">
                                <div 
                                  v-for="country in filteredCountries" 
                                  :key="country.code" 
                                  @click="selectCountry(country)" 
                                  class="dropdown-item" 
                                  :class="{ 'selected': preferences.destination.country === country.code }"
                                >
                                  <span class="flag">{{ getCountryFlag(country.code) }}</span>
                                  <span class="item-name">{{ country.name }}</span>
                                  <svg 
                                    v-if="preferences.destination.country === country.code" 
                                    class="checkmark" 
                                    width="18" 
                                    height="18" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    stroke-width="2"
                                  >
                                    <path d="M20 6L9 17l-5-5"/>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </transition>
                        </div>
                      </div>
                      <div class="selector-item">
                        <label>{{ $t('onboarding.city') }}</label>
                        <div class="expandable-selector" :class="{ 'expanded': showCityDropdown }">
                          <button 
                            type="button" 
                            @click.stop="toggleCityDropdown" 
                            class="selector-trigger" 
                            :disabled="loadingCities || !preferences.destination.country"
                          >
                            <span class="current-selection">
                              <span class="selection-text">
                                {{ preferences.destination.city || (loadingCities ? $t('onboarding.loading') : $t('onboarding.select_city')) }}
                              </span>
                            </span>
                            <svg 
                              v-if="!loadingCities"
                              class="dropdown-arrow"
                              :class="{ 'rotated': showCityDropdown }"
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              stroke-width="2"
                            >
                              <path d="M6 9l6 6 6-6"/>
                            </svg>
                            <svg 
                              v-else
                              class="spinner"
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              stroke-width="2"
                            >
                              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                            </svg>
                          </button>
                          <transition name="expand">
                            <div 
                              v-if="showCityDropdown" 
                              class="selector-dropdown-inline"
                              @click.stop
                            >
                              <input 
                                ref="citySearchInput" 
                                v-model="citySearch" 
                                :placeholder="$t('onboarding.search_cities')"
                                class="dropdown-search"
                                @click.stop
                              >
                              <div class="dropdown-list">
                                <div 
                                  v-for="city in filteredCities" 
                                  :key="`${city.name}-${city.stateCode}`" 
                                  @click="selectCity(city)" 
                                  class="dropdown-item" 
                                  :class="{ 'selected': preferences.destination.city === city.name }"
                                >
                                  <span class="item-name">{{ city.name }}</span>
                                  <span v-if="city.stateCode" class="item-region">{{ city.stateCode }}</span>
                                  <svg 
                                    v-if="preferences.destination.city === city.name" 
                                    class="checkmark" 
                                    width="18" 
                                    height="18" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    stroke-width="2"
                                  >
                                    <path d="M20 6L9 17l-5-5"/>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </transition>
                        </div>
                      </div>
                    </div>
                    <div class="map-selector-option">
                      <span class="or-divider">{{ $t('onboarding.or') }}</span>
                      <button type="button" @click="openMapSelector" class="map-selector-btn desktop-map-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>{{ $t('onboarding.select_on_map') }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <div class="submit-section">
            <MagicButton v-if="progressPercentage === 100" @click.prevent="savePreferences" :disabled="isSaving">
              {{ isSaving ? $t('onboarding.saving') : (isEditing ? $t('onboarding.save_preferences') : $t('onboarding.get_recommendations')) }}
            </MagicButton>
            <div v-else class="completion-required">
              {{ $t('onboarding.complete_warning') }}
            </div>
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
import { computed } from 'vue'   
import axios from 'axios'
import MagicButton from '@/components/ui/MagicButton.vue'
import { useI18n } from 'vue-i18n'
import { isNightTime } from '@/utils/timeUtils'
import { locationHelpKey } from '@/utils/locationHelp'

export default {
  name: 'OnboardingPage',
  components: {MagicButton},
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
      marketNotice: null,
      marketBlocked: false,
      isVisible: false,
      currentSection: 1,
      isEditing: false,
      budgetInteracted: false,
      showCompletionMessage: false,
      isSaving: false,
      completionTimeout: null,
      isDesktop: true,
      preferences: {
        travelStyle: '',
        interests: [],
        budget: { min: 0, max: 0, currency: 'USD' },
        useGPS: true,
        destination: {city: '', country: '', countryName: '', coordinates: { lat: 0, lng: 0 }}
      },
      userSettings: { theme: 'auto' },
      countryOptions: [],
      cityOptions: [],
      loadingCities: false,
      showCountryDropdown: false,
      showCityDropdown: false,
      showCurrencyDropdown: false,
      countrySearch: '',
      citySearch: '',
      locationMode: 'gps',
      permissionGranted: false,
      locationDenied: false
    }
  },
  computed: {
    currentTheme() {
      if (this.userSettings.theme === 'light') return 'day-mode';
      if (this.userSettings.theme === 'dark') return 'night-mode';
      return isNightTime() ? 'night-mode' : 'day-mode';
    },
    resolvedTheme() {
      if (this.userSettings.theme === 'light') return 'light';
      if (this.userSettings.theme === 'dark') return 'dark';
      return isNightTime() ? 'dark' : 'light';
    },
    // currencies() {
    //   try { return this.$i18n.messages[this.$i18n.locale].onboarding.currencies } 
    //   catch (e) { return this.$i18n.messages.en.onboarding.currencies }
    // },
    locationHeading() {
      if (this.locationMode === 'gps') { return this.$t('onboarding.location_title') } 
      else if (this.preferences.destination.city) { return this.preferences.destination.city + ', ' + this.preferences.destination.countryName }
      return this.$t('onboarding.location_title');
    },
    // interests() {
    //   try { return this.$i18n.messages[this.$i18n.locale].onboarding.interests } 
    //   catch (e) { return this.$i18n.messages.en.onboarding.interests }
    // },
    // travelStyles() {
    //   try { return this.$i18n.messages[this.$i18n.locale].onboarding.styles } 
    //   catch (e) { return this.$i18n.messages.en.onboarding.styles }
    // },
    isBudgetValid() {
      if (this.preferences.travelStyle === 'budget') {return this.preferences.budget.min > 0 && this.preferences.budget.max > 0 && this.preferences.budget.min <= this.preferences.budget.max}
      return true
    },
    isLocationValid() {return this.isLocationCompleted},
    progressPercentage() {
      let completed = 0;
      const totalSections = 3;      
      if (this.preferences.travelStyle) completed++;      
      if (this.preferences.interests.length > 0) completed++;      
      if (this.isLocationCompleted) completed++;      
      if (this.preferences.travelStyle === 'budget' && !this.isBudgetValid) {completed = Math.max(0, completed - 1)}
      return Math.round((completed / totalSections) * 100);
    },
    filteredCountries() {
      if (!this.countrySearch) return this.countryOptions;
      const search = this.countrySearch.toLowerCase();
      return this.countryOptions.filter(country => country.name.toLowerCase().includes(search) || country.code.toLowerCase().includes(search));
    },
    filteredCities() {
      if (!this.citySearch) return this.cityOptions;
      const search = this.citySearch.toLowerCase();
      return this.cityOptions.filter(city => city.name.toLowerCase().includes(search) || (city.stateCode && city.stateCode.toLowerCase().includes(search)));
    },
    hasLocationPermission() {
      void this.permissionGranted;
      const settings = localStorage.getItem('jinni_settings');
      if (settings) {
        try {
          const parsed = JSON.parse(settings);
          return parsed.privacy?.locationPermissionGranted === true;
        } catch (e) { return false }
      }
      return false;
    },
    gpsManuallyDisabled() {
      void this.permissionGranted;
      try {
        const parsed = JSON.parse(localStorage.getItem('jinni_settings') || '{}');
        return parsed.privacy?.autoDetectLocation === false && parsed.privacy?.locationPermissionGranted !== true;
      } catch (e) { return false }
    },
    isLocationCompleted() {
      if (this.locationMode === 'gps') {return this.hasLocationPermission && this.preferences.useGPS}
      else if (this.locationMode === 'destination') {return !!this.preferences.destination.city}
      return false;
    },
    locationHelpKey() { return locationHelpKey(); }
  },
  methods: {
    async checkMarket(lat, lng) {
      try {
        if (!lat || !lng) { this.marketNotice = null; return }
        const token = localStorage.getItem('authToken');
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const r = await fetch(`${apiUrl}/api/ai/market-status?lat=${lat}&lng=${lng}&lang=${this.$i18n?.locale || 'en'}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const d = await r.json();
        this.marketNotice = (d && d.mode === 'closed') ? d.message : null;
        if (!this.marketNotice) this.marketBlocked = false;
      } catch { this.marketNotice = null; this.marketBlocked = false }
    },
    checkScreenSize() { this.isDesktop = window.innerWidth > 768 },
    async loadCountries() {
      if (this.countryOptions.length > 0) return;
      if (!this.isDesktop) {
        console.log('📱 Mobile device - skipping country loading');
        return;
      }
      const cached = localStorage.getItem('jinni_countries');
      if (cached) {
        try {
          this.countryOptions = JSON.parse(cached);
          console.log('✅ Desktop: Loaded countries from cache');
          return;
        } catch (e) { console.error('Cache parse failed:', e) }
      }
      try {
        const { Country } = await import('country-state-city');
        this.countryOptions = Country.getAllCountries().map(country => ({
          code: country.isoCode,
          name: country.name,
          lat: parseFloat(country.latitude) || 0,
          lng: parseFloat(country.longitude) || 0
        }));
        localStorage.setItem('jinni_countries', JSON.stringify(this.countryOptions));
        console.log('✅ Desktop: Loaded', this.countryOptions.length, 'countries');
      } catch (error) {
        console.error('❌ Failed to load countries:', error);
        this.countryOptions = [];
      }
    },
    async requestLocationPermission() {
      this.locationDenied = false;
      try {
        let granted = false;
        if (!window.isSecureContext) {granted = true} 
        else {
          await new Promise((resolve, reject) => {navigator.geolocation.getCurrentPosition(resolve, reject)});
          granted = true;
        }
        if (granted) {
          const settings = JSON.parse(localStorage.getItem('jinni_settings') || '{}');
          settings.privacy = {...settings.privacy,locationPermissionGranted: true,autoDetectLocation: true};
          localStorage.setItem('jinni_settings', JSON.stringify(settings));
          this.preferences.useGPS = true;
          this.locationMode = 'gps';
          this.permissionGranted = true;
          this.locationInteracted = true;
        }
      } catch (error) {
        console.warn('Location permission denied or unavailable:', error);
        /* iOS quirk: when Safari's location access is off in iPhone Settings,
           getCurrentPosition fails INSTANTLY with NO prompt — code 1 if
           Safari-specific access is denied, code 2 (POSITION_UNAVAILABLE) if
           Location Services is off globally. Treat both as "blocked by the
           OS": show the help banner and flip to destination mode so the user
           is never left staring at a disabled GPS button with nothing
           happening. Any other failure (timeout etc.) still flips the mode
           so the map path stays usable. */
        const code = error && error.code;
        if (code === 1 || code === 2) { this.locationDenied = true }
        if (this.locationMode === 'gps') { this.locationMode = 'destination' }
      }
    },
    async loadCitiesForCountry(countryCode) {
      if (!this.isDesktop) {
        console.log('📱 Mobile - skipping city loading');
        this.cityOptions = [];
        return;
      }
      this.loadingCities = true;
      const cacheKey = `jinni_cities_${countryCode}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          this.cityOptions = JSON.parse(cached);
          console.log(`✅ Loaded ${this.cityOptions.length} cities from cache`);
          this.loadingCities = false;
          return;
        } catch (e) { console.warn('Cache parse failed:', e) }
      }
      try {
        const { City } = await import('country-state-city');
        const cities = City.getCitiesOfCountry(countryCode);
        this.cityOptions = cities.map(city => ({name: city.name,lat: parseFloat(city.latitude) || 0,lng: parseFloat(city.longitude) || 0,stateCode: city.stateCode})).sort((a, b) => a.name.localeCompare(b.name));
        localStorage.setItem(cacheKey, JSON.stringify(this.cityOptions));
      } catch (error) {
        console.error('Failed to load cities:', error);
        this.cityOptions = [];
      } finally { this.loadingCities = false }
    },
    getCountryFlag(countryCode) {
      if (!countryCode || countryCode.length !== 2) return '';
      const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
      return String.fromCodePoint(...codePoints);
    },
    toggleCountryDropdown() {
      this.showCountryDropdown = !this.showCountryDropdown;
      this.showCityDropdown = false;
      if (this.showCountryDropdown) {
        this.countrySearch = '';
        this.$nextTick(() => { this.$refs.countrySearchInput?.focus() });
      }
    },
    closeCountryDropdown() {
      this.showCountryDropdown = false;
      this.countrySearch = '';
    },
    selectCountry(country) {
      this.preferences.useGPS = false; 
      this.locationMode = 'destination';
      this.preferences.destination.country = country.code;
      this.preferences.destination.countryName = country.name;
      this.preferences.destination.coordinates.lat = country.lat;
      this.preferences.destination.coordinates.lng = country.lng;
      this.preferences.destination.city = '';
      this.loadCitiesForCountry(country.code);
      this.showCountryDropdown = false;
      this.checkMarket(country.lat, country.lng);
    },
    toggleCityDropdown() {
      if (!this.preferences.destination.country || this.loadingCities) return;
      this.showCityDropdown = !this.showCityDropdown;
      this.showCountryDropdown = false;
      if (this.showCityDropdown) {
        this.citySearch = '';
        this.$nextTick(() => { this.$refs.citySearchInput?.focus() });
      }
    },
    closeCityDropdown() {
      this.showCityDropdown = false;
      this.citySearch = '';
    },
    selectCity(city) {
      this.preferences.useGPS = false;
      this.locationMode = 'destination';
      this.preferences.destination.city = city.name;
      this.preferences.destination.coordinates.lat = city.lat;
      this.preferences.destination.coordinates.lng = city.lng;
      this.showCityDropdown = false;
      this.checkMarket(city.lat, city.lng);
    },
    toggleInterest(key) {
      const index = this.preferences.interests.indexOf(key)
      if (index > -1) { this.preferences.interests.splice(index, 1) } 
      else { this.preferences.interests.push(key) }
    },
    selectTravelStyle(key) {
      this.preferences.travelStyle = key
      // Budget inputs are only relevant for the "budget" style.
      // Clear any previously entered values when switching to another style.
      if (key !== 'budget') {
        this.budgetInteracted = false
        this.preferences.budget = { min: 0, max: 0, currency: 'USD' }
      } else {
        // Start the budget section clean so the validation error
        // only appears after the user actually types something.
        this.budgetInteracted = false
      }
    },
    toggleCurrencyDropdown() { this.showCurrencyDropdown = !this.showCurrencyDropdown },
    closeCurrencyDropdown() { this.showCurrencyDropdown = false },
    selectCurrency(currencyCode) {
      this.preferences.budget.currency = currencyCode;
      this.showCurrencyDropdown = false;
    },
    validateNumberInput(event) {
      const charCode = event.which ? event.which : event.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) { event.preventDefault() }
    },
    handleGPSToggle() { this.activateLocationMode(this.preferences.useGPS ? 'gps' : 'destination') },
    activateLocationMode(mode) {
      this.locationMode = mode;
      if (mode === 'gps') {
        this.preferences.useGPS = true;
        this.preferences.destination = {city: '', country: '', countryName: '', coordinates: { lat: 0, lng: 0 }};
        this.closeCountryDropdown();
        this.closeCityDropdown();
      } else {
        this.preferences.useGPS = false;
        if (this.isDesktop) { this.loadCountries() }
      }
    },
    // Forward the editing/returnTo flags through the map round-trip: the map
    // returns to a BARE /onboarding, which used to drop them — an Explore user
    // editing preferences lost edit mode and their way back to Explore after
    // visiting the map. New users carry neither flag, so nothing changes for
    // the auth → onboarding → chat flow.
    openMapSelector() {
      const q = { returnTo: 'onboarding' };
      if (this.$route.query.editing)  q.obEditing  = this.$route.query.editing;
      if (this.$route.query.returnTo) q.obReturnTo = this.$route.query.returnTo;
      this.$router.push({ path: '/map-selector', query: q });
    },
    chooseDestinationOnMap() {
      this.activateLocationMode('destination');
      this.openMapSelector();
    },
    async savePreferences() {
      if (this.isSaving) return;
      this.isSaving = true;
      try {
        if (this.preferences.travelStyle === 'budget' && !this.isBudgetValid) {
          alert('Please set a valid budget range');
          return;
        }
        if (!this.isLocationValid) {
          alert('Please select a destination or enable GPS');
          return;
        }
        // Closed market: re-verify at save time (the picker's check is
        // debounced) and refuse to store an unlaunched destination.
        if (this.locationMode === 'destination' && this.preferences.destination.coordinates.lat) {
          await this.checkMarket(this.preferences.destination.coordinates.lat, this.preferences.destination.coordinates.lng);
          if (this.marketNotice) {
            this.marketBlocked = true;
            this.$nextTick(() => document.querySelector('.market-notice')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
            return;
          }
        }
        const token = localStorage.getItem('authToken');
        if (!token) {
          alert('Please log in again');
          return;
        }
        if (this.preferences.useGPS) {
          try {
            const position = await new Promise((resolve, reject) => {navigator.geolocation.getCurrentPosition(resolve, reject, {enableHighAccuracy: true, timeout: 10000, maximumAge: 0})});
            const geo = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`);
            const geoData = await geo.json();
            this.preferences.destination = {
              country: geoData.address?.country_code?.toUpperCase() || '',
              countryName: geoData.address?.country || '',
              city: geoData.address?.city || geoData.address?.town || geoData.address?.village || '',
              coordinates: { lat: position.coords.latitude, lng: position.coords.longitude }
            };
          } catch (e) {
            console.warn('Could not get GPS on save:', e);
            /* Same iOS OS-level block as requestLocationPermission (code 1 or 2
               = no prompt, instant failure). Don't strand the user in a
               retry-alert loop: surface the help banner, switch to destination
               mode (map selection on mobile), and abort this save. */
            const code = e && e.code;
            if (code === 1 || code === 2) { this.locationDenied = true }
            this.preferences.useGPS = false;
            this.locationMode = 'destination';
            alert(this.$t('onboarding.gps_failed') || 'Could not get your GPS location. Please allow location access or pick a location on the map.');
            return;
          }
        }
        const existingSettings = JSON.parse(localStorage.getItem('jinni_settings') || '{}');
        const existingPermission = existingSettings.privacy?.locationPermissionGranted ?? false;
        const payload = {
          preferences: {
            travelStyle: this.preferences.travelStyle,
            interests: this.preferences.interests,
            budget: this.preferences.budget,
            useGPS: this.preferences.useGPS,
            destination: this.preferences.destination
          },
          settings: {
            location: this.preferences.destination,
            privacy: {
              autoDetectLocation: this.preferences.useGPS,
              locationPermissionGranted: this.preferences.useGPS ? true : existingPermission
            }
          },
          onboardingCompleted: true
        };
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await axios.patch(`${apiUrl}/api/auth/onboarding`, payload, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
        localStorage.setItem('user', JSON.stringify(response.data.user));
        const settings = JSON.parse(localStorage.getItem('jinni_settings') || '{}');
        settings.privacy = { autoDetectLocation: this.preferences.useGPS, locationPermissionGranted: this.preferences.useGPS ? true : existingPermission };
        settings.location = this.preferences.destination;
        localStorage.setItem('jinni_settings', JSON.stringify(settings));
        window.dispatchEvent(new CustomEvent('location-updated'));
        // Came from Explore's preferences button → go back there; the feed
        // refetches on mount and reorders by the fresh interests.
        this.$router.push(this.$route.query.returnTo === '/explore' ? '/explore' : '/chat');
      } catch (error) {
        console.error('Save failed:', error);
        if (error.response?.status === 401) {
          alert('Session expired');
          this.$router.push('/auth');
        } else { alert(this.$t('onboarding.unexpected_error')) }
      } finally {this.isSaving = false}
    },
    loadPreferences() {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          if (userData.settings?.theme) { this.userSettings.theme = userData.settings.theme }
          // Apply theme from localStorage first
          const savedSettingsRaw = localStorage.getItem('jinni_settings');
          if (savedSettingsRaw) {
            try {
              const parsedSettings = JSON.parse(savedSettingsRaw);
              if (parsedSettings.theme) { this.userSettings.theme = parsedSettings.theme }
            } catch(e) {}
          }
          // Merge DB preferences
          if (userData.preferences) { 
            this.preferences = {...this.preferences, ...userData.preferences};
          }
          // Apply localStorage LAST — it's more recent than DB (e.g. fresh map selection)
          if (savedSettingsRaw) {
            const parsedSettings = JSON.parse(savedSettingsRaw);
            if (parsedSettings.privacy) {
              this.preferences.useGPS = parsedSettings.privacy.autoDetectLocation;
            }
            if (parsedSettings.location?.coordinates?.lat && parsedSettings.location.coordinates.lat !== 0) {
              this.preferences.destination = parsedSettings.location;
              if (!this.preferences.useGPS) { this.locationMode = 'destination'; }
            }
          }
          if (this.preferences.useGPS) {
            this.locationMode = 'gps';
          } else {
            const hasValidDestination = this.preferences.destination?.city?.trim() !== '';
            this.locationMode = hasValidDestination ? 'destination' : 'destination';
          }
        } catch (error) { console.error('Error loading preferences:', error) }
      }
      this.applyTheme();
    },
    async checkGpsPermissionState() {
      if (!navigator.permissions) return;
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        if (result.state === 'denied') {
          this.locationDenied = true;
          if (this.locationMode === 'gps') { this.locationMode = 'destination' }
        }
        result.onchange = () => {
          this.locationDenied = result.state === 'denied';
          if (result.state === 'granted') {
            this.locationDenied = false;
          }
        };
      } catch (e) { /* Permissions API not available, handled on user interaction */ }
    },
    applyTheme() {
      const theme = this.resolvedTheme;
      document.documentElement.setAttribute('data-theme', theme);
      document.body.classList.remove('theme-light', 'theme-dark');
      document.body.classList.add(`theme-${theme}`);
    }
  },
  mounted() {
    this.checkScreenSize();
    /* Named + stored so beforeUnmount can remove it — previously this listener
       leaked and kept firing on other pages (including /map-selector). */
    this._outsideClickHandler = (event) => {
      const countryDropdown = this.$el?.querySelector?.('.expandable-selector');
      if (countryDropdown && !countryDropdown.contains(event.target)) {
        this.showCountryDropdown = false;
        this.showCityDropdown = false;
      }
    };
    document.addEventListener('click', this._outsideClickHandler);
    window.addEventListener('resize', this.checkScreenSize);
    this.locationMode = this.preferences.useGPS ? 'gps' : 'destination';
    this.isEditing = this.$route.query.editing === 'true'
    this.loadPreferences()
    setTimeout(() => { this.isVisible = true }, 500)
    if (this.isDesktop) {
      this.loadCountries();
      if (this.preferences.destination.country) { this.loadCitiesForCountry(this.preferences.destination.country) }
    }
    window.addEventListener('location-updated', this.loadPreferences)
    this.checkGpsPermissionState();
  },
  beforeUnmount() { 
    window.removeEventListener('resize', this.checkScreenSize);
    window.removeEventListener('location-updated', this.loadPreferences);
    if (this._outsideClickHandler) { document.removeEventListener('click', this._outsideClickHandler) }
  }
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
.night-mode{background:linear-gradient(180deg, #0a0118 0%, #1a0b2e 40%, #16213e 100%);color:#e2e8f0}
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
</style>