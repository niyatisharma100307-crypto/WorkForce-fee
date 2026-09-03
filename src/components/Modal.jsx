export default function Modal({ open, onClose, title, children }) {
  return (
    <div className={`modal-backdrop ${open ? 'show' : ''}`}>
      <div className="modal-box">
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
