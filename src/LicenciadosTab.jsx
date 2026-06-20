import Icon from './Icon.jsx'
import { useState } from 'react'
import { Badge, Field, Modal, EmptyState } from './components.jsx'
import { uid, fmtDate, addYears, daysUntil } from './utils.js'

const ESTADOS_BR = {
  AC:'Acre',AM:'Amazonas',AP:'Amapá',PA:'Pará',RO:'Rondônia',RR:'Roraima',TO:'Tocantins',
  AL:'Alagoas',BA:'Bahia',CE:'Ceará',MA:'Maranhão',PB:'Paraíba',PE:'Pernambuco',
  PI:'Piauí',RN:'Rio Grande do Norte',SE:'Sergipe',DF:'Distrito Federal',GO:'Goiás',
  MT:'Mato Grosso',MS:'Mato Grosso do Sul',ES:'Espírito Santo',MG:'Minas Gerais',
  RJ:'Rio de Janeiro',SP:'São Paulo',PR:'Paraná',RS:'Rio Grande do Sul',SC:'Santa Catarina',
}

const ESTADO_PATHS = {
  SP: "M 310 380 L 340 365 L 370 375 L 380 395 L 365 420 L 340 425 L 315 415 L 305 398 Z",
  MG: "M 330 310 L 370 295 L 400 305 L 410 330 L 395 355 L 370 370 L 340 365 L 315 350 L 310 330 Z",
  RJ: "M 370 375 L 395 365 L 410 378 L 400 395 L 380 395 Z",
  ES: "M 395 340 L 415 330 L 425 345 L 415 365 L 395 365 Z",
  PR: "M 295 415 L 340 425 L 345 445 L 315 455 L 285 445 Z",
  SC: "M 285 445 L 315 455 L 315 470 L 290 475 L 270 465 Z",
  RS: "M 270 465 L 315 470 L 318 495 L 295 510 L 265 500 L 255 480 Z",
  MS: "M 255 360 L 305 355 L 310 380 L 305 398 L 280 410 L 255 400 Z",
  MT: "M 195 270 L 260 255 L 280 285 L 275 320 L 255 340 L 215 345 L 190 320 Z",
  GO: "M 285 310 L 330 305 L 340 330 L 330 355 L 300 360 L 270 350 L 265 325 Z",
  DF: "M 308 328 L 318 323 L 322 332 L 312 337 Z",
  BA: "M 350 225 L 410 215 L 435 240 L 430 285 L 405 305 L 375 310 L 345 300 L 330 270 L 340 240 Z",
  SE: "M 420 270 L 440 265 L 445 280 L 430 285 Z",
  AL: "M 430 255 L 450 248 L 455 262 L 440 265 Z",
  PE: "M 390 225 L 450 215 L 460 232 L 440 248 L 410 248 L 390 238 Z",
  PB: "M 420 205 L 460 198 L 465 215 L 450 215 L 420 218 Z",
  RN: "M 430 188 L 465 182 L 468 198 L 445 202 L 425 200 Z",
  CE: "M 390 175 L 435 165 L 445 185 L 435 200 L 405 205 L 390 195 Z",
  PI: "M 350 175 L 390 168 L 395 195 L 385 220 L 360 225 L 340 210 L 342 188 Z",
  MA: "M 310 155 L 355 148 L 360 175 L 345 195 L 315 195 L 300 175 Z",
  TO: "M 285 195 L 330 185 L 340 210 L 330 250 L 305 258 L 278 245 L 275 218 Z",
  PA: "M 220 130 L 310 115 L 325 145 L 315 175 L 285 190 L 255 190 L 225 175 L 205 155 Z",
  AP: "M 270 90 L 310 85 L 318 115 L 295 120 L 268 112 Z",
  AM: "M 100 110 L 220 100 L 230 130 L 225 170 L 195 188 L 155 190 L 120 175 L 95 150 Z",
  RR: "M 150 60 L 220 55 L 228 90 L 200 105 L 155 100 L 140 80 Z",
  AC: "M 80 170 L 130 158 L 145 178 L 125 195 L 85 192 Z",
  RO: "M 130 195 L 195 185 L 205 215 L 185 240 L 145 242 L 122 222 Z",
  AP2: "M 295 82 L 325 78 L 330 100 L 310 105 Z",
}

