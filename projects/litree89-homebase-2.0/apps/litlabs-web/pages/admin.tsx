import React from "react";

export default function AdminDashboard() {
  return (
    <div style={{ padding: 32 }}>
      <h1>Admin Dashboard</h1>
      <ul>
        <li>Manage Users</li>
        <li>Content Moderation</li>
        <li>Automation & Bots</li>
        <li>Deployment Status</li>
        <li>Notifications & Logs</li>
      </ul>
      <p>Extend this dashboard for full control over your platform.</p>
    </div>
  );
}
