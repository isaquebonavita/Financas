export default function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0f172a",
          borderRadius: "20px 20px 0 0",
          padding: "20px 20px 32px",
          width: "100%",
          maxWidth: 420,
          maxHeight: "92vh",
          overflowY: "auto",
          border: "1px solid #1e293b",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9" }}>
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "#1e293b",
              border: "none",
              color: "#94a3b8",
              borderRadius: 8,
              width: 30,
              height: 30,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
