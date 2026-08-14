import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'rinnovi:currency'
export const AVAILABLE_CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF']
const DEFAULT_CURRENCY = 'EUR'

/** Valuta preferita, usata come default nei nuovi abbonamenti (§7.8). */
export function usePreferredCurrency() {
  const [currency, setCurrencyState] = useState<string>(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_CURRENCY
    } catch {
      return DEFAULT_CURRENCY
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, currency)
    } catch {
      // Storage non disponibile: la preferenza resta valida per la sessione
    }
  }, [currency])

  const setCurrency = useCallback((next: string) => setCurrencyState(next), [])

  return { currency, setCurrency }
}
