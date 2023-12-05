import React from "react";
import { useNavigate } from "react-router-dom";
export default function NotFound() {
  const navigate = useNavigate();
  const handlClick = () => {
    navigate("/");
  };
  return (
    <div>
      <h1>404 Not Found</h1>
      <p>Whoops! Looks like you're in the wrong place!</p>
      <button>Return Home</button>
    </div>
  );
}
