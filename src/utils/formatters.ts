export function formatCurrency(amount: number, maxDecimals: number = 2): string {
  if (amount === 0) return '$0.00'
  if (Math.abs(amount) < 0.01) {
    return `$${amount.toFixed(4)}`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDecimals,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(num * 100) / 100)
}

export function formatTokens(num: number): string {
  if (!num || num === 0) return '0'
  if (Math.abs(num) >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`
  }
  if (Math.abs(num) >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`
  }
  if (Math.abs(num) >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  try {
    const parts = dateStr.replace(/-/g, '/').split('/')
    if (parts.length === 3) {
      const y = parts[0].padStart(4, '20')
      const m = parts[1].padStart(2, '0')
      const d = parts[2].padStart(2, '0')
      return `${y}-${m}-${d}`
    }
  } catch {
    // fallback
  }
  return dateStr
}
