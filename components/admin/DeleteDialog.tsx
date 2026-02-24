"use client";

/**
 * DeleteDialog — inline confirmation dialog, no fixed positioning.
 */
interface Props {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export default function DeleteDialog({ title, onConfirm, onCancel, isDeleting }: Props) {
  return (
    <div style={{
      background: "white",
      borderRadius: "16px",
      border: "2px solid #f2d4cc",
      boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
      padding: "24px",
      maxWidth: "400px",
      margin: "24px auto",
    }}>
      <h3 style={{ fontWeight: 600, color: "#3d2e2b", marginBottom: "6px", fontSize: "15px" }}>
        Delete bookmark?
      </h3>
      <p style={{ fontSize: "14px", color: "#9a7e7a", marginBottom: "20px" }}>
        <strong style={{ color: "#3d2e2b" }}>{title}</strong> will be permanently removed from your shelf.
      </p>
      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        <button
          onClick={onCancel}
          disabled={isDeleting}
          style={{
            fontSize: "14px", padding: "8px 16px", borderRadius: "10px",
            border: "1px solid #ecddd8", color: "#9a7e7a", background: "white",
            cursor: isDeleting ? "not-allowed" : "pointer", opacity: isDeleting ? 0.5 : 1,
          }}
        >
          Cancel
        </button>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onConfirm(); }}
          disabled={isDeleting}
          style={{
            fontSize: "14px", padding: "8px 16px", borderRadius: "10px",
            border: "none", background: "#f87171", color: "white", fontWeight: 500,
            cursor: isDeleting ? "not-allowed" : "pointer", opacity: isDeleting ? 0.5 : 1,
          }}
        >
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
