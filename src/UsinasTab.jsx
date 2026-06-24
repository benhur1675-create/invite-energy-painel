import Icon from './Icon.jsx'
import { useState } from 'react'
import { Badge, Field, Modal, EmptyState } from './components.jsx'
import { uid, fmtDate } from './utils.js'

const TITULARIDADE_OPTIONS = [
  { value: 'nao_iniciada', label: 'Não iniciada', color: 'neutral' },
  { value: 'em_andamento', label: 'Em andamento', color: 'warning' },
  { value: 'concluida', label: 'Concluída', color: 'success' },
]

function titularidadeColor(val) {
  const opt = TITULARIDADE_OPTIONS.find(o => o.value === val)
  return opt ? opt.color : 'neutral'
}

function titularidadeLabel(val) {
  const opt = TITULARIDADE_OPTIONS.find(o => o.value === val)
  return opt ? opt.label : 'Não iniciada'
}

export default function UsinasTab({ data, setData }) {
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const list = data.usinas || []

  const filtered = list.filter(u =>
    (u.nomeLocador || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.cidade || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.distribuidora || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.uc || '').toLowerCase().includes(search.toLowerCase())
  )

  function save(item) {
    const exists = list.find(x => x.id === item.id)
    const next = exists ? list.map(x => x.id === item.id ? item : x) : [...list, item]
    setData({ ...data, usinas: next })
    setEditing(null)
  }

  function remove(id) {
    if (!confirm('Excluir esta usina?')) return
    setData({ ...data, usinas: list.filter(x => x.id !== id) })
  }

  function blank() {
    return {
      id: uid(), nomeLocador: '', cpfCnpj: '', uc: '', endereco: '',
      cidade: '', estado: '', distribuidora: '', potencia: '',
      geracaoMensal: '', tarifa: '0.52', dataAssinatura: '',
      inversorMarca: '', inversorModelo: '', inversorSerie: '',
      login: '', senha: '', titularidade: 'nao_iniciada', obs: ''
    }
  }

  // Totalizadores
  const totalPotencia = list.reduce((s, u) => s + (parseFloat(u.potencia) || 0), 0)
  const totalGeracao = list.reduce((s, u) => s + (parseFloat(u.geracaoMensal) || 0), 0)
  const totalValorMensal = list.reduce((s, u) => {
    const g = parseFloat(u.geracaoMensal) || 0
    const t = parseFloat(u.tarifa) || 0.52
    return s + (g * t)
  }, 0)
  const countTitularidade = {
    nao_iniciada: list.filter(u => !u.titularidade || u.titularidade === 'nao_iniciada').length,
    em_andamento: list.filter(u => u.titularidade === 'em_andamento').length,
    concluida: list.filter(u => u.titularidade === 'concluida').length,
  }

  return (
    <div>
      {/* Totalizadores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
        <div className="card">
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 4px' }}>Usinas ativas</p>
          <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{list.length}</p>
        </div>
        <div className="card">
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 4px' }}>Potência total</p>
          <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{totalPotencia.toFixed(1)} kWp</p>
        </div>
        <div className="card">
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 4px' }}>Geração total/mês</p>
          <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{Math.round(totalGeracao).toLocaleString('pt-BR')} kWh</p>
        </div>
        <div className="card">
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 4px' }}>Valor estimado/mês</p>
          <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
            R$ {totalValorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Status de titularidade */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: '1.5rem' }}>
        <div className="card" style={{ borderColor: 'var(--color-border-tertiary)' }}>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Titularidade</p>
          <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 2px', color: 'var(--color-text-secondary)' }}>Não iniciada</p>
          <p style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{countTitularidade.nao_iniciada}</p>
        </div>
        <div className="card" style={{ borderColor: 'rgba(255,165,0,0.3)', background: 'rgba(255,165,0,0.05)' }}>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Titularidade</p>
          <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 2px', color: '#FFA500' }}>Em andamento</p>
          <p style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{countTitularidade.em_andamento}</p>
        </div>
        <div className="card" style={{ borderColor: 'rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.05)' }}>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Titularidade</p>
          <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 2px', color: '#4ADE80' }}>Concluída</p>
          <p style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{countTitularidade.concluida}</p>
        </div>
      </div>

      {/* Controles */}
      <div className="search-row">
        <input
          type="text"
          placeholder="Buscar por nome, cidade, distribuidora ou UC"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="primary" onClick={() => setEditing(blank())}>
          <Icon name="plus" /> Nova usina
        </button>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{filtered.length}</span> usina{filtered.length !== 1 ? 's' : ''} {search ? 'encontrada' + (filtered.length !== 1 ? 's' : '') : 'no total'}
      </p>

      {/* Cards */}
      <div className="grid">
        {filtered.length === 0 && <EmptyState>Nenhuma usina encontrada.</EmptyState>}
        {filtered.map(u => {
          const valorMensal = (parseFloat(u.geracaoMensal) || 0) * (parseFloat(u.tarifa) || 0.52)
          const semInversor = !u.inversorMarca
          const semLogin = !u.login
          const titStatus = u.titularidade || 'nao_iniciada'

          return (
            <div className="card" key={u.id}>
              <div className="card-header">
                <div>
                  <p className="card-title">{u.nomeLocador || '(sem nome)'}</p>
                  <p className="card-subtitle">
                    {u.cidade || u.estado ? `${u.cidade || ''}${u.cidade && u.estado ? '/' : ''}${u.estado || ''}` : 'Cidade não informada'}
                    {u.distribuidora ? ` · ${u.distribuidora}` : ''}
                  </p>
                </div>
                <div className="card-actions">
                  <button aria-label="Editar" onClick={() => setEditing(u)}><Icon name="edit" /></button>
                  <button aria-label="Excluir" onClick={() => remove(u.id)}><Icon name="trash" /></button>
                </div>
              </div>

              <table className="detail-table">
                <tbody>
                  <tr><td>UC</td><td>{u.uc || '-'}</td></tr>
                  <tr><td>Potência instalada</td><td>{u.potencia ? `${u.potencia} kWp` : '-'}</td></tr>
                  <tr><td>Geração estimada/mês</td><td>{u.geracaoMensal ? `${parseFloat(u.geracaoMensal).toLocaleString('pt-BR')} kWh` : '-'}</td></tr>
                  <tr><td>Tarifa locação</td><td>{u.tarifa ? `R$ ${u.tarifa}/kWh` : '-'}</td></tr>
                  <tr><td>Valor estimado/mês</td><td>{valorMensal > 0 ? `R$ ${valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}</td></tr>
                  <tr><td>Contrato assinado</td><td>{fmtDate(u.dataAssinatura)}</td></tr>
                  <tr>
                    <td>Troca de titularidade</td>
                    <td>
                      <Badge color={titularidadeColor(titStatus)}>
                        {titularidadeLabel(titStatus)}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>Inversor</td>
                    <td>
                      {semInversor
                        ? <Badge color="neutral">Não informado</Badge>
                        : `${u.inversorMarca}${u.inversorModelo ? ' · ' + u.inversorModelo : ''}`}
                    </td>
                  </tr>
                  <tr>
                    <td>Monitoramento</td>
                    <td>
                      {semLogin
                        ? <Badge color="neutral">Sem acesso</Badge>
                        : <Badge color="success">Configurado</Badge>}
                    </td>
                  </tr>
                  {u.obs && <tr><td>Obs.</td><td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.obs}</td></tr>}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>

      {/* Modal de edição */}
      {editing && (
        <Modal title={editing.nomeLocador ? 'Editar usina' : 'Nova usina'} onClose={() => setEditing(null)}>
          <div className="form-grid">
            <Field label="Razão social / Nome do proprietário">
              <input type="text" value={editing.nomeLocador} onChange={e => setEditing({ ...editing, nomeLocador: e.target.value })} />
            </Field>
            <Field label="CPF / CNPJ">
              <input type="text" value={editing.cpfCnpj} onChange={e => setEditing({ ...editing, cpfCnpj: e.target.value })} />
            </Field>
            <Field label="UC (Unidade Consumidora)">
              <input type="text" value={editing.uc} onChange={e => setEditing({ ...editing, uc: e.target.value })} />
            </Field>
            <Field label="Distribuidora">
              <input type="text" value={editing.distribuidora} onChange={e => setEditing({ ...editing, distribuidora: e.target.value })} />
            </Field>
            <Field label="Cidade">
              <input type="text" value={editing.cidade} onChange={e => setEditing({ ...editing, cidade: e.target.value })} />
            </Field>
            <Field label="Estado (UF)">
              <input type="text" maxLength={2} value={editing.estado} onChange={e => setEditing({ ...editing, estado: e.target.value.toUpperCase() })} />
            </Field>
            <Field label="Endereço completo">
              <input type="text" value={editing.endereco} onChange={e => setEditing({ ...editing, endereco: e.target.value })} />
            </Field>
            <Field label="Potência instalada (kWp)">
              <input type="text" value={editing.potencia} onChange={e => setEditing({ ...editing, potencia: e.target.value })} />
            </Field>
            <Field label="Geração estimada mensal (kWh)">
              <input type="text" value={editing.geracaoMensal} onChange={e => setEditing({ ...editing, geracaoMensal: e.target.value })} />
            </Field>
            <Field label="Tarifa de locação (R$/kWh)">
              <input type="text" value={editing.tarifa} onChange={e => setEditing({ ...editing, tarifa: e.target.value })} />
            </Field>
            <Field label="Data de assinatura do contrato">
              <input type="date" value={editing.dataAssinatura} onChange={e => setEditing({ ...editing, dataAssinatura: e.target.value })} />
            </Field>
            <Field label="Troca de titularidade">
              <select
                value={editing.titularidade || 'nao_iniciada'}
                onChange={e => setEditing({ ...editing, titularidade: e.target.value })}
              >
                {TITULARIDADE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Marca do inversor">
              <input type="text" value={editing.inversorMarca} onChange={e => setEditing({ ...editing, inversorMarca: e.target.value })} />
            </Field>
            <Field label="Modelo do inversor">
              <input type="text" value={editing.inversorModelo} onChange={e => setEditing({ ...editing, inversorModelo: e.target.value })} />
            </Field>
            <Field label="Nº série do inversor">
              <input type="text" value={editing.inversorSerie} onChange={e => setEditing({ ...editing, inversorSerie: e.target.value })} />
            </Field>
            <Field label="Login monitoramento">
              <input type="text" value={editing.login} onChange={e => setEditing({ ...editing, login: e.target.value })} />
            </Field>
            <Field label="Senha monitoramento">
              <input type="text" value={editing.senha} onChange={e => setEditing({ ...editing, senha: e.target.value })} />
            </Field>
            <Field label="Observações">
              <input type="text" value={editing.obs} onChange={e => setEditing({ ...editing, obs: e.target.value })} />
            </Field>
          </div>
          <div className="modal-footer">
            <button onClick={() => setEditing(null)}>Cancelar</button>
            <button className="primary" onClick={() => save(editing)}>Salvar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
