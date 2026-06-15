import Icon from './Icon.jsx'
import { useState } from 'react'
import { Badge, Field, Modal, EmptyState } from './components.jsx'
import { uid } from './utils.js'

// Days of week for recurring tasks
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const DIAS_OPCOES = [
  { label: 'Todo dia', value: 'daily' },
  { label: 'Dias úteis (Seg–Sex)', value: 'weekdays' },
  { label: 'Seg, Qua e Sex', value: 'mon_wed_fri' },
  { label: 'Personalizado', value: 'custom' },
]

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function diaSemanaHoje() {
  return new Date().getDay() // 0=Dom, 1=Seg...
}

function isRecurrenceActive(recurrence, customDays) {
  const d = diaSemanaHoje()
  if (recurrence === 'daily') return true
  if (recurrence === 'weekdays') return d >= 1 && d <= 5
  if (recurrence === 'mon_wed_fri') return [1, 3, 5].includes(d)
  if (recurrence === 'custom') return (customDays || []).includes(d)
  return true
}

function recurrenceLabel(recurrence, customDays) {
  if (recurrence === 'daily') return 'Todo dia'
  if (recurrence === 'weekdays') return 'Dias úteis'
  if (recurrence === 'mon_wed_fri') return 'Seg, Qua e Sex'
  if (recurrence === 'custom') return (customDays || []).map(d => DIAS_SEMANA[d]).join(', ')
  return ''
}

const DEFAULT_TASKS = [
  { id: uid(), titulo: 'Verificar trocas de titularidade pendentes', recurrence: 'daily', customDays: [], categoria: 'Operacional', checks: {} },
  { id: uid(), titulo: 'Verificar e-mail da empresa', recurrence: 'daily', customDays: [], categoria: 'Operacional', checks: {} },
  { id: uid(), titulo: 'Criar arte para marketing', recurrence: 'mon_wed_fri', customDays: [], categoria: 'Marketing', checks: {} },
  { id: uid(), titulo: 'Verificar novas indicações de licenciados', recurrence: 'weekdays', customDays: [], categoria: 'Comercial', checks: {} },
  { id: uid(), titulo: 'Verificar mensagens no grupo de licenciados', recurrence: 'daily', customDays: [], categoria: 'Comercial', checks: {} },
  { id: uid(), titulo: 'Verificar usinas com geração baixa ou pendências', recurrence: 'weekdays', customDays: [], categoria: 'Operacional', checks: {} },
  { id: uid(), titulo: 'Enviar relatório de produção para usinas', recurrence: 'custom', customDays: [5], categoria: 'Financeiro', checks: {} }, // sextas
]

const CATEGORIAS = ['Operacional', 'Comercial', 'Marketing', 'Financeiro', 'Outro']

