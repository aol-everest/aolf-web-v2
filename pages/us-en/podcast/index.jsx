/* eslint-disable react/no-unescaped-entities */
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { youtube } from '@service';
import { PageLoading } from '@components';
import ErrorPage from 'next/error';
import YouTube from 'react-youtube';
import { useEffect, useState, useRef } from 'react';

const PLAYLIST_ID = 'PLj4pqY15Io_m1E0YeB2_tvY6xxjLuhUNz';

const VideoItemComp = (props) => {
  const { video, playingId, onPlayAction } = props;
  const [isInitialPlaying, setInitialPlaying] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const playerRef = useRef(null);
  const [player, setPlayer] = useState(null);
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
  };

  setTimeout(async () => {
    if (playerRef.current) {
      console.log('==>IN-SiDE');
      if (playingId === video.videoDetail.id) {
        console.log('==>PLAYING VIDEO');
        setPlaying(true);
        playerRef.current.internalPlayer.unMute();
        playerRef.current.internalPlayer.playVideo();
        const res = await playerRef.current.internalPlayer.getPlayerState();
        console.log('==>res', res);
        if (res === 5) {
          playerRef.current.internalPlayer.mute();
          playerRef.current.internalPlayer.playVideo();
        }
      } else if (isPlaying) {
        setPlaying(false);
        console.log('==>pauseVideo');
        playerRef.current.internalPlayer.pauseVideo();
      }
    }
  });

  const handlePlayState = () => {
    onPlay();
  };

  const unMuteAction = () => {
    setTimeout(() => {
      playerRef.current.internalPlayer.unMute();
    });
  };

  const onPlay = async (e) => {
    console.log('INNN');
    // setPlaying(true);
    // setInitialPlaying(true);
    // if (playingId !== video.videoDetail.id) {
    //   onPlayAction(video.videoDetail.id);
    // }
  };

  const watchAction = (e) => {
    if (player) {
      player.unMute();
      player.playVideo();
    }
  };

  return (
    <div className="video-item">
      <div className="video-thumb" onClick={handlePlayState}>
        {/* <img
          src={video.snippet.thumbnails.medium.url}
          style={{ display: isInitialPlaying ? 'none' : 'block' }}
          className="video-thumb-img"
          alt="YouTube"
        /> */}
        <YouTube videoId={video.videoDetail.id} opts={opts} onReady={onReady} />
      </div>
      <button onClick={watchAction}>Play Video with Volume</button>
      <div className="video-info">
        <div className="channel-name">
          {video.snippet.videoOwnerChannelTitle}
        </div>
        <div className="video-title">{video.snippet.title}</div>
        <ul className="video-actions">
          <li>
            <a href="#" className="watch" onClick={watchAction}>
              Watch
            </a>
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
};

