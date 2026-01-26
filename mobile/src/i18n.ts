import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import enTranslation from './locales/en/translation.json';
import viTranslation from './locales/vi/translation.json';

const LANGUAGE_KEY = '@app_language';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: enTranslation,
            },
            vi: {
                translation: viTranslation,
            },
        },
        lng: 'en', // Default language for mobile
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

// Load saved language preference on startup
export const loadSavedLanguage = async () => {
    try {
        const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLang && (savedLang === 'en' || savedLang === 'vi')) {
            await i18n.changeLanguage(savedLang);
        }
    } catch (error) {
        console.error('Failed to load saved language:', error);
    }
};

// Save language preference and change language
export const changeLanguage = async (lng: 'en' | 'vi') => {
    try {
        await AsyncStorage.setItem(LANGUAGE_KEY, lng);
        await i18n.changeLanguage(lng);
    } catch (error) {
        console.error('Failed to save language:', error);
    }
};

export default i18n;
