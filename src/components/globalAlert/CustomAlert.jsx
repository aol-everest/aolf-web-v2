import React from "react";
import { useGlobalAlertContext } from "@contexts";
import classNames from "classnames";
import Style from "./GlobalAlert.module.scss";

export const CustomAlert = () => {
  const { hideAlert, store } = useGlobalAlertContext();
  const { alertProps } = store || {};
  const {
    closeModalAction,
    confirmBtnText = "Close",
    title,
    children,
    className,
    hideConfirm = false,
  } = alertProps || {};

  const handleAlertToggle = () => {
    hideAlert();
    if (closeModalAction) {
      closeModalAction();
    }
  };
  return (
    <div className="alert__modal modal-window modal-window_no-log active show">
      <div
        id="retreat-prerequisite"
        className={classNames(
          `digital-member-join digital-member-join_journey course-join-card retreat-prerequisite active show`,
          className,
        )}
      >
        <div className="close-modal d-lg-none" onClick={handleAlertToggle}>
          <div className="close-line"></div>
          <div className="close-line"></div>
        </div>
        <div className="course-join-card__body alert__body">
          <h2
            className={classNames(
              "course-join-card__title section-title",
              Style.title,
            )}
          >
            {title}
          </h2>
          <div className="course-join-card__text-container">{children}</div>
        </div>
        {!hideConfirm && (
          <div className={classNames("course-join-card__footer", Style.footer)}>
            <button className="btn-secondary" onClick={handleAlertToggle}>
              {confirmBtnText}
            </button>
          </div>
        )}
        <div
          className="close-modal d-none d-lg-flex"
          onClick={handleAlertToggle}
        >
          <div className="close-line"></div>
          <div className="close-line"></div>
        </div>
      </div>
    </div>
  );
};
