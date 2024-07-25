import { ALERT_TYPES } from '@constants';
import { GlobalAlertContext } from '@contexts';
import { useState, useEffect } from 'react';
import { CustomAlert } from './CustomAlert';
import { ErrorAlert } from './ErrorAlert';
import { SuccessAlert } from './SuccessAlert';
import { WarningAlert } from './WarningAlert';
import { NewAlert } from './NewAlert';

const ALERT_COMPONENTS = {
  [ALERT_TYPES.SUCCESS_ALERT]: SuccessAlert,
  [ALERT_TYPES.CUSTOM_ALERT]: CustomAlert,
  [ALERT_TYPES.ERROR_ALERT]: ErrorAlert,
  [ALERT_TYPES.WARNING_ALERT]: WarningAlert,
  [ALERT_TYPES.NEW_ALERT]: NewAlert,
};

export const GlobalAlert = ({ children }) => {
  const [store, setStore] = useState();
  const { alertType, alertProps } = store || {};

  const showAlert = (alertType, alertProps, autoHideMS) => {
    document.body.classList.add('overflow-hidden');
    setStore({
      ...store,
      alertType,
      alertProps,
    });
    if (autoHideMS) {
      setTimeout(() => {
        hideAlert();
      }, autoHideMS);
    }
  };

  const hideAlert = () => {
    document.body.classList.remove('overflow-hidden');
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
