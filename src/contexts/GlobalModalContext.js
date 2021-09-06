import { createContext, useContext } from "react";
const initalState = {
  showModal: () => {},
  hideModal: () => {},
  store: {},
};
export const GlobalModalContext = createContext(initalState);
export const useGlobalModalContext = () => useContext(GlobalModalContext);
