import { useState, useMemo } from 'react'
import {
  TableProperties,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react'
import type { BillingRecord } from '../types/billing'
import { formatCurrency, formatNumber } from '../utils/formatters'
import { exportToCsv } from '../utils/csvExporter'
import { useTheme } from '../context/ThemeContext'

interface RawDataViewProps {
  records: BillingRecord[]
}

type SortKey = keyof BillingRecord

export const RawDataView: React.FC<RawDataViewProps> = ({ records }) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [searchTerm, setSearchTerm] = useState('')
  const [pageSize, setPageSize] = useState<number>(50)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortAsc, setSortAsc] = useState<boolean>(false)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(false) // default desc for most metrics
    }
  }

  const filteredAndSorted = useMemo(() => {
    const q = searchTerm.toLowerCase()
    let result = records

    if (q) {
      result = result.filter(
        (r) =>
          r.username.toLowerCase().includes(q) ||
          r.model.toLowerCase().includes(q) ||
          r.repository.toLowerCase().includes(q) ||
          r.cost_center_name.toLowerCase().includes(q) ||
          r.date.includes(q)
      )
    }

    return [...result].sort((a, b) => {
      const valA = a[sortKey]
      const valB = b[sortKey]

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
      }

      const numA = Number(valA) || 0
      const numB = Number(valB) || 0
      return sortAsc ? numA - numB : numB - numA
    })
  }, [records, searchTerm, sortKey, sortAsc])

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize) || 1
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredAndSorted.slice(start, start + pageSize)
  }, [filteredAndSorted, currentPage, pageSize])

  const handleExport = () => {
    const exportData = filteredAndSorted.map((r) => ({
      date: r.date,
      username: r.username,
      product: r.product,
      sku: r.sku,
      model: r.model,
      quantity: r.quantity,
      unit_type: r.unit_type,
      applied_cost_per_quantity: r.applied_cost_per_quantity,
      gross_amount: r.gross_amount,
      discount_amount: r.discount_amount,
      net_amount: r.net_amount,
      total_monthly_quota: r.total_monthly_quota,
      organization: r.organization,
      repository: r.repository,
      cost_center_name: r.cost_center_name,
      aic_quantity: r.aic_quantity,
      aic_gross_amount: r.aic_gross_amount,
      input: r.input,
      output: r.output,
      cache_read: r.cache_read,
      cache_write: r.cache_write,
    }))
    exportToCsv(exportData, `copilot-raw-records-${new Date().toISOString().slice(0, 10)}`)
  }

  return (
    <div
      className={`border rounded-xl p-5 shadow-sm space-y-4 transition-colors ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TableProperties className="w-4 h-4 text-indigo-500" />
          <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            明細レコード探索 (Raw Records)
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              isDark ? 'text-slate-400 bg-slate-800' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {filteredAndSorted.length.toLocaleString()} 行
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            />
            <input
              type="text"
              placeholder="テーブル内を検索..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className={`pl-8 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:border-indigo-500 transition-colors ${
                isDark
                  ? 'bg-slate-950 border-slate-700 text-slate-200 placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>

          <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <span>表示件数:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className={`border rounded px-2 py-1 text-xs focus:outline-none cursor-pointer ${
                isDark
                  ? 'bg-slate-950 border-slate-700 text-slate-200'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value={25}>25件</option>
              <option value={50}>50件</option>
              <option value={100}>100件</option>
              <option value={200}>200件</option>
            </select>
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

      {/* Table */}
      <div
        className={`overflow-x-auto rounded-lg border max-h-[600px] overflow-y-auto ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead
            className={`sticky top-0 z-10 uppercase tracking-wider font-medium border-b ${
              isDark
                ? 'bg-slate-950 text-slate-400 border-slate-800'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <tr>
              <th
                onClick={() => handleSort('date')}
                className={`py-2.5 px-3 cursor-pointer ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>日付</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('username')}
                className={`py-2.5 px-3 cursor-pointer ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>ユーザー</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('model')}
                className={`py-2.5 px-3 cursor-pointer ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>モデル</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('gross_amount')}
                className={`py-2.5 px-3 cursor-pointer text-right ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Gross ($)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('net_amount')}
                className={`py-2.5 px-3 cursor-pointer text-right ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Net ($)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('quantity')}
                className={`py-2.5 px-3 cursor-pointer text-right ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Credits</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('input')}
                className={`py-2.5 px-3 cursor-pointer text-right ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Input</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('output')}
                className={`py-2.5 px-3 cursor-pointer text-right ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Output</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('cache_read')}
                className={`py-2.5 px-3 cursor-pointer text-right ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Cache Read</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('cache_write')}
                className={`py-2.5 px-3 cursor-pointer text-right ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Cache Write</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3">リポジトリ</th>
              <th className="py-2.5 px-3">コストセンター</th>
              <th className="py-2.5 px-3">Quota</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              isDark
                ? 'divide-slate-800/60 text-slate-300'
                : 'divide-slate-200 text-slate-700'
            }`}
          >
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-8 text-center text-slate-500">
                  条件に一致するレコードがありません
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr
                  key={row.id}
                  className={`transition-colors ${
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <td
                    className={`py-2 px-3 font-mono ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {row.date}
                  </td>
                  <td
                    className={`py-2 px-3 font-medium ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}
                  >
                    {row.username}
                  </td>
                  <td
                    className={`py-2 px-3 ${
                      isDark ? 'text-purple-300' : 'text-purple-600'
                    }`}
                  >
                    {row.model}
                  </td>
                  <td
                    className={`py-2 px-3 text-right font-semibold ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {formatCurrency(row.gross_amount, 4)}
                  </td>
                  <td className="py-2 px-3 text-right font-medium text-emerald-500">
                    {formatCurrency(row.net_amount, 4)}
                  </td>
                  <td
                    className={`py-2 px-3 text-right font-mono ${
                      isDark ? 'text-purple-300' : 'text-purple-600'
                    }`}
                  >
                    {formatNumber(row.quantity)}
                  </td>
                  <td
                    className={`py-2 px-3 text-right font-mono ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    {row.input.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-500">
                    {row.output.toLocaleString()}
                  </td>
                  <td
                    className={`py-2 px-3 text-right font-mono ${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`}
                  >
                    {row.cache_read.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-amber-500">
                    {row.cache_write.toLocaleString()}
                  </td>
                  <td
                    className={`py-2 px-3 truncate max-w-xs ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                    title={row.repository}
                  >
                    {row.repository || '-'}
                  </td>
                  <td
                    className={`py-2 px-3 truncate max-w-xs ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                    title={row.cost_center_name}
                  >
                    {row.cost_center_name || '-'}
                  </td>
                  <td
                    className={`py-2 px-3 text-right font-mono ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {row.total_monthly_quota || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 text-xs pt-2 ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}
      >
        <div>
          <span>
            全 {filteredAndSorted.length.toLocaleString()} 件中{' '}
            {((currentPage - 1) * pageSize + 1).toLocaleString()} 〜{' '}
            {Math.min(currentPage * pageSize, filteredAndSorted.length).toLocaleString()} 件を表示
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className={`p-1.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span
            className={`px-2 font-medium ${
              isDark ? 'text-slate-200' : 'text-slate-800'
            }`}
          >
            {currentPage} / {totalPages} ページ
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className={`p-1.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
