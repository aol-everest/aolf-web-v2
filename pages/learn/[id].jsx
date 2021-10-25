/* eslint-disable react/no-unescaped-entities */
import React, { useState, useRef } from "react";
import { useRouter } from "next/router";
import { api, isSSR } from "@utils";
import classNames from "classnames";
import { withSSRContext } from "aws-amplify";
import { NextSeo } from "next-seo";
import {
  useGlobalAudioPlayerContext,
  useGlobalAlertContext,
  useGlobalVideoPlayerContext,
  useGlobalModalContext,
} from "@contexts";
import { meditatePlayEvent, markFavoriteEvent } from "@service";
import { MODAL_TYPES, ALERT_TYPES } from "@constants";
import { ChapterItem } from "@components/content";
import { updateUserActivity } from "@service";
import { Loader } from "@components";
import {
  Player,
  ControlBar,
  ReplayControl,
  ForwardControl,
  CurrentTimeDisplay,
  TimeDivider,
  PlaybackRateMenuButton,
  VolumeMenuButton,
  LoadingSpinner,
  BigPlayButton,
  PlayToggle,
  FullscreenToggle,
} from "video-react";
import Styles from "./Learn.module.scss";

export const getServerSideProps = async (context) => {
  const { id } = context.query;
  let props = {};
  let token = "";
  try {
    const { Auth } = await withSSRContext(context);
    const user = await Auth.currentAuthenticatedUser();
    token = user.signInUserSession.idToken.jwtToken;
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

  console.log(data);

  props = {
    ...props,
    data,
  };
  // Pass data to the page via props
  return { props };
};

export default function Learn({ data, authenticated, token }) {
  console.log(data);
  const {
    sfid,
    subTitle,
    description,
    primaryTeacherName,
    primaryTeacherPic,
    title,
  } = data;

  const router = useRouter();
  const playerEl = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showModal } = useGlobalModalContext();
  const { showAlert } = useGlobalAlertContext();
  const { showPlayer, hidePlayer } = useGlobalAudioPlayerContext();
  const { showVideoPlayer } = useGlobalVideoPlayerContext();

  const markFavorite = (meditate) => async (e) => {
    if (e) e.preventDefault();
    if (!authenticated) {
      showModal(MODAL_TYPES.LOGIN_MODAL);
    } else {
      await markFavoriteEvent({ meditate, refetch: null, token });
    }
  };

  const purchaseMembershipAction = (id) => (e) => {
    router.push(`/membership/${id}`);
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
        token,
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
          showVideoPlayer({
            track: {
              title: chapterDetails.title,
              artist: chapterDetails.teacher?.name,
              image: chapterDetails.coverImage?.url,
              audioSrc: chapterDetails.track?.url,
              description: chapterDetails.description,
            },
          });
        }
        await updateUserActivity(token, {
          contentSfid: chapterDetails.sfid,
        });
      }
    } catch (error) {
      console.log(error);
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: error.message,
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
              <p className="course-description">{subTitle}</p>

              <div className="accordion" id="accordionExample">
                <div className="card">
                  <div className="card-header" id="headingOne">
                    <h2 className="mb-0">
                      <button
                        className="btn btn-link btn-block text-left"
                        type="button"
                        data-toggle="collapse"
                        data-target="#collapseOne"
                        aria-expanded="true"
                        aria-controls="collapseOne"
                      >
                        What You'll Learn
                      </button>
                    </h2>
                  </div>
                  <div
                    id="collapseOne"
                    className="collapse show"
                    aria-labelledby="headingOne"
                    data-parent="#accordionExample"
                  >
                    <div className="card-body">
                      <ul>
                        <li>
                          Those who are looking for a deeper understanding of
                          the Pranayama technique.
                        </li>
                        <li>
                          Those who have a Science slant of mind and are curious
                          to know the Why behind the What.
                        </li>
                        <li>The sincere YOGA practitioner.</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header" id="headingTwo">
                    <h2 className="mb-0">
                      <button
                        className="btn btn-link btn-block text-left collapsed"
                        type="button"
                        data-toggle="collapse"
                        data-target="#collapseTwo"
                        aria-expanded="false"
                        aria-controls="collapseTwo"
                      >
                        Who is it for?
                      </button>
                    </h2>
                  </div>
                  <div
                    id="collapseTwo"
                    className="collapse"
                    aria-labelledby="headingTwo"
                    data-parent="#accordionExample"
                  >
                    <div className="card-body">
                      <ul>
                        <li>
                          Those who are looking for a deeper understanding of
                          the Pranayama technique.
                        </li>
                        <li>
                          Those who have a Science slant of mind and are curious
                          to know the Why behind the What.
                        </li>
                        <li>The sincere YOGA practitioner.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 d-flex justify-content-end">
              <article className="collection-video">
                <div className="video-player">
                  <div className="video-insighter-container">
                    <Player
                      ref={playerEl}
                      poster="http://html5videoformatconverter.com/data/images/screen.jpg"
                      onPlay={onPlayPauseAction}
                      onPause={onPlayPauseAction}
                    >
                      <source src="http://html5videoformatconverter.com/data/images/happyfit2.mp4" />
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
                    <span className="video-duration">1 min 37 seconds</span>
                    <p className="title">Welcome and Intro</p>
                    <p className="description">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                      sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua.
                    </p>
                  </div>
                </div>
              </article>
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
