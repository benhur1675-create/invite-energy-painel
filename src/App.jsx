import Icon from './Icon.jsx'
import { useState, useEffect } from 'react'
import LicenciadosTab from './LicenciadosTab.jsx'
import ClientesTab from './ClientesTab.jsx'
import UsinasTab from './UsinasTab.jsx'
import FinanceiroTab from './FinanceiroTab.jsx'
import CidadesTab from './CidadesTab.jsx'
import { loadData, saveData, exportBackup } from './utils.js'
import { defaultCoverage } from './coverageData.js'

const TABS = [
  { id: 'licenciados', label: 'Licenciados', icon: 'users' },
  { id: 'clientes', label: 'Clientes Finais', icon: 'home' },
  { id: 'usinas', label: 'Usinas', icon: 'sun' },
  { id: 'financeiro', label: 'Financeiro', icon: 'dollar' },
  { id: 'cidades', label: 'Cidades Atendidas', icon: 'mappin' },
]

export default function App() {
  const [tab, setTab] = useState('licenciados')
  const [data, setDataRaw] = useState({ licenciados: [], clientes: [], usinas: [], comissoes: [], cidades: [], coverage: defaultCoverage })
  const [status, setStatus] = useState('')

  useEffect(() => {
    setDataRaw(loadData())
  }, [])

  function setData(next) {
    setDataRaw(next)
    const ok = saveData(next)
    setStatus(ok ? 'Salvo' : 'Erro ao salvar')
    setTimeout(() => setStatus(''), 1500)
  }

  function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result)
        if (!imported.coverage) imported.coverage = defaultCoverage
        setData(imported)
        alert('Backup importado com sucesso!')
      } catch (err) {
        alert('Arquivo inválido.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const Active = {
    licenciados: LicenciadosTab,
    clientes: ClientesTab,
    usinas: UsinasTab,
    financeiro: FinanceiroTab,
    cidades: CidadesTab,
  }[tab]

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>INVITE ENERGY</h1>
          <p className="tagline">Painel de gestão — Licenciados, Clientes, Usinas e Financeiro</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {status && <span style={{ fontSize: 12, color: '#EAF3DE' }}>{status}</span>}
          <button onClick={() => exportBackup(data)} style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>
            <Icon name="download" /> Backup
          </button>
          <label style={{ display: 'inline-flex' }}>
            <button style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }} onClick={(e) => e.currentTarget.nextSibling.click()}>
              <Icon name="upload" /> Importar
            </button>
            <input type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
          </label>
        </div>
      </div>

      <div className="app-shell">
        <div className="tabs">
          {TABS.map(t => (
            <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
              <Icon name={t.icon} /> {t.label}
            </button>
          ))}
        </div>

        <Active data={data} setData={setData} />
      </div>
    </div>
  )
}
