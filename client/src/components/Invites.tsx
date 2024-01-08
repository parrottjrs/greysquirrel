import React, { useState } from "react";

export const Invites = () => {
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    try {
      const response = await fetch("/api/invites");
      const json = await response.json();
      setCount(json.count ? json.count : 0);
    } catch (err) {
      console.error(err);
    }
  };
  return <div>Invites</div>;
};
