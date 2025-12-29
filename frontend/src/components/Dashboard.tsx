import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import SidebarAdmin from "./Utils/SidebarAdmin";
import "./Dashboard.css";
import { logout } from "../apis/backend";

export default function Dashboard() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    const ok = await logout();
    if (ok) navigate("/");
  };

  return (
    <div className="dash-layout">
      {/* Sidebar (always visible) */}
      <SidebarAdmin sidebarCollapsed={false} />

      {/* Main */}
      <div className="dash-wrapper">
        {/* Header */}
        <header className="dash-header">
          <h1 className="dash-page-title">Dashboard</h1>

          {/* Profile */}
          <div className="dash-user-profile">
            <div
              className="dash-profile-circle"
              onClick={() => setShowDropdown((p) => !p)}
            >
              <span>A</span>
            </div>

            {showDropdown && (
              <div className="dash-profile-dropdown">
                <button onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="dash-content-body">
          <div className="dash-action-cards">
            <button
              className="dash-action-card primary"
              onClick={() => navigate("/admission-drives")}
            >
              Admission Drives
            </button>

            <button
              className="dash-action-card success"
              onClick={() => navigate("/shortlist")}
            >
              Shortlist
            </button>

            <button
              className="dash-action-card info"
              onClick={() => navigate("/analytics")}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
