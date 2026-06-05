import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { pt } from "../locales/pt";
import { en } from "../locales/en";
import { es } from "../locales/es";

void i18n.use(initReactI18next).init({
  resources: {
    pt: { translation: pt },
    en: { translation: en },
    es: { translation: es },
  },
  lng: "pt",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
