import React from "react";
import { useGlobalModalContext } from "@contexts";

export default function SchedulingModal() {
  const { hideModal, store } = useGlobalModalContext();
  const { modalProps } = store || {};
  const {
    closeModalAction,
    title,
    children,
    className,
    footer = () => {},
  } = modalProps || {};

  return (
    <div
      id="widget-modal"
      class="overlaying-popup overlaying-popup_active"
      role="dialog"
    >
      <div class="overlaying-popup__overlay" role="button" tabindex="0"></div>

      <div class="scheduling-modal">
        <div
          role="button"
          aria-label="Close modal"
          class="scheduling-modal__btn-close"
        >
          <img src="img/ic-close-talk.svg" alt="close icon" />
        </div>
        {children}
      </div>
    </div>
  );
}
