/**
 * Formats a numeric amount with the specified currency code.
 * Defaults to BDT (৳) if no currency is supplied.
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'BDT'
): string {
  const code = (currencyCode || 'BDT').toUpperCase().trim()

  try {
    if (code === 'BDT') {
      return new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        maximumFractionDigits: 0,
      })
        .format(amount)
        .replace('BDT', '৳')
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${code} ${amount.toLocaleString()}`
  }
}

/**
 * List of standard supported currencies for campaign forms
 */
export const SUPPORTED_CURRENCIES = [
  { code: 'BDT', label: 'BDT (৳) — Bangladeshi Taka' },
  { code: 'USD', label: 'USD ($) — US Dollar' },
  { code: 'EUR', label: 'EUR (€) — Euro' },
  { code: 'GBP', label: 'GBP (£) — British Pound' },
  { code: 'CAD', label: 'CAD ($) — Canadian Dollar' },
  { code: 'AUD', label: 'AUD ($) — Australian Dollar' },
  { code: 'SAR', label: 'SAR (﷼) — Saudi Riyal' },
  { code: 'AED', label: 'AED (د.إ) — UAE Dirham' },
  { code: 'MYR', label: 'MYR (RM) — Malaysian Ringgit' },
  { code: 'INR', label: 'INR (₹) — Indian Rupee' },
  { code: 'JPY', label: 'JPY (¥) — Japanese Yen' },
  { code: 'SGD', label: 'SGD ($) — Singapore Dollar' },
  { code: 'QAR', label: 'QAR (﷼) — Qatari Riyal' },
  { code: 'KWD', label: 'KWD (د.ك) — Kuwaiti Dinar' },
  { code: 'TRY', label: 'TRY (₺) — Turkish Lira' },
]
