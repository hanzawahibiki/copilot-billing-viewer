import {
  DollarSign,
  TrendingDown,
  Sparkles,
  Zap,
  Users,
  Database,
  Cpu,
} from 'lucide-react'
import type { SummaryMetrics } from '../types/billing'
import { formatCurrency, formatTokens, formatPercent, formatNumber } from '../utils/formatters'
import { useTheme } from '../context/ThemeContext'

interface MetricCardsProps {
  metrics: SummaryMetrics
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const cardBaseClass = `border rounded-xl p-4 sm:p-5 shadow-sm transition-colors ${
    isDark ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
  }`

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Gross Amount */}
      <div className={cardBaseClass}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            総コスト (Gross)
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {formatCurrency(metrics.totalGrossAmount)}
          </span>
        </div>
        <div className={`mt-2 text-xs flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <span>定価換算の総利用額</span>
        </div>
      </div>

      {/* Net Amount & Discount */}
      <div className={cardBaseClass}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            実質請求額 (Net)
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-emerald-500 tracking-tight">
            {formatCurrency(metrics.totalNetAmount)}
          </span>
        </div>
        <div className="mt-2 text-xs flex items-center gap-1">
          <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>割引/割当額:</span>
          <span className="text-indigo-500 font-medium">
            {formatCurrency(metrics.totalDiscountAmount)}
          </span>
        </div>
      </div>

      {/* AI Credits */}
      <div className={cardBaseClass}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            総消費クレジット
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
            {formatNumber(metrics.totalCredits)}
          </span>
          <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            credits
          </span>
        </div>
        <div className={`mt-2 text-xs flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <span>単価: $0.01 / credit</span>
        </div>
      </div>

      {/* Active Users & Models */}
      <div className={cardBaseClass}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            ユーザー & モデル
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {metrics.uniqueUsersCount}
          </span>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            名のアクティブ利用
          </span>
        </div>
        <div className={`mt-2 text-xs flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-purple-500" />
            <span>{metrics.uniqueModelsCount} モデル稼働</span>
          </span>
          <span>•</span>
          <span>{metrics.recordCount.toLocaleString()} 明細</span>
        </div>
      </div>

      {/* Token Metrics Row */}
      <div
        className={`sm:col-span-2 lg:col-span-4 border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 transition-colors ${
          isDark
            ? 'bg-slate-900/50 border-slate-800/80'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              総処理トークン (Total Tokens)
            </div>
            <div className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {formatTokens(metrics.totalTokens)}{' '}
              <span className={`text-xs font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                ({metrics.totalTokens.toLocaleString()} tokens)
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <div>
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Input:</span>{' '}
              <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {formatTokens(metrics.totalInputTokens)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <div>
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Output:</span>{' '}
              <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {formatTokens(metrics.totalOutputTokens)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <div>
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Cache Read:</span>{' '}
              <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {formatTokens(metrics.totalCacheReadTokens)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div>
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Cache Write:</span>{' '}
              <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {formatTokens(metrics.totalCacheWriteTokens)}
              </span>
            </div>
          </div>

          <div
            className={`pl-2 border-l flex items-center gap-1.5 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-cyan-500" />
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              キャッシュヒット率:
            </span>
            <span className="font-bold text-cyan-500">
              {formatPercent(metrics.cacheHitRatio)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
