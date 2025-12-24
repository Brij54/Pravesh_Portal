import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../apis/backend";
import "./CreateDrive.css";
import CreateDrives from "./Resource/CreateDrives";
// import  from "./Resource/CreateDrive";
import ReadDrive from "./Resource/ReadDrive";
import Calendar from "./Calendar/Calendar";
export default function CreateDrive() {
  const navigate = useNavigate();

  return (
    <>
      <div
        id="id-7"
        className="d-flex flex-column border border-2 p-2  gap-2 mb-2"
      >
        <CreateDrives />
      </div>
      <div
        id="id-11"
        className="d-flex flex-column border border-2 p-2  gap-2 mb-2"
      >
        <ReadDrive />
      </div>
    </>
  );
}
