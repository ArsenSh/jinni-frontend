<template>
  <div class="auth-modal-overlay" :class="currentTheme" v-if="show" @click.self="close">  
    <div class="auth-container">
      <div class="auth-card">
        <button class="close-button" @click="close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="auth-header">
          <div class="bottle-container">
            <img src="/images/bottle.png" alt="Jinni Bottle" class="bottle-image" />
          </div>
          <h1 class="auth-title">{{ $t('auth.title') }}</h1>
          <p class="auth-subtitle">
            {{ getSubtitle() }}
          </p>
        </div>
        <div v-if="!showVerification && !showForgotPassword && !showPasswordReset && !showSetupPassword" class="auth-toggle">
          <button class="toggle-btn" :class="{ active: isLogin }" @click="toggleMode(true)">
            {{ $t('auth.sign_in') }}
          </button>
          <button class="toggle-btn" :class="{ active: !isLogin }" @click="toggleMode(false)">
            {{ $t('auth.sign_up') }}
          </button>
        </div>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <div v-if="success" class="success-message">
          {{ success }}
        </div>
        <form v-if="!isLogin && !showVerification && !showForgotPassword && !showPasswordReset && !showSetupPassword" class="auth-form" @submit.prevent="handleRegister">
          <div class="input-group">
            <input v-model="formData.name" type="text" :placeholder="$t('auth.full_name')" class="input-field" required @input="validateName">
            <div v-if="nameError" class="error-text">{{ nameError }}</div>
          </div>
          <div class="input-group">
            <input v-model="formData.email" type="email" :placeholder="$t('auth.email')" class="input-field" :class="{ 'input-error': emailError }" required @input="validateEmail">
            <div v-if="emailError" class="error-text">{{ emailError }}</div>
          </div>
          <div class="input-group">
            <input v-model="formData.password" :type="showPassword ? 'text' : 'password'" :placeholder="$t('auth.password')" class="input-field" :class="{ 'input-error': passwordError }" required @input="validatePassword">
            <button type="button" class="password-toggle" @click="showPassword = !showPassword">
              {{ showPassword ? $t('auth.hide') : $t('auth.show') }}
            </button>
            <div v-if="passwordError" class="error-text">{{ passwordError }}</div>
            <div class="password-strength">
              <div :class="['strength-bar', strengthClass]" :style="{ width: strength + '%' }"></div>
            </div>
            <div class="password-hints">
              <span :class="{ met: formData.password.length >= 6 }">✓ 6+</span>
              <span :class="{ met: /[A-Z]/.test(formData.password) }">{{ $t('auth.hint_uppercase') }}</span>
              <span :class="{ met: /[0-9]/.test(formData.password) }">{{ $t('auth.hint_number') }}</span>
              <span :class="{ met: /[^A-Za-z0-9]/.test(formData.password) }">{{ $t('auth.hint_symbol') }}</span>
            </div>
          </div>
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <div v-if="isLoading" class="loading-spinner"></div>
            {{ isLoading ? $t('auth.sending_verification') : $t('auth.send_verification') }}
          </button>
        </form>
        <form v-if="showVerification" class="auth-form" @submit.prevent="handleVerifyEmail">
          <div class="verification-info">
            <h3>{{ $t('auth.check_email') }}</h3>
            <p>{{ $t('auth.verification_sent') }}</p>
            <p class="email-address">{{ pendingEmail }}</p>
          </div>
          <div class="input-group">
            <input v-model="verificationCode" type="text" :placeholder="$t('auth.enter_code')" class="input-field verification-input" maxlength="6" pattern="[0-9]{6}" required @input="formatVerificationCode">
          </div>
          <div class="verification-timer">
            <div v-if="resendTimer > 0" class="timer">
              {{ resendTimer }}s
            </div>
            <button v-else type="button" class="resend-btn" @click="handleResendCode" :disabled="isLoading">
              {{ $t('auth.resend_code') }}
            </button>
          </div>
          <button type="submit" class="submit-btn" :disabled="isLoading || verificationCode.length !== 6">
            <div v-if="isLoading" class="loading-spinner"></div>
            {{ isLoading ? $t('auth.verifying') : $t('auth.verify_create') }}
          </button>
          <button type="button" class="back-btn" @click="goBackToRegister">
            {{ $t('auth.back_to_registration') }}
          </button>
        </form>
        <form v-if="isLogin && !showForgotPassword && !showPasswordReset && !showSetupPassword" class="auth-form" @submit.prevent="handleLogin">
          <div class="input-group">
            <input v-model="formData.email" type="email" :placeholder="$t('auth.email')" class="input-field" :class="{ 'input-error': emailError }" required @input="validateEmail">
            <div v-if="emailError" class="error-text">{{ emailError }}</div>
          </div>
          <div class="input-group">
            <input v-model="formData.password" :type="showPassword ? 'text' : 'password'" :placeholder="$t('auth.password')" class="input-field" required>
            <button type="button" class="password-toggle" @click="showPassword = !showPassword">
              {{ showPassword ? $t('auth.hide') : $t('auth.show') }}
            </button>
          </div>
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <div v-if="isLoading" class="loading-spinner"></div>
            {{ isLoading ? $t('auth.signing_in') : $t('auth.sign_in') }}
          </button>
        </form>
        <form v-if="showForgotPassword" class="auth-form" @submit.prevent="sendPasswordResetCode">
          <div class="input-group">
            <input v-model="forgotPasswordEmail" type="email" :placeholder="$t('auth.email')" class="input-field" required>
          </div>
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <div v-if="isLoading" class="loading-spinner"></div>
            {{ isLoading ? $t('auth.sending_reset_code') : $t('auth.send_reset_code') }}
          </button>
          <button type="button" class="back-btn" @click="backToLogin">
            {{ $t('auth.back_to_login') }}
          </button>
        </form>
        <form v-if="showPasswordReset" class="auth-form" @submit.prevent="verifyResetCode">
          <div class="verification-info">
            <h3>{{ $t('auth.reset_password_title') }}</h3>
            <p>{{ $t('auth.reset_code_sent') }}</p>
            <p class="email-address">{{ forgotPasswordEmail }}</p>
          </div>
          <div class="input-group">
            <input v-model="resetCode" type="text" :placeholder="$t('auth.enter_reset_code')" class="input-field verification-input" maxlength="6" pattern="[0-9]{6}" required @input="formatResetCode">
          </div>
          <div class="input-group">
            <input v-model="newPassword" :type="showPassword ? 'text' : 'password'" :placeholder="$t('auth.new_password')" class="input-field" required>
            <button type="button" class="password-toggle" @click="showPassword = !showPassword">
              {{ showPassword ? $t('auth.hide') : $t('auth.show') }}
            </button>
          </div>
          <div class="input-group">
            <input v-model="confirmPassword" :type="showPassword ? 'text' : 'password'" :placeholder="$t('auth.confirm_password')" class="input-field" required>
          </div>
          <div class="verification-timer">
            <div v-if="resetTimer > 0" class="timer">
              {{ resetTimer }}s
            </div>
            <button v-else type="button" class="resend-btn" @click="resendResetCode" :disabled="isLoading">
              {{ $t('auth.resend_reset_code') }}
            </button>
          </div>
          <button type="submit" class="submit-btn" :disabled="isLoading || resetCode.length !== 6">
            <div v-if="isLoading" class="loading-spinner"></div>
            {{ isLoading ? $t('auth.resetting_password') : $t('auth.reset_password') }}
          </button>
          <button type="button" class="back-btn" @click="backToLogin">
            {{ $t('auth.back_to_login') }}
          </button>
        </form>


        <form v-if="showSetupPassword" class="auth-form" @submit.prevent="handleSetupPassword">
          <div class="input-group">
            <input  v-model="setupPassword"  :type="showPassword ? 'text' : 'password'"  :placeholder="$t('auth.setup_new_password')"  class="input-field"  required/>
            <button type="button" class="password-toggle" @click="showPassword = !showPassword">
              {{ showPassword ? $t('auth.hide') : $t('auth.show') }}
            </button>
            <div class="password-strength">
              <div :class="['strength-bar', setupStrengthClass]" :style="{ width: setupStrength + '%' }"></div>
            </div>
            <div class="password-hints">
              <span :class="{ met: setupPassword.length >= 8 }">✓ 8+</span>
              <span :class="{ met: /[A-Z]/.test(setupPassword) }">{{ $t('auth.hint_uppercase') }}</span>
              <span :class="{ met: /[0-9]/.test(setupPassword) }">{{ $t('auth.hint_number') }}</span>
              <span :class="{ met: /[^A-Za-z0-9]/.test(setupPassword) }">{{ $t('auth.hint_symbol') }}</span>
            </div>
          </div>
          <div class="input-group">
            <input v-model="setupConfirmPassword"  :type="showPassword ? 'text' : 'password'"  :placeholder="$t('auth.setup_confirm_password')" class="input-field"  required/>
          </div>
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <div v-if="isLoading" class="loading-spinner"></div>
            {{ isLoading ? $t('auth.setup_saving') : $t('auth.setup_submit') }}
          </button>
        </form>


        <div v-if="!showVerification && !showForgotPassword && !showPasswordReset && !showSetupPassword" class="social-divider">
          <span>{{ $t('auth.or_continue') }}</span>
        </div>
        <div v-if="!showVerification && !showForgotPassword && !showPasswordReset && !showSetupPassword" class="social-buttons">
          <button class="social-btn google-btn" @click="handleGoogleLogin" :disabled="isLoading">
            <svg class="social-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.796-1.672-4.152-2.693-6.735-2.693-5.522 0-10 4.477-10 10s4.478 10 10 10c8.396 0 10-7.524 10-10 0-0.671-0.068-1.325-0.182-1.977h-9.818z"/>
            </svg>
            <span v-if="isLoading && loadingProvider === 'google'">Connecting...</span>
            <span v-else>Google</span>
          </button>
        </div>
        <div class="auth-footer">
          <div v-if="!isLogin && !showVerification && !showForgotPassword && !showPasswordReset && !showSetupPassword" style="font-size: 0.9rem; color: #aaa; margin-bottom: 0;">
            {{ $t('auth.terms_prefix') }}
            <a href="#" @click.prevent="showTerms">{{ $t('auth.terms_link') }}</a>
            {{ $t('auth.terms_and') }}
            <a href="#" @click.prevent="showPrivacy">{{ $t('auth.privacy_link') }}</a>
          </div>
          <div v-if="isLogin && !showForgotPassword && !showPasswordReset && !showSetupPassword">
            <a href="#" @click.prevent="handleForgotPassword">
              {{ $t('auth.forgot_password') }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<script>
import axios from 'axios'
import { isNightTime } from '@/utils/timeUtils';

export default {
  props: { show: {type: Boolean, default: false} },
  data() {
    return {
      isLogin: true,
      showVerification: false,
      showPassword: false,
      isLoading: false,
      loadingProvider: null,
      showSetupPassword: false,
      setupToken: '',
      setupPassword: '',
      setupConfirmPassword: '',
      error: '',
      success: '',
      nameError: '',
      emailError: '',
      passwordError: '',
      verificationCode: '',
      pendingEmail: '',
      resendTimer: 0,
      resendInterval: null,
      remainingAttempts: 3,
      showForgotPassword: false,
      showPasswordReset: false,
      forgotPasswordEmail: '',
      resetCode: '',
      newPassword: '',
      confirmPassword: '',
      resetTimer: 0,
      resetInterval: null,
      formData: {name: '', email: '', password: ''},
      API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.5:5000'
    }
  },
  mounted() {
    this.handleOAuthCallback()
    this.handleSetupCallback()
    this.syncThemeColor()
  },
  computed: {
    strength() {
      if (!this.formData.password) return 0
      let strength = 0
      if (this.formData.password.length >= 6) strength += 25
      if (/[A-Z]/.test(this.formData.password)) strength += 25
      if (/[0-9]/.test(this.formData.password)) strength += 25
      if (/[^A-Za-z0-9]/.test(this.formData.password)) strength += 25
      return strength
    },
    strengthClass() {
      if (this.strength < 50) return 'weak'
      if (this.strength < 75) return 'medium'
      return 'strong'
    },
    currentTheme() { return isNightTime() ? 'night-mode' : 'day-mode' },
    setupStrength() {
      if (!this.setupPassword) return 0
      let s = 0
      if (this.setupPassword.length >= 8)  s += 25
      if (/[A-Z]/.test(this.setupPassword)) s += 25
      if (/[0-9]/.test(this.setupPassword)) s += 25
      if (/[^A-Za-z0-9]/.test(this.setupPassword)) s += 25
      return s
    },
    setupStrengthClass() {
      if (this.setupStrength < 50) return 'weak'
      if (this.setupStrength < 75) return 'medium'
      return 'strong'
    }
  },
  methods: {
    // The UI language this visitor is currently browsing in — the one they
    // picked on the landing page. Sent along with signup so the new account
    // starts in that language rather than the server's 'en' default, which
    // otherwise wins over the browser's copy as soon as JinniChat loads.
    //
    // Reads the Vuex i18n locale first (the live value the picker sets), then
    // the localStorage keys the i18n store mirrors it into, so it still works
    // if this modal is opened before the store has hydrated.
    currentLanguage() {
      try {
        const fromStore = this.$store?.state?.i18n?.locale
        if (fromStore) return fromStore
        const settings = JSON.parse(localStorage.getItem('jinni_settings') || '{}')
        return settings.language || localStorage.getItem('jinni_language') || localStorage.getItem('lang') || 'en'
      } catch (_e) {
        return 'en'
      }
    },
    // Keep the browser chrome (mobile address-bar) + page background in sync with
    // the day/night look — same colors/approach App.vue + LandingPage use. Harmless
    // no-op when this modal is overlaid on an already-themed page; matters if /auth
    // is shown standalone (direct link, refresh, or OAuth redirect).
    syncThemeColor() {
      // Clock-based like the landing page. Must write the `background`
      // SHORTHAND (not backgroundColor): App.vue paints a store-theme gradient
      // IMAGE on <html>, and color-only writes left it showing (night auth
      // page showed the day-cream overscroll). Halves swapped: the canvas
      // tiles beyond the page, so top overscroll shows a tile's BOTTOM half.
      const theme = this.currentTheme === 'night-mode' ? 'dark' : 'light'
      const p = theme === 'dark'
        ? { top: '#0a0118', bottom: '#080313' }   // starry overlay ends
        : { top: '#f9f5eb', bottom: '#e0a082' }   // day overlay gradient ends
      document.documentElement.setAttribute('data-theme', theme)
      document.documentElement.style.background =
        `linear-gradient(${p.bottom} 50%, ${p.top} 50%)`
      document.body.style.backgroundColor = p.top
      let meta = document.querySelector('meta[name="theme-color"]:not([media])')
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'theme-color')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', p.top)
      // Safari re-derives canvas/toolbar tint only on a document scroll; give
      // 2px slack when the page has nothing to scroll (same as App.vue).
      const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      if (isIOS) {
        requestAnimationFrame(() => {
          const needsSlack = document.documentElement.scrollHeight <= window.innerHeight
          if (needsSlack) document.body.style.minHeight = 'calc(100vh + 2px)'
          window.scrollBy(0, 1)
          requestAnimationFrame(() => {
            window.scrollBy(0, -1)
            if (needsSlack) document.body.style.minHeight = ''
          })
        })
      }
    },
    getSubtitle() {
      if (this.showVerification) { return this.$t('auth.verification_sent') }
      if (this.showForgotPassword) { return this.$t('auth.forgot_subtitle') }
      if (this.showPasswordReset) { return this.$t('auth.reset_subtitle') }
      if (this.showSetupPassword) { return this.$t('auth.setup_password_subtitle') }
      return this.isLogin ? this.$t('auth.subtitle_login') : this.$t('auth.subtitle_register')
    },
    handleForgotPassword() {
      this.showForgotPassword = true
      this.isLogin = false
      this.error = ''
      this.success = ''
    },
    handleSetupCallback() {
      const urlParams = new URLSearchParams(window.location.search)
      const setupToken = urlParams.get('setup')
      if (!setupToken) return
      this.setupToken = setupToken
      this.showSetupPassword = true
      this.isLogin = true
      this.showVerification = false
      this.showForgotPassword = false
      this.showPasswordReset = false
      window.history.replaceState({}, document.title, window.location.pathname)
      this.$emit('open')
    },
    async handleSetupPassword() {
      this.isLoading = true
      this.error = ''
      try {
        if (!this.setupPassword || !this.setupConfirmPassword) { throw new Error(this.$t('auth.setup_both_fields')) }
        if (this.setupPassword !== this.setupConfirmPassword) { throw new Error(this.$t('auth.passwords_dont_match')) }
        if (this.setupPassword.length < 8) { throw new Error(this.$t('auth.setup_password_min')) }
        const response = await axios.post(`${this.API_BASE_URL}/api/auth/setup-password`, { token: this.setupToken, password: this.setupPassword })
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        this.success = response.data.message
        this.showSetupPassword = false
        setTimeout(() => {
          this.$emit('login-success', response.data)
          this.close()
        }, 1500)
      } catch (error) { this.error = error.response?.data?.error || error.message || this.$t('auth.setup_error') }
      finally {this.isLoading = false}
    },
    close() {
      this.clearResendTimer()
      this.clearResetTimer()
      this.$emit('close')
    },
    toggleMode(loginMode) {
      this.isLogin = loginMode
      this.showVerification = false
      this.error = ''
      this.success = ''
      this.formData = {name: '',email: '',password: ''}
      this.verificationCode = ''
      this.resetValidation()
      this.clearResendTimer()
    },
    resetValidation() {
      this.nameError = ''
      this.emailError = ''
      this.passwordError = ''
    },
    validateName() { this.nameError = this.formData.name.trim().length >= 2 ? '' : this.$t('auth.name_error') },
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      this.emailError = emailRegex.test(this.formData.email) ? '' : this.$t('auth.email_error')
    },
    validatePassword() {
      if (!this.formData.password) {this.passwordError = this.$t('auth.password_required')} 
      else if (this.formData.password.length < 6) {this.passwordError = this.$t('auth.password_error')} 
      else {this.passwordError = ''}
    },
    validateForm() {
      if (!this.isLogin) {this.validateName()}
      this.validateEmail()
      this.validatePassword()
      if (!this.isLogin && this.nameError) {throw new Error(this.nameError)}
      if (this.emailError) {throw new Error(this.emailError)}
      if (this.passwordError) {throw new Error(this.passwordError)}
    },
    async handleRegister() {
      this.isLoading = true
      this.error = ''
      this.success = ''
      try {
        this.validateForm()
        const response = await axios.post(`${this.API_BASE_URL}/api/auth/send-verification`,{name: this.formData.name.trim(), email: this.formData.email.toLowerCase().trim(), password: this.formData.password, language: this.currentLanguage()},{headers: {'Content-Type': 'application/json'}})
        this.pendingEmail = response.data.email
        this.showVerification = true
        this.startResendTimer()
        this.success = 'Verification code sent to your email!'
      } catch (error) {
        console.error('Registration error:', error)
        if (error.response?.data?.error) {this.error = error.response.data.error} 
        else if (error.response?.data?.details) { this.error = error.response.data.details.map(d => d.message).join(', ')} 
        else if (error.message) {this.error = error.message} 
        else {this.error = this.$t('auth.unexpected_error')}
      } finally {this.isLoading = false}
    },
    formatVerificationCode() {this.verificationCode = this.verificationCode.replace(/\D/g, '').slice(0, 6)},
    async handleVerifyEmail() {
      this.isLoading = true
      this.error = ''
      try {
        const response = await axios.post(`${this.API_BASE_URL}/api/auth/verify-email`,{email: this.pendingEmail,code: this.verificationCode, language: this.currentLanguage()},{headers: {'Content-Type': 'application/json'}})
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token)
          localStorage.setItem('user', JSON.stringify(response.data.user))
          this.success = this.$t('auth.account_created')
          this.clearResendTimer()
          setTimeout(() => {
            this.$emit('login-success', response.data)
            this.close()
          }, 1500)
        }
      } catch (error) {
        console.error('Verification error:', error);
        if (error.response?.data?.blocked) {
          this.error = this.$t('auth.too_many_attempts');
          this.showVerification = false;
        }
        else if (error.response?.data?.attemptsLeft !== undefined) {
          this.error = `${this.$t('auth.invalid_code')} (${error.response.data.attemptsLeft} ${this.$t('auth.attempts_left').replace('{count}', error.response.data.attemptsLeft)})`;
          this.remainingAttempts = error.response.data.attemptsLeft;
        }
        else {this.error = error.response?.data?.error || this.$t('auth.unexpected_error')}
      } finally {this.isLoading = false}
    },
    async handleResendCode() {
      this.isLoading = true;
      this.error = '';
      this.remainingAttempts = 3;
      try {
        const response = await axios.post(`${this.API_BASE_URL}/api/auth/resend-verification`,{ email: this.pendingEmail });
        if (response.status === 200) {
          this.success = this.$t('auth.new_code_sent');
          this.verificationCode = '';
          this.startResendTimer();
        }
      } catch (error) {
        if (error.response?.data?.blocked) {this.error = this.$t('auth.too_many_attempts')} 
        else {this.error = error.response?.data?.error || this.$t('auth.unexpected_error')}
      } finally {this.isLoading = false}
    },
    startResendTimer() {
      this.resendTimer = 60
      this.resendInterval = setInterval(() => {
        this.resendTimer--
        if (this.resendTimer <= 0) {this.clearResendTimer()}
      }, 1000)
    },
    clearResendTimer() {
      if (this.resendInterval) {
        clearInterval(this.resendInterval)
        this.resendInterval = null
      }
      this.resendTimer = 0
    },
    goBackToRegister() {
      this.showVerification = false
      this.verificationCode = ''
      this.pendingEmail = ''
      this.clearResendTimer()
      this.error = ''
      this.success = ''
    },
    async handleLogin() {
      this.isLoading = true
      this.error = ''
      this.success = ''
      try {
        this.validateForm()
        const response = await axios.post(`${this.API_BASE_URL}/api/auth/login`,{email: this.formData.email.toLowerCase().trim(), password: this.formData.password},{headers: {'Content-Type': 'application/json'}})
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token)
          localStorage.setItem('user', JSON.stringify(response.data.user))
          this.success = this.$t('auth.welcome_back')
          setTimeout(() => {
            this.$emit('login-success', response.data)
            this.close()
          }, 1500)
        }
      } catch (error) {
        console.error('Login error:', error)
        if (error.response?.data?.error) {this.error = error.response.data.error} 
        else if (error.message) {this.error = error.message} 
        else {this.error = this.$t('auth.unexpected_error')}
      } finally { this.isLoading = false }
    },
    async handleGoogleLogin() {
      this.error = ''
      this.isLoading = true
      this.loadingProvider = 'google'
      // Pass the chosen language across the Google round-trip — the server
      // can't read localStorage, so without it a Google signup always lands
      // on the English default.
      try { window.location.href = `${this.API_BASE_URL}/auth/google?lang=${encodeURIComponent(this.currentLanguage() || 'en')}` }
      catch (error) {
        console.error('Google login error:', error)
        this.error = this.$t('auth.google_error')
        this.isLoading = false
        this.loadingProvider = null
      }
    },
    handleOAuthCallback() {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      const provider = urlParams.get('provider')
      const error = urlParams.get('error')
      if (token && provider === 'google') {
        localStorage.setItem('authToken', token)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          const user = {id: payload.id, email: payload.email, name: payload.name}
          localStorage.setItem('user', JSON.stringify(user))
          console.log('Google login successful!', user)
          this.$emit('login-success', { token, user })
        } catch (decodeError) {console.error('Token decode error:', decodeError)}
        window.history.replaceState({}, document.title, window.location.pathname)
      } else if (error) {
        let errorMessage = 'Login failed'
        switch (error) {
          case 'google_failed':
            errorMessage = 'Google login was cancelled or failed'
            break
          case 'token_generation_failed':
            errorMessage = 'Login successful but token generation failed'
            break
          case 'account_deactivated':
            errorMessage = 'This account has been closed and can no longer be used. If you believe this is a mistake, please contact support.'
            break
          default:
            errorMessage = 'Authentication error occurred'
        }
        console.error('OAuth Error:', errorMessage)
        // Actually surface it — previously this message was computed but never
        // shown, so OAuth failures (including a closed account) looked silent.
        this.error = errorMessage
        this.isLogin = true
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    },
    async sendPasswordResetCode() {
      this.isLoading = true;
      this.error = '';
      this.success = '';
      try {
        if (!this.forgotPasswordEmail) {throw new Error(this.$t('auth.email_required'))}
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.forgotPasswordEmail)) {throw new Error(this.$t('auth.email_error'))}
        const response = await axios.post(`${this.API_BASE_URL}/api/auth/forgot-password`,{ email: this.forgotPasswordEmail.toLowerCase().trim() },{ headers: { 'Content-Type': 'application/json' } });
        this.showPasswordReset = true;
        this.showForgotPassword = false;
        this.startResetTimer();
        this.success = this.$t('auth.reset_code_sent');
      } catch (error) {
        console.error('Forgot password error:', error);
        this.error = error.response?.data?.error || error.message || this.$t('auth.unexpected_error');
      } finally {this.isLoading = false}
    },
    async verifyResetCode() {
      this.isLoading = true;
      this.error = '';
      try {
        if (!this.resetCode || !this.newPassword || !this.confirmPassword) {throw new Error(this.$t('auth.all_fields_required'))}
        if (this.newPassword !== this.confirmPassword) {throw new Error(this.$t('auth.passwords_dont_match'))}
        if (this.newPassword.length < 6) {throw new Error(this.$t('auth.password_error'))}
        const response = await axios.post(`${this.API_BASE_URL}/api/auth/reset-password`, { email: this.forgotPasswordEmail, code: this.resetCode, newPassword: this.newPassword }, { headers: { 'Content-Type': 'application/json' } });
        this.success = this.$t('auth.password_reset_success');
        this.clearResetTimer();
        setTimeout(() => {this.backToLogin()}, 2000);
      } catch (error) {
        console.error('Reset password error:', error);
        this.error = error.response?.data?.error || error.message || this.$t('auth.unexpected_error');
      } finally {this.isLoading = false}
    },
    async resendResetCode() {
      this.isLoading = true;
      this.error = '';
      try {
        await axios.post(`${this.API_BASE_URL}/api/auth/resend-reset-code`, { email: this.forgotPasswordEmail });
        this.success = this.$t('auth.new_reset_code_sent');
        this.resetCode = '';
        this.startResetTimer();
      } catch (error) { this.error = error.response?.data?.error || this.$t('auth.unexpected_error') } 
      finally { this.isLoading = false }
    },
    startResetTimer() {
      this.resetTimer = 60;
      this.resetInterval = setInterval(() => {
        this.resetTimer--;
        if (this.resetTimer <= 0) { this.clearResetTimer() }
      }, 1000)
    },
    clearResetTimer() {
      if (this.resetInterval) {
        clearInterval(this.resetInterval);
        this.resetInterval = null;
      }
      this.resetTimer = 0;
    },
    backToLogin() {
      this.showForgotPassword = false;
      this.showPasswordReset = false;
      this.isLogin = true;
      this.forgotPasswordEmail = '';
      this.resetCode = '';
      this.newPassword = '';
      this.confirmPassword = '';
      this.error = '';
      this.success = '';
      this.clearResetTimer();
    },
    formatResetCode() { this.resetCode = this.resetCode.replace(/\D/g, '').slice(0, 6) },
    showTerms() { 
      this.close();
      this.$router.push('/terms');
    },
    showPrivacy() { 
      this.close();
      this.$router.push('/privacy');
    }
  },
  beforeUnmount() {
    this.clearResendTimer()
    this.clearResetTimer()
  }
}
</script>


