import type { BillingRecord } from '../types/billing'

export function generateSampleBillingRecords(): BillingRecord[] {
  // Base record provided by user
  const records: BillingRecord[] = [
    {
      id: 'sample-seed-0',
      date: '2026-08-07',
      username: 'user001',
      product: 'copilot',
      sku: 'copilot_ai_credit',
      model: 'Claude Sonnet 5',
      quantity: 597.55188,
      unit_type: 'ai-credits',
      applied_cost_per_quantity: 0.01,
      gross_amount: 5.9755188,
      discount_amount: 5.9755188,
      net_amount: 0,
      total_monthly_quota: 1900,
      organization: 'aaaaaa',
      repository: 'backend-microservice',
      cost_center_name: 'Core Platform Engineering',
      aic_quantity: 0,
      aic_gross_amount: 0,
      input: 15325,
      output: 84650,
      cache_read: 16113319,
      cache_write: 750282,
    },
  ]

  const users = [
    { username: 'user001', costCenter: 'Core Platform Engineering', quota: 1900 },
    { username: 'yamada-taro', costCenter: 'Frontend Engineering', quota: 1900 },
    { username: 'tanaka-kenji', costCenter: 'Data Platform', quota: 1900 },
    { username: 'sato-yuki', costCenter: 'Core Platform Engineering', quota: 1900 },
    { username: 'suzuki-mai', costCenter: 'AI Labs & Innovation', quota: 1900 },
    { username: 'watanabe-ren', costCenter: 'Frontend Engineering', quota: 1900 },
    { username: 'takahashi-aoi', costCenter: 'Product Design', quota: 1900 },
  ]

  const models = [
    // Anthropic
    { name: 'Claude Sonnet 5', costPerCredit: 0.01, creditWeight: 1.5 },
    { name: 'Claude Sonnet 4.6', costPerCredit: 0.01, creditWeight: 1.3 },
    { name: 'Claude Opus 5', costPerCredit: 0.01, creditWeight: 2.0 },
    { name: 'Claude Opus 4.8', costPerCredit: 0.01, creditWeight: 1.8 },
    { name: 'Claude Haiku 4.5', costPerCredit: 0.01, creditWeight: 0.5 },
    { name: 'Claude Fable 5.1', costPerCredit: 0.01, creditWeight: 1.6 },
    // OpenAI
    { name: 'GPT-5.4', costPerCredit: 0.01, creditWeight: 1.4 },
    { name: 'GPT-5 mini', costPerCredit: 0.01, creditWeight: 0.7 },
    { name: 'GPT-5.4 nano', costPerCredit: 0.01, creditWeight: 0.4 },
    { name: 'GPT-5.6 Luna', costPerCredit: 0.01, creditWeight: 1.2 },
    { name: 'GPT-6 Astra', costPerCredit: 0.01, creditWeight: 2.2 },
    // Google
    { name: 'Gemini 3.8 Flash', costPerCredit: 0.01, creditWeight: 0.6 },
    { name: 'Gemini 3.7 Flash', costPerCredit: 0.01, creditWeight: 0.55 },
    // Microsoft
    { name: 'MAI-Code-1.1-Flash', costPerCredit: 0.01, creditWeight: 0.8 },
    // Moonshot AI
    { name: 'Kimi K3', costPerCredit: 0.01, creditWeight: 1.1 },
    // xAI
    { name: 'Grok 4.5', costPerCredit: 0.01, creditWeight: 1.3 },
  ]

  const repos = [
    'backend-microservice',
    'web-client-next',
    'data-pipeline-spark',
    'api-gateway',
    'auth-service',
    'ml-inference-engine',
    '', // Global / Chat
  ]

  // Generate for 14 consecutive days in August 2026 (from 2026-08-01 to 2026-08-14)
  let idCount = 1
  for (let day = 1; day <= 14; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`
    const date = `2026-08-${dayStr}`

    // Skip some days for certain users to look realistic
    for (const u of users) {
      if (date === '2026-08-07' && u.username === 'user001') {
        // already added the exact seed record above
        continue
      }

      // Weekend lower activity: Aug 1 and Aug 2 are Sat/Sun, Aug 8/9 are Sat/Sun
      const isWeekend = day === 1 || day === 2 || day === 8 || day === 9
      if (isWeekend && Math.random() > 0.3) {
        continue
      }

      // Select 1 to 3 models per user per day
      const userModelCount = Math.floor(Math.random() * 2) + 1
      const shuffledModels = [...models].sort(() => 0.5 - Math.random())

      for (let mIdx = 0; mIdx < userModelCount; mIdx++) {
        const m = shuffledModels[mIdx]
        const repo = repos[Math.floor(Math.random() * repos.length)]

        const inputTokens = Math.floor(Math.random() * 25000) + 3000
        const outputTokens = Math.floor(Math.random() * 60000) + 10000
        const cacheRead = Math.floor(Math.random() * 12000000) + 1000000
        const cacheWrite = Math.floor(Math.random() * 500000) + 50000

        // Credits calculation roughly proportional to tokens
        const credits = Number(
          (
            (inputTokens * 0.00005 +
              outputTokens * 0.0004 +
              cacheRead * 0.000005 +
              cacheWrite * 0.00002) *
            m.creditWeight *
            10
          ).toFixed(5)
        )

        const grossAmount = Number((credits * m.costPerCredit).toFixed(5))
        // Half of users are within quota so net = 0, some exceed quota
        const isCoveredByQuota = Math.random() > 0.2
        const discountAmount = isCoveredByQuota ? grossAmount : Number((grossAmount * 0.4).toFixed(5))
        const netAmount = Number((grossAmount - discountAmount).toFixed(5))

        records.push({
          id: `sample-${idCount++}`,
          date,
          username: u.username,
          product: 'copilot',
          sku: 'copilot_ai_credit',
          model: m.name,
          quantity: credits,
          unit_type: 'ai-credits',
          applied_cost_per_quantity: m.costPerCredit,
          gross_amount: grossAmount,
          discount_amount: discountAmount,
          net_amount: netAmount,
          total_monthly_quota: u.quota,
          organization: 'aaaaaa',
          repository: repo,
          cost_center_name: u.costCenter,
          aic_quantity: 0,
          aic_gross_amount: 0,
          input: inputTokens,
          output: outputTokens,
          cache_read: cacheRead,
          cache_write: cacheWrite,
        })
      }
    }
  }

  return records
}
