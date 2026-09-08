import type {
  BillingRecord,
  CostCenterSummary,
  DailySummary,
  ModelSummary,
  RepositorySummary,
  SummaryMetrics,
  UserSummary,
} from '../types/billing'

export function computeSummaryMetrics(records: BillingRecord[]): SummaryMetrics {
  let totalGrossAmount = 0
  let totalDiscountAmount = 0
  let totalNetAmount = 0
  let totalCredits = 0
  let totalInputTokens = 0
  let totalOutputTokens = 0
  let totalCacheReadTokens = 0
  let totalCacheWriteTokens = 0

  const userSet = new Set<string>()
  const modelSet = new Set<string>()
  const orgSet = new Set<string>()

  for (const r of records) {
    totalGrossAmount += r.gross_amount
    totalDiscountAmount += r.discount_amount
    totalNetAmount += r.net_amount
    totalCredits += r.quantity
    totalInputTokens += r.input
    totalOutputTokens += r.output
    totalCacheReadTokens += r.cache_read
    totalCacheWriteTokens += r.cache_write

    if (r.username) userSet.add(r.username)
    if (r.model) modelSet.add(r.model)
    if (r.organization) orgSet.add(r.organization)
  }

  const totalTokens =
    totalInputTokens + totalOutputTokens + totalCacheReadTokens + totalCacheWriteTokens

  // Cache hit ratio: cache_read / (cache_read + input)
  const cacheDenominator = totalCacheReadTokens + totalInputTokens
  const cacheHitRatio = cacheDenominator > 0 ? totalCacheReadTokens / cacheDenominator : 0

  return {
    totalGrossAmount,
    totalDiscountAmount,
    totalNetAmount,
    totalCredits,
    totalTokens,
    totalInputTokens,
    totalOutputTokens,
    totalCacheReadTokens,
    totalCacheWriteTokens,
    cacheHitRatio,
    uniqueUsersCount: userSet.size,
    uniqueModelsCount: modelSet.size,
    recordCount: records.length,
    organizationNames: Array.from(orgSet),
  }
}

export function computeUserSummaries(records: BillingRecord[]): UserSummary[] {
  const map = new Map<
    string,
    {
      grossAmount: number
      discountAmount: number
      netAmount: number
      credits: number
      inputTokens: number
      outputTokens: number
      cacheReadTokens: number
      cacheWriteTokens: number
      dates: Set<string>
      modelCounts: Map<string, number>
      recordCount: number
    }
  >()

  for (const r of records) {
    let entry = map.get(r.username)
    if (!entry) {
      entry = {
        grossAmount: 0,
        discountAmount: 0,
        netAmount: 0,
        credits: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        dates: new Set<string>(),
        modelCounts: new Map<string, number>(),
        recordCount: 0,
      }
      map.set(r.username, entry)
    }

    entry.grossAmount += r.gross_amount
    entry.discountAmount += r.discount_amount
    entry.netAmount += r.net_amount
    entry.credits += r.quantity
    entry.inputTokens += r.input
    entry.outputTokens += r.output
    entry.cacheReadTokens += r.cache_read
    entry.cacheWriteTokens += r.cache_write
    entry.recordCount += 1
    if (r.date) entry.dates.add(r.date)

    if (r.model) {
      entry.modelCounts.set(r.model, (entry.modelCounts.get(r.model) || 0) + 1)
    }
  }

  const summaries: UserSummary[] = []
  for (const [username, entry] of map.entries()) {
    let topModel = '-'
    let maxCount = -1
    for (const [m, c] of entry.modelCounts.entries()) {
      if (c > maxCount) {
        maxCount = c
        topModel = m
      }
    }

    const totalTokens =
      entry.inputTokens +
      entry.outputTokens +
      entry.cacheReadTokens +
      entry.cacheWriteTokens

    summaries.push({
      username,
      grossAmount: entry.grossAmount,
      discountAmount: entry.discountAmount,
      netAmount: entry.netAmount,
      credits: entry.credits,
      inputTokens: entry.inputTokens,
      outputTokens: entry.outputTokens,
      cacheReadTokens: entry.cacheReadTokens,
      cacheWriteTokens: entry.cacheWriteTokens,
      totalTokens,
      activeDays: entry.dates.size,
      modelsUsed: Array.from(entry.modelCounts.keys()),
      topModel,
      recordCount: entry.recordCount,
    })
  }

  // Sort descending by gross amount
  return summaries.sort((a, b) => b.grossAmount - a.grossAmount)
}

