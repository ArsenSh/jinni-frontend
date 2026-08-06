import { isNightTime } from '@/utils/timeUtils';

const getInitialPreference = () => {
  const saved = localStorage.getItem('jinni_settings');
  if (saved) {
    try {
      const settings = JSON.parse(saved);
      return settings.theme || 'auto';
    } catch (e) {console.error('Failed to parse settings', e)}
  }
  return 'auto';
};

export default {
  namespaced: true,
  state: {
    preference: getInitialPreference(),
    timestamp: Date.now(),
    _timer: null,
  },
  getters: {
    effectiveTheme: (state) => {
      const _ = state.timestamp;
      if (state.preference === 'auto') {return isNightTime() ? 'dark' : 'light'}
      return state.preference;
    },
    themeClass: (state, getters) => (getters.effectiveTheme === 'dark' ? 'night-mode' : 'day-mode'),
  },
  mutations: {
    SET_PREFERENCE(state, pref) {state.preference = pref},
    UPDATE_TIMESTAMP(state) {state.timestamp = Date.now()},
  },
  actions: {
    startAutoThemeCheck({ commit, state }) {
      if (state._timer) clearInterval(state._timer);
      if (state.preference !== 'auto') return;
      commit('UPDATE_TIMESTAMP');
      state._timer = setInterval(() => {commit('UPDATE_TIMESTAMP')}, 60000);
    },
    stopAutoThemeCheck({ state }) {
      if (state._timer) {
        clearInterval(state._timer);
        state._timer = null;
      }
    },
    setPreference({ commit, dispatch }, pref) {
      commit('SET_PREFERENCE', pref);
      if (pref === 'auto') {dispatch('startAutoThemeCheck')} 
      else {dispatch('stopAutoThemeCheck')}
    },
  },
};