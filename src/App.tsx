import { useState, useMemo, useEffect } from 'react'
import type {
  BillingRecord,
  FilterState,
} from './types/billing'
import { parseBillingCsv } from './utils/csvParser'
import { generateSampleBillingRecords } from './utils/sampleData'
import {
  computeSummaryMetrics,
  computeUserSummaries,
  computeModelSummaries,
  computeDailySummaries,
  computeCostCenterSummaries,
  computeRepositorySummaries,
} from './utils/aggregator'
import { Header } from './components/Header'
import { FileUploadZone } from './components/FileUploadZone'
import { FilterBar } from './components/FilterBar'
import { MetricCards } from './components/MetricCards'
import { DashboardView } from './components/DashboardView'
import { UsersView } from './components/UsersView'
import { ModelsView } from './components/ModelsView'
import { CostCentersView } from './components/CostCentersView'
import { RawDataView } from './components/RawDataView'
import { UserDetailPage } from './components/UserDetailPage'
import {
  LayoutDashboard,
  Users,
  Cpu,
  Building2,
  TableProperties,
  AlertTriangle,
  X,
} from 'lucide-react'
import { useTheme } from './context/ThemeContext'

type TabType = 'dashboard' | 'users' | 'models' | 'costcenters' | 'raw' | 'userdetail'

