import React from "react";
import moment from "moment";
import { useEmblaCarousel } from "embla-carousel/react";
import { ABBRS } from "@constants";
import { tConvert } from "@utils";
import { COURSE_TYPES } from "@constants";

export const EventList = ({ isMobile, workshops }) => {
  const [emblaRef] = useEmblaCarousel({
    loop: false,
    align: "center",
  });
  if (isMobile) {
    return (
      <div ref={emblaRef}>
        <div className="embla__container">
          {workshops.map(renderEventMobile)}
        </div>
      </div>
    );
  }
  return <>{workshops.map(renderEvent)}</>;
};

const renderEventMobile = (workshop) => {
  const {
    sfid,
    title,
    coverImage,
    accessible,
    city,
    state,
    mode,
    isPurchased,
    isEventFull,
    primaryTeacherName,
    productTypeId,
    eventStartDate,
    eventEndDate,
    eventType,
    meetupDuration,
    meetupType,
    meetupStartDate,
    meetupStartTime,
    meetupTimeZone,
    meetupTitle,
  } = workshop || {};

  const isSKYType =
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(productTypeId) >= 0;
  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(productTypeId) >= 0;
  const isSahajSamadhiMeditationType =
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(productTypeId) >= 0;

  let imageSrc = null;
  if (eventType === "Meetup") {
    const updateMeetupDuration = meetupDuration.replace(/Minutes/g, "Min");
    switch (meetupType) {
      case "Short SKY Meditation Meetup":
        imageSrc = "/img/filter-card-1@2x.png";
        break;
      case "Guided Meditation Meetup":
        imageSrc = "/img/filter-card-2@2x.png";
        break;
      default:
        imageSrc = "/img/filter-card-1@2x.png";
        break;
    }
    return (
      <div className="embla__slide">
        <div className="profile-body_mobile__course">
          <img
            src={imageSrc}
            alt="bg"
            className="profile-body_mobile__course-img"
          />
          <div className="profile-body_mobile__course-date">
            {`${moment.utc(meetupStartDate).format("MMM DD")}, `}
            {`${tConvert(meetupStartTime)} ${ABBRS[meetupTimeZone]}, `}
            {`${updateMeetupDuration}`}
          </div>
          <div className="profile-body_mobile__course-detail">
            <h4>{mode}</h4>
            <h2>{meetupTitle}</h2>
            <h3>{primaryTeacherName}</h3>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="embla__slide" key={sfid}>
        <div className="profile-body_mobile__course">
          {isSilentRetreatType && (
            <img
              className="profile-body_mobile__course-img"
              src="/img/course-card-4.png"
              alt="bg"
            />
          )}
          {isSKYType && (
            <img
              className="profile-body_mobile__course-img"
              src="/img/course-card-2.png"
              alt="bg"
            />
          )}
          {isSahajSamadhiMeditationType && (
            <img
              className="profile-body_mobile__course-img"
              src="/img/course-card-5.png"
              alt="bg"
            />
          )}
          {isSilentRetreatType && isSKYType && isSahajSamadhiMeditationType && (
            <img
              className="profile-body_mobile__course-img"
              src="/img/course-card-1.png"
              alt="bg"
            />
          )}
          {moment
            .utc(eventStartDate)
            .isSame(moment.utc(eventEndDate), "month") && (
            <div className="profile-body_mobile__course-date">
              {`${moment.utc(eventStartDate).format("MMMM DD")}-${moment
                .utc(eventEndDate)
                .format("DD, YYYY")}`}
            </div>
          )}
          {!moment
            .utc(eventStartDate)
            .isSame(moment.utc(eventEndDate), "month") && (
            <div className="profile-body_mobile__course-date">
              {`${moment.utc(eventStartDate).format("MMMM DD")}-${moment
                .utc(eventEndDate)
                .format("MMMM DD, YYYY")}`}
            </div>
          )}
          <div className="profile-body_mobile__course-detail">
            <h4>{mode}</h4>
            <h2>{title}</h2>
            <h3>{primaryTeacherName}</h3>
          </div>
        </div>
      </div>
    );
  }
};

const renderEvent = (workshop) => {
  const {
    sfid,
    title,
    meetupTitle,
    coverImage,
    accessible,
    city,
    state,
    mode,
    isOnlineMeetup,
    isPurchased,
    isEventFull,
    primaryTeacherName,
    productTypeId,
    eventStartDate,
    eventEndDate,
    eventType,
    contactPersonName1,
    meetupStartDateTimeGMT,
    meetupStartDate,
    meetupStartTime,
    meetupTimeZone,
    eventTimeZone,
    meetupDuration,
    meetupType,
  } = workshop || {};

  let imageSrc = null;

  const isSKYType =
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(productTypeId) >= 0;
  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(productTypeId) >= 0;
  const isSahajSamadhiMeditationType =
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(productTypeId) >= 0;

  if (eventType === "Meetup") {
    const updateMeetupDuration = meetupDuration.replace(/Minutes/g, "Min");
    switch (meetupType) {
      case "Short SKY Meditation Meetup":
        imageSrc = "/img/filter-card-1@2x.png";
        break;
      case "Guided Meditation Meetup":
        imageSrc = "/img/filter-card-2@2x.png";
        break;
      default:
        imageSrc = "/img/filter-card-1@2x.png";
        break;
    }
    return (
      <div className="col-6 col-lg-3 col-md-4" key={sfid}>
        <div className="profile-body__card tw-bg-transparent">
          <img src={imageSrc} alt="bg" className="profile-body__card-img" />
          <div className="profile-body__card-date">
            {`${moment.utc(meetupStartDate).format("MMM DD")}, `}
            {`${tConvert(meetupStartTime)} ${ABBRS[meetupTimeZone]}, `}
            {`${updateMeetupDuration}`}
          </div>
          <div className="course_info">
            <div className="course_status">{mode}</div>
            <div className="course_name">{meetupTitle}</div>
            <div className="course_place">{primaryTeacherName}</div>
          </div>
        </div>
      </div>
    );
  } else {
    if (isSilentRetreatType) {
      imageSrc = "/img/course-card-4.png";
    } else if (isSKYType) {
      imageSrc = "/img/course-card-2.png";
    } else if (isSahajSamadhiMeditationType) {
      imageSrc = "/img/course-card-5.png";
    } else {
      imageSrc = "/img/course-card-1.png";
    }
    return (
      <div className="col-6 col-lg-3 col-md-4" key={sfid}>
        <div className="profile-body__card !tw-bg-transparent">
          <img src={imageSrc} alt="bg" className="profile-body__card-img" />
          {moment
            .utc(eventStartDate)
            .isSame(moment.utc(eventEndDate), "month") && (
            <div className="profile-body__card-date">
              {`${moment.utc(eventStartDate).format("MMMM DD")}-${moment
                .utc(eventEndDate)
                .format("DD, YYYY")}`}
            </div>
          )}
          {!moment
            .utc(eventStartDate)
            .isSame(moment.utc(eventEndDate), "month") && (
            <div className="profile-body__card-date">
              {`${moment.utc(eventStartDate).format("MMMM DD")}-${moment
                .utc(eventEndDate)
                .format("MMMM DD, YYYY")}`}
            </div>
          )}
          <div className="course_info">
            <div className="course_status">{mode}</div>
            <div className="course_name">{title}</div>
            <div className="course_place">{primaryTeacherName}</div>
          </div>
        </div>
      </div>
    );
  }
};