function BrazilMap({ licenciados }) {
  const [hoveredState, setHoveredState] = useState(null)

  const countByState = {}
  licenciados.forEach(l => {
    if (l.estado) {
      countByState[l.estado] = (countByState[l.estado] || 0) + 1
    }
  })

  const maxCount = Math.max(...Object.values(countByState), 1)

  function getColor(estado) {
    const count = countByState[estado] || 0
    if (count === 0) return '#1A2E1C'
    const intensity = count / maxCount
    if (intensity < 0.33) return '#1E6B30'
    if (intensity < 0.66) return '#27A844'
    return '#4ADE80'
  }

  const topStates = Object.entries(countByState)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const countByCity = {}
  licenciados.forEach(l => {
    if (l.cidade && l.cidade.trim()) {
      const chave = l.estado ? `${l.cidade.trim()}/${l.estado.trim()}` : l.cidade.trim()
      countByCity[chave] = (countByCity[chave] || 0) + 1
    }
  })
  const topCities = Object.entries(countByCity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
  const maxCityCount = topCities.length > 0 ? topCities[0][1] : 1

  return (
    <div style={{ background: '#0D1F10', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', border: '1px solid #1B3A22' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: '#FFFFFF' }}>Concentração de licenciados por estado</p>
          <p style={{ margin: 0, fontSize: 12, color: '#6B9E78' }}>Passe o mouse sobre o estado para ver detalhes</p>
        </div>
        {hoveredState && (
          <div style={{ background: '#1B3A22', borderRadius: 8, padding: '6px 12px', border: '1px solid #4ADE80' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#4ADE80' }}>{hoveredState}</p>
            <p style={{ margin: 0, fontSize: 12, color: '#FFFFFF' }}>{countByState[hoveredState] || 0} licenciado(s)</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 280px' }}>
          <svg viewBox="0 60 480 480" width="100%" style={{ display: 'block' }}>
            {Object.entries(ESTADO_PATHS).map(([estado, path]) => {
              const uf = estado.replace('2','')
              return (
                <path
                  key={estado}
                  d={path}
                  fill={getColor(uf)}
                  stroke="#0A1A0E"
                  strokeWidth="1.5"
                  style={{ cursor: 'pointer', transition: 'fill 0.2s' }}
                  onMouseEnter={() => setHoveredState(uf + (ESTADOS_BR[uf] ? ' — ' + ESTADOS_BR[uf] : ''))}
                  onMouseLeave={() => setHoveredState(null)}
                />
              )
            })}
          </svg>
        </div>

        <div style={{ flex: '0 0 180px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <p style={{ margin: '0 0 6px 0', fontSize: 11, color: '#6B9E78', textTransform: 'uppercase', letterSpacing: 1 }}>Concentração</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { color: '#4ADE80', label: 'Alta' },
                { color: '#27A844', label: 'Média' },
                { color: '#1E6B30', label: 'Baixa' },
                { color: '#1A2E1C', label: 'Nenhum' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#FFFFFF' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {topStates.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <p style={{ margin: '0 0 6px 0', fontSize: 11, color: '#6B9E78', textTransform: 'uppercase', letterSpacing: 1 }}>Top estados</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {topStates.map(([estado, count], i) => (
                  <div key={estado} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#FFFFFF' }}>
                      <span style={{ color: '#4ADE80', fontWeight: 600 }}>{i + 1}. </span>
                      {estado}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#4ADE80' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {topStates.length === 0 && (
            <p style={{ fontSize: 12, color: '#6B9E78', marginTop: 8 }}>Cadastre licenciados com estado para ver o mapa.</p>
          )}

          {topCities.length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #1B3A22' }}>
              <p style={{ margin: '0 0 6px 0', fontSize: 11, color: '#6B9E78', textTransform: 'uppercase', letterSpacing: 1 }}>Top cidades</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {topCities.map(([cidade, count], i) => (
                  <div key={cidade} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#FFFFFF' }}>
                        <span style={{ color: '#4ADE80', fontWeight: 600 }}>{i + 1}. </span>
                        {cidade}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#4ADE80' }}>{count}</span>
                    </div>
                    <div style={{ width: '100%', height: 4, background: '#1A2E1C', borderRadius: 2, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${(count / maxCityCount) * 100}%`,
                          height: '100%',
                          background: '#4ADE80',
                          borderRadius: 2,
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LicenciadosTab({ data, setData }) {
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('recente')
  const list = data.licenciados || []

  const filtered = list
    .filter(l =>
      (l.nome || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.cidade || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'recente') {
        if (!a.dataAssinatura && !b.dataAssinatura) return 0
        if (!a.dataAssinatura) return 1
        if (!b.dataAssinatura) return -1
        return b.dataAssinatura.localeCompare(a.dataAssinatura)
      }
      if (sortBy === 'alfa') {
        return (a.nome || '').localeCompare(b.nome || '', 'pt-BR')
      }
      return 0
    })

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
      <BrazilMap licenciados={list} />

      <div className="search-row">
        <input
          type="text"
          placeholder="Buscar por nome ou cidade"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 'auto' }}>
          <option value="recente">Mais recente</option>
          <option value="alfa">A → Z</option>
        </select>
        <button className="primary" onClick={() => setEditing(blank())}>
          <Icon name="plus" /> Novo licenciado
        </button>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{filtered.length}</span> licenciado{filtered.length !== 1 ? 's' : ''} {search ? 'encontrado' + (filtered.length !== 1 ? 's' : '') : 'no total'}
      </p>

      <div className="grid">
        {filtered.length === 0 && <EmptyState>Nenhum licenciado encontrado.</EmptyState>}
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
                  <p className="card-subtitle">
                    {l.cidade || l.estado
                      ? `${l.cidade || ''}${l.cidade && l.estado ? ' / ' : ''}${l.estado || ''}`
                      : 'Cidade não informada'}
                  </p>
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
