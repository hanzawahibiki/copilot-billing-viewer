import { useState, useRef } from 'react'
import {
  UploadCloud,
  FileSpreadsheet,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TableProperties,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface FileUploadZoneProps {
  onFileUpload: (file: File) => void
  onLoadSample: () => void
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileUpload,
  onLoadSample,
}) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      onFileUpload(files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFileUpload(files[0])
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Hero Welcome */}
      <div className="text-center mb-8">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 border ${
            isDark
              ? 'bg-purple-950/60 border-purple-800/60 text-purple-300'
              : 'bg-purple-50 border-purple-200 text-purple-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <span>GitHub Copilot Billing Preview 互換ダッシュボード</span>
        </div>
        <h2
          className={`text-3xl font-extrabold tracking-tight sm:text-4xl mb-3 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          Copilot の使用量・料金を瞬時に可視化
        </h2>
        <p className={`text-base max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          GitHub Enterprise / Organization からダウンロードした使用量 CSV（Billing report）を
          読み込むだけで、組織全体・ユーザー別・モデル別のコストやトークン消費量を美しいグラフと表で分析できます。
        </p>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? isDark
              ? 'border-indigo-500 bg-indigo-950/30 scale-[1.01]'
              : 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
            : isDark
            ? 'border-slate-700 hover:border-slate-500 bg-slate-900/60 hover:bg-slate-900/90'
            : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50 shadow-sm'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,.tsv,.txt"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <p className={`text-lg font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              CSV または TSV ファイルをここにドラッグ＆ドロップ
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              または <span className="text-indigo-500 font-medium underline">ファイルを選択</span>
            </p>
          </div>

          <div className={`flex items-center gap-4 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <span>対応拡張子: .csv, .tsv, .txt</span>
            <span>•</span>
            <span>カンマ・タブ区切り自動判定</span>
          </div>
        </div>
      </div>

      {/* Try with Sample Data Button */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onLoadSample}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>最新モデルのサンプルデータですぐに試す (Demo Data)</span>
        </button>
      </div>

      {/* Security & Privacy highlight */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className={`border rounded-xl p-4 flex items-start gap-3 transition-colors ${
            isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              100% 安全・ローカル処理
            </h4>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              CSVデータはブラウザ内でのみパースされ、外部サーバーには一切送信・保存されません。
            </p>
          </div>
        </div>

        <div
          className={`border rounded-xl p-4 flex items-start gap-3 transition-colors ${
            isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <TableProperties className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              公式プレビュー互換
            </h4>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              廃止された公式 Copilot Billing Preview と同様の集計・可視化を完全再現。
            </p>
          </div>
        </div>

        <div
          className={`border rounded-xl p-4 flex items-start gap-3 transition-colors ${
            isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              最新モデル・トークン対応
            </h4>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Claude Sonnet 5 / 4.6, GPT-5.4, Gemini 3.8 Flash, Cache Read/Write等に対応。
            </p>
          </div>
        </div>
      </div>

      {/* CSV Spec Reference */}
      <div
        className={`mt-10 border rounded-xl p-5 transition-colors ${
          isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <h4
          className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-purple-500" />
          <span>対応するCSVカラム定義</span>
        </h4>
        <div
          className={`text-xs font-mono p-3 rounded-lg overflow-x-auto border leading-relaxed ${
            isDark
              ? 'bg-slate-950 text-slate-300 border-slate-800/80'
              : 'bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <code>
            date, username, product, sku, model, quantity, unit_type, applied_cost_per_quantity,
            gross_amount, discount_amount, net_amount, total_monthly_quota, organization, repository,
            cost_center_name, aic_quantity, aic_gross_amount, input, output, cache_read, cache_write
          </code>
        </div>
        <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          ※ 各種列の表記ゆれ（大文字小文字、スペースやアンダースコア）も自動判定します。
        </p>
      </div>
    </div>
  )
}
