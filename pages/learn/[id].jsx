/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { useRouter } from "next/router";
import { api, isSSR } from "@utils";
import classNames from "classnames";
import { withSSRContext } from "aws-amplify";
import HTMLEllipsis from "react-lines-ellipsis/lib/html";
import * as RemoveMarkdown from "remove-markdown";
import { NextSeo } from "next-seo";
import {
  useGlobalAudioPlayerContext,
  useGlobalAlertContext,
  useGlobalVideoPlayerContext,
  useGlobalModalContext,
} from "@contexts";
import { meditatePlayEvent, markFavoriteEvent } from "@service";
import { MODAL_TYPES } from "@constants";

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

  const router = useRouter();
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

  const renderChapter = (chapter) => {
    const desc = chapter.description ? RemoveMarkdown(chapter.description) : "";
    return (
      <div
        className={classNames("category-slide-item block", {
          viewed: chapter.isCompleted,
          next: chapter.isAccessible && !chapter.isCompleted,
        })}
        key={chapter.sfid}
      >
        <div className="insight-item-img">
          <img
            src={
              chapter.isCompleted
                ? "/img/ic-play-viewed.svg"
                : "/img/ic-play.svg"
            }
            alt=""
            className={classNames({
              "module-play": chapter.isAccessible && !chapter.isCompleted,
              "module-viewed": chapter.isCompleted,
            })}
            data-toggle="modal"
            data-target="#modal_video1"
          />
          <img
            src="/img/ic-info.svg"
            alt=""
            className="module-info"
            data-toggle="modal"
            data-target="#modal_module_details"
          />
        </div>
        <div className="insight-item-details">
          <p className="card-duration">
            <img src="/img/ic-video.svg" alt="" /> 2 mins
          </p>
          <h5 className="card-title">{chapter.title}</h5>
          <p className="card-text">
            <HTMLEllipsis
              unsafeHTML={desc}
              maxLine="2"
              ellipsis="..."
              basedOn="letters"
            />
          </p>
          <p className="read-more">Read More</p>
        </div>
      </div>
    );
  };

  const {
    subTitle,
    description,
    primaryTeacherName,
    primaryTeacherPic,
    title,
  } = data;

  return (
    <main className="background-image meditation">
      <section className="top-column meditation-page browse-category insight-collection insight-collection2">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-md-6 text-left">
              <p className="type-course">Course</p>
              <h1 className="course-name">{title}</h1>
              <p className="type-guide">
                <img src={primaryTeacherPic} alt="" />
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
                    <video
                      id="video-insighter"
                      src="http://html5videoformatconverter.com/data/images/happyfit2.mp4"
                      poster="http://html5videoformatconverter.com/data/images/screen.jpg"
                    ></video>
                    <div className="video-insighter-play">
                      <img
                        src="/img/ic-play.svg"
                        alt=""
                        className="video-play"
                      />
                    </div>
                  </div>
                  <div className="video-insighter-bar">
                    <div className="video-insighter-progress">
                      {/* <div className="loaded" style="width: 100%;"></div>
                      <div className="played" style="width: 0%;"></div> */}
                    </div>
                    <div className="video-time-hint"></div>
                  </div>
                  <div className="collection-video-details video-details">
                    <img
                      src="/img/ic-play-40.svg"
                      alt=""
                      className="video-play play"
                    />
                    <img
                      src="/img/ic-expand2.svg"
                      alt=""
                      className="video-expand"
                    />
                    <button
                      type="button"
                      name="button"
                      className="video-shrink"
                    >
                      <img src="/img/ic-shrink2.svg" alt="shrink" />
                    </button>
                    <button type="button" className="video-close close">
                      <span aria-hidden="true">×</span>
                    </button>
                    <span className="video-duration"></span>
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
                {data && data.chapters && data.chapters.map(renderChapter)}
                <div className="category-slide-item viewed">
                  <div className="insight-item-img">
                    <img
                      src="/img/ic-play-viewed.svg"
                      alt=""
                      className="module-viewed"
                      data-toggle="modal"
                      data-target="#modal_video1"
                    />
                    <img
                      src="/img/ic-info.svg"
                      alt=""
                      className="module-info"
                      data-toggle="modal"
                      data-target="#modal_module_details"
                    />
                  </div>
                  <div className="insight-item-details">
                    <p className="card-duration">
                      <img src="/img/ic-video.svg" alt="" /> 2 mins
                    </p>
                    <h5 className="card-title">Video that has been seen</h5>
                    <p className="card-text">
                      In this video, meet hapiness expert and celebrated author
                      Rajshee Patel and discover a new approach...
                    </p>
                    <p className="read-more">Read More</p>
                  </div>
                </div>
                <div className="category-slide-item next">
                  <div className="insight-item-img">
                    <img
                      src="/img/ic-play.svg"
                      alt=""
                      className="module-play"
                      data-toggle="modal"
                      data-target="#modal_video2"
                    />
                    <img
                      src="/img/ic-info.svg"
                      alt=""
                      className="module-info"
                      data-toggle="modal"
                      data-target="#modal_module_details"
                    />
                  </div>
                  <div className="insight-item-details">
                    <p className="card-duration">
                      <img src="/img/ic-video.svg" alt="" /> 16 mins
                    </p>
                    <h5 className="card-title">
                      Video that has to be watched next
                    </h5>
                    <p className="card-text">
                      In this video, meet hapiness expert and celebrated author
                      Rajshee Patel and discover a new approach to sleep.
                      Welcome and enjoy!
                    </p>
                    <p className="read-more">Read More</p>
                  </div>
                </div>
                <div className="category-slide-item block">
                  <div className="insight-item-img">
                    <img
                      src="/img/ic-play.svg"
                      alt=""
                      className="module-play"
                      data-toggle="modal"
                      data-target="#modal_video3"
                    />
                    <img
                      src="/img/ic-info.svg"
                      alt=""
                      className="module-info"
                      data-toggle="modal"
                      data-target="#modal_module_details"
                    />
                  </div>
                  <div className="insight-item-details">
                    <p className="card-duration">
                      <img src="/img/ic-video.svg" alt="" /> 16 mins
                    </p>
                    <h5 className="card-title">
                      Block with the short description
                    </h5>
                    <p className="card-text">
                      Very very short description in this block
                    </p>
                  </div>
                </div>
                <div className="category-slide-item block">
                  <div className="insight-item-img">
                    <img
                      src="/img/ic-play.svg"
                      alt=""
                      className="module-play"
                      data-toggle="modal"
                      data-target="#modal_video4"
                    />
                    <img
                      src="/img/ic-info.svg"
                      alt=""
                      className="module-info"
                      data-toggle="modal"
                      data-target="#modal_module_details"
                    />
                  </div>
                  <div className="insight-item-details">
                    <p className="card-duration">
                      <img src="/img/ic-video.svg" alt="" /> 16 mins
                    </p>
                    <h5 className="card-title">Expanded block</h5>
                    <p className="card-text">
                      In this video, meet hapiness expert and celebrated author
                      Rajshee Patel and discover a new approach to sleep.
                      Welcome and enjoy! In this video, meet hapiness expert and
                      celebrated author Rajshee Patel and discover a new
                      approach to sleep. Welcome and enjoy! In this video, meet
                      hapiness expert and celebrated author Rajshee Patel and
                      discover a new approach to sleep. Welcome and enjoy!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
