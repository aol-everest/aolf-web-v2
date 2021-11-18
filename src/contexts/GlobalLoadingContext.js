import { createContext, useContext } from "react";
const initalState = {
  showLoader: () => {},
  hideLoader: () => {},
};
export const GlobalLoadingContext = createContext(initalState);
export const useGlobalLoadingContext = () => useContext(GlobalLoadingContext);
