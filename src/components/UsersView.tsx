import { useState, useMemo } from 'react'
import {
  Users,
  Search,
  ArrowUpDown,
  Download,
  ExternalLink,
} from 'lucide-react'
import type { UserSummary } from '../types/billing'
import { formatCurrency, formatTokens, formatNumber } from '../utils/formatters'
import { exportToCsv } from '../utils/csvExporter'
import { useTheme } from '../context/ThemeContext'

interface UsersViewProps {
  userSummaries: UserSummary[]
  onSelectUser: (username: string) => void
}

type SortField =
  | 'grossAmount'
  | 'netAmount'
  | 'credits'
  | 'totalTokens'
  | 'inputTokens'
  | 'outputTokens'
  | 'cacheReadTokens'
  | 'activeDays'
  | 'username'
type SortOrder = 'asc' | 'desc'

export const UsersView: React.FC<UsersViewProps> = ({
  userSummaries,
  onSelectUser,
}) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('grossAmount')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const filteredUsers = useMemo(() => {
    return userSummaries
      .filter((u) =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.topModel.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        let valA = a[sortField]
        let valB = b[sortField]

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortOrder === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA)
        }

        const numA = Number(valA) || 0
        const numB = Number(valB) || 0
        return sortOrder === 'asc' ? numA - numB : numB - numA
      })
  }, [userSummaries, searchTerm, sortField, sortOrder])

  const handleExport = () => {
    const exportData = filteredUsers.map((u) => ({
      username: u.username,
      gross_amount: u.grossAmount,
      discount_amount: u.discountAmount,
      net_amount: u.netAmount,
      credits: u.credits,
      total_tokens: u.totalTokens,
      input_tokens: u.inputTokens,
      output_tokens: u.outputTokens,
      cache_read_tokens: u.cacheReadTokens,
      cache_write_tokens: u.cacheWriteTokens,
      active_days: u.activeDays,
      top_model: u.topModel,
      records: u.recordCount,
    }))
    exportToCsv(exportData, `copilot-users-summary-${new Date().toISOString().slice(0, 10)}`)
  }

  return (
    <div
      className={`border rounded-xl p-5 shadow-sm space-y-4 transition-colors ${
        isDark
          ? 'bg-slate-900/80 border-slate-800'
          : 'bg-white border-slate-200'
      }`}
    >
      {/* Table Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-500" />
          <h3
            className={`text-sm font-semibold ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            ユーザー別 使用量一覧
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              isDark ? 'text-slate-400 bg-slate-800' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {filteredUsers.length} 名
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            />
            <input
              type="text"
              placeholder="ユーザー名・モデルで絞り込み..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-8 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:border-indigo-500 transition-colors ${
                isDark
                  ? 'bg-slate-950 border-slate-700 text-slate-200 placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
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
      </div>

      {/* Table View */}
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
              <th
                onClick={() => handleSort('username')}
                className={`py-3 px-3 cursor-pointer ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>ユーザー (クリックで詳細)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('grossAmount')}
                className={`py-3 px-3 cursor-pointer text-right ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>総コスト (Gross)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('netAmount')}
                className={`py-3 px-3 cursor-pointer text-right ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>実質請求額 (Net)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('credits')}
                className={`py-3 px-3 cursor-pointer text-right ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>AI Credits</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('totalTokens')}
                className={`py-3 px-3 cursor-pointer text-right ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>総トークン</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('cacheReadTokens')}
                className={`py-3 px-3 cursor-pointer text-right ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Cache Read</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3">主な使用モデル</th>
              <th
                onClick={() => handleSort('activeDays')}
                className={`py-3 px-3 cursor-pointer text-center ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>利用日数</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">詳細</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              isDark
                ? 'divide-slate-800/60 text-slate-300'
                : 'divide-slate-200 text-slate-700'
            }`}
          >
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  該当するユーザーがいません
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.username}
                  className={`transition-colors group ${
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Clickable Username */}
                  <td
                    onClick={() => onSelectUser(user.username)}
                    className="py-3 px-3 font-medium cursor-pointer"
                    title={`${user.username} の詳細な使用データを表示`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-transform group-hover:scale-105 ${
                          isDark
                            ? 'bg-slate-800 border-slate-700 text-indigo-400'
                            : 'bg-indigo-50 border-indigo-200 text-indigo-600'
                        }`}
                      >
                        {user.username.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-indigo-500 hover:text-indigo-400 hover:underline transition-colors flex items-center gap-1">
                        <span>{user.username}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </span>
                    </div>
                  </td>

                  <td
                    className={`py-3 px-3 text-right font-semibold ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {formatCurrency(user.grossAmount)}
                  </td>

                  <td className="py-3 px-3 text-right font-medium text-emerald-500">
                    {formatCurrency(user.netAmount)}
                  </td>

                  <td
                    className={`py-3 px-3 text-right font-mono ${
                      isDark ? 'text-purple-300' : 'text-purple-600'
                    }`}
                  >
                    {formatNumber(user.credits)}
                  </td>

                  <td
                    className={`py-3 px-3 text-right font-mono ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}
                  >
                    {formatTokens(user.totalTokens)}
                  </td>

                  <td
                    className={`py-3 px-3 text-right font-mono ${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`}
                  >
                    {formatTokens(user.cacheReadTokens)}
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] border max-w-[150px] truncate ${
                        isDark
                          ? 'bg-slate-800 text-slate-300 border-slate-700/60'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {user.topModel}
                    </span>
                  </td>

                  <td
                    className={`py-3 px-3 text-center ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {user.activeDays} 日
                  </td>

                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onSelectUser(user.username)}
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-500 hover:text-indigo-400 hover:underline cursor-pointer font-medium"
                    >
                      <span>分析</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
