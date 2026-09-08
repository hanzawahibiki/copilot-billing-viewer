import { Cpu, Download, Zap } from 'lucide-react'
import type { ModelSummary } from '../types/billing'
import { formatCurrency, formatTokens, formatPercent, formatNumber } from '../utils/formatters'
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

interface ModelsViewProps {
  modelSummaries: ModelSummary[]
}

export const ModelsView: React.FC<ModelsViewProps> = ({ modelSummaries }) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const chartAxisStroke = isDark ? '#64748b' : '#94a3b8'
  const gridStroke = isDark ? '#1e293b' : '#f1f5f9'
  const tooltipBg = isDark ? '#0f172a' : '#ffffff'
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0'
  const tooltipText = isDark ? '#f8fafc' : '#0f172a'

  const handleExport = () => {
    const exportData = modelSummaries.map((m) => ({
      model: m.model,
      gross_amount: m.grossAmount,
      net_amount: m.netAmount,
      credits: m.credits,
      total_tokens: m.totalTokens,
      input_tokens: m.inputTokens,
      output_tokens: m.outputTokens,
      cache_read_tokens: m.cacheReadTokens,
      cache_write_tokens: m.cacheWriteTokens,
      user_count: m.userCount,
      percentage: (m.percentage * 100).toFixed(2) + '%',
    }))
    exportToCsv(exportData, `copilot-models-summary-${new Date().toISOString().slice(0, 10)}`)
  }

  return (
    <div className="space-y-6">
      {/* Comparison Chart */}
      <div
        className={`border rounded-xl p-5 shadow-sm transition-colors ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-500" />
            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              モデル別 コスト・クレジット比較
            </h3>
          </div>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {modelSummaries.length} モデルが利用されています
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={modelSummaries}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 50, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
              <XAxis
                type="number"
                stroke={chartAxisStroke}
                fontSize={11}
                tickFormatter={(v) => `$${v}`}
              />
              <YAxis
                type="category"
                dataKey="model"
                stroke={chartAxisStroke}
                fontSize={11}
                width={130}
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
                fill="#8b5cf6"
                radius={[0, 4, 4, 0]}
              />
              <Bar
                dataKey="netAmount"
                name="Net Amount ($)"
                fill="#10b981"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Cards & Breakdown Table */}
      <div
        className={`border rounded-xl p-5 shadow-sm space-y-4 transition-colors ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-500" />
            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              モデル別 トークン & コスト詳細
            </h3>
          </div>

          <button
            onClick={handleExport}
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
                <th className="py-3 px-3">モデル名</th>
                <th className="py-3 px-3 text-right">総コスト (Gross)</th>
                <th className="py-3 px-3 text-right">実質請求額 (Net)</th>
                <th className="py-3 px-3 text-right">クレジット (cr)</th>
                <th className="py-3 px-3 text-right">Input Tokens</th>
                <th className="py-3 px-3 text-right">Output Tokens</th>
                <th className="py-3 px-3 text-right">Cache Read</th>
                <th className="py-3 px-3 text-right">Cache Write</th>
                <th className="py-3 px-3 text-center">利用者数</th>
                <th className="py-3 px-3 text-right">コストシェア</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark
                  ? 'divide-slate-800/60 text-slate-300'
                  : 'divide-slate-200 text-slate-700'
              }`}
            >
              {modelSummaries.map((m) => (
                <tr
                  key={m.model}
                  className={`transition-colors ${
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <td
                    className={`py-3 px-3 font-semibold flex items-center gap-2 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>{m.model}</span>
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-bold ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}
                  >
                    {formatCurrency(m.grossAmount)}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-emerald-500">
                    {formatCurrency(m.netAmount)}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono ${
                      isDark ? 'text-purple-300' : 'text-purple-600'
                    }`}
                  >
                    {formatNumber(m.credits)}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    {formatTokens(m.inputTokens)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-500">
                    {formatTokens(m.outputTokens)}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono ${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`}
                  >
                    {formatTokens(m.cacheReadTokens)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-amber-500">
                    {formatTokens(m.cacheWriteTokens)}
                  </td>
                  <td
                    className={`py-3 px-3 text-center ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {m.userCount} 名
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-indigo-500">
                    {formatPercent(m.percentage)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
