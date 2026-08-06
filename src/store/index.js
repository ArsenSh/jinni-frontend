import { createStore } from 'vuex'
import i18n from './modules/i18n'
import settings from './modules/settings';

export default createStore({
    modules: { i18n, settings }
})