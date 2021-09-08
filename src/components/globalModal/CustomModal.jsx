import React from "react";
import { useGlobalModalContext } from "@contexts";
import classNames from "classnames";

export const CustomModal = () => {
  const { hideModal, store } = useGlobalModalContext();
  const { modalProps } = store || {};
  const {
    closeModalAction,
    title,
    children,
    className,
    footer = () => {},
  } = modalProps || {};

  const handleModalToggle = () => {
    hideModal();
    if (closeModalAction) {
      closeModalAction();
    }
  };
  return (
    <div class="profile-modal active show" style={{ zIndex: 99 }}>
      <div class={classNames(`digital-member-join_journey show`, className)}>
        <div class="close-modal new-btn-modal" onClick={handleModalToggle}>
          <div class="close-line"></div>
          <div class="close-line"></div>
        </div>
        <div class="course-details-card__body">
          <h3 class="course-join-card__title section-title">{title}</h3>
          {children}
        </div>
        {footer()}

        <div class="close-modal d-md-flex d-none" onClick={handleModalToggle}>
          <div class="close-line"></div>
          <div class="close-line"></div>
        </div>
      </div>
    </div>
  );
};
