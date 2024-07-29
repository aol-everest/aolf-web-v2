/* eslint-disable react-hooks/rules-of-hooks */
import { useGlobalAudioPlayerContext } from '@contexts';
import { useEffect, useRef, useState } from 'react';

import { isSSR } from '@utils';

const AudioPlayerSmall = ({ audioSrc }) => {
  console.log('audioSrc', audioSrc);

  const [trackProgress, setTrackProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dragging, setDragging] = useState(false);

  if (isSSR) {
    return null;
  }
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      // Update the audio source
      audioRef.current.src = audioSrc;

      // Set up event listeners
      audioRef.current.addEventListener('timeupdate', () => {
        setTrackProgress(audioRef.current.currentTime);
      });

      audioRef.current.addEventListener('play', () => {
        setIsPlaying(true);
      });

      audioRef.current.addEventListener('pause', () => {
        setIsPlaying(false);
      });

      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setTrackProgress(0);
      });
    }

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', () => {
          setTrackProgress(audioRef.current.currentTime);
        });
        audioRef.current.removeEventListener('play', () => {
          setIsPlaying(true);
        });
        audioRef.current.removeEventListener('pause', () => {
          setIsPlaying(false);
        });
        audioRef.current.removeEventListener('ended', () => {
          setIsPlaying(false);
          setTrackProgress(0);
        });
      }
    };
  }, [audioSrc]);

  return (
    <audio ref={audioRef} controls className="audio-player">
      <source src={audioSrc} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  );
};

export default AudioPlayerSmall;
