import Papa from 'papaparse'
import type { BillingRecord } from '../types/billing'

function normalizeDate(raw: string): string {
  if (!raw) return ''
  const clean = raw.trim()
  // Matches YYYY/MM/DD, YYYY-MM-DD, M/D/YYYY, etc.
  const parts = clean.split(/[/ -]/)
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY/MM/DD
      const y = parts[0]
      const m = parts[1].padStart(2, '0')
      const d = parts[2].padStart(2, '0')
      return `${y}-${m}-${d}`
    } else if (parts[2].length === 4) {
      // MM/DD/YYYY
      const y = parts[2]
      const m = parts[0].padStart(2, '0')
      const d = parts[1].padStart(2, '0')
      return `${y}-${m}-${d}`
    }
  }
  return clean
}

function safeNumber(val: unknown): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val
  if (typeof val === 'string') {
    const cleaned = val.replace(/,/g, '').trim()
    if (!cleaned) return 0
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

function safeString(val: unknown): string {
  if (val === null || val === undefined) return ''
  return String(val).trim()
}

// Normalize key by lowercasing and removing spaces/underscores
function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[\s_-]/g, '')
}

export function parseBillingCsv(fileContent: string): { records: BillingRecord[]; warnings: string[] } {
  const warnings: string[] = []

  const result = Papa.parse<Record<string, unknown>>(fileContent, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
    delimiter: '', // auto-detect delimiter (comma, tab, semicolon)
  })

  if (result.errors && result.errors.length > 0) {
    result.errors.forEach((err) => {
      warnings.push(`Line ${err.row}: ${err.message}`)
    })
  }

  const records: BillingRecord[] = []

  for (let i = 0; i < result.data.length; i++) {
    const row = result.data[i]
    if (!row || Object.keys(row).length === 0) continue

    // Map keys flexibly
    const mappedRow: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(row)) {
      mappedRow[normalizeKey(key)] = val
    }

    const dateRaw = safeString(
      mappedRow['date'] || mappedRow['usage_date'] || mappedRow['created_at']
    )
    const username = safeString(
      mappedRow['username'] || mappedRow['user'] || mappedRow['login']
    )

    // Skip empty or header rows
    if (!dateRaw && !username) continue

    const record: BillingRecord = {
      id: `rec-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: normalizeDate(dateRaw),
      username: username || '(Unknown User)',
      product: safeString(mappedRow['product'] || 'copilot'),
      sku: safeString(mappedRow['sku']),
      model: safeString(mappedRow['model'] || '(Unknown Model)'),
      quantity: safeNumber(mappedRow['quantity']),
      unit_type: safeString(mappedRow['unittype'] || mappedRow['unit_type']),
      applied_cost_per_quantity: safeNumber(
        mappedRow['appliedcostperquantity'] || mappedRow['unitprice']
      ),
      gross_amount: safeNumber(
        mappedRow['grossamount'] || mappedRow['gross_amount']
      ),
      discount_amount: safeNumber(
        mappedRow['discountamount'] || mappedRow['discount_amount']
      ),
      net_amount: safeNumber(
        mappedRow['netamount'] || mappedRow['net_amount']
      ),
      total_monthly_quota: safeNumber(
        mappedRow['totalmonthlyquota'] || mappedRow['quota']
      ),
      organization: safeString(
        mappedRow['organization'] || mappedRow['org']
      ),
      repository: safeString(
        mappedRow['repository'] || mappedRow['repo']
      ),
      cost_center_name: safeString(
        mappedRow['costcentername'] || mappedRow['costcenter']
      ),
      aic_quantity: safeNumber(
        mappedRow['aicquantity'] || mappedRow['aic_quantity']
      ),
      aic_gross_amount: safeNumber(
        mappedRow['aicgrossamount'] || mappedRow['aic_gross_amount']
      ),
      input: safeNumber(mappedRow['input'] || mappedRow['inputtokens']),
      output: safeNumber(mappedRow['output'] || mappedRow['outputtokens']),
      cache_read: safeNumber(
        mappedRow['cacheread'] || mappedRow['cache_read']
      ),
      cache_write: safeNumber(
        mappedRow['cachewrite'] || mappedRow['cache_write']
      ),
    }

    // If gross_amount is missing or 0 but quantity and applied_cost_per_quantity exist
    if (record.gross_amount === 0 && record.quantity > 0 && record.applied_cost_per_quantity > 0) {
      record.gross_amount = record.quantity * record.applied_cost_per_quantity
    }

    records.push(record)
  }

  return { records, warnings }
}
