import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

const AudioPlayerOnScreen = ({ pageParam }) => {
  const [trackProgress, setTrackProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [duration, setDuration] = useState(0);

  const { track } = pageParam || {};
  const { title, artist, color, image, audioSrc } = track || {};

  const isTouch = 'ontouchstart' in window;
  const audioRef = useRef(new Audio(audioSrc));
  const intervalRef = useRef();
  const barRef = useRef();

  const currentPercentage = duration
    ? `${(trackProgress / duration) * 100}%`
    : '0%';

  const secondsToTime = (secs) => {
    if (!secs) {
      return '00:00';
    }
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = Math.ceil((secs % 3600) % 60);
    return (
      (hours ? `${hours < 10 ? '0' : ''}${hours}:` : '') +
      `${minutes < 10 ? '0' : ''}${minutes}:` +
      `${seconds < 10 ? '0' : ''}${seconds}`
    );
  };

  const onPlayPauseClick = () => {
    if (!isPlaying) {
      audioRef.current.play();
      startTimer();
    } else {
      audioRef.current.pause();
    }
    setIsPlaying((isPlaying) => !isPlaying);
  };

  const startTimer = () => {
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (audioRef.current.ended) {
        // Handle end of track
      } else {
        setTrackProgress(audioRef.current.currentTime);
      }
    }, 1000);
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

  const trackerMouseup = () => {
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

  useEffect(() => {
    audioRef.current.pause();
    audioRef.current = new Audio(audioSrc);

    const onLoadedMetadata = () => {
      setDuration(audioRef.current.duration);
      setTrackProgress(audioRef.current.currentTime);
    };

    audioRef.current.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      audioRef.current.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [audioSrc]);

  useEffect(() => {
    return () => {
      audioRef.current.pause();
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="meditation tw-p-0 tw-pt-[62px]">
      <div id="player" className="visible !tw-bottom-0 tw-z-50">
        <div
          className={classNames('audioplayer', {
            'audioplayer-playing': isPlaying,
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
      </div>
    </div>
  );
};

export default AudioPlayerOnScreen;
