import React, { useState } from "react";
import classNames from "classnames";
import { priceCalculation } from "@utils";
import { useRouter } from "next/router";

export const RegisterPanel = ({ workshop }) => {
  const router = useRouter();
  const { title, sfid } = workshop;
  const { fee, delfee, offering } = priceCalculation({ workshop });

  const handleRegister = (e) => {
    e.preventDefault();
    router.push(`/checkout/${sfid}`);
  };

  return (
    <div className="powerful__block powerful__block_bottom">
      <div>
        <h6 className="powerful__block-caption_2">Limited Time Offer</h6>
        <h5 className="powerful__block-title_3">
          {title}: <span className="discount">${delfee}</span> ${fee}
        </h5>
      </div>
      <div className="bottom-box">
        <img src="/img/ic-timer-orange.svg" alt="timer" />
        <p>Register soon. Course fee will go up by $100 on MM/DD</p>
        <button className="btn-secondary" onClick={handleRegister}>
          Register Today
        </button>
      </div>
    </div>
  );
};
