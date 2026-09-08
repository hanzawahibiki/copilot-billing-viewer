import React, { useRef } from 'react'
import {
  Upload,
  FileSpreadsheet,
  Trash2,
  ShieldCheck,
  Sparkles,
  Download,
  Sun,
  Moon,
} from 'lucide-react'
import type { BillingRecord } from '../types/billing'
import { exportToCsv } from '../utils/csvExporter'
import { useTheme } from '../context/ThemeContext'

interface HeaderProps {
  records: BillingRecord[]
  fileName: string | null
  onFileUpload: (file: File) => void
  onLoadSample: () => void
  onClearData: () => void
}

export const Header: React.FC<HeaderProps> = ({
  records,
  fileName,
  onFileUpload,
  onLoadSample,
  onClearData,
}) => {
  const { theme, toggleTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileUpload(file)
      // Reset input value so re-uploading the same file triggers change
      e.target.value = ''
    }
  }

  const handleExportFiltered = () => {
    if (records.length === 0) return
    exportToCsv(records, `copilot-billing-export-${new Date().toISOString().slice(0, 10)}`)
  }

  const isDark = theme === 'dark'

  return (
    <header
      className={`sticky top-0 z-30 shadow-md border-b transition-colors ${
        isDark
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-200 shadow-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[2px] flex items-center justify-center shadow-lg shadow-purple-500/20">
              <div
                className={`w-full h-full rounded-[10px] flex items-center justify-center ${
                  isDark ? 'bg-slate-900' : 'bg-white'
                }`}
              >
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className={`text-lg font-bold tracking-tight flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Copilot Billing Viewer
                </h1>
                <span
                  className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${
                    isDark
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-purple-50 text-purple-700 border-purple-200'
                  }`}
                >
                  Preview Replacer
                </span>
              </div>
              <p
                className={`text-xs hidden sm:block ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                GitHub Copilot 使用量 & コスト分析ダッシュボード
              </p>
            </div>
          </div>

          {/* Privacy badge & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Safe / Local Privacy notice */}
            <div
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${
                isDark
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>完全クライアント処理（データ外部送信なし）</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-indigo-600 border-slate-200'
              }`}
              title={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.tsv,.txt"
              className="hidden"
            />

            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm cursor-pointer"
              title="CSV / TSV ファイルを開く"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">CSV読込</span>
            </button>

            {/* Load Sample Button */}
            <button
              onClick={onLoadSample}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              }`}
              title="サンプルデータを読み込んで試す"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="hidden md:inline">サンプルデータ</span>
            </button>

            {records.length > 0 && (
              <>
                {/* Export Button */}
                <button
                  onClick={handleExportFiltered}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title="表示中のデータをCSV出力"
                >
                  <Download className="w-4 h-4 text-cyan-500" />
                  <span className="hidden lg:inline">出力</span>
                </button>

                {/* Clear Data */}
                <button
                  onClick={onClearData}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isDark
                      ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/30'
                      : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                  title="データをリセット"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Active file indicator sub-bar if loaded */}
        {records.length > 0 && (
          <div
            className={`py-1.5 border-t flex items-center justify-between text-xs ${
              isDark
                ? 'border-slate-800 text-slate-400'
                : 'border-slate-100 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <span
                className={`font-mono truncate ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                {fileName || 'Sample Dataset'}
              </span>
              <span className={isDark ? 'text-slate-500' : 'text-slate-300'}>•</span>
              <span>{records.length.toLocaleString()} 行読み込み済</span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
