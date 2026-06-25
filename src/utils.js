// utils.js — Invite Energy Painel
// Dados salvos no Supabase (nuvem) — todos os sócios veem em tempo real

const SUPABASE_URL = 'https://snoghyuapgnjnzrsaysp.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNub2doeXVhcGduam56cnNheXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMzA2NDAsImV4cCI6MjA5NzkwNjY0MH0.dvFkPLelMVcpKRX_veFvGAat5Y-ZLSGN1PCBwUq--w8'
const TABLE = 'invite_data'
const DATA_KEY = 'painel_principal'

// ── Supabase helpers ──────────────────────────────────────────────────────────

async function sbGet(key) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${TABLE}?key=eq.${key}&select=value`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  )
  if (!res.ok) throw new Error(`Supabase GET error: ${res.status}`)
  const rows = await res.json()
  return rows.length > 0 ? rows[0].value : null
}

async function sbUpsert(key, value) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${TABLE}`,
    {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({ key, value }),
    }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Supabase UPSERT error: ${res.status} — ${err}`)
  }
}

// ── API pública ───────────────────────────────────────────────────────────────

export async function loadData() {
  try {
    const data = await sbGet(DATA_KEY)
    if (data) return data
  } catch (e) {
    console.warn('Supabase indisponível, usando localStorage como fallback:', e)
  }
  // Fallback: localStorage
  try {
    const raw = localStorage.getItem('invite-painel-data')
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return null
}

export async function saveData(data) {
  // Salvar na nuvem
  try {
    await sbUpsert(DATA_KEY, data)
  } catch (e) {
    console.error('Erro ao salvar no Supabase:', e)
  }
  // Salvar localmente também como fallback offline
  try {
    localStorage.setItem('invite-painel-data', JSON.stringify(data))
  } catch (_) {}
}

export function exportBackup(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invite-energy-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Polling para sincronização em tempo real ──────────────────────────────────
// Verifica se houve mudanças a cada 30 segundos e atualiza automaticamente

export function startSync(onUpdate) {
  let lastUpdatedAt = null

  async function check() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${TABLE}?key=eq.${DATA_KEY}&select=updated_at,value`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      )
      if (!res.ok) return
      const rows = await res.json()
      if (!rows.length) return
      const { updated_at, value } = rows[0]
      if (lastUpdatedAt && updated_at !== lastUpdatedAt) {
        onUpdate(value)
      }
      lastUpdatedAt = updated_at
    } catch (_) {}
  }

  check() // verificação imediata
  const interval = setInterval(check, 30000) // a cada 30s
  return () => clearInterval(interval) // retorna função para parar o polling
}

// ── Utilitários de data ───────────────────────────────────────────────────────

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function fmtDate(iso) {
  if (!iso) return '-'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function addYears(iso, n) {
  if (!iso) return ''
  const d = new Date(iso)
  d.setFullYear(d.getFullYear() + n)
  return d.toISOString().slice(0, 10)
}

export function daysUntil(iso) {
  if (!iso) return null
  const diff = new Date(iso) - new Date()
  return Math.ceil(diff / 86400000)
}

export function distribuidorasFrom(data) {
  const coverage = data?.coverage || {}
  return Object.keys(coverage).sort()
}
