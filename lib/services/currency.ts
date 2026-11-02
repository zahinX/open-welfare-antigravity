/**
 * Currency conversion service.
 * Supports cross-currency calculations against standard base rates.
 */

// Exchange rates normalized against 1 USD
export const USD_EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  BDT: 120.0,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.52,
  SAR: 3.75,
  AED: 3.67,
  MYR: 4.45,
  INR: 86.5,
  JPY: 155.0,
  SGD: 1.34,
  QAR: 3.64,
  KWD: 0.31,
  TRY: 34.0,
}

/**
 * Returns the exchange rate from `fromCurrency` to `toCurrency`.
 * Example: getExchangeRate('USD', 'BDT') -> 120.0
 * Example: getExchangeRate('BDT', 'USD') -> 0.008333...
 */
export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  const from = (fromCurrency || 'BDT').toUpperCase().trim()
  const to = (toCurrency || 'BDT').toUpperCase().trim()

  if (from === to) return 1.0

  const rateFrom = USD_EXCHANGE_RATES[from] ?? 1.0
  const rateTo = USD_EXCHANGE_RATES[to] ?? 1.0

  // 1 unit of `from` in USD is (1 / rateFrom)
  // in `to` it is (1 / rateFrom) * rateTo = rateTo / rateFrom
  return rateTo / rateFrom
}

export interface CurrencyConversionResult {
  amount: number
  fromCurrency: string
  toCurrency: string
  convertedAmount: number
  exchangeRate: number
}

/**
 * Converts a monetary amount between any two supported currencies.
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): CurrencyConversionResult {
  const from = (fromCurrency || 'BDT').toUpperCase().trim()
  const to = (toCurrency || 'BDT').toUpperCase().trim()

  if (from === to) {
    return {
      amount,
      fromCurrency: from,
      toCurrency: to,
      convertedAmount: Number(amount.toFixed(2)),
      exchangeRate: 1.0,
    }
  }

  const exchangeRate = getExchangeRate(from, to)
  const rawConverted = amount * exchangeRate
  const convertedAmount = Number(rawConverted.toFixed(2))

  return {
    amount,
    fromCurrency: from,
    toCurrency: to,
    convertedAmount,
    exchangeRate: Number(exchangeRate.toFixed(6)),
  }
}
