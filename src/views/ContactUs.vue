<template>
  <div class="contact-page" :class="currentTheme">
    <DesertSky v-if="currentTheme === 'day-mode'" />
    <header class="contact-header">
      <div class="header-top">
        <button @click="goBack" class="back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="currentTheme === 'night-mode' ? '#c084fc' : '#8B4513'" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {{ $t('contact.back') }}
        </button>
      </div>
      <div class="header-content">
        <h1 class="page-title">{{ $t('contact.title') }}</h1>
        <p class="page-subtitle">
          {{ $t('contact.subtitle') }}
        </p>
      </div>
    </header>
    <main class="contact-main">
      <div class="contact-container">
        <div class="contact-form-section">
          <div class="section-card form-card">
            <h2 class="section-title">{{ $t('contact.form_title') }}</h2>
            <p class="section-description">
              {{ $t('contact.form_description') }}
            </p>
            <form @submit.prevent="submitForm" class="contact-form">
              <div class="form-group">
                <label>{{ $t('contact.subject') }}</label>
                <div class="custom-select-wrapper" v-click-outside="closeDropdown">
                  <button type="button" class="custom-select-trigger" :class="{ open: dropdownOpen, 'has-value': formData.subject }" @click="dropdownOpen = !dropdownOpen">
                    <span class="trigger-text">
                      <span v-if="!formData.subject" class="placeholder-text">{{ $t('contact.select_topic') }}</span>
                      <span v-else class="selected-icon">{{ selectedOption.icon }}</span>
                      <span v-if="formData.subject">{{ selectedOption.label }}</span>
                    </span>
                    <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                  <transition name="dropdown">
                    <div v-if="dropdownOpen" class="custom-options">
                      <button v-for="opt in topicOptions" :key="opt.value" type="button" class="custom-option" :class="{ active: formData.subject === opt.value }" @click="selectOption(opt)">
                        <span class="option-label">{{ opt.label }}</span>
                        <svg v-if="formData.subject === opt.value" class="check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      </button>
                    </div>
                  </transition>
                </div>
              </div>
              <div class="form-group">
                <label for="message">{{ $t('contact.message') }}</label>
                <div class="input-wrapper">
                  <textarea id="message"  v-model="formData.message"  :placeholder="$t('contact.message_placeholder')" rows="5" required></textarea>
                </div>
              </div>
              <div class="form-group email-group">
                <label for="email">{{ $t('contact.response_sent_to') }}</label>
                <div class="email-display">
                    <input type="email" id="email" v-model="formData.email" placeholder="you@example.com" disabled/>
                </div>
              </div>
              <button type="submit" class="submit-btn" :class="{ 'submitting': isSubmitting }" :disabled="isSubmitting">
                <span class="btn-text">
                  {{ isSubmitting ? $t('contact.sending') : $t('contact.send_message') }}
                </span>
              </button>
              <p class="form-note">
                {{ $t('contact.response_time') }}
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
    <footer class="contact-footer">
      <div class="footer-content">
        <div class="footer-links">
          <router-link :to="privacyPath" class="footer-link">{{ $t('contact.privacy_policy') }}</router-link>
          <router-link :to="termsPath" class="footer-link">{{ $t('contact.terms_of_service') }}</router-link>
        </div>
        <p class="copyright">{{ $t('contact.copyright') }}</p>
      </div>
    </footer>
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeModal">
      <div class="success-modal" @click.stop>
        <h3 class="modal-title">{{ $t('contact.modal.title') }}</h3>
        <p class="modal-message">
          {{ $t('contact.modal.message', { email: formData.email }) }}
        </p>
        <button class="modal-btn" @click="closeModal">{{ $t('contact.modal.button') }}</button>
      </div>
    </div>
  </div>
</template>




