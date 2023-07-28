import VideoPlayer from "@components/videoPlayer";
import { GlobalVideoPlayerContext } from "@contexts";
import { useState } from "react";

export const GlobalVideoPlayer = ({ children }) => {
  const [store, setStore] = useState();
  const { show, playerProps } = store || {};

  const showVideoPlayer = (playerProps) => {
    setStore({
      ...store,
      show: true,
      playerProps,
    });
  };

  const hideVideoPlayer = () => {
    setStore({
      ...store,
      show: false,
      playerProps: {},
    });
  };

  const renderComponent = () => {
    if (!show) {
      return null;
    }
    return <VideoPlayer id="global-video-player" {...playerProps} />;
  };

  return (
    <GlobalVideoPlayerContext.Provider
      value={{ store, showVideoPlayer, hideVideoPlayer }}
    >
      {children}
      {renderComponent()}
    </GlobalVideoPlayerContext.Provider>
  );
};
