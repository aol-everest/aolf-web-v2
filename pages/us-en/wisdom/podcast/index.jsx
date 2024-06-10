/* eslint-disable react/no-unescaped-entities */
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { youtube } from '@service';
import { PageLoading } from '@components';
import ErrorPage from 'next/error';
import YouTube from 'react-youtube';
import { useEffect, useState } from 'react';

const PLAYLIST_ID = `${process.env.NEXT_PUBLIC_PODCAST_PLAYLIST_ID}`;

const SEARCH_PARAM = [
  'videoDetail.snippet.title',
  'videoDetail.snippet.description',
  'videoDetail.snippet.channelTitle',
  'snippet.videoOwnerChannelTitle',
];

// Helper function to handle nested properties
function deepValue(obj, path) {
  const parts = path.split('.');
  return parts.reduce((acc, current) => acc[current], obj);
}

function toPascalCaseWithSpaces(inputString) {
  // Check if inputString is not null or undefined
  if (inputString == null) {
    console.error('Input string is null or undefined.');
    return null; // or return an appropriate value based on your use case
  }

  // Split the string into words while preserving special characters
  let words = inputString.split(/\b/);

  // Capitalize the first letter of each word, excluding words after an apostrophe
  let pascalCaseString = words
    .map((word, index) => {
      // Check if the word is a word character (letter, digit, or underscore)
      if (/^\w+$/.test(word)) {
        // Check if the previous word ends with an apostrophe
        let isAfterApostrophe =
          index > 0 &&
          (words[index - 1].endsWith("'") || words[index - 1].endsWith('’'));
        return isAfterApostrophe
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      } else {
        return word; // Retain the special character
      }
    })
    .join('');

  // return pascalCaseString;

  return removeTextFromEnd(pascalCaseString, [
    ' | A Conversation With Gurudev Sri Sri Ravi Shankar',
    ' With Gurudev Sri Sri Ravi Shankar',
    ' – Gurudev Sri Sri Ravi Shankar',
    ' - Gurudev Sri Sri Ravi Shankar',
    ' | Gurudev Sri Sri Ravi Shankar',
    ' | Gurudev Sri Sri Ravi Shankar.',
    ' Gurudev Sri Sri Ravi Shankar.',
    ' Gurudev Sri Sri Ravi Shankar',
  ]);
}

function removeTextFromEnd(inputString, textsToRemove) {
  for (const textToRemove of textsToRemove) {
    const lowerInput = inputString.toLowerCase();
    const lowerTextToRemove = textToRemove.toLowerCase();

    if (lowerInput.endsWith(lowerTextToRemove)) {
      return inputString.slice(0, -textToRemove.length);
    }
  }
  return inputString;
}

