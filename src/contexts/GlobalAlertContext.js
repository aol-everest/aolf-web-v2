import { createContext, useContext } from 'react';
const initalState = {
  showAlert: () => {},
  hideAlert: () => {},
  store: {},
};
export const GlobalAlertContext = createContext(initalState);
export const useGlobalAlertContext = () => useContext(GlobalAlertContext);
