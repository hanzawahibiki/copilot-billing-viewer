import { useMemo } from 'react'
import {
  X,
  User,
  TrendingUp,
  Cpu,
  GitBranch,
} from 'lucide-react'
import type { BillingRecord } from '../types/billing'
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
} from 'recharts'
import { useTheme } from '../context/ThemeContext'

interface UserDetailModalProps {
  username: string
  records: BillingRecord[]
  onClose: () => void
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  username,
  records,
  onClose,
}) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const userRecords = useMemo(
    () => records.filter((r) => r.username === username),
    [records, username]
  )

  const metrics = useMemo(
    () => computeSummaryMetrics(userRecords),
    [userRecords]
  )

  const dailyData = useMemo(
    () => computeDailySummaries(userRecords),
    [userRecords]
  )

  const modelData = useMemo(
    () => computeModelSummaries(userRecords, metrics.totalGrossAmount),
    [userRecords, metrics.totalGrossAmount]
  )

  const repoData = useMemo(
    () => computeRepositorySummaries(userRecords),
    [userRecords]
  )

  const chartAxisStroke = isDark ? '#64748b' : '#94a3b8'
  const gridStroke = isDark ? '#1e293b' : '#f1f5f9'
  const tooltipBg = isDark ? '#0f172a' : '#ffffff'
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0'
  const tooltipText = isDark ? '#f8fafc' : '#0f172a'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div
        className={`border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark
              ? 'bg-slate-950/60 border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3
                className={`text-lg font-bold flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                <span>{username}</span>
                <span
                  className={`text-xs font-normal ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  の個別利用分析
                </span>
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {dailyData.length} 日間利用 • {userRecords.length} レコード
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* User KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              className={`p-3.5 rounded-xl border ${
                isDark
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                総コスト (Gross)
              </div>
              <div
                className={`text-xl font-bold mt-0.5 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {formatCurrency(metrics.totalGrossAmount)}
              </div>
              <div
                className={`text-[10px] mt-1 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Net: {formatCurrency(metrics.totalNetAmount)}
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isDark
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                AI Credits
              </div>
              <div
                className={`text-xl font-bold mt-0.5 ${
                  isDark ? 'text-purple-300' : 'text-purple-600'
                }`}
              >
                {formatNumber(metrics.totalCredits)}
              </div>
              <div
                className={`text-[10px] mt-1 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Quota: {userRecords[0]?.total_monthly_quota || '-'}
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isDark
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                総トークン数
              </div>
              <div
                className={`text-xl font-bold mt-0.5 ${
                  isDark ? 'text-cyan-300' : 'text-cyan-600'
                }`}
              >
                {formatTokens(metrics.totalTokens)}
              </div>
              <div
                className={`text-[10px] mt-1 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                In: {formatTokens(metrics.totalInputTokens)} / Out:{' '}
                {formatTokens(metrics.totalOutputTokens)}
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isDark
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Cache Read トークン
              </div>
              <div
                className={`text-xl font-bold mt-0.5 ${
                  isDark ? 'text-amber-300' : 'text-amber-600'
                }`}
              >
                {formatTokens(metrics.totalCacheReadTokens)}
              </div>
              <div
                className={`text-[10px] mt-1 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Hit率: {formatPercent(metrics.cacheHitRatio)}
              </div>
            </div>
          </div>

          {/* Daily Usage Chart for User */}
          <div
            className={`p-4 rounded-xl border ${
              isDark
                ? 'bg-slate-950 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <h4
              className={`text-xs font-semibold mb-3 flex items-center gap-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
              <span>日別コスト推移 ($)</span>
            </h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke={chartAxisStroke}
                    fontSize={10}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis
                    stroke={chartAxisStroke}
                    fontSize={10}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val))}
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: tooltipBorder,
                      color: tooltipText,
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar
                    dataKey="grossAmount"
                    name="Gross Amount"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Models & Repos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Model Breakdown */}
            <div
              className={`p-4 rounded-xl border ${
                isDark
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <h4
                className={`text-xs font-semibold mb-3 flex items-center gap-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-purple-500" />
                <span>モデル別内訳</span>
              </h4>
              <div className="space-y-2">
                {modelData.map((m) => (
                  <div
                    key={m.model}
                    className={`flex items-center justify-between text-xs p-2 rounded border ${
                      isDark
                        ? 'bg-slate-900/60 border-slate-800/80'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <div
                        className={`font-medium ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}
                      >
                        {m.model}
                      </div>
                      <div
                        className={`text-[10px] ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {formatTokens(m.totalTokens)} tokens
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-bold ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {formatCurrency(m.grossAmount)}
                      </div>
                      <div className="text-[10px] text-purple-500">
                        {formatNumber(m.credits)} credits
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Repository Breakdown */}
            <div
              className={`p-4 rounded-xl border ${
                isDark
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <h4
                className={`text-xs font-semibold mb-3 flex items-center gap-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5 text-cyan-500" />
                <span>リポジトリ別内訳</span>
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {repoData.map((r) => (
                  <div
                    key={r.repository}
                    className={`flex items-center justify-between text-xs p-2 rounded border ${
                      isDark
                        ? 'bg-slate-900/60 border-slate-800/80'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <div
                        className={`font-medium truncate ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}
                      >
                        {r.repository}
                      </div>
                      <div
                        className={`text-[10px] ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {formatTokens(r.tokens)} tokens
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div
                        className={`font-bold ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {formatCurrency(r.grossAmount)}
                      </div>
                      <div className="text-[10px] text-purple-500">
                        {formatNumber(r.credits)} cr
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`px-6 py-3 border-t flex justify-end ${
            isDark
              ? 'border-slate-800 bg-slate-950/60'
              : 'border-slate-200 bg-slate-50'
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