<script>
import { isNightTime } from '@/utils/timeUtils';
import DesertSky from '@/components/ui/DesertSky.vue';
export default {
  name: 'ContactPage',
  components: {DesertSky},
  directives: {
    'click-outside': {
      mounted(el, binding) {
        el._clickOutside = (e) => { if (!el.contains(e.target)) binding.value() };
        document.addEventListener('click', el._clickOutside);
      },
      unmounted(el) { document.removeEventListener('click', el._clickOutside) }
    }
  },
  data() {
    return {
      formData: { email: '', subject: '', message: '' },
      isSubmitting: false,
      showSuccessModal: false,
      dropdownOpen: false,
      topicOptions: [
        { value: 'general',      label: this.$t('contact.subjects.general') },
        { value: 'technical',    label: this.$t('contact.subjects.technical') },
        { value: 'billing',      label: this.$t('contact.subjects.billing') },
        { value: 'feature',      label: this.$t('contact.subjects.feature') },
        { value: 'partnership',  label: this.$t('contact.subjects.partnership') },
      ]
    }
  },
  computed: {
    selectedOption() {return this.topicOptions.find(o => o.value === this.formData.subject) || {}},
    // Business owners (accounts linked to a Business listing — e.g. reaching
    // Contact from the business dashboard) get the business legal pages;
    // travellers get the general ones.
    isBusinessUser() {
      try { return !!JSON.parse(localStorage.getItem('user') || '{}').businessId }
      catch { return false }
    },
    privacyPath() { return this.isBusinessUser ? '/business/privacy' : '/privacy?returnTo=contact' },
    termsPath()   { return this.isBusinessUser ? '/business/terms'   : '/terms?returnTo=contact' },
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
  mounted() { this.loadUserEmail() },
  methods: {
    selectOption(opt) {
      this.formData.subject = opt.value;
      this.dropdownOpen = false;
    },
    closeDropdown() { this.dropdownOpen = false; },
    loadUserEmail() {
      try {
        const user = localStorage.getItem('user');
        if (user) {
          const userData = JSON.parse(user);
          this.formData.email = userData.email || '';
        }
      } catch (error) { console.error('Failed to load user email:', error) }
    },
    async submitForm() {
      if (!this.formData.subject || !this.formData.message) {
        alert(this.$t('contact.fill_required'));
        return;
      }
      this.isSubmitting = true;
      try {
        const token = localStorage.getItem('authToken');
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${API_BASE_URL}/api/contact`, {method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ email: this.formData.email, subject: this.formData.subject, message: this.formData.message })});
        if (!response.ok) { throw new Error('Failed to send message') }
        this.showSuccessModal = true;
        this.formData = { email: this.formData.email, subject: '', message: '' };
      } catch (error) {
        console.error('Error sending message:', error);
        alert(this.$t('contact.send_error'));
      } finally { this.isSubmitting = false }
    },
    closeModal() {
      this.showSuccessModal = false;
      this.goBack();
    },
    goBack() {
      // If there's a valid previous route in history, go back to it
      if (window.history.length > 1 && this.$router.options.history.state?.back) {this.$router.back()} 
      else {
        // Fallback: business owners go to dashboard, regular users go to chat
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          this.$router.push(user.businessId ? '/business/dashboard' : '/chat');
        } catch {this.$router.push('/chat')}
      }
    }
  }
}
</script>




<style scoped>
/* Base */
.contact-page{min-height:100vh;transition:background 0.5s ease,color 0.3s ease;font-family:'Segoe UI',system-ui,-apple-system,'Noto Sans Armenian',sans-serif;display:flex;flex-direction:column;position:relative;z-index:1}
/* Header */
.contact-header{display:flex;flex-direction:column;padding:1.5rem 2rem;max-width:1400px;margin:0 auto;width:100%;position:relative;z-index:2;}
.header-top{width:100%;display:flex;justify-content:center}
.back-btn{margin-bottom: 30px;display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:10px;border:none;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s ease;background:transparent;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.header-content{text-align:center;width:100%}
.page-title{font-size:2rem;font-weight:700;margin-bottom:0.5rem}
.page-subtitle{font-size:1rem;opacity:0.9;line-height:1.6;max-width:600px;margin:0 auto}
/* Main Content */
.contact-main{flex:1;max-width:1400px;margin:0 auto;padding:0 2rem;width:100%;position:relative;z-index:2}
.contact-container{display:flex;justify-content:center}
/* Section Cards */
.section-card{border-radius:16px;padding:2rem;transition:all 0.3s;max-width:600px;width:100%;backdrop-filter:blur(10px) saturate(180%);-webkit-backdrop-filter:blur(10px) saturate(180%)}
.section-title{font-size:1.5rem;font-weight:600;margin-bottom:0.75rem}
.section-description{margin-bottom:1.5rem;line-height:1.6;opacity:0.9}
/* Form */
.contact-form{display:flex;flex-direction:column;gap:1.5rem}
.email-display input{cursor:default;border:none;background:transparent;padding-left:0;font-size:1.1rem;font-weight:500;}
.form-group label{display:block;font-weight:600;margin-bottom:0.5rem;font-size:0.95rem}
.input-wrapper{position:relative}
.input-wrapper input,.input-wrapper select,.input-wrapper textarea{width:100%;padding:0.9rem 1rem;border-radius:10px;border:none;font-size:1rem;font-family:inherit;transition:all 0.3s;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.input-wrapper textarea{resize:none}
.email-display input{cursor:default;opacity:0.85;border:none;background:transparent;padding:0!important;margin:0;line-height:1;font-size:0.95rem;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;width:100%;max-width:100%;box-sizing:border-box}
.email-group{display:flex;align-items:center;gap:0.3rem}
.email-group label{margin-bottom:0;flex-shrink:0;font-size:0.95rem;font-weight:500;line-height:1}
.email-group .email-display{flex:1;min-width:0;overflow:hidden}
.input-wrapper select{cursor:pointer;appearance:none;background-repeat:no-repeat;background-position:right 1rem center;padding-right:2.5rem}
/* Submit Button */
.submit-btn{display:flex;align-items:center;justify-content:center;gap:0.75rem;padding:0.8rem 2rem;border-radius:25px;border:none;font-size:1.1rem;font-weight:600;cursor:pointer;transition:all 0.3s;align-self:center;box-shadow:inset 0 1px 0 rgba(255,255,255,0.3)}
.submit-btn:disabled{opacity:0.7;cursor:not-allowed}
.submit-btn:active:not(:disabled){transform:scale(0.98)}
.form-note{text-align:center;font-size:0.9rem;opacity:0.8}
/* Footer */
.contact-footer{margin-top:auto;padding:2.5rem 1rem 0.5rem 1rem;position:relative;z-index:2}
.footer-content{max-width:1400px;margin:0 auto;text-align:center}
.footer-logo{font-size:1.5rem;font-weight:700;margin-bottom:0.75rem}
.footer-tagline{font-size:1rem;margin-bottom:0.5rem;opacity:0.9}
.footer-links{display:flex;justify-content:center;gap:2rem;margin-bottom:0.5rem;flex-wrap:wrap}
.footer-link{text-decoration:none;font-weight:500;transition:all 0.3s}
.copyright{font-size:0.9rem;opacity:0.8}
/* Modal */
.modal-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.success-modal{max-width:500px;width:90%;padding:2.5rem;overflow-wrap:anywhere;border-radius:20px;text-align:center;animation:modalAppear 0.4s ease-out;backdrop-filter:blur(28px) saturate(180%);-webkit-backdrop-filter:blur(28px) saturate(180%)}
.modal-title{font-size:1.8rem;font-weight:700;margin-bottom:1rem}
.modal-message{line-height:1.6;margin-bottom:2rem;opacity:0.9}
.modal-btn{padding:0.9rem 2rem;border-radius:12px;border:none;font-weight:600;font-size:1rem;cursor:pointer;transition:all 0.3s;box-shadow:inset 0 1px 0 rgba(255,255,255,0.3),0 8px 22px rgba(0,0,0,0.18)}
/* Animations */
@keyframes modalAppear{0%{opacity:0;transform:translateY(-20px) scale(0.95)}100%{opacity:1;transform:translateY(0) scale(1)}}
/* Custom Select Dropdown */
.custom-select-wrapper{position:relative;width:100%}
.custom-select-trigger{width:100%;display:flex;align-items:center;justify-content:space-between;padding:0.9rem 1rem;border-radius:10px;border:none;font-size:1rem;font-family:inherit;cursor:pointer;transition:all 0.25s ease;text-align:left;gap:0.5rem;backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%)}
.custom-select-trigger .trigger-text{display:flex;align-items:center;gap:0.5rem;flex:1;overflow:hidden}
.custom-select-trigger .selected-icon{font-size:1.1rem;flex-shrink:0}
.custom-select-trigger .placeholder-text{opacity:0.55}
.chevron{transition:transform 0.25s ease;flex-shrink:0}
.custom-select-trigger.open .chevron{transform:rotate(180deg)}
.custom-options{position:absolute;top:calc(100% + 6px);left:0;right:0;border-radius:12px;border:none;overflow:hidden;z-index:100;backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);box-shadow:0 8px 24px rgba(0,0,0,0.15)}
.custom-option{width:100%;display:flex;align-items:center;gap:0.75rem;padding:0.8rem 1rem;font-size:0.97rem;font-family:inherit;cursor:pointer;border:none;text-align:left;transition:background 0.15s ease}
.custom-option:not(:last-child){border-bottom:1px solid}
.option-icon{font-size:1.1rem;flex-shrink:0}
.option-label{flex:1}
.check-icon{flex-shrink:0;opacity:0.85}
/* Dropdown transition */
.dropdown-enter-active,.dropdown-leave-active{transition:opacity 0.18s ease,transform 0.18s ease}
.dropdown-enter-from,.dropdown-leave-to{opacity:0;transform:translateY(-6px)}
/* ========== NIGHT MODE ========== */
.contact-page.night-mode{background:linear-gradient(180deg,#0a0118 0%,#1a0b2e 40%,#16213e 100%);color:#e2e8f0}
.night-mode .custom-select-trigger{background:rgba(255,255,255,0.06);color:#e2e8f0;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1)}
.night-mode .custom-select-trigger:hover{background:rgba(255,255,255,0.12)}
.night-mode .custom-options{background:rgba(36,24,69,0.7);box-shadow:0 14px 34px rgba(0,0,0,0.45),inset 0 0 0 1px rgba(255,255,255,0.09)}
.night-mode .custom-option{background:transparent;color:#e2e8f0;border-color:rgba(255,255,255,0.08)}
.night-mode .custom-option:hover{background:rgba(139,92,246,0.15)}
.night-mode .custom-option.active{background:rgba(139,92,246,0.2);color:#c084fc}
.night-mode .check-icon{stroke:#a855f7}
.night-mode .chevron{stroke:#c084fc; opacity: 0.8}
.night-mode .back-btn{color:#c084fc;background:rgba(255,255,255,0.06);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1)}
.night-mode .back-btn:hover{background:rgba(255,255,255,0.13)}
.night-mode .back-btn svg{stroke:#c084fc}
.night-mode .page-title{color:#e2e8f0}
.night-mode .page-subtitle{color:#94a3b8}
.night-mode .section-card{background:linear-gradient(165deg,rgba(44,30,80,0.55) 0%,rgba(24,15,46,0.62) 100%);box-shadow:0 0 3px rgba(0,0,0,0.45),inset 0 0 0 1px rgba(255,255,255,0.09),inset 0 1px 0 rgba(255,255,255,0.14)}
.night-mode .section-title{color:#c084fc}
.night-mode .section-description{color:#e2e8f0}
.night-mode .form-group label{color:#e2e8f0}
.night-mode .email-display input{color:#c084fc}
.night-mode .input-wrapper input,.night-mode .input-wrapper select,.night-mode .input-wrapper textarea{background:rgba(255,255,255,0.06);color:#e2e8f0;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1)}
.night-mode .input-wrapper input:focus,.night-mode .input-wrapper select:focus,.night-mode .input-wrapper textarea:focus{outline:none;background:rgba(255,255,255,0.1);box-shadow:inset 0 0 0 1px rgba(192,132,252,0.5)}
.night-mode .input-wrapper input::placeholder,.night-mode .input-wrapper textarea::placeholder{color:rgba(226,232,240,0.5)}
.night-mode .submit-btn{background:linear-gradient(135deg,#8b5cf6 0%,#a855f7 100%);color:white}
.night-mode .submit-btn:hover:not(:disabled){background:linear-gradient(135deg,#7c3aed 0%,#9333ea 100%);}
.night-mode .form-note{color:#94a3b8}
.night-mode .footer-logo{color:#c084fc}
.night-mode .footer-tagline{color:#e2e8f0}
.night-mode .footer-link{color:#94a3b8}
.night-mode .footer-link:hover{color:#c084fc}
.night-mode .copyright{color:#94a3b8}
.night-mode .success-modal{background:linear-gradient(165deg,rgba(44,30,80,0.82) 0%,rgba(24,15,46,0.88) 100%);box-shadow:0 28px 70px rgba(0,0,0,0.55),inset 0 0 0 1px rgba(255,255,255,0.1),inset 0 1px 0 rgba(255,255,255,0.14)}
.night-mode .modal-title{color:#c084fc}
.night-mode .modal-message{color:#e2e8f0}
.night-mode .modal-btn{background:linear-gradient(135deg,#8b5cf6 0%,#a855f7 100%);color:white}
.night-mode .modal-btn:hover{background:linear-gradient(135deg,#7c3aed 0%,#9333ea 100%);box-shadow:0 0 6px rgba(139,92,246,0.6)}
.night-mode .modal-overlay{background:rgba(10,1,24,0.45)}
/* ========== DAY MODE ========== */
.contact-page.day-mode{color:#3c2a1e}
.day-mode .custom-select-trigger{background:rgba(255,255,255,0.55);color:#3c2a1e;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.65)}
.day-mode .custom-select-trigger:hover,.day-mode .custom-select-trigger.open{background:rgba(255,255,255,0.82)}
.day-mode .custom-options{background:rgba(255,255,255,0.72);box-shadow:0 14px 34px rgba(120,80,30,0.18),inset 0 0 0 1px rgba(255,255,255,0.7)}
.day-mode .custom-option{background:transparent;color:#3c2a1e;border-color:rgba(120,80,30,0.12)}
.day-mode .custom-option:hover{background:rgba(212,175,55,0.12)}
.day-mode .custom-option.active{background:rgba(212,175,55,0.18);color:#A0522D}
.day-mode .check-icon{stroke:#A0522D}
.day-mode .chevron{stroke:#A0522D}
.day-mode .back-btn{color:#A0522D;background:rgba(255,255,255,0.5);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.65)}
.day-mode .back-btn:hover{background:rgba(255,255,255,0.8)}
.day-mode .page-title{color:#3c2a1e}
.day-mode .page-subtitle{color:#5c3f2e}
.day-mode .section-card{background:rgba(255,255,255,0.55);box-shadow:0 0 3px rgba(120,80,30,0.15),inset 0 0 0 1px rgba(255,255,255,0.65)}
.day-mode .section-title{color:#A0522D}
.day-mode .section-description{color:#3c2a1e}
.day-mode .form-group label{color:#3c2a1e}
.day-mode .email-display input{color:#A0522D}
.day-mode .input-wrapper input,.day-mode .input-wrapper select,.day-mode .input-wrapper textarea{background:rgba(255,255,255,0.5);color:#3c2a1e;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.6)}
.day-mode .input-wrapper input:focus,.day-mode .input-wrapper select:focus,.day-mode .input-wrapper textarea:focus{outline:none;background:rgba(255,255,255,0.75);box-shadow:inset 0 0 0 1px rgba(212,175,55,0.55)}
.day-mode .input-wrapper input::placeholder,.day-mode .input-wrapper textarea::placeholder{color:rgba(92,74,66,0.7)}
.day-mode .submit-btn{background:linear-gradient(45deg,rgba(212,175,55,0.9),rgba(160,82,45,0.9));color:white}
.day-mode .submit-btn:hover:not(:disabled){background:linear-gradient(45deg,#d4af37,#A0522D);}
.day-mode .form-note{color:#5c3f2e}
.day-mode .footer-logo{color:#A0522D}
.day-mode .footer-tagline{color:#3c2a1e}
.day-mode .footer-link{color:#5c3f2e}
.day-mode .footer-link:hover{color:#A0522D}
.day-mode .copyright{color:#5c3f2e}
.day-mode .success-modal{background:rgba(255,255,255,0.7);box-shadow:0 28px 70px rgba(120,80,30,0.2),inset 0 0 0 1px rgba(255,255,255,0.7)}
.day-mode .modal-title{color:#A0522D}
.day-mode .modal-message{color:#3c2a1e}
.day-mode .modal-btn{background:linear-gradient(45deg,rgba(212,175,55,0.9),rgba(160,82,45,0.9));color:white}
.day-mode .modal-btn:hover{background:linear-gradient(45deg,#d4af37,#A0522D);box-shadow:0 0 8px rgba(212,175,55,0.4)}
.day-mode .modal-overlay{background:rgba(60,40,20,0.25)}
/* Mobile */
@media (max-width:768px){
  .contact-header{flex-direction:column;align-items:flex-start;gap:1rem;padding:1rem 1.5rem}
  .header-content{text-align:center}
  .page-title{font-size:1.5rem}
  .page-subtitle{font-size:0.9rem}
  .contact-main{padding:1rem 1.5rem 2rem}
  .section-card{padding:1.5rem}
}
@media (max-width:480px){
  .contact-header{padding:1rem}
  .page-title{font-size:1.5rem}
  .page-subtitle{font-size:0.95rem;line-height:1.5}
  .page-title{font-size:1.5rem}
  .page-subtitle{font-size:0.95rem;line-height:1.5}
  .contact-main{padding:2rem 1rem}
  .section-card{padding:1.25rem}
  .form-group label{font-size:0.9rem}
  .back-btn{padding:8px 10px}
  .input-wrapper input,.input-wrapper select,.input-wrapper textarea{padding:0.75rem 0.9rem;font-size:0.95rem}
  .submit-btn{padding:0.85rem 1.5rem;font-size:1rem}
  .form-note{font-size:0.85rem}
  .success-modal{padding:2rem;width:92%}
  .modal-title{font-size:1.5rem}
  .modal-message{font-size:0.95rem}
  .modal-btn{padding:0.75rem 1.5rem;font-size:0.95rem}
  .footer-links{gap:1rem;font-size:0.9rem}
  .footer-tagline{font-size:0.9rem}
  .copyright{font-size:0.85rem}
}
</style>