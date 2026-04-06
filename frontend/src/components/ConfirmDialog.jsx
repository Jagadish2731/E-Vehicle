import "../styles/ConfirmDialog.css";

export default function ConfirmDialog({ open, title, message, confirmText = "Confirm", danger, onConfirm, onClose }) {
  if (!open) return null;

  return (
    <div className="confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={onClose}>
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <h4 id="confirm-title">{title}</h4>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={danger ? "btn-danger" : ""}
            onClick={async () => {
              await Promise.resolve(onConfirm?.());
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
