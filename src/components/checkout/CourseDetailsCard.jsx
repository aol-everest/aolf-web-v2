import React, { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import NumberFormat from "react-number-format";
import { ABBRS, COURSE_MODES, COURSE_TYPES } from "@constants";
import { tConvert } from "@utils";
import Image from "next/image";

dayjs.extend(utc);

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
    isGenericWorkshop,
  } = workshop || {};

  const isSKYType =
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(productTypeId) >= 0;
  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(productTypeId) >= 0;
  const isSahajSamadhiMeditationType =
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(productTypeId) >= 0;

  return (
    <div className="reciept__details">
      <div className="course">
        <div className="course__photo tw-max-w-[98px] tw-h-[98px] tw-relative">
          {isSilentRetreatType && (
            <Image
              src="/img/course-card-4.png"
              alt="course-photo"
              layout="fill"
            />
          )}
          {isSKYType && (
            <Image
              src="/img/course-card-2.png"
              alt="course-photo"
              layout="fill"
            />
          )}
          {isSahajSamadhiMeditationType && (
            <Image
              src="/img/course-card-5.png"
              alt="course-photo"
              layout="fill"
            />
          )}
          {!isSilentRetreatType &&
            !isSKYType &&
            !isSahajSamadhiMeditationType && (
              <Image
                src="/img/course-card-1.png"
                alt="course-photo"
                layout="fill"
              />
            )}
        </div>
        <div className="course__info info tw-max-w-[190px]">
          {!isGenericWorkshop && (
            <>
              <ul className="info__list">
                <h2 className="info__title">Date:</h2>
                {dayjs
                  .utc(eventStartDate)
                  .isSame(dayjs.utc(eventEndDate), "month") && (
                  <li className="tw-text-sm tw-truncate tw-tracking-tighter">{`${dayjs
                    .utc(eventStartDate)
                    .format("MMMM DD")}-${dayjs
                    .utc(eventEndDate)
                    .format("DD, YYYY")}`}</li>
                )}
                {!dayjs
                  .utc(eventStartDate)
                  .isSame(dayjs.utc(eventEndDate), "month") && (
                  <li className="tw-text-sm tw-truncate tw-tracking-tighter">{`${dayjs
                    .utc(eventStartDate)
                    .format("MMMM DD")}-${dayjs
                    .utc(eventEndDate)
                    .format("MMMM DD, YYYY")}`}</li>
                )}
              </ul>
              <ul className="info__list mt-3">
                <h2 className="info__title">Timings:</h2>
                {timings &&
                  timings.map((time) => {
                    return (
                      <li
                        className="tw-text-sm tw-truncate tw-tracking-tighter"
                        key={time.startDate}
                      >
                        {`${dayjs.utc(time.startDate).format("dd")}: ${tConvert(
                          time.startTime,
                        )}-${tConvert(time.endTime)} ${ABBRS[time.timeZone]}`}
                      </li>
                    );
                  })}
              </ul>
            </>
          )}
          <ul className="info__list mt-3">
            <h2 className="info__title">Instructor(s):</h2>
            {primaryTeacherName && (
              <li className="tw-text-sm tw-truncate tw-tracking-tighter">
                {primaryTeacherName}
              </li>
            )}
            {coTeacher1Name && (
              <li className="tw-text-sm tw-truncate tw-tracking-tighter">
                {coTeacher1Name}
              </li>
            )}
            {coTeacher2Name && (
              <li className="tw-text-sm tw-truncate tw-tracking-tighter">
                {coTeacher2Name}
              </li>
            )}
          </ul>
          <ul className="info__list mt-3">
            <h2 className="info__title">Contact details:</h2>
            <li className="tw-text-sm tw-truncate tw-tracking-tighter">
              <a href={`tel:${phone1}`}>
                <NumberFormat
                  value={phone1}
                  displayType={"text"}
                  format="+1 (###) ###-####"
                ></NumberFormat>
              </a>
            </li>
            {phone2 && (
              <li className="tw-text-sm tw-truncate tw-tracking-tighter">
                <a href={`tel:${phone2}`}>
                  <NumberFormat
                    value={phone2}
                    displayType={"text"}
                    format="+1 (###) ###-####"
                  ></NumberFormat>
                </a>
              </li>
            )}
            <li className="tw-text-sm tw-truncate tw-tracking-tighter">
              <a href={`mailto:${email}`}>{email}</a>
            </li>
          </ul>
          {mode === COURSE_MODES.IN_PERSON.name && (
            <>
              {!workshop.isLocationEmpty && (
                <ul className="info__list mt-3">
                  <h2 className="info__title">Location:</h2>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${
                      workshop.locationStreet || ""
                    }, ${workshop.locationCity} ${workshop.locationProvince} ${
                      workshop.locationPostalCode
                    } ${workshop.locationCountry}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {workshop.locationStreet && (
                      <li className="tw-text-sm tw-truncate tw-tracking-tighter">
                        {workshop.locationStreet}
                      </li>
                    )}
                    <li className="tw-text-sm tw-truncate tw-tracking-tighter">
                      {workshop.locationCity || ""}
                      {", "}
                      {workshop.locationProvince || ""}{" "}
                      {workshop.locationPostalCode || ""}
                    </li>
                  </a>
                </ul>
              )}
              {workshop.isLocationEmpty && (
                <ul className="info__list mt-3">
                  <h2 className="info__title">Location:</h2>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${
                      workshop.streetAddress1 || ""
                    },${workshop.streetAddress2 || ""} ${workshop.city} ${
                      workshop.state
                    } ${workshop.zip} ${workshop.country}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {workshop.streetAddress1 && (
                      <li className="tw-text-sm tw-truncate tw-tracking-tighter">
                        {workshop.streetAddress1}
                      </li>
                    )}
                    {workshop.streetAddress2 && (
                      <li className="tw-text-sm tw-truncate tw-tracking-tighter">
                        {workshop.streetAddress2}
                      </li>
                    )}
                    <li className="tw-text-sm tw-truncate tw-tracking-tighter">
                      {workshop.city || ""}
                      {", "}
                      {workshop.state || ""} {workshop.zip || ""}
                    </li>
                  </a>
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsCard;
