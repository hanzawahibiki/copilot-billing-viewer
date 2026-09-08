import { useState } from 'react'
import {
  Calendar,
  Users,
  Cpu,
  Search,
  RotateCcw,
  Building2,
  GitBranch,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { FilterState } from '../types/billing'
import { useTheme } from '../context/ThemeContext'

interface FilterBarProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  availableUsers: string[]
  availableModels: string[]
  availableCostCenters: string[]
  availableRepositories: string[]
  availableDates: { minDate: string; maxDate: string }
  totalCount: number
  filteredCount: number
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  availableUsers,
  availableModels,
  availableCostCenters,
  availableRepositories,
  availableDates,
  totalCount,
  filteredCount,
}) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [isExpanded, setIsExpanded] = useState(false)

  const handleReset = () => {
    onFilterChange({
      startDate: availableDates.minDate,
      endDate: availableDates.maxDate,
      selectedUsers: [],
      selectedModels: [],
      selectedCostCenters: [],
      selectedRepositories: [],
      searchQuery: '',
    })
  }

  const setPresetDate = (days: number | 'all' | 'month') => {
    if (days === 'all') {
      onFilterChange({
        ...filters,
        startDate: availableDates.minDate,
        endDate: availableDates.maxDate,
      })
      return
    }

    if (!availableDates.maxDate) return

    const max = new Date(availableDates.maxDate)
    let min = new Date(max)

    if (days === 'month') {
      min = new Date(max.getFullYear(), max.getMonth(), 1)
    } else {
      min.setDate(max.getDate() - days)
    }

    const minStr = min.toISOString().slice(0, 10)
    const maxStr = max.toISOString().slice(0, 10)

    onFilterChange({
      ...filters,
      startDate: minStr < availableDates.minDate ? availableDates.minDate : minStr,
      endDate: maxStr,
    })
  }

  const isFilterActive =
    filters.selectedUsers.length > 0 ||
    filters.selectedModels.length > 0 ||
    filters.selectedCostCenters.length > 0 ||
    filters.selectedRepositories.length > 0 ||
    filters.searchQuery !== '' ||
    filters.startDate !== availableDates.minDate ||
    filters.endDate !== availableDates.maxDate

  return (
    <div
      className={`border-b px-4 sm:px-6 lg:px-8 py-3 transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Main Bar: Search, Date Range, Quick Presets & Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search
              className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            />
            <input
              type="text"
              placeholder="ユーザー、モデル、リポジトリを検索..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              className={`w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border rounded-lg focus:outline-none focus:border-indigo-500 transition-colors ${
                isDark
                  ? 'bg-slate-950 border-slate-700 text-slate-200 placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Date Picker & Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-xs ${
                isDark
                  ? 'bg-slate-950 border-slate-700 text-slate-200'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="date"
                value={filters.startDate}
                min={availableDates.minDate}
                max={availableDates.maxDate}
                onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
                className="bg-transparent focus:outline-none cursor-pointer"
              />
              <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>〜</span>
              <input
                type="date"
                value={filters.endDate}
                min={availableDates.minDate}
                max={availableDates.maxDate}
                onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
                className="bg-transparent focus:outline-none cursor-pointer"
              />
            </div>

            {/* Presets */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => setPresetDate('all')}
                className={`px-2 py-1 text-xs rounded border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                全期間
              </button>
              <button
                onClick={() => setPresetDate(7)}
                className={`px-2 py-1 text-xs rounded border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                過去7日
              </button>
              <button
                onClick={() => setPresetDate(30)}
                className={`px-2 py-1 text-xs rounded border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                過去30日
              </button>
            </div>
          </div>

          {/* Filter Expander Toggle & Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                isExpanded || isFilterActive
                  ? isDark
                    ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                    : 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>詳細フィルタ</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {isFilterActive && (
              <button
                onClick={handleReset}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200'
                }`}
                title="フィルタ条件をリセット"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">リセット</span>
              </button>
            )}

            <div className={`text-xs pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {filteredCount.toLocaleString()}
              </span>
              <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>
                {' '}
                / {totalCount.toLocaleString()} 件
              </span>
            </div>
          </div>
        </div>

        {/* Expanded Filters Dropdowns */}
        {isExpanded && (
          <div
            className={`pt-3 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            {/* User Selector */}
            <div>
              <label
                className={`block text-[11px] font-medium mb-1 flex items-center gap-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                <Users className="w-3 h-3 text-indigo-500" />
                <span>ユーザー ({availableUsers.length})</span>
              </label>
              <select
                value={filters.selectedUsers[0] || ''}
                onChange={(e) => {
                  const val = e.target.value
                  onFilterChange({
                    ...filters,
                    selectedUsers: val ? [val] : [],
                  })
                }}
                className={`w-full px-2.5 py-1.5 text-xs border rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer ${
                  isDark
                    ? 'bg-slate-950 border-slate-700 text-slate-200'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="">すべてのユーザー</option>
                {availableUsers.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Selector */}
            <div>
              <label
                className={`block text-[11px] font-medium mb-1 flex items-center gap-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                <Cpu className="w-3 h-3 text-purple-500" />
                <span>モデル ({availableModels.length})</span>
              </label>
              <select
                value={filters.selectedModels[0] || ''}
                onChange={(e) => {
                  const val = e.target.value
                  onFilterChange({
                    ...filters,
                    selectedModels: val ? [val] : [],
                  })
                }}
                className={`w-full px-2.5 py-1.5 text-xs border rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer ${
                  isDark
                    ? 'bg-slate-950 border-slate-700 text-slate-200'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="">すべてのモデル</option>
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Cost Center Selector */}
            <div>
              <label
                className={`block text-[11px] font-medium mb-1 flex items-center gap-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                <Building2 className="w-3 h-3 text-emerald-500" />
                <span>コストセンター ({availableCostCenters.length})</span>
              </label>
              <select
                value={filters.selectedCostCenters[0] || ''}
                onChange={(e) => {
                  const val = e.target.value
                  onFilterChange({
                    ...filters,
                    selectedCostCenters: val ? [val] : [],
                  })
                }}
                className={`w-full px-2.5 py-1.5 text-xs border rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer ${
                  isDark
                    ? 'bg-slate-950 border-slate-700 text-slate-200'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="">すべてのコストセンター</option>
                {availableCostCenters.map((c) => (
                  <option key={c} value={c}>
                    {c || '(未設定)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Repository Selector */}
            <div>
              <label
                className={`block text-[11px] font-medium mb-1 flex items-center gap-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                <GitBranch className="w-3 h-3 text-cyan-500" />
                <span>リポジトリ ({availableRepositories.length})</span>
              </label>
              <select
                value={filters.selectedRepositories[0] || ''}
                onChange={(e) => {
                  const val = e.target.value
                  onFilterChange({
                    ...filters,
                    selectedRepositories: val ? [val] : [],
                  })
                }}
                className={`w-full px-2.5 py-1.5 text-xs border rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer ${
                  isDark
                    ? 'bg-slate-950 border-slate-700 text-slate-200'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="">すべてのリポジトリ</option>
                {availableRepositories.map((r) => (
                  <option key={r} value={r}>
                    {r || '(未指定 / チャット)'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
