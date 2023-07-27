import AudioPlayer from "@components/audioPlayer";
import { GlobalAudioPlayerContext } from "@contexts";
import { useState } from "react";

export const GlobalAudioPlayer = ({ children }) => {
  const [store, setStore] = useState();
  const { show, playerProps } = store || {};

  const showPlayer = (playerProps) => {
    setStore({
      ...store,
      show: true,
      playerProps,
    });
  };

  const hidePlayer = () => {
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
    return <AudioPlayer id="global-player" {...playerProps} />;
  };

  return (
    <GlobalAudioPlayerContext.Provider
      value={{ store, showPlayer, hidePlayer }}
    >
      {children}
      {renderComponent()}
    </GlobalAudioPlayerContext.Provider>
  );
};
