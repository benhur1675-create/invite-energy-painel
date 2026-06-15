import { defaultCoverage } from './coverageData.js'

// Returns the list of distribuidora names from coverage data, plus a fallback "Outra".
export function distribuidorasFrom(data) {
  const coverage = data?.coverage || []
  const names = coverage.map(d => d.nome)
  return [...names, 'Outra']
}

export function uid() {
  return 'id_' + Math.random().toString(36).slice(2, 10)
}

export function fmtDate(d) {
  if (!d) return '-'
  const parts = d.split('-')
  if (parts.length === 3) return parts[2] + '/' + parts[1] + '/' + parts[0]
  return d
}

export function addYears(dateStr, years) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  d.setFullYear(d.getFullYear() + years)
  return d.toISOString().slice(0, 10)
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

export function currency(value) {
  return 'R$ ' + Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const STORAGE_KEY = 'invite-energy-painel-data'

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (!parsed.coverage) parsed.coverage = defaultCoverage
      return parsed
    }
  } catch (e) {
    console.error('Erro ao carregar dados', e)
  }
  return { licenciados: [], clientes: [], usinas: [], comissoes: [], cidades: [], coverage: defaultCoverage }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('Erro ao salvar dados', e)
    return false
  }
}

export function exportBackup(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'invite-energy-backup-' + new Date().toISOString().slice(0, 10) + '.json'
  a.click()
  URL.revokeObjectURL(url)
}
