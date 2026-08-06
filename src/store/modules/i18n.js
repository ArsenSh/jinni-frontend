function getInitialLanguage() {
    try {
        const settings = localStorage.getItem('jinni_settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            return parsed.language || 'en';
        }
    } catch (error) {console.error('Failed to parse jinni_settings:', error)}
    return 'en';
}

export default {
    namespaced: true,
    state: {locale: getInitialLanguage()},
    mutations: {
        SET_LANGUAGE(state, lang) {
            state.locale = lang;            
            try {
                const settings = JSON.parse(localStorage.getItem('jinni_settings') || '{}');
                settings.language = lang;
                localStorage.setItem('jinni_settings', JSON.stringify(settings));
            } catch (error) {console.error('Failed to update language in jinni_settings:', error)}            
            localStorage.setItem('lang', lang);
            localStorage.setItem('jinni_language', lang);
        }
    },
    actions: {
        changeLanguage({ commit }, lang) {
            commit('SET_LANGUAGE', lang);
            window.location.reload();
        }
    }
}