export function App() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [records, setRecords] = useState<BillingRecord[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [selectedDetailUser, setSelectedDetailUser] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    selectedUsers: [],
    selectedModels: [],
    selectedCostCenters: [],
    selectedRepositories: [],
    searchQuery: '',
  })

  // Derive min and max dates from total records
  const availableDates = useMemo(() => {
    if (records.length === 0) return { minDate: '', maxDate: '' }
    const dates = records
      .map((r) => r.date)
      .filter(Boolean)
      .sort()
    return {
      minDate: dates[0] || '',
      maxDate: dates[dates.length - 1] || '',
    }
  }, [records])

  // Set default filter date range when new records are loaded
  useEffect(() => {
    if (availableDates.minDate && availableDates.maxDate) {
      setFilters((prev) => ({
        ...prev,
        startDate: availableDates.minDate,
        endDate: availableDates.maxDate,
      }))
    }
  }, [availableDates])

  // Available options for dropdowns
  const availableUsers = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.username))).sort()
  }, [records])

  const availableModels = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.model).filter(Boolean))).sort()
  }, [records])

  const availableCostCenters = useMemo(() => {
    return Array.from(
      new Set(records.map((r) => r.cost_center_name).filter(Boolean))
    ).sort()
  }, [records])

  const availableRepositories = useMemo(() => {
    return Array.from(
      new Set(records.map((r) => r.repository).filter(Boolean))
    ).sort()
  }, [records])

  // Handle CSV file upload
  const handleFileUpload = (file: File) => {
    setIsLoading(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const { records: parsedRecords, warnings: parsedWarnings } = parseBillingCsv(text)
        if (parsedRecords.length === 0) {
          alert('CSVファイルから有効な利用明細行を読み取れませんでした。ヘッダー形式をご確認ください。')
        } else {
          setRecords(parsedRecords)
          setFileName(file.name)
          setWarnings(parsedWarnings)
        }
      } catch (err) {
        console.error('Failed to parse file:', err)
        alert('ファイルの読み込み中にエラーが発生しました。')
      } finally {
        setIsLoading(false)
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  // Load sample dataset
  const handleLoadSample = () => {
    setIsLoading(true)
    setTimeout(() => {
      const sample = generateSampleBillingRecords()
      setRecords(sample)
      setFileName('GitHub-Copilot-Billing-Sample (2026-08).csv')
      setWarnings([])
      setIsLoading(false)
    }, 100)
  }

  // Clear data
  const handleClearData = () => {
    if (confirm('読み込んだデータをリセットしてよろしいですか？')) {
      setRecords([])
      setFileName(null)
      setWarnings([])
      setSelectedDetailUser(null)
      setFilters({
        startDate: '',
        endDate: '',
        selectedUsers: [],
        selectedModels: [],
        selectedCostCenters: [],
        selectedRepositories: [],
        searchQuery: '',
      })
    }
  }

  // Apply filters to records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Date range
      if (filters.startDate && r.date < filters.startDate) return false
      if (filters.endDate && r.date > filters.endDate) return false

      // User filter
      if (
        filters.selectedUsers.length > 0 &&
        !filters.selectedUsers.includes(r.username)
      ) {
        return false
      }

      // Model filter
      if (
        filters.selectedModels.length > 0 &&
        !filters.selectedModels.includes(r.model)
      ) {
        return false
      }

      // Cost center filter
      if (
        filters.selectedCostCenters.length > 0 &&
        !filters.selectedCostCenters.includes(r.cost_center_name)
      ) {
        return false
      }

      // Repository filter
      if (
        filters.selectedRepositories.length > 0 &&
        !filters.selectedRepositories.includes(r.repository)
      ) {
        return false
      }

      // Search query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase()
        const matches =
          r.username.toLowerCase().includes(q) ||
          r.model.toLowerCase().includes(q) ||
          r.repository.toLowerCase().includes(q) ||
          r.cost_center_name.toLowerCase().includes(q)
        if (!matches) return false
      }

      return true
    })
  }, [records, filters])

  // Aggregated calculations
  const summaryMetrics = useMemo(
    () => computeSummaryMetrics(filteredRecords),
    [filteredRecords]
  )

  const userSummaries = useMemo(
    () => computeUserSummaries(filteredRecords),
    [filteredRecords]
  )

  const modelSummaries = useMemo(
    () => computeModelSummaries(filteredRecords, summaryMetrics.totalGrossAmount),
    [filteredRecords, summaryMetrics.totalGrossAmount]
  )

  const dailySummaries = useMemo(
    () => computeDailySummaries(filteredRecords),
    [filteredRecords]
  )

  const costCenterSummaries = useMemo(
    () => computeCostCenterSummaries(filteredRecords),
    [filteredRecords]
  )

  const repositorySummaries = useMemo(
    () => computeRepositorySummaries(filteredRecords),
    [filteredRecords]
  )

  const handleSelectUser = (username: string) => {
    setSelectedDetailUser(username)
    setActiveTab('userdetail')
  }

  return (
    <div
      className={`min-h-screen flex flex-col antialiased transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div
            className={`p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3 border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              データを読み込み中...
            </p>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        records={filteredRecords}
        fileName={fileName}
        onFileUpload={handleFileUpload}
        onLoadSample={handleLoadSample}
        onClearData={handleClearData}
      />

      {/* Main Content Area */}
      {records.length === 0 ? (
        <main className="flex-1 flex items-center justify-center p-4">
          <FileUploadZone
            onFileUpload={handleFileUpload}
            onLoadSample={handleLoadSample}
          />
        </main>
      ) : activeTab === 'userdetail' && selectedDetailUser ? (
        /* Full-page User Detail View */
        <UserDetailPage
          username={selectedDetailUser}
          records={records}
          onBack={() => {
            setActiveTab('users')
            setSelectedDetailUser(null)
          }}
        />
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Warnings Banner if any */}
          {warnings.length > 0 && (
            <div
              className={`px-4 py-2 text-xs flex items-center justify-between border-b ${
                isDark
                  ? 'bg-amber-950/60 border-amber-800/60 text-amber-300'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>
                  CSV読み込み中に {warnings.length} 件の警告がありました (例: {warnings[0]})
                </span>
              </div>
              <button
                onClick={() => setWarnings([])}
                className="text-amber-500 hover:text-amber-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Filter Bar */}
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            availableUsers={availableUsers}
            availableModels={availableModels}
            availableCostCenters={availableCostCenters}
            availableRepositories={availableRepositories}
            availableDates={availableDates}
            totalCount={records.length}
            filteredCount={filteredRecords.length}
          />

          <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
            {/* Top Metric Cards */}
            <MetricCards metrics={summaryMetrics} />

            {/* Navigation Tabs */}
            <div
              className={`flex items-center gap-2 border-b pb-2 overflow-x-auto ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>概要ダッシュボード</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>ユーザー別分析 ({userSummaries.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('models')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'models'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>モデル別分析 ({modelSummaries.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('costcenters')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'costcenters'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>コストセンター & リポ</span>
              </button>

              <button
                onClick={() => setActiveTab('raw')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'raw'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <TableProperties className="w-4 h-4" />
                <span>明細レコード ({filteredRecords.length.toLocaleString()})</span>
              </button>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'dashboard' && (
                <DashboardView
                  dailySummaries={dailySummaries}
                  modelSummaries={modelSummaries}
                  userSummaries={userSummaries}
                  costCenterSummaries={costCenterSummaries}
                  onSelectUser={handleSelectUser}
                  onNavigateToUsers={() => setActiveTab('users')}
                />
              )}

              {activeTab === 'users' && (
                <UsersView
                  userSummaries={userSummaries}
                  onSelectUser={handleSelectUser}
                />
              )}

              {activeTab === 'models' && (
                <ModelsView modelSummaries={modelSummaries} />
              )}

              {activeTab === 'costcenters' && (
                <CostCentersView
                  costCenterSummaries={costCenterSummaries}
                  repositorySummaries={repositorySummaries}
                />
              )}

              {activeTab === 'raw' && (
                <RawDataView records={filteredRecords} />
              )}
            </div>
          </main>
        </div>
      )}

      {/* Footer */}
      <footer
        className={`mt-auto border-t py-4 text-center text-xs transition-colors ${
          isDark
            ? 'border-slate-900 text-slate-500'
            : 'border-slate-200 text-slate-400 bg-white'
        }`}
      >
        GitHub Copilot Billing Viewer • Fully Client-Side & Private • Claude Sonnet 5 & GPT-5.4 Ready
      </footer>
    </div>
  )
}
export default App
