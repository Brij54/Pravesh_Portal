import React from "react";
import {
  Github,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
} from "lucide-react";
import "./Home.css";
import { Outlet } from "react-router-dom";
import logo from "../images/iiit_logo.png";

const Home = () => {
  return (
    <div className="login-container">
      <div className="login-content">
        
        {/* LEFT SIDE – BRANDING */}
        <div className="branding-section">

          <div className="branding-content">
            {/* Logo */}
            <div className="logo-container">
              <img src={logo}
                alt="logo"
                className="logo"
                width="120"
                height="120"
              />
            </div>

            {/* Institute Name */}
            <div className="institution-info">
              <h1 className="institution-name">International Institute of</h1>
              <h1 className="institution-name">
                Information Technology Bangalore
              </h1>
            </div>

            {/* Portal Title */}
            <div className="portal-title">
              <h2>Pravesh PORTAL</h2>
            </div>
          </div>

          {/* Footer */}
          <div className="branding-footer">

            {/* Social Icons */}
            <div className="social-icons">
              <a href="#" className="social-icon"><Github size={20} /></a>
              <a href="#" className="social-icon"><Facebook size={20} /></a>
              <a href="#" className="social-icon"><Twitter size={20} /></a>
              <a href="#" className="social-icon"><Linkedin size={20} /></a>
              <a href="#" className="social-icon"><Youtube size={20} /></a>
            </div>

            {/* Copyright */}
            <div className="copyright">
              <p>© 2024 International Institute of Information Technology - Bangalore</p>
              <p className="support-text">Technical Support - application@iiitb.ac.in</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE – FORM SECTION */}
        <div className="form-section">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default Home;
