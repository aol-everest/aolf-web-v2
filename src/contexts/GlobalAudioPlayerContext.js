import { createContext, useContext } from "react";
const initalState = {
  showPlayer: () => {},
  hidePlayer: () => {},
  store: {},
};
export const GlobalAudioPlayerContext = createContext(initalState);
export const useGlobalAudioPlayerContext = () =>
  useContext(GlobalAudioPlayerContext);
