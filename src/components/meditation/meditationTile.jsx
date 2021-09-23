import React from "react";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { useGlobalModalContext, useGlobalAlertContext } from "@contexts";
import { MODAL_TYPES, ALERT_TYPES, ABBRS } from "@constants";
import { api } from "@utils";
import classNames from "classnames";

const timeConvert = (data) => {
  const minutes = data % 60;
  const hours = (data - minutes) / 60;

  return String(hours).padStart(2, 0) + ":" + String(minutes).padStart(2, 0);
};

export const MeditationTile = ({
  data,
  authenticated,
  markFavorite,
  meditateClickHandle,
  additionalClass,
}) => {
  const { showModal } = useGlobalModalContext();
  const { showAlert } = useGlobalAlertContext();
  const {
    title,
    description,
    coverImage,
    totalActivities,
    accessible,
    category,
    liveMeetingStartDateTime,
    liveMeetingDuration,
    duration,
    isFavorite,
    isFree,
    primaryTeacherName,
  } = data || {};

  const markFavoriteAction = async () => {
    if (!authenticated) {
      showModal(MODAL_TYPES.LOGIN_MODAL);
    } else {
      await markFavorite();
    }
  };

  const meditateClickAction = async () => {
    if (!authenticated) {
      showModal(MODAL_TYPES.LOGIN_MODAL);
    } else {
      await meditateClickHandle();
    }
  };

  return (
    <div className="col-6 col-lg-3 col-md-4">
      <div
        className={classNames(
          "upcoming_course_card newCard-new",
          additionalClass,
        )}
        data-full={false}
        data-complete={false}
        style={{
          background: `url(${
            coverImage ? coverImage.url : "/img/card-1a.png"
          }) no-repeat center/cover`,
        }}
      >
        <div className="course_dat">
          <span className="duration duration-time-txt">
            {timeConvert(duration)}
          </span>
          {!accessible && (
            <span className="lock collection-lock">
              {" "}
              <img src={Lock} />{" "}
            </span>
          )}
        </div>
        {accessible && (
          <div
            onClick={markFavoriteAction}
            className={isFavorite ? "course-like liked" : "course-like"}
          ></div>
        )}
        <div className="forClick" onClick={meditateClickAction}></div>
        <div className="card-title-bxs">
          <div className="course_name">{title}</div>
          <div className="course_place">{primaryTeacherName}</div>
        </div>
      </div>
    </div>
  );
};
