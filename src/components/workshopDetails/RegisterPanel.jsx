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
    <div class="powerful__block powerful__block_bottom">
      <div>
        <h6 class="powerful__block-caption_2">Limited Time Offer</h6>
        <h5 class="powerful__block-title_3">
          {title}: <span class="discount">${delfee}</span> ${fee}
        </h5>
      </div>
      <div class="bottom-box">
        <img src="/img/ic-timer-orange.svg" alt="timer" />
        <p>Register soon. Course fee will go up by $100 on MM/DD</p>
        <button class="btn-secondary" onClick={handleRegister}>
          Register Today
        </button>
      </div>
    </div>
  );
};
