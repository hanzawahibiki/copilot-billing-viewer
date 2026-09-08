import { useState } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'
import type {
  DailySummary,
  ModelSummary,
  UserSummary,
  CostCenterSummary,
} from '../types/billing'
import { formatCurrency, formatTokens, formatNumber } from '../utils/formatters'
import {
  TrendingUp,
  PieChart as PieIcon,
  Award,
  Zap,
  Building2,
  ArrowRight,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface DashboardViewProps {
  dailySummaries: DailySummary[]
  modelSummaries: ModelSummary[]
  userSummaries: UserSummary[]
  costCenterSummaries: CostCenterSummary[]
  onSelectUser: (username: string) => void
  onNavigateToUsers: () => void
}

const COLORS = [
  '#8b5cf6', // purple
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#6366f1', // indigo
]

export const DashboardView: React.FC<DashboardViewProps> = ({
  dailySummaries,
  modelSummaries,
  userSummaries,
  costCenterSummaries,
  onSelectUser,
  onNavigateToUsers,
}) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [costChartType, setCostChartType] = useState<'amount' | 'credits'>('amount')

  const topUsers = userSummaries.slice(0, 5)

  const chartAxisStroke = isDark ? '#64748b' : '#94a3b8'
  const gridStroke = isDark ? '#1e293b' : '#f1f5f9'
  const tooltipBg = isDark ? '#0f172a' : '#ffffff'
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0'
  const tooltipText = isDark ? '#f8fafc' : '#0f172a'

  // Custom tooltip for charts
  const CustomCostTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div
          style={{
            backgroundColor: tooltipBg,
            borderColor: tooltipBorder,
            color: tooltipText,
          }}
          className="border p-3 rounded-lg shadow-xl text-xs space-y-1"
        >
          <div className="font-semibold border-b border-slate-700/50 pb-1 mb-1">
            {label}
          </div>
          <div className="text-indigo-500">
            Gross Amount: <span className="font-bold">{formatCurrency(data.grossAmount)}</span>
          </div>
          <div className="text-emerald-500">
            Net Amount: <span className="font-bold">{formatCurrency(data.netAmount)}</span>
          </div>
          <div className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            Discount: <span className="font-bold">{formatCurrency(data.discountAmount)}</span>
          </div>
          <div className="text-purple-500">
            AI Credits: <span className="font-bold">{formatNumber(data.credits)}</span>
          </div>
          <div className="text-cyan-500">
            Active Users: <span className="font-bold">{data.activeUsers} 名</span>
          </div>
        </div>
      )
    }
    return null
  }

  const CustomTokenTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div
          style={{
            backgroundColor: tooltipBg,
            borderColor: tooltipBorder,
            color: tooltipText,
          }}
          className="border p-3 rounded-lg shadow-xl text-xs space-y-1"
        >
          <div className="font-semibold border-b border-slate-700/50 pb-1 mb-1">
            {label}
          </div>
          <div className="text-cyan-500">
            Total Tokens: <span className="font-bold">{formatTokens(data.tokens)}</span>
          </div>
          <div className="text-blue-500">
            Input: <span className="font-bold">{formatTokens(data.input)}</span>
          </div>
          <div className="text-emerald-500">
            Output: <span className="font-bold">{formatTokens(data.output)}</span>
          </div>
          <div className="text-purple-500">
            Cache Read: <span className="font-bold">{formatTokens(data.cacheRead)}</span>
          </div>
          <div className="text-amber-500">
            Cache Write: <span className="font-bold">{formatTokens(data.cacheWrite)}</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Top Row: Daily Cost Trend + Model Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Trend Chart (2 cols) */}
        <div
          className={`lg:col-span-2 border rounded-xl p-5 shadow-sm transition-colors ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                日別利用・コスト推移
              </h3>
            </div>
            <div
              className={`flex items-center gap-1 p-0.5 rounded-lg border text-xs ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                onClick={() => setCostChartType('amount')}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  costChartType === 'amount'
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                金額 ($)
              </button>
              <button
                onClick={() => setCostChartType('credits')}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  costChartType === 'credits'
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                AI Credits
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dailySummaries} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke={chartAxisStroke}
                  fontSize={11}
                  tickFormatter={(v) => v.slice(5)} // MM-DD
                />
                <YAxis
                  stroke={chartAxisStroke}
                  fontSize={11}
                  tickFormatter={(v) =>
                    costChartType === 'amount' ? `$${v}` : formatTokens(v)
                  }
                />
                <Tooltip content={<CustomCostTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconType="circle"
                />
                {costChartType === 'amount' ? (
                  <>
                    <Bar
                      dataKey="grossAmount"
                      name="Gross Cost ($)"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="netAmount"
                      name="Net Billed ($)"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="activeUsers"
                      name="Active Users"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  </>
                ) : (
                  <>
                    <Bar
                      dataKey="credits"
                      name="AI Credits"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="activeUsers"
                      name="Active Users"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Share Pie Chart (1 col) */}
        <div
          className={`border rounded-xl p-5 shadow-sm flex flex-col justify-between transition-colors ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <PieIcon className="w-4 h-4 text-purple-500" />
            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              モデル別コスト割合
            </h3>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modelSummaries}
                  dataKey="grossAmount"
                  nameKey="model"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {modelSummaries.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke={isDark ? '#0f172a' : '#ffffff'}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val))}
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    color: tooltipText,
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend list */}
          <div
            className={`space-y-1.5 pt-2 border-t max-h-36 overflow-y-auto ${
              isDark ? 'border-slate-800/80' : 'border-slate-100'
            }`}
          >
            {modelSummaries.map((m, idx) => (
              <div key={m.model} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span
                    className={`truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                    title={m.model}
                  >
                    {m.model}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {formatCurrency(m.grossAmount)}
                  </span>
                  <span className={`w-10 text-right ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {(m.percentage * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row: Token Volume Trend + Top Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token Volume Stacked Area Chart (2 cols) */}
        <div
          className={`lg:col-span-2 border rounded-xl p-5 shadow-sm transition-colors ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-500" />
              <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                日別トークン消費推移 (Tokens)
              </h3>
            </div>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Input / Output / Cache Read / Cache Write
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailySummaries}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCacheRead" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  tickFormatter={(v) => formatTokens(v)}
                />
                <Tooltip content={<CustomTokenTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="cacheRead"
                  name="Cache Read"
                  stroke="#a855f7"
                  fillOpacity={1}
                  fill="url(#colorCacheRead)"
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="input"
                  name="Input"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorInput)"
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="output"
                  name="Output"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorOutput)"
                  stackId="1"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Users Leaderboard (1 col) */}
        <div
          className={`border rounded-xl p-5 shadow-sm flex flex-col justify-between transition-colors ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              利用上位ユーザー Top 5
            </h3>
          </div>

          <div className="space-y-3">
            {topUsers.map((user, idx) => (
              <div
                key={user.username}
                onClick={() => onSelectUser(user.username)}
                className={`group p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  isDark
                    ? 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-indigo-500/40'
                    : 'bg-slate-50 hover:bg-indigo-50/50 border-slate-100 hover:border-indigo-200'
                }`}
                title="クリックして個別詳細を表示"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0
                        ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
                        : idx === 1
                        ? 'bg-slate-400/20 text-slate-400 border border-slate-400/40'
                        : idx === 2
                        ? 'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                        : isDark
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-xs font-semibold truncate group-hover:text-indigo-500 transition-colors ${
                        isDark ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      {user.username}
                    </div>
                    <div
                      className={`text-[11px] truncate ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {user.topModel} • {formatTokens(user.totalTokens)} tok
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-2">
                  <div
                    className={`text-xs font-bold ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {formatCurrency(user.grossAmount)}
                  </div>
                  <div
                    className={`text-[10px] ${
                      isDark ? 'text-purple-300' : 'text-purple-600'
                    }`}
                  >
                    {formatNumber(user.credits)} credits
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigates to Users tab */}
          <div
            className={`pt-3 border-t text-center ${
              isDark ? 'border-slate-800/80' : 'border-slate-100'
            }`}
          >
            <button
              type="button"
              onClick={onNavigateToUsers}
              className="text-xs text-indigo-500 hover:text-indigo-600 font-medium cursor-pointer inline-flex items-center gap-1 hover:underline transition-colors"
            >
              <span>ユーザー一覧タブで全員の明細を表示</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Cost Centers Quick Bar */}
      {costCenterSummaries.length > 1 && (
        <div
          className={`border rounded-xl p-5 shadow-sm transition-colors ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-emerald-500" />
            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              コストセンター別 利用集計
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {costCenterSummaries.slice(0, 4).map((cc) => (
              <div
                key={cc.name}
                className={`p-3.5 rounded-lg border ${
                  isDark
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-slate-50 border-slate-100'
                }`}
              >
                <div
                  className={`text-xs truncate ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                  title={cc.name}
                >
                  {cc.name}
                </div>
                <div
                  className={`text-lg font-bold mt-1 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {formatCurrency(cc.grossAmount)}
                </div>
                <div
                  className={`mt-1 text-xs flex justify-between ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  <span>{cc.userCount} 名</span>
                  <span>{formatTokens(cc.tokens)} tokens</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
