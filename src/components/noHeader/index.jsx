import React from "react";
export const NoHeader = () => {
  return (
    <header
      style={{ backgroundColor: "#ffffff", position: "relative", zIndex: 9 }}
    >
      <div className="logo">
        <img src="/img/ic-logo.svg" alt="logo" />
      </div>
    </header>
  );
};
