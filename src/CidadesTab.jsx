import Icon from './Icon.jsx'
import { useState } from 'react'
import { Badge, Field, Modal, EmptyState } from './components.jsx'
import { uid } from './utils.js'

export default function CidadesTab({ data, setData }) {
  const usinas = data.usinas || []
  const clientes = data.clientes || []
  const licenciados = data.licenciados || []
  const coverage = data.coverage || []

  const [search, setSearch] = useState('')
  const [editingDist, setEditingDist] = useState(null) // { id, nome } for add/rename
  const [addingCityFor, setAddingCityFor] = useState(null) // distribuidora id
  const [bulkFor, setBulkFor] = useState(null) // distribuidora id for bulk-paste

  const operatingCities = new Set()
  ;[...usinas, ...clientes, ...licenciados].forEach(x => {
    if (x.cidade) operatingCities.add((x.cidade + '/' + (x.estado || '')).toLowerCase())
  })

  function countFor(cidade) {
    const norm = c => (c.cidade || '').toLowerCase() === cidade.toLowerCase()
    return {
      clientesCount: clientes.filter(norm).length,
      licCount: licenciados.filter(norm).length,
      usinasCount: usinas.filter(norm).length,
    }
  }

  function saveCoverage(next) {
    setData({ ...data, coverage: next })
  }

  function addDistribuidora(nome) {
    if (!nome.trim()) return
    saveCoverage([...coverage, { id: uid(), nome: nome.trim(), cidades: [] }])
    setEditingDist(null)
  }

  function renameDistribuidora(id, nome) {
    saveCoverage(coverage.map(d => d.id === id ? { ...d, nome } : d))
    setEditingDist(null)
  }

  function removeDistribuidora(id) {
    if (!confirm('Remover esta distribuidora e todas as suas cidades da lista de cobertura?')) return
    saveCoverage(coverage.filter(d => d.id !== id))
  }

  function addCity(distId, nome, estado) {
    if (!nome.trim()) return
    saveCoverage(coverage.map(d => {
      if (d.id !== distId) return d
      const exists = d.cidades.some(c => c.nome.toLowerCase() === nome.trim().toLowerCase() && c.estado === estado)
      if (exists) return d
      return { ...d, cidades: [...d.cidades, { nome: nome.trim(), estado: estado.trim().toUpperCase() }] }
    }))
    setAddingCityFor(null)
  }

  function addCitiesBulk(distId, text, estado) {
    const names = text.split('\n').map(s => s.trim()).filter(Boolean)
    if (names.length === 0) return
    saveCoverage(coverage.map(d => {
      if (d.id !== distId) return d
      const existingKeys = new Set(d.cidades.map(c => c.nome.toLowerCase() + '/' + c.estado))
      const toAdd = names
        .filter(n => !existingKeys.has(n.toLowerCase() + '/' + estado.toUpperCase()))
        .map(n => ({ nome: n, estado: estado.trim().toUpperCase() }))
      return { ...d, cidades: [...d.cidades, ...toAdd] }
    }))
    setBulkFor(null)
  }

  function removeCity(distId, cidadeNome, estado) {
    saveCoverage(coverage.map(d => {
      if (d.id !== distId) return d
      return { ...d, cidades: d.cidades.filter(c => !(c.nome === cidadeNome && c.estado === estado)) }
    }))
  }

  const term = search.trim().toLowerCase()

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 0 }}>
        Cidades dentro da área de concessão de cada distribuidora — onde é possível oferecer a Assinatura Invite.
        Cidades destacadas em verde já têm usina, cliente ou licenciado cadastrado. Adicione novas distribuidoras
        (CPFL, Equatorial, etc.) e suas cidades conforme formos expandindo.
      </p>

      <div className="search-row">
        <input type="text" placeholder="Buscar cidade..." value={search} onChange={e => setSearch(e.target.value)} />
        <button className="primary" onClick={() => setEditingDist({ id: null, nome: '' })}>
          <Icon name="plus" /> Nova distribuidora
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {coverage.length === 0 && (
          <EmptyState>Nenhuma distribuidora cadastrada. Clique em "Nova distribuidora" para começar.</EmptyState>
        )}
        {coverage.map(dist => {
          const filtered = term ? dist.cidades.filter(c => c.nome.toLowerCase().includes(term)) : dist.cidades
          if (term && filtered.length === 0) return null
          return (
            <div key={dist.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 className="section-title" style={{ margin: 0 }}>
                  {dist.nome} <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: 13 }}>({filtered.length} cidades)</span>
                </h3>
                <div className="card-actions">
                  <button aria-label="Adicionar cidade" onClick={() => setAddingCityFor(dist.id)} title="Adicionar cidade"><Icon name="plus" /></button>
                  <button aria-label="Adicionar várias cidades" onClick={() => setBulkFor(dist.id)} title="Adicionar lista de cidades"><Icon name="upload" /></button>
                  <button aria-label="Renomear" onClick={() => setEditingDist({ id: dist.id, nome: dist.nome })} title="Renomear"><Icon name="edit" /></button>
                  <button aria-label="Excluir distribuidora" onClick={() => removeDistribuidora(dist.id)} title="Excluir distribuidora"><Icon name="trash" /></button>
                </div>
              </div>
              {filtered.length === 0 ? (
                <EmptyState>Nenhuma cidade cadastrada para esta distribuidora.</EmptyState>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {filtered.map(city => {
                    const isOperating = operatingCities.has((city.nome + '/' + city.estado).toLowerCase())
                    const counts = isOperating ? countFor(city.nome) : null
                    return (
                      <span
                        key={city.nome + city.estado}
                        className={'badge ' + (isOperating ? 'badge-success' : 'badge-neutral')}
                        title={isOperating ? `${counts.usinasCount} usina(s) · ${counts.licCount} licenciado(s) · ${counts.clientesCount} cliente(s)` : ''}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        {isOperating && <Icon name="check" size={12} />}
                        {city.nome} / {city.estado}
                        <button
                          aria-label={`Remover ${city.nome}`}
                          onClick={() => removeCity(dist.id, city.nome, city.estado)}
                          style={{ padding: 0, border: 'none', background: 'none', display: 'inline-flex', cursor: 'pointer' }}
                        >
                          <Icon name="x" size={12} />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
        {term && coverage.every(d => d.cidades.filter(c => c.nome.toLowerCase().includes(term)).length === 0) && (
          <EmptyState>Nenhuma cidade encontrada para "{search}".</EmptyState>
        )}
      </div>

      {coverage.length > 0 && (
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: 16, alignItems: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
          <span><Badge color="success">Verde</Badge> já operamos (usina, cliente ou licenciado)</span>
          <span><Badge color="neutral">Cinza</Badge> dentro da área de cobertura, ainda sem operação</span>
        </div>
      )}

      {editingDist && (
        <DistribuidoraModal
          initial={editingDist}
          onClose={() => setEditingDist(null)}
          onSave={(nome) => editingDist.id ? renameDistribuidora(editingDist.id, nome) : addDistribuidora(nome)}
        />
      )}

      {addingCityFor && (
        <AddCityModal
          onClose={() => setAddingCityFor(null)}
          onSave={(nome, estado) => addCity(addingCityFor, nome, estado)}
        />
      )}

      {bulkFor && (
        <BulkCityModal
          onClose={() => setBulkFor(null)}
          onSave={(text, estado) => addCitiesBulk(bulkFor, text, estado)}
        />
      )}
    </div>
  )
}

function DistribuidoraModal({ initial, onSave, onClose }) {
  const [nome, setNome] = useState(initial.nome)
  return (
    <Modal title={initial.id ? 'Renomear distribuidora' : 'Nova distribuidora'} onClose={onClose}>
      <Field label="Nome da distribuidora">
        <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: CPFL Paulista" autoFocus />
      </Field>
      <div className="modal-footer">
        <button onClick={onClose}>Cancelar</button>
        <button className="primary" onClick={() => onSave(nome)}>Salvar</button>
      </div>
    </Modal>
  )
}

function AddCityModal({ onSave, onClose }) {
  const [nome, setNome] = useState('')
  const [estado, setEstado] = useState('')
  return (
    <Modal title="Adicionar cidade" onClose={onClose}>
      <div className="form-grid">
        <Field label="Cidade">
          <input type="text" value={nome} onChange={e => setNome(e.target.value)} autoFocus />
        </Field>
        <Field label="Estado (UF)">
          <input type="text" maxLength={2} value={estado} onChange={e => setEstado(e.target.value.toUpperCase())} />
        </Field>
      </div>
      <div className="modal-footer">
        <button onClick={onClose}>Cancelar</button>
        <button className="primary" onClick={() => onSave(nome, estado)}>Adicionar</button>
      </div>
    </Modal>
  )
}

function BulkCityModal({ onSave, onClose }) {
  const [text, setText] = useState('')
  const [estado, setEstado] = useState('')
  return (
    <Modal title="Adicionar várias cidades" onClose={onClose}>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 0 }}>
        Cole uma cidade por linha. Todas serão adicionadas com o mesmo estado.
      </p>
      <div className="form-grid">
        <Field label="Estado (UF) para todas">
          <input type="text" maxLength={2} value={estado} onChange={e => setEstado(e.target.value.toUpperCase())} />
        </Field>
      </div>
      <div style={{ marginTop: 12 }}>
        <Field label="Cidades (uma por linha)">
          <textarea rows={8} value={text} onChange={e => setText(e.target.value)} placeholder={'Cidade 1\nCidade 2\nCidade 3'} />
        </Field>
      </div>
      <div className="modal-footer">
        <button onClick={onClose}>Cancelar</button>
        <button className="primary" onClick={() => onSave(text, estado)}>Adicionar</button>
      </div>
    </Modal>
  )
}
