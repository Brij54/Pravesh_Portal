import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import SidebarAdmin from "./Utils/SidebarAdmin";
import CreateDrives from "./Resource/CreateDrives";
import ReadDrive from "./Resource/ReadDrive";

import "./Dashboard.css";
import "./CreateDrive.css";
import { logout } from "../apis/backend";

export default function CreateDrive() {
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    const ok = await logout();
    if (ok) navigate("/");
  };

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <SidebarAdmin
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={() => setSidebarCollapsed((p) => !p)}
      />

      {/* Main Wrapper */}
      <div
        className={`dash-wrapper ${
          sidebarCollapsed ? "dash-wrapper-collapsed" : ""
        }`}
      >
        {/* Header */}
        <header className="dash-header">
          <h1 className="dash-page-title">Create Drive</h1>

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

        {/* Page Content */}
        <div className="dash-content-body">
          <div
            id="id-7"
            className="d-flex flex-column border border-2 p-3 gap-2 mb-3"
          >
            <CreateDrives />
          </div>

          <div
            id="id-11"
            className="d-flex flex-column border border-2 p-3 gap-2"
          >
            <ReadDrive />
          </div>
        </div>
      </div>
    </div>
  );
}
