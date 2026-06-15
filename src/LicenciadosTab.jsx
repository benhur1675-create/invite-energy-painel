import Icon from './Icon.jsx'
import { useState } from 'react'
import { Badge, Field, Modal, EmptyState } from './components.jsx'
import { uid, fmtDate, addYears, daysUntil } from './utils.js'

export default function LicenciadosTab({ data, setData }) {
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const list = data.licenciados || []

  const filtered = list.filter(l =>
    (l.nome || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.cidade || '').toLowerCase().includes(search.toLowerCase())
  )

  function save(item) {
    const exists = list.find(x => x.id === item.id)
    const next = exists ? list.map(x => x.id === item.id ? item : x) : [...list, item]
    setData({ ...data, licenciados: next })
    setEditing(null)
  }

  function remove(id) {
    if (!confirm('Excluir este licenciado?')) return
    setData({ ...data, licenciados: list.filter(x => x.id !== id) })
  }

  function blank() {
    return { id: uid(), nome: '', cpfCnpj: '', cidade: '', estado: '', dataAssinatura: '', indicadoPor: '', whatsapp: '', email: '', taxaAdesaoCobrada: false }
  }

  return (
    <div>
      <div className="search-row">
        <input type="text" placeholder="Buscar por nome ou cidade" value={search} onChange={e => setSearch(e.target.value)} />
        <button className="primary" onClick={() => setEditing(blank())}>
          <Icon name="plus" /> Novo licenciado
        </button>
      </div>

      <div className="grid">
        {filtered.length === 0 && <EmptyState>Nenhum licenciado cadastrado ainda.</EmptyState>}
        {filtered.map(l => {
          const renovacao = l.dataAssinatura ? addYears(l.dataAssinatura, 1) : ''
          const dias = renovacao ? daysUntil(renovacao) : null
          const indicados = list.filter(x => x.indicadoPor === l.id)
          let renovColor = 'neutral'
          if (dias !== null) {
            if (dias < 0) renovColor = 'danger'
            else if (dias <= 30) renovColor = 'warning'
            else renovColor = 'success'
          }
          const upline = list.find(x => x.id === l.indicadoPor)

          return (
            <div className="card" key={l.id}>
              <div className="card-header">
                <div>
                  <p className="card-title">{l.nome || '(sem nome)'}</p>
                  <p className="card-subtitle">{(l.cidade || '-')} / {(l.estado || '-')}</p>
                </div>
                <div className="card-actions">
                  <button aria-label="Editar" onClick={() => setEditing(l)}><Icon name="edit" /></button>
                  <button aria-label="Excluir" onClick={() => remove(l.id)}><Icon name="trash" /></button>
                </div>
              </div>
              <table className="detail-table">
                <tbody>
                  <tr><td>Contrato assinado</td><td>{fmtDate(l.dataAssinatura)}</td></tr>
                  <tr>
                    <td>Renovação da licença</td>
                    <td>
                      {renovacao ? (
                        <Badge color={renovColor}>
                          {fmtDate(renovacao)}{dias !== null ? ` (${dias < 0 ? 'vencida há ' + Math.abs(dias) + 'd' : dias + 'd'})` : ''}
                        </Badge>
                      ) : '-'}
                    </td>
                  </tr>
                  <tr><td>Indicado por</td><td>{upline ? upline.nome : 'Invite Energy'}</td></tr>
                  <tr><td>Indicou</td><td>{indicados.length ? indicados.length + ' licenciado(s)' : '-'}</td></tr>
                  <tr><td>WhatsApp</td><td>{l.whatsapp || '-'}</td></tr>
                  <tr><td>E-mail</td><td>{l.email || '-'}</td></tr>
                  <tr>
                    <td>Taxa de adesão</td>
                    <td><Badge color={l.taxaAdesaoCobrada ? 'success' : 'neutral'}>{l.taxaAdesaoCobrada ? 'Cobrada (R$ 500)' : 'Não cobrada'}</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
        })}
      </div>

      {editing && (
        <Modal title={editing.nome ? 'Editar licenciado' : 'Novo licenciado'} onClose={() => setEditing(null)}>
          <div className="form-grid">
            <Field label="Nome / Razão social">
              <input type="text" value={editing.nome} onChange={e => setEditing({ ...editing, nome: e.target.value })} />
            </Field>
            <Field label="CPF/CNPJ">
              <input type="text" value={editing.cpfCnpj} onChange={e => setEditing({ ...editing, cpfCnpj: e.target.value })} />
            </Field>
            <Field label="Cidade">
              <input type="text" value={editing.cidade} onChange={e => setEditing({ ...editing, cidade: e.target.value })} />
            </Field>
            <Field label="Estado (UF)">
              <input type="text" maxLength={2} value={editing.estado} onChange={e => setEditing({ ...editing, estado: e.target.value.toUpperCase() })} />
            </Field>
            <Field label="Data de assinatura do contrato">
              <input type="date" value={editing.dataAssinatura} onChange={e => setEditing({ ...editing, dataAssinatura: e.target.value })} />
            </Field>
            <Field label="Indicado por (upline)">
              <select value={editing.indicadoPor} onChange={e => setEditing({ ...editing, indicadoPor: e.target.value })}>
                <option value="">Invite Energy (fundadores)</option>
                {list.filter(x => x.id !== editing.id).map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}
              </select>
            </Field>
            <Field label="WhatsApp">
              <input type="text" value={editing.whatsapp} onChange={e => setEditing({ ...editing, whatsapp: e.target.value })} />
            </Field>
            <Field label="E-mail">
              <input type="text" value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} />
            </Field>
            <Field label="Taxa de adesão (R$500)">
              <label className="checkbox-field">
                <input type="checkbox" checked={!!editing.taxaAdesaoCobrada} onChange={e => setEditing({ ...editing, taxaAdesaoCobrada: e.target.checked })} />
                Já cobrada
              </label>
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
