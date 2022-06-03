import React from "react";
import { orgConfig } from "@org";

export const NoHeader = () => {
  return (
    <header className="header tw-bg-white tw-relative tw-z-10">
      <div className="header__container !tw-justify-center">
        <div className="logo">
          <img src={`/img/${orgConfig.logo}`} alt="logo" />
        </div>
      </div>
    </header>
  );
};
