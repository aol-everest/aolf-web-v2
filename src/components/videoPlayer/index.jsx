import React from "react";
import { useGlobalVideoPlayerContext } from "@contexts";
import "node_modules/video-react/dist/video-react.css";
import {
  Player,
  ControlBar,
  ReplayControl,
  ForwardControl,
  CurrentTimeDisplay,
  TimeDivider,
  PlaybackRateMenuButton,
  VolumeMenuButton,
  LoadingSpinner,
  BigPlayButton,
} from "video-react";

const VideoPlayer = () => {
  const { hideVideoPlayer, store } = useGlobalVideoPlayerContext();

  const { playerProps } = store || {};
  const { track } = playerProps || {};

  // Destructure for conciseness
  const { title, artist, image = "/img/card-1a.png", audioSrc } = track || {};

  const handleModalToggle = () => {
    hideVideoPlayer();
  };

  return (
    <div className="profile-modal active show" style={{ zIndex: 999 }}>
      <div className="digital-member-join_journey show course-join-card video-player-modal">
        <div className="close-modal new-btn-modal" onClick={handleModalToggle}>
          <div className="close-line"></div>
          <div className="close-line"></div>
        </div>
        <div
          className="course-details-card__body"
          style={{ paddingBottom: 0, paddingTop: "5px", textAlign: "center" }}
        >
          <h3
            className="course-join-card__title section-title"
            style={{ marginBottom: 0 }}
          >
            {title}
          </h3>
          <span>{artist}</span>
        </div>
        <div className="video-player">
          <Player>
            <source src={audioSrc} />

            <BigPlayButton position="center" />
            <LoadingSpinner />
            <ControlBar>
              <ReplayControl seconds={10} order={1.1} />
              <ForwardControl seconds={30} order={1.2} />
              <CurrentTimeDisplay order={4.1} />
              <TimeDivider order={4.2} />
              <PlaybackRateMenuButton rates={[5, 2, 1, 0.5, 0.1]} order={7.1} />

              <VolumeMenuButton vertical />
            </ControlBar>
          </Player>
        </div>
        <div
          className="close-modal d-md-flex d-none"
          onClick={handleModalToggle}
        >
          <div className="close-line"></div>
          <div className="close-line"></div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