export default function TarefasTab({ data, setData }) {
  const tarefas = data.tarefas || DEFAULT_TASKS
  const [editing, setEditing] = useState(null)
  const today = todayKey()

  function saveTarefas(next) {
    setData({ ...data, tarefas: next })
  }

  function toggle(id) {
    saveTarefas(tarefas.map(t => {
      if (t.id !== id) return t
      const checks = { ...t.checks }
      checks[today] = !checks[today]
      return { ...t, checks }
    }))
  }

  function save(item) {
    const exists = tarefas.find(x => x.id === item.id)
    const next = exists ? tarefas.map(x => x.id === item.id ? item : x) : [...tarefas, item]
    saveTarefas(next)
    setEditing(null)
  }

  function remove(id) {
    if (!confirm('Excluir esta tarefa?')) return
    saveTarefas(tarefas.filter(x => x.id !== id))
  }

  function blank() {
    return { id: uid(), titulo: '', recurrence: 'daily', customDays: [], categoria: 'Operacional', checks: {} }
  }

  // Only show tasks active today
  const ativas = tarefas.filter(t => isRecurrenceActive(t.recurrence, t.customDays))
  const inativas = tarefas.filter(t => !isRecurrenceActive(t.recurrence, t.customDays))

  const concluidas = ativas.filter(t => t.checks[today])
  const pendentes = ativas.filter(t => !t.checks[today])

  const progresso = ativas.length > 0 ? Math.round((concluidas.length / ativas.length) * 100) : 100

  // Group pending by category
  const byCategoria = {}
  pendentes.forEach(t => {
    if (!byCategoria[t.categoria]) byCategoria[t.categoria] = []
    byCategoria[t.categoria].push(t)
  })

  const diasSemanaLabels = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  const diaHoje = diasSemanaLabels[diaSemanaHoje()]
  const dataHoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>{diaHoje}, {dataHoje}</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>
            {concluidas.length} de {ativas.length} tarefas concluídas hoje
          </p>
        </div>
        <button className="primary" onClick={() => setEditing(blank())}>
          <Icon name="plus" /> Nova tarefa
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--border)', borderRadius: 8, height: 8, marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{ background: progresso === 100 ? 'var(--green)' : 'var(--green-light)', height: '100%', width: progresso + '%', transition: 'width 0.3s ease', borderRadius: 8 }} />
      </div>

      {/* Pendentes */}
      {pendentes.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: 14, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>Pendentes ({pendentes.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(byCategoria).map(([cat, tasks]) => (
              <div key={cat}>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '8px 0 4px 0' }}>{cat}</p>
                {tasks.map(t => (
                  <TaskRow key={t.id} tarefa={t} today={today} onToggle={() => toggle(t.id)} onEdit={() => setEditing(t)} onRemove={() => remove(t.id)} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Concluídas */}
      {concluidas.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: 14, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>Concluídas ({concluidas.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {concluidas.map(t => (
              <TaskRow key={t.id} tarefa={t} today={today} onToggle={() => toggle(t.id)} onEdit={() => setEditing(t)} onRemove={() => remove(t.id)} done />
            ))}
          </div>
        </div>
      )}

      {ativas.length === 0 && <EmptyState>Nenhuma tarefa para hoje. Clique em "Nova tarefa" para adicionar.</EmptyState>}

      {/* Tarefas inativas hoje */}
      {inativas.length > 0 && (
        <details style={{ marginTop: '1rem' }}>
          <summary style={{ fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Tarefas não programadas para hoje ({inativas.length})
          </summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {inativas.map(t => (
              <div key={t.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14 }}>{t.titulo}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>{recurrenceLabel(t.recurrence, t.customDays)} · {t.categoria}</p>
                </div>
                <div className="card-actions">
                  <button aria-label="Editar" onClick={() => setEditing(t)}><Icon name="edit" /></button>
                  <button aria-label="Excluir" onClick={() => remove(t.id)}><Icon name="trash" /></button>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      {editing && (
        <TarefaModal
          initial={editing}
          tarefas={tarefas}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  )
}

function TaskRow({ tarefa, today, onToggle, onEdit, onRemove, done }) {
  return (
    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
        <button
          onClick={onToggle}
          aria-label={done ? 'Desmarcar' : 'Marcar como feito'}
          style={{
            width: 24, height: 24, borderRadius: 6, padding: 0,
            background: done ? 'var(--green)' : 'transparent',
            border: done ? '2px solid var(--green)' : '2px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {done && <Icon name="check" size={14} style={{ color: 'white' }} />}
        </button>
        <div>
          <p style={{ margin: 0, fontSize: 14, textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--text-secondary)' : 'var(--text)' }}>
            {tarefa.titulo}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
            {recurrenceLabel(tarefa.recurrence, tarefa.customDays)} · {tarefa.categoria}
          </p>
        </div>
      </div>
      <div className="card-actions">
        <button aria-label="Editar" onClick={onEdit}><Icon name="edit" /></button>
        <button aria-label="Excluir" onClick={onRemove}><Icon name="trash" /></button>
      </div>
    </div>
  )
}

function TarefaModal({ initial, onSave, onClose }) {
  const [item, setItem] = useState(initial)

  function toggleDay(d) {
    const days = item.customDays || []
    const next = days.includes(d) ? days.filter(x => x !== d) : [...days, d]
    setItem({ ...item, customDays: next })
  }

  return (
    <Modal title={initial.titulo ? 'Editar tarefa' : 'Nova tarefa'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Título da tarefa">
          <input type="text" value={item.titulo} onChange={e => setItem({ ...item, titulo: e.target.value })} autoFocus />
        </Field>
        <Field label="Categoria">
          <select value={item.categoria} onChange={e => setItem({ ...item, categoria: e.target.value })}>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Recorrência">
          <select value={item.recurrence} onChange={e => setItem({ ...item, recurrence: e.target.value })}>
            {DIAS_OPCOES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        {item.recurrence === 'custom' && (
          <Field label="Dias da semana">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DIAS_SEMANA.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  style={{
                    padding: '4px 10px',
                    background: (item.customDays || []).includes(i) ? 'var(--green)' : 'transparent',
                    color: (item.customDays || []).includes(i) ? 'white' : 'var(--text)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    fontSize: 13
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </Field>
        )}
      </div>
      <div className="modal-footer">
        <button onClick={onClose}>Cancelar</button>
        <button className="primary" onClick={() => onSave(item)}>Salvar</button>
      </div>
    </Modal>
  )
}
