import React from "react";
import Navbar from "../components/Navbar";

export default function NotFound() {
  return (
    <div>
      <Navbar />
      <h1>404 Not Found</h1>
      <p>Whoops! Looks like you're in the wrong place!</p>
      <button>
        <a href="#/">Return to Signin</a>
      </button>
    </div>
  );
}
