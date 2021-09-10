import React, { useState } from "react";
import { SuccessAlert } from "./SuccessAlert";
import { CustomAlert } from "./CustomAlert";
import { ErrorAlert } from "./ErrorAlert";
import { ALERT_TYPES } from "@constants";
import { GlobalAlertContext } from "@contexts";

const ALERT_COMPONENTS = {
  [ALERT_TYPES.SUCCESS_ALERT]: SuccessAlert,
  [ALERT_TYPES.CUSTOM_ALERT]: CustomAlert,
  [ALERT_TYPES.ERROR_ALERT]: ErrorAlert,
};

export const GlobalAlert = ({ children }) => {
  const [store, setStore] = useState();
  const { alertType, alertProps } = store || {};

  const showAlert = (alertType, alertProps) => {
    setStore({
      ...store,
      alertType,
      alertProps,
    });
  };

  const hideAlert = () => {
    setStore({
      ...store,
      alertType: null,
      alertProps: {},
    });
  };

  const renderComponent = () => {
    const AlertComponent = ALERT_COMPONENTS[alertType];
    if (!alertType || !AlertComponent) {
      return null;
    }
    return <AlertComponent id="global-modal" {...alertProps} />;
  };

  return (
    <GlobalAlertContext.Provider value={{ store, showAlert, hideAlert }}>
      {renderComponent()}
      {children}
    </GlobalAlertContext.Provider>
  );
};
