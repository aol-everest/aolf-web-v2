import { createContext, useContext } from 'react';
const initalState = {
  showVideoPlayer: () => {},
  hideVideoPlayer: () => {},
  store: {},
};
export const GlobalVideoPlayerContext = createContext(initalState);
export const useGlobalVideoPlayerContext = () =>
  useContext(GlobalVideoPlayerContext);
