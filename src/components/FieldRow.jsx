export default function FieldRow({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontSize: 10,
          color: "#64748b",
          fontWeight: 700,
          marginBottom: 5,
          letterSpacing: 0.5,
        }}
      >
        {label.toUpperCase()}
      </div>
      {children}
    </div>
  );
}
