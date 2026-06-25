import { useState, useEffect, useCallback, useRef } from 'react'
import LicenciadosTab from './LicenciadosTab.jsx'
import ClientesTab from './ClientesTab.jsx'
import UsinasTab from './UsinasTab.jsx'
import FinanceiroTab from './FinanceiroTab.jsx'
import TarefasTab from './TarefasTab.jsx'
import { loadData, saveData, exportBackup, startSync } from './utils.js'
import { defaultCoverage } from './coverageData.js'

const TABS = [
  { id: 'tarefas',     label: 'Tarefas',        icon: 'ti-checklist' },
  { id: 'licenciados', label: 'Licenciados',     icon: 'ti-users' },
  { id: 'clientes',    label: 'Clientes Finais', icon: 'ti-user-check' },
  { id: 'usinas',      label: 'Usinas',          icon: 'ti-solar-panel' },
  { id: 'financeiro',  label: 'Financeiro',      icon: 'ti-coin' },
]

const DEFAULT_DATA = {
  licenciados: [],
  clientes: [],
  usinas: [],
  comissoes: [],
  cidades: [],
  coverage: defaultCoverage,
  tarefas: [],
}

export default function App() {
  const [tab, setTab] = useState('tarefas')
  const [data, setDataRaw] = useState(null) // null = ainda carregando
  const [saveStatus, setSaveStatus] = useState('')
  const [syncStatus, setSyncStatus] = useState('🟡 Conectando...')
  const saveTimer = useRef(null)
  const isRemoteUpdate = useRef(false)

  // ── Carregamento inicial ───────────────────────────────────────────────────
  useEffect(() => {
    loadData().then(loaded => {
      if (loaded) {
        // Garantir que campos novos existam em dados antigos
        setDataRaw({ ...DEFAULT_DATA, ...loaded })
      } else {
        setDataRaw(DEFAULT_DATA)
      }
      setSyncStatus('🟢 Conectado')
    }).catch(() => {
      setDataRaw(DEFAULT_DATA)
      setSyncStatus('🔴 Offline')
    })
  }, [])

  // ── Sincronização automática a cada 30s ────────────────────────────────────
  useEffect(() => {
    if (!data) return
    const stop = startSync((remoteData) => {
      isRemoteUpdate.current = true
      setDataRaw({ ...DEFAULT_DATA, ...remoteData })
      setSaveStatus('🔄 Atualizado por outro sócio')
      setTimeout(() => setSaveStatus(''), 3000)
    })
    return stop
  }, [!!data]) // só inicia após carregar

  // ── Salvar na nuvem com debounce ───────────────────────────────────────────
  const setData = useCallback((newData) => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false
      return
    }
    setDataRaw(newData)
    setSaveStatus('Salvando...')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        await saveData(newData)
        setSyncStatus('🟢 Conectado')
        setSaveStatus('✓ Salvo na nuvem')
      } catch (e) {
        setSyncStatus('🔴 Erro ao salvar')
        setSaveStatus('⚠ Salvo localmente')
      }
      setTimeout(() => setSaveStatus(''), 3000)
    }, 800)
  }, [])

  // ── Importar backup ────────────────────────────────────────────────────────
  function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const imported = JSON.parse(ev.target.result)
        setData({ ...DEFAULT_DATA, ...imported })
        alert('Backup importado e salvo na nuvem com sucesso!')
      } catch {
        alert('Arquivo inválido.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (!data) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', gap: 16,
        background: 'var(--color-background-primary)',
        color: 'var(--color-text-primary)'
      }}>
        <div style={{ fontSize: 32 }}>⚡</div>
        <p style={{ fontSize: 16, fontWeight: 600 }}>Invite Energy</p>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Carregando dados da nuvem...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.5rem', height: 56, flexShrink: 0,
        borderBottom: '1px solid var(--color-border-tertiary)',
        background: 'var(--color-background-secondary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>⚡ Invite Energy</span>
          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', background: 'var(--color-background-tertiary)', padding: '2px 8px', borderRadius: 100 }}>
            {syncStatus}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{saveStatus}</span>
          <button
            onClick={() => exportBackup(data)}
            style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--color-border-tertiary)', background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
          >
            ↓ Backup
          </button>
          <label style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--color-border-tertiary)', background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            ↑ Importar
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
      </header>

      {/* Tabs */}
      <nav style={{
        display: 'flex', gap: 4, padding: '0 1rem',
        borderBottom: '1px solid var(--color-border-tertiary)',
        background: 'var(--color-background-secondary)',
        overflowX: 'auto', flexShrink: 0,
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 14px', fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
              border: 'none', background: 'transparent', cursor: 'pointer',
              borderBottom: tab === t.id ? '2px solid var(--color-text-primary)' : '2px solid transparent',
              color: tab === t.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              whiteSpace: 'nowrap',
            }}
          >
            <i className={`ti ${t.icon}`} style={{ fontSize: 16 }} aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </nav>

      {/* Conteúdo */}
      <main style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
        {tab === 'tarefas'     && <TarefasTab     data={data} setData={setData} />}
        {tab === 'licenciados' && <LicenciadosTab data={data} setData={setData} />}
        {tab === 'clientes'    && <ClientesTab    data={data} setData={setData} />}
        {tab === 'usinas'      && <UsinasTab      data={data} setData={setData} />}
        {tab === 'financeiro'  && <FinanceiroTab  data={data} setData={setData} />}
      </main>
    </div>
  )
}
