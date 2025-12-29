import React from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  Layers,
  Award,
  PenLine,
  Settings,
  FolderOpen,
} from "lucide-react";

import iiitbLogo from "../../images/IIITB_logo1.png";
import "./SidebarAdmin.css";

type SidebarProps = {
  sidebarCollapsed: boolean;
  toggleSidebar?: () => void; // ✅ optional
};

export default function SidebarAdmin({
  sidebarCollapsed,
  toggleSidebar,
}: SidebarProps) {
  const navigate = useNavigate();

  const menuItems = [
    { text: "Add Student", path: "/bulkUpload", icon: <UserPlus /> },
    { text: "Batch Configuration", path: "/batch_config", icon: <Layers /> },
    { text: "VALP Certificate Generate", path: "/valp/generate", icon: <Award /> },
    { text: "Dean Signature", path: "/DeanSignature", icon: <PenLine /> },
    { text: "Program Configuration", path: "/program_config", icon: <Settings /> },
    { text: "Program Records", path: "/program_records", icon: <FolderOpen /> },
  ];

  return (
    <>
      {/* Toggle (only if provided) */}
      {toggleSidebar && (
        <button
          className={`ps-toggle ${sidebarCollapsed ? "ps-collapsed" : ""}`}
          onClick={toggleSidebar}
        >
          <div className="ps-hamburger">
            <span className="ps-hamburger-line" />
            <span className="ps-hamburger-line" />
            <span className="ps-hamburger-line" />
          </div>
        </button>
      )}

      <aside className={`ps-sidebar ${sidebarCollapsed ? "ps-collapsed" : ""}`}>
        <div className="ps-logo">
          <div className="ps-logo-circle">
            <img src={iiitbLogo} alt="IIITB Logo" />
          </div>

          <div className="ps-institute">
            International Institute of <br />
            Information Technology <br />
            Bangalore
          </div>
        </div>

        <nav className="ps-nav">
          {menuItems.map((item) => (
            <button
              key={item.text}
              className="ps-nav-item"
              onClick={() => navigate(item.path)}
            >
              <span className="ps-nav-icon">{item.icon}</span>
              <span className="ps-nav-text">{item.text}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
