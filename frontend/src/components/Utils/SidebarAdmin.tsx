// src/components/Utils/Sidebar.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Home, ClipboardCheck, FileBadge2, Award, Layers, FileCheck, PenLine, Settings, FolderOpen } from "lucide-react";

// CSS is global; you can import here OR rely on CreateStudent importing Upload.css
// import "../Upload.css";

type SidebarProps = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  activeSection: "dashboard" | "settings";
};

export default function Sidebar({
  sidebarCollapsed,
  toggleSidebar,
  activeSection,
}: SidebarProps) {
  const navigate = useNavigate();

  const menuItems = [
  { text: "dashboard", path: "/dashboard" },
  { text: "Create Drives", path: "/createdrive" },
  { text: "Create Rounds", path: "/createround" },

];

const iconMap: Record<string, JSX.Element> = {
  "dashboard": <UserPlus size={24} color="#007bff" />,               // Blue
  "Create Drives": <Layers size={24} color="#ff9800" />,        // Orange
  "Create Rounds": <FileCheck size={24} color="#28a745" />, // Green
};

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        className={`menuToggleBtn ${
          sidebarCollapsed ? "sidebarCollapsed" : ""
        }`}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <div className="hamburgerIcon">
          <span className="hamburgerLine" />
          <span className="hamburgerLine" />
          <span className="hamburgerLine" />
        </div>
      </button>

      {/* Sidebar Container */}
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        {/* Logo Section */}
        <div className="logoSection">
          <div
            className="logoCircle d-flex justify-content-center align-items-center shadow-sm mx-auto"
            style={{
              width: "95px", // larger circle
              height: "95px",
              borderRadius: "50%",
              backgroundColor: "#fff",
              border: "2px solid #ddd",
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "10px", // 🟢 adds inner breathing space to prevent edge cutting
            }}
          >
            <img
              src="/images/IIITB_logo1.png"
              alt="IIITB Logo"
              style={{
                width: "90%",
                height: "90%",
                objectFit: "contain", // 🟢 shows full image, no cropping
                objectPosition: "center", // 🟢 ensures it stays centered horizontally
              }}
            />
          </div>
          <div
            className="instituteName text-center"
            style={{
              fontFamily: "'Merriweather', serif",
              fontWeight: 600,
              fontSize: "1.3rem",
              color: "#161e27ff",
              lineHeight: "1.4",
              letterSpacing: "0.5px",
              whiteSpace: "pre-line", // 👈 this ensures line breaks are respected
              maxWidth: "100%", // prevent tight wrapping
            }}
          >
            {`International Institute of
Information Technology
Bangalore`}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="navMenu">
          {menuItems.map((item) => (
            <button
              key={item.text}
              className="navItem"
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "12px 14px",
                marginBottom: "12px", // ← margin added here
                borderRadius: "8px",
                width: "100%",
              }}
            >
              <span className="navIcon">{iconMap[item.text]}</span>

              <span
                className="navText"
                style={{
                  fontSize: "17px",
                  fontWeight: 600,
                }}
              >
                {item.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
