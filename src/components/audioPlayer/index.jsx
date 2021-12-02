/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect, useRef } from "react";
import { useGlobalAudioPlayerContext } from "@contexts";
// import AudioControls from "./AudioControls";
// import Backdrop from "./Backdrop";
// import "./styles.css";

/*
 * Read the blog post here:
 * https://letsbuildui.dev/articles/building-an-audio-player-with-react-hooks
 */

import { isSSR } from "@utils";
import classNames from "classnames";

const AudioPlayer = () => {
  // State

  const [trackProgress, setTrackProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [isFullPlayer, setIsFullPlayer] = useState(false);

  const { hidePlayer, store } = useGlobalAudioPlayerContext();

  const { playerProps } = store || {};
  const { track } = playerProps || {};

  // Destructure for conciseness
  const { title, artist, color, image, audioSrc } = track || {};

  if (isSSR) {
    return null;
  }
  const isTouch = "ontouchstart" in window;
  // Refs
  const audioRef = useRef(new Audio(audioSrc));
  const intervalRef = useRef();
  const isReady = useRef(false);
  const barRef = useRef();

  // Destructure for conciseness
  const { duration } = audioRef.current;

  const currentPercentage = duration
    ? `${(trackProgress / duration) * 100}%`
    : "0%";

  const secondsToTime = (secs) => {
    if (!secs) {
      return "00:00";
    }
    var hours = Math.floor(secs / 3600),
      minutes = Math.floor((secs % 3600) / 60),
      seconds = Math.ceil((secs % 3600) % 60);
    return (
      (hours == 0
        ? ""
        : hours > 0 && hours.toString().length < 2
        ? "0" + hours + ":"
        : hours + ":") +
      (minutes.toString().length < 2 ? "0" + minutes : minutes) +
      ":" +
      (seconds.toString().length < 2 ? "0" + seconds : seconds)
    );
  };

  const onPlayPauseClick = () => {
    setIsPlaying((isPlaying) => !isPlaying);
  };

  const toggelPlayer = () => {
    setIsFullPlayer((isFullPlayer) => !isFullPlayer);
  };

  const startTimer = () => {
    // Clear any timers already running
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (audioRef.current.ended) {
        //toNextTrack();
      } else {
        setTrackProgress(audioRef.current.currentTime);
      }
    }, [1000]);
  };

  const onScrub = (value) => {
    // Clear any timers already running
    clearInterval(intervalRef.current);
    audioRef.current.currentTime = value;
    setTrackProgress(audioRef.current.currentTime);
  };

  const onScrubEnd = () => {
    // If not already playing, start
    if (!isPlaying) {
      setIsPlaying(true);
    }
    startTimer();
  };

  const trackerMousedown = (event) => {
    const theRealEvent = isTouch ? event.touches[0] : event;
    const currentTime = Math.round(
      (duration * (theRealEvent.pageX - barRef.current.offsetLeft)) /
        barRef.current.offsetWidth,
    );
    if (currentTime) {
      audioRef.current.currentTime = currentTime;
      setTrackProgress(audioRef.current.currentTime);
    }
    setDragging(true);
  };

  const trackerMouseup = (event) => {
    setDragging(false);
  };

  const trackerMousemove = (event) => {
    const theRealEvent = isTouch ? event.touches[0] : event;
    if (dragging) {
      const currentTime = Math.round(
        (duration * (theRealEvent.pageX - barRef.current.offsetLeft)) /
          barRef.current.offsetWidth,
      );
      if (currentTime) {
        audioRef.current.currentTime = currentTime;
        setTrackProgress(audioRef.current.currentTime);
      }
    }
  };

  // const adjustCurrentTime = (e) => {
  //   const theRealEvent = isTouch ? e.originalEvent.touches[0] : e;
  //   const currentTime = Math.round(
  //     (duration * (theRealEvent.pageX - barRef.current.offsetLeft)) /
  //       barRef.current.width,
  //   );
  //   console.log("oo", currentTime);
  // };

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play();
      startTimer();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handles cleanup and setup when changing tracks
  useEffect(() => {
    audioRef.current.pause();

    audioRef.current = new Audio(audioSrc);
    setTrackProgress(audioRef.current.currentTime);

    if (isReady.current) {
      audioRef.current.play();
      setIsPlaying(true);
      startTimer();
    } else {
      // Set the isReady ref as true for the next pass
      isReady.current = true;
    }
  }, [audioSrc]);

  useEffect(() => {
    // Pause and clean up on unmount
    setIsPlaying(true);
    audioRef.current.oncanplay = () => {
      console.log("Can play");
    };
    audioRef.current.oncanplaythrough = () => {
      console.log("Can play through");
    };
    audioRef.current.onloadeddata = () => {
      console.log("Loaded data");
    };
    return () => {
      audioRef.current.pause();
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="meditation tw-p-0 tw-pt-[62px]">
      {isFullPlayer && (
        <div
          id="modal_player"
          className="modal player fixed-right fade show"
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="logo">
                <img src="/img/ic-logo.svg" alt="logo" />
              </div>
              <div className="mobile-wrapper">
                <div
                  className="modal-header"
                  // eslint-disable-next-line no-inline-styles/no-inline-styles
                  style={{ backgroundImage: "url('/img/card-1a.png')" }}
                >
                  <button
                    type="button"
                    className="close"
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    <img
                      src="/img/ic-collapse.svg"
                      className="collapse-player"
                      onClick={toggelPlayer}
                    />
                  </button>
                </div>
                <div className="modal-body">
                  <p>Gratitude</p>
                  <span>Alan Watts</span>
                  <div className="audioplayer">
                    <div
                      className="audioplayer-playpause tw-w-[40px] tw-h-[40px]"
                      title=""
                      onClick={onPlayPauseClick}
                    >
                      {!isPlaying && <img src="/img/ic-play-40-hover.svg" />}
                      {isPlaying && <img src="/img/ic-pause-40-hover.svg" />}
                    </div>
                    <div className="player-song"></div>
                    <div className="audioplayer-time audioplayer-time-current">
                      {secondsToTime(trackProgress)}
                    </div>
                    <div
                      ref={barRef}
                      className="audioplayer-bar"
                      onMouseDown={!isTouch ? trackerMousedown : () => {}}
                      onMouseMove={!isTouch ? trackerMousemove : () => {}}
                      onMouseUp={!isTouch ? trackerMouseup : () => {}}
                      onTouchStart={isTouch ? trackerMousedown : () => {}}
                      onTouchMove={isTouch ? trackerMousemove : () => {}}
                      onTouchCancel={isTouch ? trackerMouseup : () => {}}
                    >
                      <div className="audioplayer-bar-loaded tw-w-full"></div>
                      <div
                        className="audioplayer-bar-played"
                        style={{ width: currentPercentage }}
                      ></div>
                    </div>
                    <div className="audioplayer-time audioplayer-time-duration">
                      {secondsToTime(duration)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {!isFullPlayer && (
        <div id="player" className="visible !tw-bottom-0 tw-z-50">
          <div
            className={classNames("audioplayer", {
              "audioplayer-playing": isPlaying,
            })}
          >
            <div
              className="audioplayer-playpause tw-w-[40px]"
              title=""
              onClick={onPlayPauseClick}
            >
              {!isPlaying && <img src="/img/ic-play-40-hover.svg" />}
              {isPlaying && <img src="/img/ic-pause-40-hover.svg" />}
            </div>
            <div className="player-song">
              <span>{artist}</span>
              <p>{title}</p>
            </div>
            <div className="audioplayer-time audioplayer-time-current">
              {secondsToTime(trackProgress)}
            </div>
            <div
              ref={barRef}
              className="audioplayer-bar"
              onMouseDown={!isTouch ? trackerMousedown : () => {}}
              onMouseMove={!isTouch ? trackerMousemove : () => {}}
              onMouseUp={!isTouch ? trackerMouseup : () => {}}
              onTouchStart={isTouch ? trackerMousedown : () => {}}
              onTouchMove={isTouch ? trackerMousemove : () => {}}
              onTouchCancel={isTouch ? trackerMouseup : () => {}}
            >
              <div className="audioplayer-bar-loaded tw-w-full"></div>
              <div
                className="audioplayer-bar-played"
                style={{ width: currentPercentage }}
              ></div>
            </div>
            <div className="audioplayer-time audioplayer-time-duration">
              {secondsToTime(duration)}
            </div>
            <div></div>
          </div>
          <img
            src="/img/ic-close-24-r.svg"
            className="close-player"
            onClick={hidePlayer}
          />
          <img
            src="/img/ic-expand.svg"
            className="expand-player"
            onClick={toggelPlayer}
          ></img>
        </div>
      )}
      {/* <div className="audio-player">
        <div className="track-info">
          <img
            className="artwork"
            src={image}
            alt={`track artwork for ${title} by ${artist}`}
          />
          <h2 className="title">{title}</h2>
          <h3 className="artist">{artist}</h3>
          <AudioControls
            isPlaying={isPlaying}
            onPrevClick={toPrevTrack}
            onNextClick={toNextTrack}
            onPlayPauseClick={setIsPlaying}
          />
          <input
            type="range"
            value={trackProgress}
            step="1"
            min="0"
            max={duration ? duration : `${duration}`}
            className="progress"
            onChange={(e) => onScrub(e.target.value)}
            onMouseUp={onScrubEnd}
            onKeyUp={onScrubEnd}
            style={{ background: trackStyling }}
          />
        </div>
        <Backdrop
          trackIndex={trackIndex}
          activeColor={color}
          isPlaying={isPlaying}
        />
      </div> */}
    </div>
  );
};

export default AudioPlayer;
