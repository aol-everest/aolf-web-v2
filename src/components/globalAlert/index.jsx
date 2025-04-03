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

// Global reference to showAlert function
let globalShowAlert = null;

export const showGlobalAlert = (
  message,
  description,
  type = ALERT_TYPES.ERROR_ALERT,
) => {
  if (globalShowAlert) {
    globalShowAlert(type, { message, description });
  }
};

export const GlobalAlert = ({ children }) => {
  const [store, setStore] = useState();
  const { alertType, alertProps } = store || {};

  const showAlert = (alertType, props, autoHideMS) => {
    // Convert string children to message format
    const alertProps = {
      ...props,
      message:
        typeof props.children === 'string' ? props.children : props.message,
      description: props.description,
      children: typeof props.children === 'string' ? undefined : props.children,
    };

    document.body.classList.add('overflow-hidden');
    setStore({
      ...store,
      alertType,
      alertProps,
      autoHideMS,
    });
    if (autoHideMS) {
      setTimeout(() => {
        hideAlert();
      }, autoHideMS);
    }
  };

  // Store reference to showAlert function
  useEffect(() => {
    globalShowAlert = showAlert;
    return () => {
      globalShowAlert = null;
    };
  }, []);

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