function PodcastPage() {
  const router = useRouter();
  const playerRef = useRef(null);
  const [isPlaying, setPlaying] = useState(false);
  const [playingId, setPlayingId] = useState(false);
  const [player, setPlayer] = useState(null);

  const { data, isLoading, isError, error } = useQuery(
    'yt-playlist',
    async () => {
      const result = await youtube.getPlaylistDetails(PLAYLIST_ID);
      return result;
    },
    {
      refetchOnWindowFocus: false,
    },
  );
  const [first, ...restData] = data || [];

  useEffect(() => {
    if (first) {
      if (playingId === first.videoDetail.id) {
        playerRef.current.internalPlayer.playVideo();
      } else {
        playerRef.current.internalPlayer.pauseVideo();
      }
    }
  }, [playingId]);

  const onReady = (event) => {
    setPlayer(event.target);
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

  const handlePlayState = () => {
    setPlaying(true);
    if (playingId !== first.videoDetail.id) {
      setPlayingId(first.videoDetail.id);
    }
  };

  const onPlayAction = (id) => {
    setPlayingId(id);
  };

  return (
    <main class="podcasts">
      <section class="top-video">
        <img
          style={{ display: isPlaying ? 'none' : 'inline-block' }}
          src={first.snippet.thumbnails.standard.url}
          class="video-thumb-img"
          width="100%"
          height="700"
          alt="YouTube"
        />

        <YouTube
          ref={playerRef}
          videoId={first.videoDetail.id}
          title={first.snippet.title} // defaults -> ''
          loading="loading" // defaults -> undefined
          opts={opts}
          onPlay={handlePlayState}
        />

        <div class="top-video-info">
          <div class="channel-name">{first.snippet.videoOwnerChannelTitle}</div>
          <div class="video-title">{first.snippet.title}</div>
        </div>
      </section>
      <section className="video-playlist">
        <div className="container">
          <div className="podcast-search-wrap">
            <input
              type="text"
              className="podcast-search-input"
              placeholder="Search..."
            />
          </div>
          <h2 className="section-title">Gurudev in Conversation</h2>
          <div className="section-description">
            Sharing wisdom with the world’s best thought leaders
          </div>
          <div className="featured-video-list">
            <div className="featured-video-item">
              <div className="video-thumb">
                <img
                  onclick="this.nextElementSibling.style.display='block'; this.style.display='none';"
                  src="http://img.youtube.com/vi/Q7p_E_3Upzg/maxresdefault.jpg"
                  className="video-thumb-img"
                  alt="YouTube"
                />
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/Q7p_E_3Upzg?enablejsapi=1&html5=1&mute=1"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
                <span className="thumb-label popular">The Most Popular</span>
              </div>
              <div className="video-info">
                <div className="channel-name">Lewis Howes 2022</div>
                <div className="video-title">
                  Everything You Know About Manifesting Is wrong! (Do This
                  Instead)
                </div>
                <ul className="video-actions">
                  <li>
                    <a href="" className="watch">
                      Watch
                    </a>
                  </li>
                  {/* <li><a href="" className="listen">Listen</a></li> */}
                  <li>
                    <a href="" className="duration">
                      00:37:36
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="featured-video-item">
              <div className="video-thumb">
                <img
                  onclick="this.nextElementSibling.style.display='block'; this.style.display='none';"
                  src="http://img.youtube.com/vi/WNuI8_8mX34/maxresdefault.jpg"
                  className="video-thumb-img"
                  alt="YouTube"
                />
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/WNuI8_8mX34?si=-hCnl2OJygKWRRbd"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
                <span className="thumb-label popular">The Most Popular</span>
              </div>
              <div className="video-info">
                <div className="channel-name">Vishen (Mindvalley)</div>
                <div className="video-title">
                  Your Most Difficult Philosophical Questions Answered
                </div>
                <ul className="video-actions">
                  <li>
                    <a href="" className="watch">
                      Watch
                    </a>
                  </li>
                  <li>
                    <a href="" className="duration">
                      00:48:15
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="featured-video-item">
              <div className="video-thumb">
                <img
                  onclick="this.nextElementSibling.style.display='block'; this.style.display='none';"
                  src="http://img.youtube.com/vi/wPQJz__rdHo/maxresdefault.jpg"
                  className="video-thumb-img"
                  alt="YouTube"
                />
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/wPQJz__rdHo?si=gcjhHIxpWl7bi0W5"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
                <span className="thumb-label featured">Featured</span>
              </div>
              <div className="video-info">
                <div className="channel-name">Next Level Soul</div>
                <div className="video-title">
                  Indian Mystic Reveals everything You Know About the universe
                  is wrong
                </div>
                <ul className="video-actions">
                  <li>
                    <a href="" className="watch">
                      Watch
                    </a>
                  </li>
                  <li>
                    <a href="" className="duration">
                      0:48:15
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="video-listing">
            {restData.map((video) => {
              return (
                <VideoItemComp
                  key={video.id}
                  video={video}
                  playingId={playingId}
                  onPlayAction={onPlayAction}
                />
              );
            })}
            <div className="video-item">
              <div className="video-thumb">
                <img
                  onclick="this.nextElementSibling.style.display='block'; this.style.display='none';"
                  src="http://img.youtube.com/vi/HTtKk7FvqBc/maxresdefault.jpg"
                  className="video-thumb-img"
                  alt="YouTube"
                />
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/HTtKk7FvqBc?si=bRXc9AlYWj4MXMbG"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
              </div>
              <div className="video-info">
                <div className="channel-name">Lewis Howes 2022</div>
                <div className="video-title">
                  Everything You Know About Manifesting Is wrong! (Do This
                  Instead)
                </div>
                <ul className="video-actions">
                  <li>
                    <a href="" className="watch">
                      Watch
                    </a>
                  </li>
                  <li>
                    <a href="" className="duration">
                      00:37:36
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="video-item">
              <div className="video-thumb">
                <img
                  onclick="this.nextElementSibling.style.display='block'; this.style.display='none';"
                  src="http://img.youtube.com/vi/n_uN-Lq3nyU/maxresdefault.jpg"
                  className="video-thumb-img"
                  alt="YouTube"
                />
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/n_uN-Lq3nyU?si=WmiN5_MSh_U6exjk"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
              </div>
              <div className="video-info">
                <div className="channel-name">Vishen (Mindvalley)</div>
                <div className="video-title">
                  Your Most Difficult Philosophical Questions Answered
                </div>
                <ul className="video-actions">
                  <li>
                    <a href="" className="watch">
                      Watch
                    </a>
                  </li>
                  <li>
                    <a href="" className="duration">
                      00:48:15
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="video-item">
              <div className="video-thumb">
                <img
                  onclick="this.nextElementSibling.style.display='block'; this.style.display='none';"
                  src="http://img.youtube.com/vi/iQWZdALmOcw/maxresdefault.jpg"
                  className="video-thumb-img"
                  alt="YouTube"
                />
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/iQWZdALmOcw?si=5kpV6V7ic_3kuX8x"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
              </div>
              <div className="video-info">
                <div className="channel-name">Next Level Soul</div>
                <div className="video-title">
                  Indian Mystic Reveals everything You Know About the universe
                  is wrong
                </div>
                <ul className="video-actions">
                  <li>
                    <a href="" className="watch">
                      Watch
                    </a>
                  </li>
                  <li>
                    <a href="" className="duration">
                      0:48:15
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="load-more-action">
            <button className="load-more-btn">Load more</button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default PodcastPage;
