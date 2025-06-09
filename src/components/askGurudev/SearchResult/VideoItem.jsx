import React, { useState, useEffect } from 'react';
import {
  extractFacebookVideoId,
  extractInstagramVideoId,
  extractVideoIdAndStartTime,
} from '@utils';
import FacebookVideo from '@components/facebookVideo';
import InstagramVideo from '@components/instagramVideo';
import YouTube from 'react-youtube';

const VideoItem = (props) => {
  const { video, playingId, onPlayAction } = props;
  const [playerVars, setPlayerVars] = useState({
    height: '100%',
    width: '100%',
    playerVars: {
      version: 3,
      controls: 1,
      playerapiid: 'ytplayer',
      color: 'white',
      enablejsapi: 1,
      mute: 1,
      showinfo: 0,
      rel: 0,
      playsinline: 1,
      iv_load_policy: 3,
      listType: 'playlist',
      start: 0,
    },
  });
  // const [isInitialPlaying, setInitialPlaying] = useState(false);
  // const [isReady, setReady] = useState(false);
  const [player, setPlayer] = useState(null);
  // const [playerState, setPlayerState] = useState(null);

  const facebookView = video.includes('www.facebook.com');
  const instagramView = video.includes('www.instagram.com');

  const { videoId, start } = facebookView
    ? { videoId: extractFacebookVideoId(video), start: 0 }
    : instagramView
      ? { videoId: extractInstagramVideoId(video), start: 0 }
      : extractVideoIdAndStartTime(video);

  useEffect(() => {
    setPlayerVars({
      height: '100%',
      width: '100%',
      playerVars: {
        version: 3,
        controls: 1,
        playerapiid: 'ytplayer',
        color: 'white',
        enablejsapi: 1,
        mute: 1,
        showinfo: 0,
        rel: 0,
        playsinline: 1,
        iv_load_policy: 3,
        listType: 'playlist',
        start: start,
      },
    });
  }, [start]);

  const onReady = (event) => {
    setPlayer(event.target);
    // setReady(true);
  };

  const playVideo = () => {
    if (player) {
      player.unMute();
      player.playVideo();
      setTimeout(function () {
        if (player.getPlayerState() !== 1) {
          player.mute();
          player.playVideo();
          // player.seekTo(parseFloat(startSec));
        }
      }, 1000);
    }
  };

  // useEffect(() => {
  //   if (player) {
  //     if (playingId === videoId) {
  //       playVideo();
  //     } else {
  //       player.pauseVideo();
  //     }
  //   }
  // }, [playingId, player]);

  const onPlay = async (e) => {
    // setInitialPlaying(true);
    if (player.isMuted()) {
      player.unMute();
    }
    if (playingId !== videoId) {
      onPlayAction(videoId);
    }
  };

  const watchAction = () => {
    if (player) {
      if (playingId !== videoId) {
        onPlayAction(videoId);
      }
      if (player.getPlayerState() === 2) {
        playVideo();
      }
    }
  };

  if (facebookView) {
    return <FacebookVideo video={video} />;
  }

  if (instagramView) {
    return <InstagramVideo video={video} />;
  }

  return (
    <div onClick={watchAction} className="youtube-wrapper">
      <YouTube
        videoId={videoId}
        loading="lazy"
        opts={playerVars}
        onReady={onReady}
        onPlay={onPlay}
        className="youtube-iframe"
      />
    </div>
  );
};

export default VideoItem;
