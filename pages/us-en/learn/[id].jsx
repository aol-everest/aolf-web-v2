/* eslint-disable react/no-unescaped-entities */
import { Loader, PageLoading } from "@components";
import { ChapterItem } from "@components/content";
import { ALERT_TYPES, MODAL_TYPES } from "@constants";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import {
  useAuth,
  useGlobalAlertContext,
  useGlobalAudioPlayerContext,
  useGlobalModalContext,
  useGlobalVideoPlayerContext,
} from "@contexts";
import {
  markFavoriteEvent,
  pushRouteWithUTMQuery,
  updateUserActivity,
} from "@service";
import { api, secondsToHms } from "@utils";
import classNames from "classnames";
import ErrorPage from "next/error";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { useQuery } from "react-query";
import {
  BigPlayButton,
  ControlBar,
  CurrentTimeDisplay,
  ForwardControl,
  FullscreenToggle,
  LoadingSpinner,
  PlayToggle,
  PlaybackRateMenuButton,
  Player,
  ReplayControl,
  TimeDivider,
  VolumeMenuButton,
} from "video-react";
import Styles from "./Learn.module.scss";

/* export const getServerSideProps = async (context) => {
  const { query, req, res } = context;
  const { id } = query;
  let props = {};
  let token = "";
  try {
    const { Auth } = await withSSRContext({ req });
    const user = await Auth.currentAuthenticatedUser();
    const currentSession = await Auth.currentSession();
    token = currentSession.idToken.jwtToken;
    props = {
      authenticated: true,
      username: user.username,
      token,
    };
  } catch (err) {
    props = {
      authenticated: false,
    };
  }
  const { data } = await api.get({
    path: "courseDetail",
    token,
    param: {
      id,
    },
  });
  props = {
    ...props,
    data,
  };
  // Pass data to the page via props
  return { props };
}; */