const VideoItemComp = (props) => {
  const { video, playingId, onPlayAction, isVertical, isMostPopular } = props;
  const [isInitialPlaying, setInitialPlaying] = useState(false);
  const [isReady, setReady] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const [player, setPlayer] = useState(null);
  const [playerState, setPlayerState] = useState(null);
  const opts = {
    height: '560',
    width: '315',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
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
      list: PLAYLIST_ID,
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
      if (playingId === video.videoDetail.id) {
        playVideo();
      } else {
        player.pauseVideo();
      }
    }
  }, [playingId, player]);

  const onPlay = async (e) => {
    setPlaying(true);
    setInitialPlaying(true);
    if (playingId !== video.videoDetail.id) {
      onPlayAction(video.videoDetail.id);
    }
  };

  const onPause = async (e) => {
    setPlaying(false);
  };

  const watchAction = () => {
    if (player) {
      if (playingId !== video.videoDetail.id) {
        onPlayAction(video.videoDetail.id);
      }
      if (player.getPlayerState() === 2) {
        playVideo();
      }
    }
  };

  const pauseAction = () => {
    if (playingId === video.videoDetail.id) {
      onPlayAction(null);
    }
  };

  const onError = (event) => {
    console.log('Error code:', event.data);
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

  if (isVertical) {
    return (
      <div className="video-item">
        <div className="video-thumb" onClick={watchAction}>
          {showLoader() && (
            <div className="loader-container">
              <div className="loader"></div>
            </div>
          )}
          <img
            src={video.snippet.thumbnails.medium.url}
            style={{ display: isInitialPlaying ? 'none' : 'block' }}
            className="video-thumb-img"
            alt="YouTube"
          />

          <YouTube
            videoId={video.videoDetail.id}
            title={video.snippet.title}
            loading="loading"
            opts={opts}
            onReady={onReady}
            onPlay={onPlay}
            onPause={onPause}
            onError={onError}
            onStateChange={onStateChange}
          />
        </div>

        <div className="video-info">
          <div className="channel-name">
            {video.snippet.videoOwnerChannelTitle}
          </div>
          <div className="video-title">
            {toPascalCaseWithSpaces(video.snippet.title)}
          </div>
          <ul className="video-actions">
            <li>
              {playerState !== YouTube.PlayerState.PLAYING && (
                <button onClick={watchAction} className="watch">
                  Watch
                </button>
              )}
              {playerState === YouTube.PlayerState.PLAYING && (
                <button onClick={pauseAction} className="pause">
                  Pause
                </button>
              )}
            </li>
            <li>
              <a href="" className="duration">
                {video.videoDetail.duration}
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
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
          src={video.snippet.thumbnails.medium.url}
          className="video-thumb-img"
          alt="YouTube"
        />
        <YouTube
          videoId={video.videoDetail.id}
          title={video.snippet.title}
          loading="loading"
          opts={opts}
          onReady={onReady}
          onPlay={onPlay}
          onPause={onPause}
          onStateChange={onStateChange}
        />
        {isMostPopular && (
          <span className="thumb-label popular">The Most Popular</span>
        )}
      </div>
      <div className="video-info">
        <div className="channel-name">
          {video.snippet.videoOwnerChannelTitle}
        </div>
        <div className="video-title">
          {toPascalCaseWithSpaces(video.snippet.title)}
        </div>
        <ul className="video-actions">
          <li>
            {!isPlaying && (
              <button onClick={watchAction} className="watch">
                Watch
              </button>
            )}
            {isPlaying && (
              <button onClick={pauseAction} className="pause">
                Pause
              </button>
            )}
          </li>
          {/* <li><a href="" className="listen">Listen</a></li> */}
          <li>
            <a href="" className="duration">
              {video.videoDetail.duration}
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

function PodcastPage() {
  const router = useRouter();
  const [isPlaying, setPlaying] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [player, setPlayer] = useState(null);
  //     set search query to empty string
  const [q, setQ] = useState('');
  const [playerCount, setPlayerCount] = useState(0);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: 'yt-playlist',
    queryFn: async () => {
      const result = await youtube.getPlaylistDetails(PLAYLIST_ID);
      return result;
    },
  });
  const [first, second, third, ...restData] = data?.all || [];

  const playVideo = () => {
    if (player) {
      player.unMute();
      player.playVideo();
      if (player.getPlayerState() !== 1) {
        player.mute();
        player.playVideo();
      }
    }
  };

  useEffect(() => {
    if (data?.mostPopular) {
      setPlayingId(data.mostPopular.videoDetail.id);
    }
  }, [data?.mostPopular]);

  useEffect(() => {
    if (data?.mostPopular && player) {
      if (playingId === data.mostPopular.videoDetail.id) {
        playVideo();
      } else if (player.getPlayerState() === 1) {
        player.pauseVideo();
      }
    }
  }, [playingId, player]);

  const search = (items) => {
    return items.filter((item) => {
      return SEARCH_PARAM.some((newItem) => {
        const value = deepValue(item, newItem); // Helper function to handle nested properties
        return (
          value && value.toString().toLowerCase().indexOf(q.toLowerCase()) > -1
        );
      });
    });
  };

  const onReady = (event) => {
    setPlayer(event.target);
  };

  const onPlay = async (e) => {
    setPlaying(true);
    if (playingId !== data.mostPopular.videoDetail.id) {
      setPlayingId(data.mostPopular.videoDetail.id);
    }
  };

  const addPlayerLoadedCount = () => {
    setPlayerCount(playerCount + 1);
  };

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !router.isReady) return <PageLoading />;

  const opts = {
    height: '700px',
    width: '100%',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
      color: 'white',
      mute: 1,
      enablejsapi: 1,
      fs: 0,
      hl: 'en',
      loop: 1,
      showinfo: 0,
      rel: 0,
      playsinline: 1,
      iv_load_policy: 3,
      listType: 'playlist',
      list: PLAYLIST_ID,
    },
  };

  const onPlayAction = (id) => {
    setPlayingId(id);
  };

  return (
    <main className="podcasts">
      {data.mostPopular && (
        <section className="top-video">
          <img
            style={{ display: isPlaying ? 'none' : 'inline-block' }}
            src={data.mostPopular.snippet.thumbnails.maxres.url}
            className="video-thumb-img"
            width="100%"
            height="700"
            alt="YouTube"
          />

          <YouTube
            videoId={data.mostPopular.videoDetail.id}
            title={data.mostPopular.snippet.title}
            loading="loading"
            opts={opts}
            onPlay={onPlay}
            onReady={onReady}
          />

          <div className="top-video-info">
            <div className="channel-name">
              {data.mostPopular.snippet.videoOwnerChannelTitle}
            </div>
            <div className="video-title">
              {toPascalCaseWithSpaces(data.mostPopular.snippet.title)}
            </div>
          </div>
        </section>
      )}
      <section className="video-playlist">
        <div className="container">
          <div className="podcast-search-wrap">
            <input
              type="text"
              className="podcast-search-input"
              placeholder="Search..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <h2 className="section-title">Gurudev in Conversation</h2>
          <div className="section-description">
            Sharing wisdom with the world’s best thought leaders
          </div>
          <div className="featured-video-list">
            <VideoItemComp
              video={first}
              playingId={playingId}
              onPlayAction={onPlayAction}
              // isMostPopular
            ></VideoItemComp>
            <VideoItemComp
              video={second}
              playingId={playingId}
              onPlayAction={onPlayAction}
            ></VideoItemComp>
            <VideoItemComp
              video={third}
              playingId={playingId}
              onPlayAction={onPlayAction}
            ></VideoItemComp>
          </div>
          <div className="video-listing">
            {search(restData)?.map((video) => {
              return (
                <VideoItemComp
                  addPlayerLoadedCount={addPlayerLoadedCount}
                  key={video.id}
                  video={video}
                  playingId={playingId}
                  onPlayAction={onPlayAction}
                  isVertical
                />
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

PodcastPage.sideGetStartedAction = true;
export default PodcastPage;
