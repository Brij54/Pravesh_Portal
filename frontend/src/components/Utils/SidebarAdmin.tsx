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

type SidebarProps = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
};

export default function SidebarAdmin({ sidebarCollapsed, toggleSidebar }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: "Add Student", path: "/bulkUpload" },
    { text: "Batch Configuration", path: "/batch_config" },
    { text: "Approve Reject Certificate", path: "/approve_reject_certificate" },
    { text: "VALP Certificate Generate", path: "/valp/generate" },
    { text: "Dean Signature", path: "/DeanSignature" },
    { text: "Program Configuration", path: "/program_config" },
    { text: "Program Records", path: "/program_records" },
  ];

  const iconMap: Record<string, JSX.Element> = {
    "Add Student": <UserPlus size={24} color="#007bff" />,
    "Batch Configuration": <Layers size={24} color="#ff9800" />,
    "Approve Reject Certificate": <FileCheck size={24} color="#28a745" />,
    "VALP Certificate Generate": <Award size={24} color="#28a745" />,
    "Dean Signature": <PenLine size={24} color="#28a745" />,
    "Program Configuration": <Settings size={24} color="#007bff" />,
    "Program Records": <FolderOpen size={24} color="#007bff" />,
  };

  return (
    <>
      {/* Component-scoped CSS */}
      <style>{`
        :root {
          --sb-expanded: 260px;
          --sb-collapsed: 92px;
        }

        .yt-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: var(--sb-expanded);
          background: #fff;
          border-right: 1px solid #eee;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          transition: width 0.2s ease;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        }

        .yt-sidebar.collapsed {
          width: var(--sb-collapsed);
        }

        .yt-top {
          height: 70px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 14px;
        }

        .yt-menu-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: transparent;
          cursor: pointer;
          display: grid;
          place-items: center;
        }

        .yt-menu-btn:hover {
          background: #f2f2f2;
        }

        .yt-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
        }

        .yt-brand-logo {
          width: 34px;
          height: 34px;
          border-radius: 6px;
          object-fit: contain;
        }

        .yt-brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .yt-brand-title {
          font-weight: 750;
          font-size: 16px;
          color: #111;
        }

        .yt-brand-subtitle {
          font-size: 12px;
          color: #666;
        }

        .yt-institute {
          padding: 0 16px 12px 16px;
          font-size: 13px;
          line-height: 1.5;
          font-weight: 500;
          color: #444;
          border-bottom: 1px solid #eee;
        }

        .yt-nav {
          padding: 10px 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          overflow-y: auto;
        }

        .yt-item {
          width: 100%;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          border-radius: 12px;
          color: #111;
          font-size: 15px;
          text-align: left;
        }

        .yt-item:hover {
          background: #f6f6f6;
        }

        .yt-item.active {
          background: #f2f2f2;
          font-weight: 650;
        }

        .yt-icon {
          width: 28px;
          display: flex;
          justify-content: center;
        }

        .yt-text {
          white-space: nowrap;
        }

        /* collapsed mode */
        .yt-item.icon-only {
          flex-direction: column;
          gap: 6px;
          padding: 14px 6px;
          justify-content: center;
        }

        .yt-mini-text {
          font-size: 11px;
          color: #111;
          line-height: 1;
          text-align: center;
          max-width: 80px;
        }
      `}</style>

      <aside className={`yt-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        {/* Top */}
        <div className="yt-top">
          <button
            className="yt-menu-btn"
            onClick={toggleSidebar}
            type="button"
            aria-label="Toggle sidebar"
          >
            <Menu size={22} />
          </button>

          {!sidebarCollapsed && (
            <div className="yt-brand" onClick={() => navigate("/dashboard")} role="button">
              <img className="yt-brand-logo" src={iiitbLogo} alt="IIITB" />
              <div className="yt-brand-text">
                <div className="yt-brand-title">IIIT-B</div>
                <div className="yt-brand-subtitle">Admin Portal</div>
              </div>
            </div>
          )}
        </div>

        {/* Institute (only expanded) */}
        {!sidebarCollapsed && (
          <div className="yt-institute">
            International Institute of <br />
            Information Technology <br />
            Bangalore
          </div>
        )}

        {/* Nav */}
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
                <span className="yt-icon">{iconMap[item.text]}</span>

                {!sidebarCollapsed ? (
                  <span className="yt-text">{item.text}</span>
                ) : (
                  <span className="yt-mini-text">{item.text}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
