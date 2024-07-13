import React, { useState } from 'react';
import { motion } from 'framer-motion';
import YouTube from 'react-youtube';
import { extractVideoId } from '@utils';

export const VideoItemComp = (props) => {
  const { video, playingId, onPlayAction } = props;
  // const [isInitialPlaying, setInitialPlaying] = useState(false);
  // const [isReady, setReady] = useState(false);
  const [player, setPlayer] = useState(null);
  // const [playerState, setPlayerState] = useState(null);
  const opts = {
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
  };

  const videoId = extractVideoId(video);
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

  return (
    <div onClick={watchAction}>
      <YouTube
        videoId={videoId}
        loading="loading"
        opts={opts}
        onReady={onReady}
        onPlay={onPlay}
        className="youtube-iframe"
      />
    </div>
  );
};

const SearchResult = React.forwardRef(function SearchResult(
  { result, setPlayingId, playingId },
  ref,
) {
  const [showToast, setShowToast] = useState(false);
  const onPlayAction = (id) => {
    setPlayingId(id);
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(result.content)
      .then(() => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000); // Reset the copied state after 2 seconds
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  };

  const getFormattedText = () => {
    return result?.content?.replace(/\n/g, '<br />');
  };

  return (
    <motion.div
      // className={['searchResult']}
      initial={{ scale: 0, translateY: -50 }}
      animate={{ scale: 1, translateY: 0 }}
      exit={{ scale: 0, translateY: 50 }}
      ref={ref}
    >
      {result?.category?.startsWith('video') ? (
        <div
          className="tab-pane"
          id="nav-anxiety"
          role="tabpanel"
          aria-labelledby="nav-anxiety-tab"
        >
          <div className="tab-content-video">
            <VideoItemComp
              video={result.source}
              onPlayAction={onPlayAction}
              playingId={playingId}
              className="youtube-iframe"
            ></VideoItemComp>
          </div>
        </div>
      ) : (
        result.content && (
          <div className="tab-pane active" id="nav-anger" role="tabpanel">
            <div className="tab-content-text">
              <p dangerouslySetInnerHTML={{ __html: getFormattedText() }} />
            </div>
            <div className="tab-content-action">
              <button className="tc-action-btn" onClick={copyToClipboard}>
                <span className="icon-aol iconaol-copy"></span>
              </button>
            </div>
          </div>
        )
      )}
      {showToast && <div className="toast">Text copied!</div>}
    </motion.div>
  );
});

export default SearchResult;
