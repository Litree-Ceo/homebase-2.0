import React from "react";
export default function GooglePayButton({ price, label, onSuccess }) {
  return (
    <button
      style={{
        background: "#4285F4",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        padding: "10px 22px",
        fontSize: 18,
        fontWeight: 700,
        cursor: "pointer",
        margin: 8,
      }}
      onClick={() => {
        alert(`Demo: Would process payment of $${price}`);
        if (onSuccess) onSuccess();
      }}
    >
      {label || `Pay $${price}`}
    </button>
  );
}
