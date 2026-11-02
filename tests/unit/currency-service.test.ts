import { describe, it, expect } from 'vitest'
import {
  getExchangeRate,
  convertCurrency,
} from '@/lib/services/currency'

describe('Currency Service (lib/services/currency.ts)', () => {
  describe('getExchangeRate', () => {
    it('should return 1.0 when converting to the exact same currency', () => {
      expect(getExchangeRate('BDT', 'BDT')).toBe(1.0)
      expect(getExchangeRate('USD', 'USD')).toBe(1.0)
      expect(getExchangeRate('EUR', 'EUR')).toBe(1.0)
    })

    it('should calculate direct rates against USD accurately', () => {
      expect(getExchangeRate('USD', 'BDT')).toBe(120.0)
      expect(getExchangeRate('USD', 'EUR')).toBe(0.92)
      expect(getExchangeRate('USD', 'GBP')).toBe(0.79)
    })

    it('should calculate inverse exchange rates correctly', () => {
      const bdtToUsd = getExchangeRate('BDT', 'USD')
      expect(bdtToUsd).toBeCloseTo(1 / 120, 5)
    })

    it('should calculate cross currency rates correctly (e.g., EUR to BDT)', () => {
      // 1 EUR = (1 / 0.92) USD = (1 / 0.92) * 120 BDT = 130.4347...
      const eurToBdt = getExchangeRate('EUR', 'BDT')
      expect(eurToBdt).toBeCloseTo(120 / 0.92, 4)
    })

    it('should handle lowercase and untrimmed inputs gracefully', () => {
      expect(getExchangeRate(' usd ', ' bdt ')).toBe(120.0)
    })

    it('should fallback to 1.0 rate for unsupported/missing currencies', () => {
      expect(getExchangeRate('UNKNOWN', 'USD')).toBe(1.0)
      expect(getExchangeRate('UNKNOWN', 'BDT')).toBe(120.0)
    })
  })

  describe('convertCurrency', () => {
    it('should return exact amount and rate 1.0 for same-currency conversion', () => {
      const result = convertCurrency(500, 'BDT', 'BDT')
      expect(result).toEqual({
        amount: 500,
        fromCurrency: 'BDT',
        toCurrency: 'BDT',
        convertedAmount: 500,
        exchangeRate: 1.0,
      })
    })

    it('should convert USD to BDT accurately', () => {
      const result = convertCurrency(25, 'USD', 'BDT')
      expect(result.amount).toBe(25)
      expect(result.convertedAmount).toBe(3000) // 25 * 120
      expect(result.exchangeRate).toBe(120)
    })

    it('should round converted amount to 2 decimal places', () => {
      const result = convertCurrency(100, 'BDT', 'USD')
      // 100 / 120 = 0.833333... -> 0.83
      expect(result.convertedAmount).toBe(0.83)
    })
  })
})
