import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../apis/backend";
import "./Dashboard.css";
export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <>
      <button className="btn btn-success" id="id-1">
        Admission Drives
      </button>
      <button className="btn btn-success" id="id-3">
        Shortlist
      </button>
      <button className="btn btn-success" id="id-5">
        Analytics
      </button>
    </>
  );
}