<style scoped>
.password-hints { display: flex; gap: 8px; flex-wrap: wrap; padding: 2px 0 0 0; justify-content: center; }
.password-hints span { font-size: 0.75rem; color: #666; transition: color 0.2s; }
.password-hints span.met { color: #0c6; }
.auth-modal-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:radial-gradient(ellipse at center,#1a0933 0%,#0f0520 50%,#05020d 80%,#000 100%);display:flex;align-items:flex-start;justify-content:center;z-index:1000;backdrop-filter:blur(5px);overflow-y:auto;padding:40px 20px}
.auth-container{width:100%;max-width:450px;padding:20px;position:relative;margin:auto}
.close-button{position:absolute;top:20px;right:20px;background:0 0;border:none;color:#aaa;font-size:1.8rem;cursor:pointer;width:40px;height:40px;display:flex;align-items:center;justify-content:center;transition:all .3s ease;z-index:10;border-radius:50%}
.close-button:hover{color:#d4af37;background:rgba(255,255,255,.1)}
.auth-card{background:0 0;backdrop-filter:blur(15px);border-radius:20px;padding:30px;width:100%;box-shadow:0 0 40px #000;position:relative;z-index:2;overflow-y:auto}
.auth-card::-webkit-scrollbar{width:5px}
.auth-card::-webkit-scrollbar-thumb{background:rgba(212,175,55,.5);border-radius:10px}
.auth-header{text-align:center;margin-bottom:0}
.auth-title{font-size:2.5rem;font-weight:700;background:linear-gradient(5deg,#d4af37,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:0;text-shadow:0 0 15px rgba(212,175,55,.3)}
.auth-subtitle{color:#e0e0e0;font-size:1.1rem;margin-bottom:20px}
.auth-toggle{display:flex;background:rgba(255,255,255,.1);border-radius:50px;padding:3px;margin-bottom:20px}
.toggle-btn{flex:1;padding:12px 20px;background:0 0;border:none;color:#ccc;font-size:1rem;border-radius:50px;cursor:pointer;transition:all .3s ease}
.toggle-btn.active{background:linear-gradient(45deg,#d4af37,#ff8c00);color:#fff;box-shadow:0 0 15px rgba(212,175,55,.3)}
.auth-form{display:flex;flex-direction:column;gap:20px}
.input-group{position:relative}
.input-field{position:relative;width:100%;padding:15px 20px;border:none;background:rgba(255,255,255,.1);border-radius:50px;color:#fff;font-size:1rem;transition:all .3s ease}
.input-field:focus{outline:0;border-color:#d4af37;box-shadow:0 0 15px rgba(212,175,55,.5)}
.input-field::placeholder{color:#aaa}
.password-toggle{position:absolute;right:20px;top:calc(15px + .1rem);background:0 0;border:none;color:#aaa;cursor:pointer;font-size:1rem;padding:0;margin:0;line-height:1rem;height:1rem}
.password-toggle:hover{color:#d4af37}
.input-error{border-color:#f4d!important}
.error-text{color:#f99;font-size:.8rem;padding:5px 20px;margin-top:5px}
.password-strength{height:2px;background:rgba(255,255,255,.1);margin-top:8px;border-radius:2px;overflow:hidden}
.strength-bar{height:100%;transition:width .3s ease}
.weak{background:#f4d}
.medium{background:#fc0}
.strong{background:#0c6}
.verification-info{text-align:center;padding-top:15px;padding-left:15px;padding-right:15px;border-radius:20px;position:relative;overflow:hidden}
.verification-info h3{color:#d4af37;margin-bottom:8px;font-size:1.3rem;font-weight:600}
.verification-info p{color:#e0e0e0;font-size:.95rem}
.email-address{color:#d4af37;font-weight:500;padding:8px 14px;border-radius:20px;display:inline-block;font-size:1rem}
.verification-input{text-align:center;font-size:1rem;letter-spacing:.05rem;font-weight:400;padding:15px 20px}
.verification-timer{text-align:center;margin:0}
.timer{color:#d4d4d4;font-size:.95rem}
.resend-btn{background:0 0;border:none;color:#d4af37;cursor:pointer;font-size:1rem;transition:color .3s ease}
.resend-btn:hover:not(:disabled){color:#ff8c00}
.resend-btn:disabled{color:#666;cursor:not-allowed;text-decoration:none}
.back-btn{background:0 0;border:1px solid #231639;color:#aaa;padding:12px 24px;border-radius:25px;font-size:.95rem;cursor:pointer;transition:all .3s ease;width:100%;display:flex;align-items:center;justify-content:center;gap:8px}
.back-btn:hover{color:#d4af37;background:rgba(255,255,255,.1)}
.back-btn:active{transform:translateY(0)}
.submit-btn{background:linear-gradient(45deg,#d4af37,#ff8c00);color:#fff;border:none;padding:12px 30px;border-radius:50px;font-size:1.1rem;font-weight:700;cursor:pointer;transition:all .4s cubic-bezier(.175,.885,.32,1.275);box-shadow:0 0 15px rgba(212,175,55,.3);display:flex;align-items:center;justify-content:center;gap:10px}
.submit-btn:hover:not(:disabled){box-shadow:0 0 12px rgba(212,175,55,.5)}
.submit-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}
.loading-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.3);border-top:2px solid #fff;border-radius:50%;animation:spin 1s linear infinite}
@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
.social-divider{text-align:center;margin:15px 0;position:relative}
.social-divider::before{content:'';position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,.2)}
.social-divider span{padding:0 20px;color:#aaa;font-size:.9rem}
.social-buttons{display:flex;gap:17px}
.social-btn{flex:1;padding:14px 20px;background:rgba(255,255,255,.1);border:none;border-radius:50px;color:#fff;cursor:pointer;transition:all .3s ease;display:flex;align-items:center;justify-content:center;gap:8px;font-size:.95rem}
.social-btn:hover:not(:disabled){background:rgba(255,255,255,.2)}
.social-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}
.social-icon{width:20px;height:20px;fill:currentColor}
.error-message{background:rgba(255,0,0,.2);color:#f99;padding:12px 18px;border-radius:25px;font-size:.9rem;text-align:center;margin-bottom:15px;animation:shake .5s}
.success-message{background:rgba(212,175,55,.25);color:#f4d03f;padding:12px 18px;border-radius:25px;font-size:.9rem;text-align:center;margin-bottom:15px;animation:fadeIn .5s}
@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.auth-footer{text-align:center;margin-top:15px}
.auth-footer a{color:#d4af37;text-decoration:none;transition:color .3s ease}
.auth-footer a:hover{color:#ff8c00}
@media(max-width:768px){.auth-card{padding:30px 20px}.auth-title{font-size:2.5rem}.social-buttons{flex-direction:column}}
@media(max-width:480px){.auth-modal-overlay{padding:0}.auth-card{padding:23px}.close-button{top:12px;right:12px}.verification-input{font-size:1rem;letter-spacing:.15rem;padding:12px 16px}.timer{font-size:.9rem;padding:6px 12px}.verification-info{padding:20px}.back-btn{font-size:.9rem;padding:10px 20px}}
.back-btn:focus,.resend-btn:focus{outline:2px solid #d4af37;outline-offset:2px}
.bottle-container{display:flex;justify-content:center;align-items:center;margin-bottom:0}
.bottle-image{width:130px;height:70px;object-fit:contain;filter:drop-shadow(0 4px 10px rgba(212,175,55,.3))}
.auth-modal-overlay.day-mode{background:linear-gradient(to bottom,#f9f5eb 0%,#f2e3d3 8%,#ecd6c2 16%,#e9ccb3 24%,#ebc4a6 32%,#efbc9b 40%,#f3b692 48%,#f7be98 56%,#f9c8a0 64%,#f5c099 72%,#f0b893 80%,#ebb08d 88%,#e6a888 96%,#e0a082 100%)}
.auth-modal-overlay.day-mode .auth-card{background:rgba(255,255,255,.95);box-shadow:0 0 40px rgba(139,107,61,.2)}
.auth-modal-overlay.day-mode .auth-subtitle{color:#5a4a42}
.auth-modal-overlay.day-mode .close-button{color:#8b4513}
.auth-modal-overlay.day-mode .close-button:hover{color:#d4af37;background:rgba(212,175,55,.1)}
.auth-modal-overlay.day-mode .input-field{background:rgba(255,255,255,.8);color:#3c2a1e;border:1px solid rgba(139,107,61,.2)}
.auth-modal-overlay.day-mode .input-field::placeholder{color:rgba(92,74,66,.6)}
.auth-modal-overlay.day-mode .input-field:focus{border-color:#d4af37;box-shadow:0 0 15px rgba(212,175,55,.3)}
.auth-modal-overlay.day-mode .password-toggle{color:#8b4513}
.auth-modal-overlay.day-mode .password-toggle:hover{color:#d4af37}
.auth-modal-overlay.day-mode .toggle-btn{color:#5a4a42}
.auth-modal-overlay.day-mode .toggle-btn.active{color:#fff}
.auth-modal-overlay.day-mode .social-btn{background:rgba(255,255,255,.9);color:#5a4a42;border:1px solid rgba(139,107,61,.2)}
.auth-modal-overlay.day-mode .social-btn:hover:not(:disabled){background:rgba(212,175,55,.1)}
.auth-modal-overlay.day-mode .back-btn{border-color:rgba(139,107,61,.3);color:#8b4513}
.auth-modal-overlay.day-mode .back-btn:hover{background:rgba(212,175,55,.1);border-color:#d4af37;color:#d4af37}
.auth-modal-overlay.day-mode .resend-btn{color:#b7791f}
.auth-modal-overlay.day-mode .resend-btn:hover:not(:disabled){color:#d4af37}
.auth-modal-overlay.day-mode .verification-info h3{color:#b7791f}
.auth-modal-overlay.day-mode .verification-info p{color:#5a4a42}
.auth-modal-overlay.day-mode .email-address{color:#b7791f;background:rgba(212,175,55,.1)}
.auth-modal-overlay.day-mode .timer{color:#8b4513}
.auth-modal-overlay.day-mode .error-message{background:rgba(229,62,62,.1);color:#e53e3e;border:1px solid rgba(229,62,62,.2)}
.auth-modal-overlay.day-mode .success-message{background:rgba(212,175,55,.15);color:#b7791f;border:1px solid rgba(184,125,78,.3)}
.auth-modal-overlay.day-mode .error-text{color:#e53e3e}
.auth-modal-overlay.day-mode .auth-footer a{color:#b7791f}
.auth-modal-overlay.day-mode .auth-footer a:hover{color:#d4af37}
.auth-modal-overlay.day-mode .social-divider::before{background:rgba(139,107,61,.3)}
.auth-modal-overlay.day-mode .social-divider span{color:#8b4513}
.auth-modal-overlay.day-mode .auth-toggle{background:rgba(139,107,61,.1)}
.auth-modal-overlay.day-mode .input-error{border-color:#e53e3e!important}
.auth-modal-overlay.day-mode .verification-input{background:rgba(255,255,255,.9)}
</style>