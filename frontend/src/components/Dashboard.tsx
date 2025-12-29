import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import SidebarAdmin from "./Utils/SidebarAdmin";
import "./Dashboard.css";
import { logout } from "../apis/backend";

export default function Dashboard() {
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    const ok = await logout();
    if (ok) navigate("/");
  };

  return (
    <div className="dash-layout">
      <SidebarAdmin
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={() => setSidebarCollapsed((p) => !p)}
      />

      <div
        className={`dash-wrapper ${
          sidebarCollapsed ? "dash-wrapper-collapsed" : ""
        }`}
      >
        <header className="dash-header">
          <h1 className="dash-page-title">Dashboard</h1>

          <div className="dash-user-profile">
            <div
              className="dash-profile-circle"
              onClick={() => setShowDropdown((p) => !p)}
            >
              <span>A</span>
            </div>

            {showDropdown && (
              <div className="dash-profile-dropdown">
                <button onClick={handleLogout} type="button">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="dash-content-body">
          <div className="dash-action-cards">
            <button
              className="dash-action-card primary"
              onClick={() => navigate("/createdrive")}
              type="button"
            >
              Admission Drives
            </button>

            <button
              className="dash-action-card success"
              onClick={() => navigate("/shortlist")}
              type="button"
            >
              Shortlist
            </button>

            <button
              className="dash-action-card info"
              onClick={() => navigate("/analytics")}
              type="button"
            >
              Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
