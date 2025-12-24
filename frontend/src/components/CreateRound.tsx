import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../apis/backend";
import "./CreateRound.css";

import CreateRounds from "./Resource/CreateRounds";
import Calendar from "./Calendar/Calendar";
import ReadRounds from "./Resource/ReadRounds";

export default function CreateRound() {
  const navigate = useNavigate();

  return (
    <>
      <div
        id="id-1V"
        className="d-flex flex-column border border-2 p-2  gap-2 mb-2"
      >
        <CreateRounds />
      </div>
      <div
        id="id-2V"
        className="d-flex flex-column border border-2 p-2  gap-2 mb-2"
      >
        <ReadRounds />
      </div>
    </>
  );
}
