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

const AudioPlayer = () => {
  // State
  const [trackIndex, setTrackIndex] = useState(0);
  const [trackProgress, setTrackProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const { hidePlayer, store } = useGlobalAudioPlayerContext();

  const { playerProps } = store || {};
  const { track } = playerProps || {};

  // Destructure for conciseness
  const { title, artist, color, image, audioSrc } = track || {};

  if (isSSR) {
    return null;
  }
  // Refs
  const audioRef = useRef(new Audio(audioSrc));
  const intervalRef = useRef();
  const isReady = useRef(false);

  // Destructure for conciseness
  const { duration } = audioRef.current;

  const currentPercentage = duration
    ? `${(trackProgress / duration) * 100}%`
    : "0%";
  const trackStyling = `
    -webkit-gradient(linear, 0% 0%, 100% 0%, color-stop(${currentPercentage}, #fff), color-stop(${currentPercentage}, #777))
  `;

  const startTimer = () => {
    // Clear any timers already running
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (audioRef.current.ended) {
        toNextTrack();
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

  const toPrevTrack = () => {
    if (trackIndex - 1 < 0) {
      setTrackIndex(tracks.length - 1);
    } else {
      setTrackIndex(trackIndex - 1);
    }
  };

  const toNextTrack = () => {
    if (trackIndex < tracks.length - 1) {
      setTrackIndex(trackIndex + 1);
    } else {
      setTrackIndex(0);
    }
  };

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
  }, [trackIndex]);

  useEffect(() => {
    // Pause and clean up on unmount
    return () => {
      audioRef.current.pause();
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="meditation">
      <div id="player" class="visible" style={{ bottom: 0 }}>
        <div class="audioplayer">
          <audio
            preload="auto"
            controls=""
            id="audioHeader"
            style={{ width: "0px", height: "0px", visibility: "hidden" }}
          >
            <source src={audioSrc} />
          </audio>
          <div class="audioplayer-playpause" title="">
            <img src="/img/ic-play-40-hover.svg" />
          </div>
          <div class="player-song">
            <span>Alan Watts</span>
            <p>Breath of Relaxation</p>
          </div>
          <div class="audioplayer-time audioplayer-time-current">00:02</div>
          <div class="audioplayer-bar">
            <div class="audioplayer-bar-loaded" style={{ width: "100%" }}></div>
            <div
              class="audioplayer-bar-played"
              style={{ width: "10.6207%" }}
            ></div>
          </div>
          <div class="audioplayer-time audioplayer-time-duration">00:17</div>
          <div></div>
        </div>
        <img
          src="/img/ic-close-24-r.svg"
          class="close-player"
          onClick={hidePlayer}
        />
        <img
          src="/img/ic-expand.svg"
          class="expand-player"
          data-toggle="modal"
          data-target="#modal_player"
        ></img>
      </div>

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
