import Icon from './Icon.jsx'
import { useState } from 'react'
import { Badge, Field, Modal, EmptyState } from './components.jsx'
import { uid, fmtDate, currency, distribuidorasFrom } from './utils.js'

export default function UsinasTab({ data, setData }) {
  const [editing, setEditing] = useState(null)
  const list = data.usinas || []
  const distribuidoras = distribuidorasFrom(data)

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
      id: uid(), nomeLocador: '', cpfCnpj: '', uc: '', endereco: '', cidade: '', estado: '',
      distribuidora: '', potencia: '', geracaoMensal: '', tarifa: '', dataAssinatura: '',
      inversorMarca: '', inversorModelo: '', inversorSerie: '', login: '', senha: '', obs: ''
    }
  }

  return (
    <div>
      <div className="search-row" style={{ justifyContent: 'flex-end' }}>
        <button className="primary" onClick={() => setEditing(blank())}>
          <Icon name="plus" /> Nova usina
        </button>
      </div>

      <div className="grid">
        {list.length === 0 && <EmptyState>Nenhuma usina cadastrada ainda.</EmptyState>}
        {list.map(u => {
          const valorMensal = (parseFloat(u.geracaoMensal) || 0) * (parseFloat(u.tarifa) || 0)
          return (
            <div className="card" key={u.id}>
              <div className="card-header">
                <div>
                  <p className="card-title">{u.nomeLocador || '(sem nome)'}</p>
                  <p className="card-subtitle">{(u.cidade || '-')} / {(u.estado || '-')} · {(u.distribuidora || '-')}</p>
                </div>
                <div className="card-actions">
                  <button aria-label="Editar" onClick={() => setEditing(u)}><Icon name="edit" /></button>
                  <button aria-label="Excluir" onClick={() => remove(u.id)}><Icon name="trash" /></button>
                </div>
              </div>
              <table className="detail-table">
                <tbody>
                  <tr><td>UC</td><td>{u.uc || '-'}</td></tr>
                  <tr><td>Potência instalada</td><td>{u.potencia ? u.potencia + ' kW' : '-'}</td></tr>
                  <tr><td>Geração estimada</td><td>{u.geracaoMensal ? Number(u.geracaoMensal).toLocaleString('pt-BR') + ' kWh/mês' : '-'}</td></tr>
                  <tr><td>Tarifa</td><td>{u.tarifa ? 'R$ ' + Number(u.tarifa).toFixed(2) + '/kWh' : '-'}</td></tr>
                  <tr><td style={{ fontWeight: 600 }}>Valor mensal estimado</td><td style={{ fontWeight: 600 }}>{currency(valorMensal)}</td></tr>
                  <tr><td>Assinatura</td><td>{fmtDate(u.dataAssinatura)}</td></tr>
                  <tr>
                    <td>Inversor</td>
                    <td>{u.inversorMarca ? (u.inversorMarca + (u.inversorModelo ? ' ' + u.inversorModelo : '')) : <Badge color="danger">Pendente</Badge>}</td>
                  </tr>
                  <tr>
                    <td>Login monitoramento</td>
                    <td>{u.login || <Badge color="danger">Pendente</Badge>}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
        })}
      </div>

      {editing && (
        <Modal title={editing.nomeLocador ? 'Editar usina' : 'Nova usina'} onClose={() => setEditing(null)}>
          <div className="form-grid">
            <Field label="Nome do locador">
              <input type="text" value={editing.nomeLocador} onChange={e => setEditing({ ...editing, nomeLocador: e.target.value })} />
            </Field>
            <Field label="CPF/CNPJ">
              <input type="text" value={editing.cpfCnpj} onChange={e => setEditing({ ...editing, cpfCnpj: e.target.value })} />
            </Field>
            <Field label="UC">
              <input type="text" value={editing.uc} onChange={e => setEditing({ ...editing, uc: e.target.value })} />
            </Field>
            <Field label="Endereço da usina">
              <input type="text" value={editing.endereco} onChange={e => setEditing({ ...editing, endereco: e.target.value })} />
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
            <Field label="Potência instalada (kW)">
              <input type="text" value={editing.potencia} onChange={e => setEditing({ ...editing, potencia: e.target.value })} />
            </Field>
            <Field label="Geração estimada mensal (kWh)">
              <input type="text" value={editing.geracaoMensal} onChange={e => setEditing({ ...editing, geracaoMensal: e.target.value })} />
            </Field>
            <Field label="Tarifa locação (R$/kWh)">
              <input type="text" value={editing.tarifa} onChange={e => setEditing({ ...editing, tarifa: e.target.value })} />
            </Field>
            <Field label="Data de assinatura">
              <input type="date" value={editing.dataAssinatura} onChange={e => setEditing({ ...editing, dataAssinatura: e.target.value })} />
            </Field>
            <div />
            <Field label="Marca do inversor">
              <input type="text" value={editing.inversorMarca} onChange={e => setEditing({ ...editing, inversorMarca: e.target.value })} />
            </Field>
            <Field label="Modelo do inversor">
              <input type="text" value={editing.inversorModelo} onChange={e => setEditing({ ...editing, inversorModelo: e.target.value })} />
            </Field>
            <Field label="Nº série inversor">
              <input type="text" value={editing.inversorSerie} onChange={e => setEditing({ ...editing, inversorSerie: e.target.value })} />
            </Field>
            <div />
            <Field label="Login monitoramento">
              <input type="text" value={editing.login} onChange={e => setEditing({ ...editing, login: e.target.value })} />
            </Field>
            <Field label="Senha monitoramento">
              <input type="text" value={editing.senha} onChange={e => setEditing({ ...editing, senha: e.target.value })} />
            </Field>
          </div>
          <div style={{ marginTop: 12 }}>
            <Field label="Observações">
              <textarea rows={2} value={editing.obs} onChange={e => setEditing({ ...editing, obs: e.target.value })} />
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