export function computeModelSummaries(records: BillingRecord[], totalGross: number): ModelSummary[] {
  const map = new Map<
    string,
    {
      grossAmount: number
      netAmount: number
      credits: number
      inputTokens: number
      outputTokens: number
      cacheReadTokens: number
      cacheWriteTokens: number
      users: Set<string>
    }
  >()

  for (const r of records) {
    const model = r.model || '(Unknown Model)'
    let entry = map.get(model)
    if (!entry) {
      entry = {
        grossAmount: 0,
        netAmount: 0,
        credits: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        users: new Set<string>(),
      }
      map.set(model, entry)
    }

    entry.grossAmount += r.gross_amount
    entry.netAmount += r.net_amount
    entry.credits += r.quantity
    entry.inputTokens += r.input
    entry.outputTokens += r.output
    entry.cacheReadTokens += r.cache_read
    entry.cacheWriteTokens += r.cache_write
    if (r.username) entry.users.add(r.username)
  }

  const summaries: ModelSummary[] = []
  for (const [model, entry] of map.entries()) {
    const totalTokens =
      entry.inputTokens +
      entry.outputTokens +
      entry.cacheReadTokens +
      entry.cacheWriteTokens

    const percentage = totalGross > 0 ? (entry.grossAmount / totalGross) : 0

    summaries.push({
      model,
      grossAmount: entry.grossAmount,
      netAmount: entry.netAmount,
      credits: entry.credits,
      inputTokens: entry.inputTokens,
      outputTokens: entry.outputTokens,
      cacheReadTokens: entry.cacheReadTokens,
      cacheWriteTokens: entry.cacheWriteTokens,
      totalTokens,
      userCount: entry.users.size,
      percentage,
    })
  }

  return summaries.sort((a, b) => b.grossAmount - a.grossAmount)
}

export function computeDailySummaries(records: BillingRecord[]): DailySummary[] {
  const map = new Map<
    string,
    {
      grossAmount: number
      discountAmount: number
      netAmount: number
      credits: number
      input: number
      output: number
      cacheRead: number
      cacheWrite: number
      users: Set<string>
    }
  >()

  for (const r of records) {
    const d = r.date || 'Unknown Date'
    let entry = map.get(d)
    if (!entry) {
      entry = {
        grossAmount: 0,
        discountAmount: 0,
        netAmount: 0,
        credits: 0,
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0,
        users: new Set<string>(),
      }
      map.set(d, entry)
    }

    entry.grossAmount += r.gross_amount
    entry.discountAmount += r.discount_amount
    entry.netAmount += r.net_amount
    entry.credits += r.quantity
    entry.input += r.input
    entry.output += r.output
    entry.cacheRead += r.cache_read
    entry.cacheWrite += r.cache_write
    if (r.username) entry.users.add(r.username)
  }

  const list: DailySummary[] = []
  for (const [date, entry] of map.entries()) {
    const tokens = entry.input + entry.output + entry.cacheRead + entry.cacheWrite
    list.push({
      date,
      grossAmount: entry.grossAmount,
      discountAmount: entry.discountAmount,
      netAmount: entry.netAmount,
      credits: entry.credits,
      tokens,
      input: entry.input,
      output: entry.output,
      cacheRead: entry.cacheRead,
      cacheWrite: entry.cacheWrite,
      activeUsers: entry.users.size,
    })
  }

  // Sort ascending by date
  return list.sort((a, b) => a.date.localeCompare(b.date))
}

export function computeCostCenterSummaries(records: BillingRecord[]): CostCenterSummary[] {
  const map = new Map<
    string,
    {
      grossAmount: number
      netAmount: number
      credits: number
      tokens: number
      users: Set<string>
    }
  >()

  for (const r of records) {
    const name = r.cost_center_name.trim() || '(Default / Unassigned)'
    let entry = map.get(name)
    if (!entry) {
      entry = {
        grossAmount: 0,
        netAmount: 0,
        credits: 0,
        tokens: 0,
        users: new Set<string>(),
      }
      map.set(name, entry)
    }

    entry.grossAmount += r.gross_amount
    entry.netAmount += r.net_amount
    entry.credits += r.quantity
    entry.tokens += r.input + r.output + r.cache_read + r.cache_write
    if (r.username) entry.users.add(r.username)
  }

  const list: CostCenterSummary[] = []
  for (const [name, entry] of map.entries()) {
    list.push({
      name,
      grossAmount: entry.grossAmount,
      netAmount: entry.netAmount,
      credits: entry.credits,
      tokens: entry.tokens,
      userCount: entry.users.size,
    })
  }

  return list.sort((a, b) => b.grossAmount - a.grossAmount)
}

export function computeRepositorySummaries(records: BillingRecord[]): RepositorySummary[] {
  const map = new Map<
    string,
    {
      grossAmount: number
      netAmount: number
      credits: number
      tokens: number
      users: Set<string>
    }
  >()

  for (const r of records) {
    const repo = r.repository.trim() || '(Global / Chat / No Repo)'
    let entry = map.get(repo)
    if (!entry) {
      entry = {
        grossAmount: 0,
        netAmount: 0,
        credits: 0,
        tokens: 0,
        users: new Set<string>(),
      }
      map.set(repo, entry)
    }

    entry.grossAmount += r.gross_amount
    entry.netAmount += r.net_amount
    entry.credits += r.quantity
    entry.tokens += r.input + r.output + r.cache_read + r.cache_write
    if (r.username) entry.users.add(r.username)
  }

  const list: RepositorySummary[] = []
  for (const [repository, entry] of map.entries()) {
    list.push({
      repository,
      grossAmount: entry.grossAmount,
      netAmount: entry.netAmount,
      credits: entry.credits,
      tokens: entry.tokens,
      userCount: entry.users.size,
    })
  }

  return list.sort((a, b) => b.grossAmount - a.grossAmount)
}
