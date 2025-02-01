/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import YouTube from 'react-youtube';
import {
  extractFacebookVideoId,
  extractInstagramVideoId,
  extractVideoId,
} from '@utils';
import FacebookVideo from '@components/facebookVideo';
import InstagramVideo from '@components/instagramVideo';

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

  const facebookView = video.includes('www.facebook.com');
  const instagramView = video.includes('www.instagram.com');

  const videoId = facebookView
    ? extractFacebookVideoId(video)
    : instagramView
      ? extractInstagramVideoId(video)
      : extractVideoId(video);
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

  if (facebookView) {
    return <FacebookVideo video={video} />;
  }

  if (instagramView) {
    return <InstagramVideo video={video} />;
  }

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
  {
    result,
    setPlayingId,
    playingId,
    selectedVotes,
    handleVoteSelect,
    selectedPageIndex,
    query,
    currentMeta,
  },
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

  const isFeedbackSelected = selectedVotes[selectedPageIndex];

  const getErrorMessagesForMeta = () => {
    switch (currentMeta) {
      case 'suicide':
        return "Hi there, below is a wisdom sheet from Gurudev. You are so loved and as Gurudev says, 'know that you are very much needed in this world' too. You are not alone, we are with you, and help is available. To speak with a certified listener in the USA, call the National Suicide Prevention Hotline at <a href='tel:988'>988</a>. In India, call the Aasra hotline at <a href='tel:+91-9820466726'>91-9820466726</a> . For other countries, find a helpline <a href='https://findahelpline.com/'>here</a>. To speak to an Art of Living teacher, call <a href='tel:(855) 202-4400'>(855) 202-4400</a>";
      default:
        return "Here is a wisdom sheet we found related to your question. It may not be specific to your situation, but we hope it's helpful!";
    }
  };

  const CustomMessage = () => {
    const message = getErrorMessagesForMeta();
    return (
      <div className="emptyResults">
        <p dangerouslySetInnerHTML={{ __html: message }} />
      </div>
    );
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
              {query && <div className="disclaimer">{<CustomMessage />}</div>}
              <p dangerouslySetInnerHTML={{ __html: getFormattedText() }} />
            </div>
            <div className="tab-content-action">
              <div className="vote-up-down">
                <label>Did we find the right bit of wisdom for you?</label>
                <div className="vote-actions">
                  <button
                    className={`vote-btn ${isFeedbackSelected === 1 ? 'active' : ''}`}
                    onClick={() => handleVoteSelect(true)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.23242 15.2917L8.81575 17.2917C9.14909 17.625 9.89909 17.7917 10.3991 17.7917H13.5658C14.5658 17.7917 15.6491 17.0417 15.8991 16.0417L17.8991 9.95835C18.3158 8.79168 17.5658 7.79168 16.3158 7.79168H12.9824C12.4824 7.79168 12.0658 7.37501 12.1491 6.79168L12.5658 4.12501C12.7324 3.37501 12.2324 2.54168 11.4824 2.29168C10.8158 2.04168 9.98242 2.37501 9.64909 2.87501L6.23242 7.95835"
                        stroke="#31364E"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                      />
                      <path
                        d="M1.98242 15.2916V7.12496C1.98242 5.95829 2.48242 5.54163 3.64909 5.54163H4.48242C5.64909 5.54163 6.14909 5.95829 6.14909 7.12496V15.2916C6.14909 16.4583 5.64909 16.875 4.48242 16.875H3.64909C2.48242 16.875 1.98242 16.4583 1.98242 15.2916Z"
                        stroke="#31364E"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    className={`vote-btn ${isFeedbackSelected === -1 ? 'active' : ''}`}
                    onClick={() => handleVoteSelect(false)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.7668 4.70837L11.1834 2.70837C10.8501 2.37504 10.1001 2.20837 9.6001 2.20837H6.43344C5.43344 2.20837 4.3501 2.95837 4.1001 3.95837L2.1001 10.0417C1.68344 11.2084 2.43344 12.2084 3.68344 12.2084H7.01677C7.51677 12.2084 7.93344 12.625 7.8501 13.2084L7.43344 15.875C7.26677 16.625 7.76677 17.4584 8.51677 17.7084C9.18344 17.9584 10.0168 17.625 10.3501 17.125L13.7668 12.0417"
                        stroke="#31364E"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                      />
                      <path
                        d="M18.0163 4.70833V12.875C18.0163 14.0417 17.5163 14.4583 16.3496 14.4583H15.5163C14.3496 14.4583 13.8496 14.0417 13.8496 12.875V4.70833C13.8496 3.54167 14.3496 3.125 15.5163 3.125H16.3496C17.5163 3.125 18.0163 3.54167 18.0163 4.70833Z"
                        stroke="#31364E"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {showToast && <div className="toast">Text copied!</div>}
    </motion.div>
  );
});

export default SearchResult;
