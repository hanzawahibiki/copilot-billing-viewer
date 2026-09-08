import { useState } from 'react'
import { Building2, GitBranch, Download } from 'lucide-react'
import type { CostCenterSummary, RepositorySummary } from '../types/billing'
import { formatCurrency, formatTokens, formatNumber } from '../utils/formatters'
import { exportToCsv } from '../utils/csvExporter'
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

interface CostCentersViewProps {
  costCenterSummaries: CostCenterSummary[]
  repositorySummaries: RepositorySummary[]
}

export const CostCentersView: React.FC<CostCentersViewProps> = ({
  costCenterSummaries,
  repositorySummaries,
}) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [activeTab, setActiveTab] = useState<'costcenter' | 'repository'>('costcenter')

  const chartAxisStroke = isDark ? '#64748b' : '#94a3b8'
  const gridStroke = isDark ? '#1e293b' : '#f1f5f9'
  const tooltipBg = isDark ? '#0f172a' : '#ffffff'
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0'
  const tooltipText = isDark ? '#f8fafc' : '#0f172a'

  const handleExportCostCenters = () => {
    const exportData = costCenterSummaries.map((c) => ({
      cost_center: c.name,
      gross_amount: c.grossAmount,
      net_amount: c.netAmount,
      credits: c.credits,
      tokens: c.tokens,
      users: c.userCount,
    }))
    exportToCsv(exportData, `copilot-cost-centers-${new Date().toISOString().slice(0, 10)}`)
  }

  const handleExportRepos = () => {
    const exportData = repositorySummaries.map((r) => ({
      repository: r.repository,
      gross_amount: r.grossAmount,
      net_amount: r.netAmount,
      credits: r.credits,
      tokens: r.tokens,
      users: r.userCount,
    }))
    exportToCsv(exportData, `copilot-repositories-${new Date().toISOString().slice(0, 10)}`)
  }

  return (
    <div className="space-y-6">
      {/* Sub tabs */}
      <div
        className={`flex items-center gap-2 border-b pb-3 ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <button
          onClick={() => setActiveTab('costcenter')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activeTab === 'costcenter'
              ? 'bg-indigo-600 text-white shadow-sm'
              : isDark
              ? 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>コストセンター別 ({costCenterSummaries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('repository')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activeTab === 'repository'
              ? 'bg-indigo-600 text-white shadow-sm'
              : isDark
              ? 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>リポジトリ別 ({repositorySummaries.length})</span>
        </button>
      </div>

      {activeTab === 'costcenter' ? (
        <div className="space-y-6">
          {/* Cost Center Chart */}
          <div
            className={`border rounded-xl p-5 shadow-sm transition-colors ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`text-sm font-semibold flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4 text-emerald-500" />
                <span>コストセンター別 コスト比較</span>
              </h3>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={costCenterSummaries}
                  margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke={chartAxisStroke}
                    fontSize={11}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke={chartAxisStroke}
                    fontSize={11}
                    tickFormatter={(v) => `$${v}`}
                  />
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
                  <Bar
                    dataKey="grossAmount"
                    name="Gross Amount ($)"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cost Center Table */}
          <div
            className={`border rounded-xl p-5 shadow-sm space-y-4 transition-colors ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                コストセンター集計明細
              </h4>
              <button
                onClick={handleExportCostCenters}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer transition-colors ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-cyan-500" />
                <span>CSV出力</span>
              </button>
            </div>

            <div
              className={`overflow-x-auto rounded-lg border ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              <table className="w-full text-left text-xs">
                <thead
                  className={`uppercase tracking-wider font-medium border-b ${
                    isDark
                      ? 'bg-slate-950/80 text-slate-400 border-slate-800'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <tr>
                    <th className="py-3 px-3">コストセンター名</th>
                    <th className="py-3 px-3 text-right">総コスト (Gross)</th>
                    <th className="py-3 px-3 text-right">実質請求額 (Net)</th>
                    <th className="py-3 px-3 text-right">クレジット (cr)</th>
                    <th className="py-3 px-3 text-right">総トークン数</th>
                    <th className="py-3 px-3 text-center">所属ユーザー数</th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDark
                      ? 'divide-slate-800/60 text-slate-300'
                      : 'divide-slate-200 text-slate-700'
                  }`}
                >
                  {costCenterSummaries.map((c) => (
                    <tr
                      key={c.name}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td
                        className={`py-3 px-3 font-semibold flex items-center gap-2 ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{c.name}</span>
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          isDark ? 'text-slate-100' : 'text-slate-900'
                        }`}
                      >
                        {formatCurrency(c.grossAmount)}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-emerald-500">
                        {formatCurrency(c.netAmount)}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-mono ${
                          isDark ? 'text-purple-300' : 'text-purple-600'
                        }`}
                      >
                        {formatNumber(c.credits)}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-mono ${
                          isDark ? 'text-cyan-300' : 'text-cyan-600'
                        }`}
                      >
                        {formatTokens(c.tokens)}
                      </td>
                      <td
                        className={`py-3 px-3 text-center ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {c.userCount} 名
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Repository Chart */}
          <div
            className={`border rounded-xl p-5 shadow-sm transition-colors ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`text-sm font-semibold flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                <GitBranch className="w-4 h-4 text-cyan-500" />
                <span>リポジトリ別 コスト比較 (Top 10)</span>
              </h3>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={repositorySummaries.slice(0, 10)}
                  margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis
                    dataKey="repository"
                    stroke={chartAxisStroke}
                    fontSize={11}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke={chartAxisStroke}
                    fontSize={11}
                    tickFormatter={(v) => `$${v}`}
                  />
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
                  <Bar
                    dataKey="grossAmount"
                    name="Gross Amount ($)"
                    fill="#06b6d4"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Repository Table */}
          <div
            className={`border rounded-xl p-5 shadow-sm space-y-4 transition-colors ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                リポジトリ集計明細
              </h4>
              <button
                onClick={handleExportRepos}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer transition-colors ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-cyan-500" />
                <span>CSV出力</span>
              </button>
            </div>

            <div
              className={`overflow-x-auto rounded-lg border ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              <table className="w-full text-left text-xs">
                <thead
                  className={`uppercase tracking-wider font-medium border-b ${
                    isDark
                      ? 'bg-slate-950/80 text-slate-400 border-slate-800'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <tr>
                    <th className="py-3 px-3">リポジトリ</th>
                    <th className="py-3 px-3 text-right">総コスト (Gross)</th>
                    <th className="py-3 px-3 text-right">実質請求額 (Net)</th>
                    <th className="py-3 px-3 text-right">クレジット (cr)</th>
                    <th className="py-3 px-3 text-right">総トークン数</th>
                    <th className="py-3 px-3 text-center">利用者数</th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDark
                      ? 'divide-slate-800/60 text-slate-300'
                      : 'divide-slate-200 text-slate-700'
                  }`}
                >
                  {repositorySummaries.map((r) => (
                    <tr
                      key={r.repository}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td
                        className={`py-3 px-3 font-semibold flex items-center gap-2 ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        <GitBranch className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
                        <span className="truncate max-w-xs">{r.repository}</span>
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          isDark ? 'text-slate-100' : 'text-slate-900'
                        }`}
                      >
                        {formatCurrency(r.grossAmount)}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-emerald-500">
                        {formatCurrency(r.netAmount)}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-mono ${
                          isDark ? 'text-purple-300' : 'text-purple-600'
                        }`}
                      >
                        {formatNumber(r.credits)}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-mono ${
                          isDark ? 'text-cyan-300' : 'text-cyan-600'
                        }`}
                      >
                        {formatTokens(r.tokens)}
                      </td>
                      <td
                        className={`py-3 px-3 text-center ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {r.userCount} 名
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
