import { createContext, useContext } from 'react';
const initalState = {
  showBanner: () => {},
  hideBanner: () => {},
  store: {},
};
export const GlobalBannerContext = createContext(initalState);
export const useGlobalBannerContext = () => useContext(GlobalBannerContext);
