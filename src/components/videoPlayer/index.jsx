import React, { useState, useRef } from "react";
import { useGlobalVideoPlayerContext } from "@contexts";
import classNames from "classnames";
import HTMLEllipsis from "react-lines-ellipsis/lib/html";
import * as RemoveMarkdown from "remove-markdown";
import ReactHtmlParser from "react-html-parser";
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
  PlayToggle,
  FullscreenToggle,
} from "video-react";

const VideoPlayer = () => {
  const { hideVideoPlayer, store } = useGlobalVideoPlayerContext();
  const playerEl = useRef(null);
  const [showFull, setShowFull] = useState(false);

  const { playerProps } = store || {};
  const { track, playAction } = playerProps || {};
  const [isPlaying, setIsPlaying] = useState(false);
  const [isActivityLogged, setIsActivityLogged] = useState(false);

  const readMoreAction = () => {
    setShowFull(true);
  };

  const handleReflow = (rleState) => {
    const { clamped } = rleState;
    if (!clamped) {
      setShowFull(true);
    }
  };

  // Destructure for conciseness
  const {
    title,
    artist,
    image = "http://html5videoformatconverter.com/data/images/screen.jpg",
    audioSrc,
    description = "",
  } = track || {};
  const desc = description ? RemoveMarkdown(description) : "";

  const handleModalToggle = () => {
    hideVideoPlayer();
  };

  const onPlayPauseAction = () => {
    const { player } = playerEl.current.getState();
    setIsPlaying(!player.paused);
    if (playAction && !player.paused && !isActivityLogged) {
      setIsActivityLogged(true);
      playAction();
    }
  };

  const togglePlay = () => {
    const { player } = playerEl.current.getState();
    if (player.paused) {
      playerEl.current.play();
    } else {
      playerEl.current.pause();
    }
  };

  const toggleFullscreen = () => {
    const { player } = playerEl.current.getState();
    if (player.isFullscreen) {
      playerEl.current.toggleFullscreen();
    } else {
      playerEl.current.toggleFullscreen();
    }
  };

  return (
    <div className="modal modal_video fade show" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="mobile-wrapper">
            <div className="modal-header">
              <button type="button" name="button" className="video-shrink">
                <img src="/img/ic-shrink2.svg" alt="shrink" />
              </button>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                onClick={handleModalToggle}
              >
                <span aria-hidden="true">×</span>
              </button>
              <img
                src="/img/ic-play-40.svg"
                alt=""
                className="video-full-play play"
              />
            </div>
            <div className="modal-body">
              <div className="video-player">
                <div className="video-container">
                  <Player
                    ref={playerEl}
                    poster={image}
                    onPlay={onPlayPauseAction}
                    onPause={onPlayPauseAction}
                  >
                    <source src={audioSrc} />
                    <BigPlayButton position="center" className="d-none" />
                    <LoadingSpinner />
                    <ControlBar>
                      <PlayToggle className="d-none" />
                      <ReplayControl seconds={10} order={1.1} />
                      <ForwardControl seconds={30} order={1.2} />
                      <CurrentTimeDisplay order={4.1} />
                      <TimeDivider order={4.2} />
                      <PlaybackRateMenuButton
                        rates={[5, 2, 1, 0.5, 0.1]}
                        order={7.1}
                      />
                      <VolumeMenuButton vertical />
                      <FullscreenToggle />
                    </ControlBar>
                  </Player>
                </div>
                <div className="video-details">
                  <img
                    src={
                      isPlaying ? "/img/ic-pause-40.svg" : "/img/ic-play-40.svg"
                    }
                    alt=""
                    className={classNames("video-play", {
                      play: !isPlaying,
                      pause: isPlaying,
                    })}
                    onClick={togglePlay}
                  />
                  <img
                    src="/img/ic-expand2.svg"
                    alt=""
                    className="video-expand"
                    onClick={toggleFullscreen}
                  />
                  <span>{artist}</span>
                  <p className="video-title">{title}</p>
                  {!showFull && (
                    <>
                      <p className="card-text">
                        <HTMLEllipsis
                          unsafeHTML={desc}
                          onReflow={handleReflow}
                          maxLine="2"
                          ellipsis="..."
                          basedOn="letters"
                        />
                      </p>
                      <p className="read-more" onClick={readMoreAction}>
                        Read More
                      </p>
                    </>
                  )}
                  {showFull && (
                    <p className="card-text">{ReactHtmlParser(desc)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
