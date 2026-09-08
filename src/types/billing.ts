export interface BillingRecord {
  id: string
  date: string // YYYY-MM-DD
  username: string
  product: string
  sku: string
  model: string
  quantity: number
  unit_type: string
  applied_cost_per_quantity: number
  gross_amount: number
  discount_amount: number
  net_amount: number
  total_monthly_quota: number
  organization: string
  repository: string
  cost_center_name: string
  aic_quantity: number
  aic_gross_amount: number
  input: number
  output: number
  cache_read: number
  cache_write: number
}

export interface FilterState {
  startDate: string
  endDate: string
  selectedUsers: string[]
  selectedModels: string[]
  selectedCostCenters: string[]
  selectedRepositories: string[]
  searchQuery: string
}

export interface SummaryMetrics {
  totalGrossAmount: number
  totalDiscountAmount: number
  totalNetAmount: number
  totalCredits: number
  totalTokens: number
  totalInputTokens: number
  totalOutputTokens: number
  totalCacheReadTokens: number
  totalCacheWriteTokens: number
  cacheHitRatio: number
  uniqueUsersCount: number
  uniqueModelsCount: number
  recordCount: number
  organizationNames: string[]
}

export interface UserSummary {
  username: string
  grossAmount: number
  discountAmount: number
  netAmount: number
  credits: number
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  totalTokens: number
  activeDays: number
  modelsUsed: string[]
  topModel: string
  recordCount: number
}

export interface ModelSummary {
  model: string
  grossAmount: number
  netAmount: number
  credits: number
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  totalTokens: number
  userCount: number
  percentage: number
}

export interface DailySummary {
  date: string
  grossAmount: number
  discountAmount: number
  netAmount: number
  credits: number
  tokens: number
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
  activeUsers: number
}

export interface CostCenterSummary {
  name: string
  grossAmount: number
  netAmount: number
  credits: number
  tokens: number
  userCount: number
}

export interface RepositorySummary {
  repository: string
  grossAmount: number
  netAmount: number
  credits: number
  tokens: number
  userCount: number
}
