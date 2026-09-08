import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  User,
  TrendingUp,
  Cpu,
  GitBranch,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import type { BillingRecord, ModelSummary } from '../types/billing'
import {
  computeDailySummaries,
  computeModelSummaries,
  computeRepositorySummaries,
  computeSummaryMetrics,
} from '../utils/aggregator'
import { formatCurrency, formatTokens, formatPercent, formatNumber } from '../utils/formatters'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { useTheme } from '../context/ThemeContext'

type ModelSortField = keyof Pick<
  ModelSummary,
  'model' | 'grossAmount' | 'credits' | 'totalTokens' | 'inputTokens' | 'outputTokens' | 'cacheReadTokens'
>

interface UserDetailPageProps {
  username: string
  records: BillingRecord[]
  onBack: () => void
}

export function UserDetailPage({ username, records, onBack }: UserDetailPageProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  type MetricMode = 'cost' | 'credits' | 'tokens'
  const [chartMetric, setChartMetric] = useState<MetricMode>('cost')
  const [modelSortField, setModelSortField] = useState<ModelSortField>('grossAmount')
  const [modelSortDir, setModelSortDir] = useState<'asc' | 'desc'>('desc')

  const userRecords = useMemo(
    () => records.filter((r) => r.username === username),
    [records, username]
  )
  const metrics = useMemo(() => computeSummaryMetrics(userRecords), [userRecords])
  const dailyData = useMemo(() => computeDailySummaries(userRecords), [userRecords])
  const modelData = useMemo(
    () => computeModelSummaries(userRecords, metrics.totalGrossAmount),
    [userRecords, metrics.totalGrossAmount]
  )
  const repoData = useMemo(() => computeRepositorySummaries(userRecords), [userRecords])

  // カラーパレット定義（モデル識別用）
  const MODEL_COLORS = [
    '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6',
    '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
    '#e11d48', '#d97706', '#a855f7', '#22c55e', '#fb923c', '#64748b',
  ]

  // 該当ユーザーが使用した全モデル一覧
  const allModels = useMemo(
    () => [...new Set(userRecords.map((r) => r.model).filter(Boolean))].sort(),
    [userRecords]
  )

  // モデルごとのカラーマップ
  const modelColorMap = useMemo(() => {
    const map: Record<string, string> = {}
    allModels.forEach((m, idx) => {
      map[m] = MODEL_COLORS[idx % MODEL_COLORS.length]
    })
    return map
  }, [allModels])

  // 日別 × モデル別の詳細集計データ
  const dailyByModel = useMemo(() => {
    const dateMap = new Map<
      string,
      {
        totalGross: number
        totalCredits: number
        totalTokens: number
        details: Record<
          string,
          {
            grossAmount: number
            credits: number
            tokens: number
            input: number
            output: number
            cacheRead: number
            cacheWrite: number
          }
        >
      }
    >()

    for (const r of userRecords) {
      const d = r.date || 'Unknown'
      let row = dateMap.get(d)
      if (!row) {
        row = { totalGross: 0, totalCredits: 0, totalTokens: 0, details: {} }
        dateMap.set(d, row)
      }
      const m = r.model || '(Unknown)'
      if (!row.details[m]) {
        row.details[m] = {
          grossAmount: 0,
          credits: 0,
          tokens: 0,
          input: 0,
          output: 0,
          cacheRead: 0,
          cacheWrite: 0,
        }
      }
      const totalTokens = r.input + r.output + r.cache_read + r.cache_write
      row.totalGross += r.gross_amount
      row.totalCredits += r.quantity
      row.totalTokens += totalTokens

      const dtl = row.details[m]
      dtl.grossAmount += r.gross_amount
      dtl.credits += r.quantity
      dtl.tokens += totalTokens
      dtl.input += r.input
      dtl.output += r.output
      dtl.cacheRead += r.cache_read
      dtl.cacheWrite += r.cache_write
    }

    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rowObj: Record<string, any> = {
          date,
          totalGross: data.totalGross,
          totalCredits: data.totalCredits,
          totalTokens: data.totalTokens,
          details: data.details,
        }
        allModels.forEach((m) => {
          const dtl = data.details[m]
          if (!dtl) {
            rowObj[m] = 0
          } else if (chartMetric === 'cost') {
            rowObj[m] = Number(dtl.grossAmount.toFixed(4))
          } else if (chartMetric === 'credits') {
            rowObj[m] = Number(dtl.credits.toFixed(4))
          } else {
            rowObj[m] = dtl.tokens
          }
        })
        return rowObj
      })
  }, [userRecords, allModels, chartMetric])

  const sortedModelData = useMemo(() => {
    return [...modelData].sort((a, b) => {
      const aVal = a[modelSortField]
      const bVal = b[modelSortField]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return modelSortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      const aNum = Number(aVal)
      const bNum = Number(bVal)
      return modelSortDir === 'asc' ? aNum - bNum : bNum - aNum
    })
  }, [modelData, modelSortField, modelSortDir])

  const handleModelSort = (field: ModelSortField) => {
    if (modelSortField === field) {
      setModelSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setModelSortField(field)
      setModelSortDir('desc')
    }
  }

  const SortIcon = ({ field }: { field: ModelSortField }) => {
    if (modelSortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return modelSortDir === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-indigo-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-indigo-400" />
    )
  }

  const chartAxisStroke = isDark ? '#64748b' : '#94a3b8'
  const gridStroke = isDark ? '#1e293b' : '#f1f5f9'
  const tooltipBg = isDark ? '#0f172a' : '#ffffff'
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0'
  const tooltipText = isDark ? '#f8fafc' : '#0f172a'
  const cardBg = isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
  const sectionBg = isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
  const rowBg = isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'
  const thClass = isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-200'
  const tdClass = isDark ? 'text-slate-300 border-slate-800/60' : 'text-slate-700 border-slate-100'

  // 日別・モデル別ツールチップ
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const DailyModelTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null
    const row = dailyByModel.find((d) => d.date === label)
    if (!row) return null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const total = payload.reduce((s: number, p: any) => s + (Number(p.value) || 0), 0)

    return (
      <div
        style={{
          backgroundColor: tooltipBg,
          borderColor: tooltipBorder,
          color: tooltipText,
          border: '1px solid',
          borderRadius: '10px',
          padding: '10px 14px',
          fontSize: '12px',
          minWidth: '240px',
        }}
        className="shadow-xl space-y-2"
      >
        <div className="font-bold border-b border-slate-700/50 pb-1.5 flex justify-between items-center">
          <span>{label}</span>
          <span className="text-indigo-400 font-extrabold">
            {chartMetric === 'cost'
              ? formatCurrency(total)
              : chartMetric === 'credits'
              ? `${formatNumber(total)} cr`
              : `${formatTokens(total)} tok`}
          </span>
        </div>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {[...payload].reverse().map((p: any) => {
            const modelName = String(p.name ?? '')
            const dtl = row.details[modelName]
            if (!dtl) return null

            return (
              <div key={modelName} className="flex items-start gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: p.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{modelName}</div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between gap-2">
                    <span>{formatCurrency(dtl.grossAmount)}</span>
                    <span>{formatNumber(dtl.credits)} cr</span>
                    <span>{formatTokens(dtl.tokens)} tok</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* ページヘッダー */}
      <div
        className={`sticky top-0 z-30 border-b px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4 ${
          isDark
            ? 'bg-slate-950/95 border-slate-800 backdrop-blur-sm'
            : 'bg-white/95 border-slate-200 backdrop-blur-sm'
        }`}
      >
        <button
          onClick={onBack}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
            isDark
              ? 'border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
              : 'border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>戻る</span>
        </button>
        <div className={`h-5 w-px ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h1 className={`text-base font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {username}
            </h1>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              アクティブ: {dailyData.length} 日間 / レコード数: {userRecords.length} 件
            </p>
          </div>
        </div>
      </div>

      {/* ページ本文 */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* KPIカード */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border ${cardBg}`}>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>定価コスト (Gross)</div>
            <div className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {formatCurrency(metrics.totalGrossAmount)}
            </div>
            <div className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              実質請求: {formatCurrency(metrics.totalNetAmount)}
            </div>
          </div>
          <div className={`p-4 rounded-xl border ${cardBg}`}>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>消費 AI クレジット</div>
            <div className={`text-2xl font-bold mt-1 ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
              {formatNumber(metrics.totalCredits)}
            </div>
            <div className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              月間枠: {userRecords[0]?.total_monthly_quota || '-'}
            </div>
          </div>
          <div className={`p-4 rounded-xl border ${cardBg}`}>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>総消費トークン数</div>
            <div className={`text-2xl font-bold mt-1 ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`}>
              {formatTokens(metrics.totalTokens)}
            </div>
            <div className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              In: {formatTokens(metrics.totalInputTokens)} / Out: {formatTokens(metrics.totalOutputTokens)}
            </div>
          </div>
          <div className={`p-4 rounded-xl border ${cardBg}`}>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cache Read トークン</div>
            <div className={`text-2xl font-bold mt-1 ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>
              {formatTokens(metrics.totalCacheReadTokens)}
            </div>
            <div className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              ヒット率: {formatPercent(metrics.cacheHitRatio)}
            </div>
          </div>
        </div>

        {/* 日別モデル別積み上げチャート */}
        <div className={`p-5 rounded-xl border ${cardBg}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span>日別コスト・モデル別使用量推移</span>
            </h2>

            {/* 指標切り替えスイッチ (コスト / クレジット / トークン) */}
            <div className={`flex items-center gap-1 p-0.5 rounded-lg border text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              <button
                onClick={() => setChartMetric('cost')}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  chartMetric === 'cost'
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                コスト ($)
              </button>
              <button
                onClick={() => setChartMetric('credits')}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  chartMetric === 'credits'
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                クレジット
              </button>
              <button
                onClick={() => setChartMetric('tokens')}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  chartMetric === 'tokens'
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                トークン数
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyByModel} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke={chartAxisStroke}
                  fontSize={11}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis
                  stroke={chartAxisStroke}
                  fontSize={11}
                  tickFormatter={(v) =>
                    chartMetric === 'cost'
                      ? `$${v}`
                      : chartMetric === 'credits'
                      ? formatNumber(v)
                      : formatTokens(v)
                  }
                />
                <Tooltip content={<DailyModelTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
                {allModels.map((m) => (
                  <Bar
                    key={m}
                    dataKey={m}
                    name={m}
                    stackId="a"
                    fill={modelColorMap[m]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* モデル別集計テーブル */}
        <div className={`p-5 rounded-xl border ${cardBg}`}>
          <h2 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <Cpu className="w-4 h-4 text-purple-500" />
            <span>モデル別消費内訳</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  {(
                    [
                      { field: 'model' as ModelSortField, label: 'モデル名', align: 'left' },
                      { field: 'grossAmount' as ModelSortField, label: '定価 ($)', align: 'right' },
                      { field: 'credits' as ModelSortField, label: 'クレジット', align: 'right' },
                      { field: 'totalTokens' as ModelSortField, label: '総トークン', align: 'right' },
                      { field: 'inputTokens' as ModelSortField, label: 'Input', align: 'right' },
                      { field: 'outputTokens' as ModelSortField, label: 'Output', align: 'right' },
                      { field: 'cacheReadTokens' as ModelSortField, label: 'Cache Read', align: 'right' },
                    ] as { field: ModelSortField; label: string; align: 'left' | 'right' }[]
                  ).map(({ field, label, align }) => (
                    <th
                      key={field}
                      onClick={() => handleModelSort(field)}
                      className={`pb-2 px-3 font-semibold cursor-pointer select-none border-b transition-colors ${thClass} ${
                        align === 'right' ? 'text-right' : 'text-left'
                      } hover:${isDark ? 'text-slate-200' : 'text-slate-900'}`}
                    >
                      <span className={`inline-flex items-center gap-1 ${align === 'right' ? 'justify-end w-full' : ''}`}>
                        {label}
                        <SortIcon field={field} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedModelData.map((m, idx) => (
                  <tr
                    key={m.model}
                    className={`border-b transition-colors ${rowBg} ${
                      idx % 2 === 0
                        ? isDark ? 'bg-slate-900/30' : 'bg-white'
                        : isDark ? 'bg-slate-900/10' : 'bg-slate-50/50'
                    } ${tdClass}`}
                  >
                    <td className={`py-2.5 px-3 border-b ${tdClass}`}>
                      <span className={`font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        {m.model}
                      </span>
                    </td>
                    <td className={`py-2.5 px-3 text-right border-b font-mono ${tdClass}`}>
                      {formatCurrency(m.grossAmount)}
                    </td>
                    <td className={`py-2.5 px-3 text-right border-b font-mono ${tdClass}`}>
                      {formatNumber(m.credits)}
                    </td>
                    <td className={`py-2.5 px-3 text-right border-b font-mono ${tdClass}`}>
                      {formatTokens(m.totalTokens)}
                    </td>
                    <td className={`py-2.5 px-3 text-right border-b font-mono ${tdClass}`}>
                      {formatTokens(m.inputTokens)}
                    </td>
                    <td className={`py-2.5 px-3 text-right border-b font-mono ${tdClass}`}>
                      {formatTokens(m.outputTokens)}
                    </td>
                    <td className={`py-2.5 px-3 text-right border-b font-mono ${tdClass}`}>
                      {formatTokens(m.cacheReadTokens)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* リポジトリ別内訳 */}
        <div className={`p-5 rounded-xl border ${cardBg}`}>
          <h2 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <GitBranch className="w-4 h-4 text-cyan-500" />
            <span>リポジトリ別利用状況</span>
          </h2>
          <div className={`rounded-lg border overflow-hidden ${sectionBg}`}>
            {repoData.map((r, idx) => (
              <div
                key={r.repository}
                className={`flex items-center justify-between px-4 py-3 text-xs transition-colors ${
                  idx !== repoData.length - 1
                    ? `border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`
                    : ''
                } ${isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-100'}`}
              >
                <div className="min-w-0 mr-4">
                  <div className={`font-medium truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {r.repository || '(Global / Chat / No Repo)'}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {formatTokens(r.tokens)} tokens
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {formatCurrency(r.grossAmount)}
                  </div>
                  <div className="text-[10px] text-purple-500">{formatNumber(r.credits)} cr</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}