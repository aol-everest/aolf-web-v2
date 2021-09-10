import React, { useState } from "react";
import classNames from "classnames";

export const ViewCardDetail = ({
  isMobile,
  profile = {},
  switchCardDetailView,
}) => {
  const { cardLast4Digit } = profile;
  return (
    <form className="profile-update__form">
      <div className="profile-update__form-header d-flex justify-content-between align-items-center">
        <h6 className="profile-update__title m-0">Card Details:</h6>
        <div className="profile-update__images-container">
          <img src="/img/ic-visa.svg" alt="visa" />
          <img src="/img/ic-mc.svg" alt="mc" />
          <img src="/img/ic-ae.svg" alt="ae" />
        </div>
      </div>
      <div className="profile-update__card">
        <div className="input-block mt-0 w-100">
          <input
            className="mt-0 w-100"
            type="text"
            placeholder="Card Number"
            value={`**** **** **** ${cardLast4Digit || "****"}`}
            readOnly
          />
        </div>
        <div className="input-block">
          <input
            type="text"
            placeholder="MM/YY"
            value="**/**"
            readOnly
            className={classNames({
              "w-100": isMobile,
            })}
          />
        </div>
        <div className="input-block">
          <input
            type="text"
            placeholder="CVC"
            value="****"
            readOnly
            className={classNames({
              "w-100": isMobile,
            })}
          />
        </div>
      </div>
      <button
        className="btn-primary d-block ml-auto mt-4 v2"
        onClick={switchCardDetailView}
      >
        Change Card
      </button>
    </form>
  );
};
