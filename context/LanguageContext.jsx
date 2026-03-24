import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import en from '../locales/en.json'
import ar from '../locales/ar.json'
import { formatTemplate, resolveMessage, resolveMessageSegments } from '../utils/i18n'

const STORAGE_KEY = 'realestate-lang'

const catalogs = { en, ar }

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'ar' ? 'ar' : 'en'
    } catch {
      return 'en'
    }
  })

  useEffect(() => {
    const html = document.documentElement
    html.lang = locale === 'ar' ? 'ar' : 'en'
    html.dir = locale === 'ar' ? 'rtl' : 'ltr'
    try {
      localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      /* ignore quota / private mode */
    }
  }, [locale])

  const setLocale = (next) => setLocaleState(next === 'ar' ? 'ar' : 'en')

  const t = useCallback(
    (key, vars) => {
      const raw = resolveMessage(catalogs[locale], key)
      if (raw === undefined) return key
      return vars ? formatTemplate(raw, vars) : raw
    },
    [locale],
  )

  const tSegments = useCallback(
    (segments, vars) => {
      const raw = resolveMessageSegments(catalogs[locale], segments)
      if (raw === undefined) return segments.join(' / ')
      return vars ? formatTemplate(raw, vars) : raw
    },
    [locale],
  )

  const value = useMemo(
    () => ({ locale, setLocale, t, tSegments }),
    [locale, t, tSegments],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