export default function Learn() {
  const { user, authenticated } = useAuth();
  const router = useRouter();
  const playerEl = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showWhatYoullLearn, setShowWhatYoullLearn] = useState(true);
  const [showWhoIsItFor, setShowWhoIsItFor] = useState(false);
  const { showModal } = useGlobalModalContext();
  const { showAlert } = useGlobalAlertContext();
  const { showPlayer, hidePlayer } = useGlobalAudioPlayerContext();
  const { showVideoPlayer } = useGlobalVideoPlayerContext();
  const { id: courseId } = router.query;
  const { data, isLoading, isError, error } = useQuery(
    "courseDetail",
    async () => {
      const response = await api.get({
        path: "courseDetail",
        param: {
          id: courseId,
        },
      });
      if (response.isError) {
        throw new Error(
          response.error || "No content found. Invalid content Id.",
        );
      }
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      enabled: router.isReady,
    },
  );

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !router.isReady) return <PageLoading />;

  const {
    sfid,
    subTitle,
    description,
    primaryTeacherName,
    primaryTeacherPic,
    title,
    introContent,
    cardImage,
    whatYouWillLearn,
    whoIsItFor,
  } = data;

  let introContentPoster =
    "http://html5videoformatconverter.com/data/images/screen.jpg";
  if (introContent && introContent.coverImage) {
    introContentPoster = introContent.coverImage.url;
  } else if (cardImage) {
    introContentPoster = cardImage.url;
  }

  // Call this function whenever you want to
  // refresh props!
  const refreshData = () => {
    router.replace(router.asPath);
  };

  const markFavorite = (meditate) => async (e) => {
    if (e) e.preventDefault();
    if (!authenticated) {
      showModal(MODAL_TYPES.LOGIN_MODAL);
    } else {
      await markFavoriteEvent({ meditate, refetch: null });
    }
  };

  const purchaseMembershipAction = (id) => (e) => {
    pushRouteWithUTMQuery(router, `/us-en/membership/${id}`);
  };

  const onPlayPauseAction = () => {
    const { player } = playerEl.current.getState();
    setIsPlaying(!player.paused);
  };

  const togglePlay = () => {
    const { player } = playerEl.current.getState();
    if (player.paused) {
      playerEl.current.play();
    } else {
      playerEl.current.pause();
    }
  };

  const toggleFullscreen = () => {
    const { player } = playerEl.current.getState();
    if (player.isFullscreen) {
      playerEl.current.toggleFullscreen();
    } else {
      playerEl.current.toggleFullscreen();
    }
  };

  const playChapterAction = (chapter) => async () => {
    setLoading(true);
    try {
      const { data } = await api.get({
        path: "chapterDetail",
        param: {
          id: sfid,
          chapterSfid: chapter.sfid,
        },
      });

      if (data) {
        const chapterDetails = { ...data, ...chapter };
        if (
          chapterDetails.contentType === "Audio" ||
          chapterDetails.contentType === "audio/x-m4a"
        ) {
          showPlayer({
            track: {
              title: chapterDetails.title,
              artist: chapterDetails.teacher?.name,
              image: chapterDetails.coverImage?.url,
              audioSrc: chapterDetails.track?.url,
            },
          });
        } else if (chapterDetails.contentType === "Video") {
          hidePlayer();
          const image = chapterDetails.coverImage?.url;
          showVideoPlayer({
            track: {
              title: chapterDetails.title,
              artist: chapterDetails.teacher?.name,
              image: image || introContentPoster,
              audioSrc: chapterDetails.track?.url,
              description: chapterDetails.description,
            },
            playAction: async () => {
              await updateUserActivity({
                contentSfid: sfid,
                subContentSfid: chapterDetails.sfid,
              });
              refreshData();
            },
          });
        }
      }
    } catch (ex) {
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: message ? `Error: ${message} (${statusCode})` : ex.message,
      });
    }
    setLoading(false);
  };

  return (
    <main className="background-image meditation">
      {loading && <Loader />}
      <section className="top-column meditation-page browse-category insight-collection insight-collection2">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-md-6 text-left">
              <p className="type-course">Course</p>
              <h1 className="course-name">{title}</h1>
              <p className="type-guide">
                <img
                  src={primaryTeacherPic}
                  alt=""
                  className={classNames("rounded-circle", Styles.teacherPic)}
                />
                {primaryTeacherName}
              </p>
              <p className="course-description">
                {description && documentToReactComponents(description)}
              </p>

              <div className="accordion">
                {whatYouWillLearn && (
                  <div className="card">
                    <div className="card-header">
                      <h2 className="mb-0">
                        <button
                          onClick={() =>
                            setShowWhatYoullLearn(
                              (showWhatYoullLearn) => !showWhatYoullLearn,
                            )
                          }
                          className="btn btn-link btn-block text-left"
                          type="button"
                          data-toggle="collapse"
                          data-target="#collapseOne"
                          aria-expanded={showWhatYoullLearn}
                          aria-controls="collapseOne"
                        >
                          What You'll Learn
                        </button>
                      </h2>
                    </div>
                    <div
                      className={classNames("collapse", {
                        show: showWhatYoullLearn,
                      })}
                      aria-labelledby="headingOne"
                      data-parent="#accordionExample"
                    >
                      <div className="card-body">
                        {documentToReactComponents(whatYouWillLearn)}
                      </div>
                    </div>
                  </div>
                )}
                {whoIsItFor && (
                  <div className="card">
                    <div className="card-header">
                      <h2 className="mb-0">
                        <button
                          onClick={() =>
                            setShowWhoIsItFor(
                              (showWhoIsItFor) => !showWhoIsItFor,
                            )
                          }
                          className="btn btn-link btn-block text-left collapsed"
                          type="button"
                          data-toggle="collapse"
                          data-target="#collapseTwo"
                          aria-expanded={showWhoIsItFor}
                          aria-controls="collapseTwo"
                        >
                          Who is it for?
                        </button>
                      </h2>
                    </div>
                    <div
                      className={classNames("collapse", {
                        show: showWhoIsItFor,
                      })}
                      aria-labelledby="headingTwo"
                      data-parent="#accordionExample"
                    >
                      <div className="card-body">
                        {documentToReactComponents(whoIsItFor)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="col-12 col-md-6 d-flex justify-content-end">
              {!introContent && (
                <article className="collection-video">
                  <div className="video-player">
                    <div className="video-insighter-container tw-rounded-r">
                      <video poster={introContentPoster}></video>
                    </div>
                  </div>
                </article>
              )}
              {introContent && introContent.track && (
                <article className="collection-video">
                  <div className="video-player">
                    <div className="video-insighter-container">
                      <Player
                        ref={playerEl}
                        poster={introContentPoster}
                        onPlay={onPlayPauseAction}
                        onPause={onPlayPauseAction}
                      >
                        <source src={introContent.track.url} />
                        <BigPlayButton position="center" className="d-none" />
                        <LoadingSpinner />
                        <ControlBar>
                          <PlayToggle className="d-none" />
                          <ReplayControl seconds={10} order={1.1} />
                          <ForwardControl seconds={30} order={1.2} />
                          <CurrentTimeDisplay order={4.1} />
                          <TimeDivider order={4.2} />
                          <PlaybackRateMenuButton
                            rates={[5, 2, 1, 0.5, 0.1]}
                            order={7.1}
                          />
                          <VolumeMenuButton vertical />
                          <FullscreenToggle />
                        </ControlBar>
                      </Player>
                      <div className="video-insighter-play">
                        <img
                          src="/img/ic-play.svg"
                          alt=""
                          className="video-play"
                        />
                      </div>
                    </div>

                    <div className="collection-video-details video-details">
                      <img
                        src={
                          isPlaying
                            ? "/img/ic-pause-40.svg"
                            : "/img/ic-play-40.svg"
                        }
                        alt=""
                        className={classNames("video-play", {
                          play: !isPlaying,
                          pause: isPlaying,
                        })}
                        onClick={togglePlay}
                      />
                      <img
                        src="/img/ic-expand2.svg"
                        alt=""
                        className="video-expand"
                        onClick={toggleFullscreen}
                      />
                      <button
                        type="button"
                        name="button"
                        className="video-shrink"
                        onClick={toggleFullscreen}
                      >
                        <img src="/img/ic-shrink2.svg" alt="shrink" />
                      </button>
                      <button type="button" className="video-close close">
                        <span aria-hidden="true">×</span>
                      </button>
                      <span className="video-duration">
                        {secondsToHms(introContent.duration)}
                      </span>
                      <p className="title">{introContent.title}</p>
                      <p className="description">{introContent.description}</p>
                    </div>
                  </div>
                </article>
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <p className="title-modules">Course Modules</p>
            </div>
            <div className="col-md-6 offset-md-3 col-12">
              <div className="" id="video-insighter-list">
                {data &&
                  data.chapters &&
                  data.chapters.map((chapter) => {
                    return (
                      <ChapterItem
                        key={chapter.sfid}
                        chapter={chapter}
                        playChapterAction={playChapterAction}
                      />
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
