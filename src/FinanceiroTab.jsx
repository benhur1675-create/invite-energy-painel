import Icon from './Icon.jsx'
import { useState } from 'react'
import { Badge, Field, Modal, EmptyState } from './components.jsx'
import { uid, fmtDate, currency } from './utils.js'

export default function FinanceiroTab({ data, setData }) {
  const usinas = data.usinas || []
  const clientes = data.clientes || []
  const licenciados = data.licenciados || []
  const comissoes = data.comissoes || []

  const [editing, setEditing] = useState(null)

  const totalAdesoes = licenciados.reduce((sum, l) => sum + (l.taxaAdesaoCobrada ? 500 : 0), 0)
  const totalRepasseUsinas = usinas.reduce((sum, u) => sum + (parseFloat(u.geracaoMensal) || 0) * (parseFloat(u.tarifa) || 0), 0)

  function save(item) {
    const exists = comissoes.find(x => x.id === item.id)
    const next = exists ? comissoes.map(x => x.id === item.id ? item : x) : [...comissoes, item]
    setData({ ...data, comissoes: next })
    setEditing(null)
  }

  function remove(id) {
    if (!confirm('Excluir esta comissão?')) return
    setData({ ...data, comissoes: comissoes.filter(x => x.id !== id) })
  }

  function toggle(id) {
    const next = comissoes.map(x => x.id === id ? { ...x, pago: !x.pago } : x)
    setData({ ...data, comissoes: next })
  }

  function blank() {
    return { id: uid(), licenciadoId: '', clienteId: '', valor: '', vencimento: '', pago: false }
  }

  const pendentes = comissoes.filter(c => !c.pago)
  const totalPendente = pendentes.reduce((s, c) => s + (parseFloat(c.valor) || 0), 0)

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <p>Licenciados ativos</p>
          <p>{licenciados.length}</p>
        </div>
        <div className="stat-card">
          <p>Receita taxas adesão (cobradas)</p>
          <p>R$ {totalAdesoes.toLocaleString('pt-BR')}</p>
        </div>
        <div className="stat-card">
          <p>Repasse mensal às usinas</p>
          <p>{currency(totalRepasseUsinas)}</p>
        </div>
        <div className="stat-card">
          <p>Comissões pendentes</p>
          <p>{currency(totalPendente)}</p>
        </div>
      </div>

      <div className="search-row" style={{ justifyContent: 'space-between' }}>
        <h3 className="section-title">Comissões a pagar</h3>
        <button className="primary" onClick={() => setEditing(blank())}>
          <Icon name="plus" /> Nova comissão
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {comissoes.length === 0 && <EmptyState>Nenhuma comissão lançada ainda.</EmptyState>}
        {comissoes.map(c => {
          const lic = licenciados.find(x => x.id === c.licenciadoId)
          const cli = clientes.find(x => x.id === c.clienteId)
          return (
            <div className="card commission-row" key={c.id}>
              <div>
                <p>{lic ? lic.nome : '(licenciado não definido)'}</p>
                <p>{cli ? 'Cliente: ' + cli.nome + ' · ' : ''}Venc: {fmtDate(c.vencimento)}</p>
              </div>
              <div className="commission-actions">
                <span style={{ fontWeight: 600 }}>{currency(c.valor)}</span>
                <Badge color={c.pago ? 'success' : 'warning'}>{c.pago ? 'Pago' : 'Pendente'}</Badge>
                <button aria-label="Marcar pago" onClick={() => toggle(c.id)}><Icon name="check" /></button>
                <button aria-label="Editar" onClick={() => setEditing(c)}><Icon name="edit" /></button>
                <button aria-label="Excluir" onClick={() => remove(c.id)}><Icon name="trash" /></button>
              </div>
            </div>
          )
        })}
      </div>

      {editing && (
        <Modal title="Comissão" onClose={() => setEditing(null)}>
          <div className="form-grid">
            <Field label="Licenciado">
              <select value={editing.licenciadoId} onChange={e => setEditing({ ...editing, licenciadoId: e.target.value })}>
                <option value="">Selecione</option>
                {licenciados.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
              </select>
            </Field>
            <Field label="Cliente final (opcional)">
              <select value={editing.clienteId} onChange={e => setEditing({ ...editing, clienteId: e.target.value })}>
                <option value="">Nenhum</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </Field>
            <Field label="Valor (R$)">
              <input type="text" value={editing.valor} onChange={e => setEditing({ ...editing, valor: e.target.value })} />
            </Field>
            <Field label="Vencimento">
              <input type="date" value={editing.vencimento} onChange={e => setEditing({ ...editing, vencimento: e.target.value })} />
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
