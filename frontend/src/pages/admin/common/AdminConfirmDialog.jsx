import React from "react";
import { TbAlertTriangle, TbX } from "react-icons/tb";

export const AdminConfirmDialog = ({
  isOpen,
  title = "Xác Nhận Thao Tác",
  message = "Bạn có chắc chắn muốn thực hiện thao tác này?",
  confirmText = "Xác Nhận",
  cancelText = "Hủy Bỏ",
  type = "danger", // 'danger', 'warning', 'primary'
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-container"
        style={{
          maxWidth: "400px",
          width: "100%",
          padding: "1.35rem",
          textAlign: "center",
          borderRadius: "var(--adm-radius-xl)",
          border: "1px solid var(--adm-border)",
          boxShadow: "var(--adm-shadow-modal)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "var(--adm-radius-md)",
            background: type === "danger" ? "#fee2e2" : "#fffbeb",
            color: type === "danger" ? "#ef4444" : "#f59e0b",
            border:
              type === "danger" ? "1px solid #fca5a5" : "1px solid #fde68a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.35rem",
            margin: "0 auto 0.85rem auto",
          }}
        >
          <TbAlertTriangle />
        </div>

        <h3
          style={{
            fontSize: "1.05rem",
            fontWeight: 800,
            color: "var(--adm-text-main)",
            fontFamily: "var(--adm-font-display)",
            letterSpacing: "-0.3px",
            marginBottom: "0.35rem",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--adm-text-muted)",
            lineHeight: 1.45,
            marginBottom: "1.25rem",
          }}
        >
          {message}
        </p>

        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "0.45rem 1rem",
              borderRadius: "var(--adm-radius-sm)",
              border: "1px solid var(--adm-border)",
              background: "#f8fafc",
              color: "#64748b",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "0.45rem 1.15rem",
              borderRadius: "var(--adm-radius-sm)",
              border: "none",
              background:
                type === "danger"
                  ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                  : "linear-gradient(135deg, #ff385c 0%, #e11d48 100%)",
              color: "#ffffff",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 3px 10px rgba(239, 68, 68, 0.22)",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminConfirmDialog;
