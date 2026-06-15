import Icon from './Icon.jsx'
import { useState } from 'react'
import { Badge, Field, Modal, EmptyState } from './components.jsx'
import { uid, fmtDate, distribuidorasFrom } from './utils.js'

export default function ClientesTab({ data, setData }) {
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const list = data.clientes || []
  const licenciados = data.licenciados || []
  const distribuidoras = distribuidorasFrom(data)

  const filtered = list.filter(c => (c.nome || '').toLowerCase().includes(search.toLowerCase()))

  function save(item) {
    const exists = list.find(x => x.id === item.id)
    const next = exists ? list.map(x => x.id === item.id ? item : x) : [...list, item]
    setData({ ...data, clientes: next })
    setEditing(null)
  }

  function remove(id) {
    if (!confirm('Excluir este cliente?')) return
    setData({ ...data, clientes: list.filter(x => x.id !== id) })
  }

  function blank() {
    return { id: uid(), nome: '', cpfCnpj: '', endereco: '', cidade: '', estado: '', distribuidora: '', uc: '', licenciadoId: '', tituloTrocado: false, dataCadastro: '', desconto: '' }
  }

  return (
    <div>
      <div className="search-row">
        <input type="text" placeholder="Buscar cliente" value={search} onChange={e => setSearch(e.target.value)} />
        <button className="primary" onClick={() => setEditing(blank())}>
          <Icon name="plus" /> Novo cliente
        </button>
      </div>

      <div className="grid">
        {filtered.length === 0 && <EmptyState>Nenhum cliente cadastrado ainda.</EmptyState>}
        {filtered.map(c => {
          const lic = licenciados.find(x => x.id === c.licenciadoId)
          return (
            <div className="card" key={c.id}>
              <div className="card-header">
                <div>
                  <p className="card-title">{c.nome || '(sem nome)'}</p>
                  <p className="card-subtitle">{(c.cidade || '-')} / {(c.estado || '-')}</p>
                </div>
                <div className="card-actions">
                  <button aria-label="Editar" onClick={() => setEditing(c)}><Icon name="edit" /></button>
                  <button aria-label="Excluir" onClick={() => remove(c.id)}><Icon name="trash" /></button>
                </div>
              </div>
              <table className="detail-table">
                <tbody>
                  <tr><td>UC</td><td>{c.uc || '-'}</td></tr>
                  <tr><td>Distribuidora</td><td>{c.distribuidora || '-'}</td></tr>
                  <tr>
                    <td>Troca de titularidade</td>
                    <td><Badge color={c.tituloTrocado ? 'success' : 'warning'}>{c.tituloTrocado ? 'Concluída' : 'Pendente'}</Badge></td>
                  </tr>
                  <tr><td>Licenciado</td><td>{lic ? lic.nome : 'Direto / Invite'}</td></tr>
                  <tr><td>Desconto ofertado</td><td>{c.desconto ? c.desconto + '%' : '-'}</td></tr>
                  <tr><td>Cadastrado em</td><td>{fmtDate(c.dataCadastro)}</td></tr>
                </tbody>
              </table>
            </div>
          )
        })}
      </div>

      {editing && (
        <Modal title={editing.nome ? 'Editar cliente' : 'Novo cliente'} onClose={() => setEditing(null)}>
          <div className="form-grid">
            <Field label="Nome / Razão social">
              <input type="text" value={editing.nome} onChange={e => setEditing({ ...editing, nome: e.target.value })} />
            </Field>
            <Field label="CPF/CNPJ">
              <input type="text" value={editing.cpfCnpj} onChange={e => setEditing({ ...editing, cpfCnpj: e.target.value })} />
            </Field>
            <Field label="Endereço">
              <input type="text" value={editing.endereco} onChange={e => setEditing({ ...editing, endereco: e.target.value })} />
            </Field>
            <Field label="UC (Unidade Consumidora)">
              <input type="text" value={editing.uc} onChange={e => setEditing({ ...editing, uc: e.target.value })} />
            </Field>
            <Field label="Cidade">
              <input type="text" value={editing.cidade} onChange={e => setEditing({ ...editing, cidade: e.target.value })} />
            </Field>
            <Field label="Estado (UF)">
              <input type="text" maxLength={2} value={editing.estado} onChange={e => setEditing({ ...editing, estado: e.target.value.toUpperCase() })} />
            </Field>
            <Field label="Distribuidora">
              <select value={editing.distribuidora} onChange={e => setEditing({ ...editing, distribuidora: e.target.value })}>
                <option value="">Selecione</option>
                {distribuidoras.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Desconto ofertado (%)">
              <input type="text" value={editing.desconto} onChange={e => setEditing({ ...editing, desconto: e.target.value })} />
            </Field>
            <Field label="Licenciado responsável">
              <select value={editing.licenciadoId} onChange={e => setEditing({ ...editing, licenciadoId: e.target.value })}>
                <option value="">Direto / Invite Energy</option>
                {licenciados.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
              </select>
            </Field>
            <Field label="Data de cadastro">
              <input type="date" value={editing.dataCadastro} onChange={e => setEditing({ ...editing, dataCadastro: e.target.value })} />
            </Field>
            <Field label="Troca de titularidade">
              <label className="checkbox-field">
                <input type="checkbox" checked={editing.tituloTrocado} onChange={e => setEditing({ ...editing, tituloTrocado: e.target.checked })} />
                Concluída
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
