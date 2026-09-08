import Papa from 'papaparse'

export function exportToCsv<T extends object>(data: T[], filename: string): void {
  if (!data || data.length === 0) {
    alert('エクスポートするデータがありません。')
    return
  }

  const csv = Papa.unparse(data)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
