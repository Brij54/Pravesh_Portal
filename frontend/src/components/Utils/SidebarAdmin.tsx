import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  UserPlus,
  Layers,
  FileCheck,
  Award,
  PenLine,
  Settings,
  FolderOpen,
} from "lucide-react";
import iiitbLogo from "../../images/IIITB_logo1.png";
import "./SidebarAdmin.css";

type SidebarProps = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
};

const menuItems = [
  { text: "Dashboard", path: "/dashboard", icon: <UserPlus size={22} /> },
  { text: "Create Drives", path: "/createdrive", icon: <Layers size={22} /> },
  {
    text: "Create Rounds",
    path: "/createround",
    icon: <FileCheck size={22} />,
  },
];

export default function SidebarAdmin({
  sidebarCollapsed,
  toggleSidebar,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className={`yt-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
      {/* TOP ROW */}
      <div className="yt-top">
        <button
          className="yt-menu-btn"
          onClick={toggleSidebar}
          type="button"
          aria-label="Toggle sidebar"
        >
          <Menu size={22} />
        </button>

        {/* LOGO — ONLY WHEN EXPANDED */}
        {!sidebarCollapsed && (
          <img
            src={iiitbLogo}
            alt="IIITB"
            className="yt-logo-inline"
            onClick={() => navigate("/dashboard")}
          />
        )}
      </div>

      {/* COLLEGE NAME — ONLY WHEN EXPANDED */}
      {!sidebarCollapsed && (
        <div className="yt-institute">
          International Institute of <br />
          Information Technology <br />
          Bangalore
        </div>
      )}

      {/* NAV ITEMS */}
      <nav className="yt-nav">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <button
              key={item.text}
              className={`yt-item ${active ? "active" : ""} ${
                sidebarCollapsed ? "icon-only" : ""
              }`}
              onClick={() => navigate(item.path)}
              type="button"
            >
              <span className="yt-icon">{item.icon}</span>

              {!sidebarCollapsed && (
                <span className="yt-text">{item.text}</span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
