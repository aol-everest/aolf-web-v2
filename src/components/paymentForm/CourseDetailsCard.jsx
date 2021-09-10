import React, { useState } from "react";
import moment from "moment";
import classNames from "classnames";
import NumberFormat from "react-number-format";
import renderHTML from "react-render-html";
import { ABBRS, COURSE_MODES } from "@constants";
import { Popup } from "@components";
import { LinkedCalendar } from "@components/dateRangePicker";
import { tConvert } from "@utils";

export const CourseDetailsCard = ({ workshop, ...rest }) => {
  const {
    eventStartDate,
    eventEndDate,
    email,
    phone1,
    phone2,
    timings,
    primaryTeacherName,
    coTeacher1Name,
    coTeacher2Name,
    notes,
    streetAddress1,
    streetAddress2,
    state,
    city,
    country,
    productTypeId,
    mode,
    corporateName,
  } = workshop || {};

  return (
    <div className="reciept__details">
      <div className="course">
        <div className="course__photo" style={{ minWidth: "98px" }}>
          <img src="/img/rectangle.png" alt="course-photo" />
        </div>
        <div className="course__info info">
          <ul className="info__list">
            <h2 className="info__title">Date:</h2>
            {moment
              .utc(eventStartDate)
              .isSame(moment.utc(eventEndDate), "month") && (
              <li>{`${moment.utc(eventStartDate).format("MMMM DD")}-${moment
                .utc(eventEndDate)
                .format("DD, YYYY")}`}</li>
            )}
            {!moment
              .utc(eventStartDate)
              .isSame(moment.utc(eventEndDate), "month") && (
              <li>{`${moment.utc(eventStartDate).format("MMMM DD")}-${moment
                .utc(eventEndDate)
                .format("MMMM DD, YYYY")}`}</li>
            )}
          </ul>
          <ul className="info__list mt-3">
            <h2 className="info__title">Timings:</h2>
            {timings &&
              timings.map((time) => {
                return (
                  <li key={time.startDate}>
                    {`${moment.utc(time.startDate).format("dd")}: ${tConvert(
                      time.startTime,
                    )}-${tConvert(time.endTime)} ${ABBRS[time.timeZone]}`}
                  </li>
                );
              })}
          </ul>
          <ul className="info__list mt-3">
            <h2 className="info__title">Instructor(s):</h2>
            {primaryTeacherName && <li>{primaryTeacherName}</li>}
            {coTeacher1Name && <li>{coTeacher1Name}</li>}
            {coTeacher2Name && <li>{coTeacher2Name}</li>}
          </ul>
          <ul className="info__list mt-3">
            <h2 className="info__title">Contact details:</h2>
            <li>
              <a href={`tel:${phone1}`}>
                <NumberFormat
                  value={phone1}
                  displayType={"text"}
                  format="+1 (###) ###-####"
                ></NumberFormat>
              </a>
            </li>
            {phone2 && (
              <li>
                <a href={`tel:${phone2}`}>
                  <NumberFormat
                    value={phone2}
                    displayType={"text"}
                    format="+1 (###) ###-####"
                  ></NumberFormat>
                </a>
              </li>
            )}
            <li>
              <a href={`mailto:${email}`}>{email}</a>
            </li>
          </ul>
          {mode === COURSE_MODES.IN_PERSON && (
            <ul className="course-details__list">
              <h2 className="course-details__title">Location:</h2>
              <li>
                {" "}
                {`${streetAddress1 || ""} ${streetAddress2 || ""}, ${
                  city || ""
                }, ${country || ""}`}
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsCard;
