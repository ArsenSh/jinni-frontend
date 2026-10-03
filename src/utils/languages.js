// utils/languages.js — app languages that exist in the code but are not
// offered to anyone (founder 2026-10-03: "hide armenian language in system").
// The hy locale files and fonts stay; remove a code from this set to bring
// the language back everywhere at once. A visitor who had a hidden language
// saved falls back to English.
export const HIDDEN_LANGUAGES = new Set(['hy'])

export const isHiddenLanguage = (code) => HIDDEN_LANGUAGES.has(String(code || '').slice(0, 2))
export const visibleLanguage = (code) => (!code || isHiddenLanguage(code) ? 'en' : code)
export const visibleLanguageOptions = (list) => list.filter(l => !isHiddenLanguage(l.code))
