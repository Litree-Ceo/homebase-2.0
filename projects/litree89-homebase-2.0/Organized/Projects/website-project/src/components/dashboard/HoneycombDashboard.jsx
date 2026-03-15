import React from "react";
import "../../styles/honeycomb-theme.css";
import "./dashboard.css";

const stats = [
  { label: "Total Revenue", value: "$12,340", icon: "💰" },
  { label: "Active Users", value: "1,234", icon: "🟣" },
  { label: "Transactions", value: "567", icon: "🔄" },
  { label: "Growth", value: "8.2%", icon: "📈" },
  { label: "Conversion Rate", value: "4.5%", icon: "🔗" },
  { label: "New Signups", value: "89", icon: "🆕" },
];

export default function HoneycombDashboard() {
  return (
    <div className="dashboard-container honeycomb">
      <h1 className="dashboard-title">God View Dashboard</h1>
      <div className="honeycomb-grid">
        {stats.map((stat, idx) => (
          <div className="honeycomb-cell" key={idx}>
            <div className="honeycomb-icon">{stat.icon}</div>
            <div className="honeycomb-value">{stat.value}</div>
            <div className="honeycomb-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
