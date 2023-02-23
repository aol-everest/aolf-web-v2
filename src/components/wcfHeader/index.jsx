import React from "react";

export const WCFHeader = () => {
  return (
    <header className="wcf-header">
      <div className="container wcf-header__container">
        <a href="https://worldculturefest.org/" className="wcf-logo">
          <img
            src="/img/wcf-logo.png"
            alt="World Culture Festival 2023"
            className="wcf-logo__image"
          />
        </a>
      </div>
    </header>
  );
};
