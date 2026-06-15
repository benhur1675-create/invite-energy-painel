import Icon from './Icon.jsx'
export function Badge({ children, color }) {
  return <span className={`badge badge-${color}`}>{children}</span>
}

export function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  )
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button aria-label="Fechar" onClick={onClose}>
            <Icon name="x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function EmptyState({ children }) {
  return <p className="empty-state">{children}</p>
}
