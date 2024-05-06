import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import YouTube from 'react-youtube';

const VideoItemComp = (props) => {
  const { videoId, thumbnailUrl, videoTitle, playingId, onPlayAction } = props;
  const [isInitialPlaying, setInitialPlaying] = useState(false);
  const [isReady, setReady] = useState(false);
  const [player, setPlayer] = useState(null);
  const [playerState, setPlayerState] = useState(null);
  const opts = {
    height: '560',
    width: '315',
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
    },
  };
  const onReady = (event) => {
    setPlayer(event.target);
    setReady(true);
  };

  const playVideo = () => {
    if (player) {
      player.unMute();
      player.playVideo();
      setTimeout(function () {
        if (player.getPlayerState() !== 1) {
          player.mute();
          player.playVideo();
        }
      }, 1000);
    }
  };

  useEffect(() => {
    if (player) {
      if (playingId === videoId) {
        playVideo();
      } else {
        player.pauseVideo();
      }
    }
  }, [playingId, player]);

  const onPlay = async (e) => {
    setInitialPlaying(true);
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

  const onStateChange = (event) => {
    setPlayerState(event.data);
  };

  const showLoader = () => {
    return (
      !isReady ||
      (playerState &&
        playerState !== YouTube.PlayerState.PLAYING &&
        playerState !== YouTube.PlayerState.PAUSED &&
        playerState !== YouTube.PlayerState.ENDED)
    );
  };

  return (
    <div className="featured-video-item">
      <div className="video-thumb" onClick={watchAction}>
        {showLoader() && (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        )}
        <img
          style={{ display: isInitialPlaying ? 'none' : 'block' }}
          src={thumbnailUrl}
          className="thumbnail"
          alt="YouTube"
        />
        <YouTube
          videoId={videoId}
          title={videoTitle}
          loading="loading"
          opts={opts}
          onReady={onReady}
          onPlay={onPlay}
          onStateChange={onStateChange}
        />
      </div>
    </div>
  );
};

const SearchResult = React.forwardRef(function SearchResult({ result }, ref) {
  const thumbnailUrl = result.metadata.thumbnail;
  const [playingId, setPlayingId] = useState(null);

  const onPlayAction = (id) => {
    setPlayingId(id);
  };

  return (
    <motion.div
      className={['searchResult']}
      initial={{ scale: 0, translateY: -50 }}
      animate={{ scale: 1, translateY: 0 }}
      exit={{ scale: 0, translateY: 50 }}
      ref={ref}
    >
      <main className="ask-gurudev-video-item podcasts">
        <section className="video-text">
          <div className="video-text">
            <p>{result.metadata.title}</p>
          </div>
          <div className="video-player-wrap">
            <VideoItemComp
              videoId={result.metadata.videoId}
              videoTitle={result.metadata.title}
              thumbnailUrl={thumbnailUrl}
              onPlayAction={onPlayAction}
              playingId={playingId}
            ></VideoItemComp>
          </div>
        </section>
      </main>
    </motion.div>
  );
});

export default SearchResult;
