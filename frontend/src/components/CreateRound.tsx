import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import SidebarAdmin from "./Utils/SidebarAdmin";
import { logout } from "../apis/backend";

import "./Dashboard.css";
import "./CreateRound.css";

import CreateRounds from "./Resource/CreateRounds";
import ReadRounds from "./Resource/ReadRounds";

export default function CreateRound() {
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    const ok = await logout();
    if (ok) navigate("/");
  };

  return (
    <div className="dash-layout">
      {/* SIDEBAR */}
      <SidebarAdmin
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={() => setSidebarCollapsed((p) => !p)}
      />

      {/* MAIN CONTENT */}
      <div
        className={`dash-wrapper ${
          sidebarCollapsed ? "dash-wrapper-collapsed" : ""
        }`}
      >
        {/* NAVBAR / HEADER */}
        <header className="dash-header">
          <h1 className="dash-page-title">Create Rounds</h1>

          {/* PROFILE */}
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

        {/* PAGE BODY */}
        <div className="dash-content-body">
          <div className="d-flex flex-column border border-2 p-2 gap-2 mb-3">
            <CreateRounds />
          </div>

          <div className="d-flex flex-column border border-2 p-2 gap-2">
            <ReadRounds />
          </div>
        </div>
      </div>
    </div>
  );
}
