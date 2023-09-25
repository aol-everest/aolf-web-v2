/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-irregular-whitespace */
import { AddToCalendarModal, PageLoading } from "@components";
import {
  InPersonGenericCourse,
  OnlineCourse,
  SKYBreathMeditation,
  SahajSamadhi,
  SilentRetreat,
} from "@components/coursethankYouDetails";
import { ABBRS, ALERT_TYPES, COURSE_MODES, COURSE_TYPES } from "@constants";
import { useGlobalAlertContext } from "@contexts";
import { orgConfig } from "@org";
import { pushRouteWithUTMQuery } from "@service";
import { api, calculateBusinessDays, tConvert } from "@utils";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import moment from "moment";
import { NextSeo } from "next-seo";
import ErrorPage from "next/error";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { useQueryString } from "@hooks";
import { useEffectOnce } from "react-use";
import { useAnalytics } from "use-analytics";

dayjs.extend(utc);
dayjs.extend(localizedFormat);

const renderVideo = (productTypeId) => {
  switch (productTypeId) {
    case "811570":
    case "1001309":
    case "1008432":
      return (
        <iframe
          src="https://player.vimeo.com/video/432237531"
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; fullscreen"
          allowFullScreen
        ></iframe>
      );
    case "811569":
      return (
        <iframe
          src="https://player.vimeo.com/video/411549679"
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; fullscreen"
          allowFullScreen
        ></iframe>
      );
    case "999649":
      return (
        <img
          src="/img/SahajSamadhi.png"
          alt="course img"
          className="img-fluid"
        />
      );
    default:
      return (
        <img src="/img/image@3x.png" alt="course img" className="img-fluid" />
      );
  }
};

const Thankyou = () => {
  const router = useRouter();
  const { track, page } = useAnalytics();
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const [paymentIntent] = useQueryString("payment_intent");
  const [courseType] = useQueryString("courseType");
  const { id: workshopId } = router.query;
  const {
    data: workshop,
    isLoading,
    isError,
    error,
  } = useQuery(
    "workshopDetail",
    async () => {
      const response = await api.get({
        path: "workshopDetail",
        param: {
          id: workshopId,
          rp: "checkout",
        },
        isUnauthorized: true,
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!workshopId,
    },
  );

  useEffectOnce(() => {
    page({
      category: "course_registration",
      name: "course_registration_thank_you",
      payment_intent: paymentIntent,
      course_type: courseType,
      referral: "course_scheduling_checkout",
    });
  });

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !workshopId) return <PageLoading />;

  const {
    title,
    meetupTitle,
    productTypeId,
    unitPrice,
    id: courseId,
    formattedStartDateOnly,
    formattedEndDateOnly,
    shortAddress,
    primaryTeacherName,
    primaryTeacherSfid,
    eventStartDate,
    eventEndDate,
    phone1,
    email,
    timings,
    isGenericWorkshop,
    streetAddress1,
    streetAddress2,
    city,
    country,
    eventStartTime,
    eventEndTime,
    meetupStartDate,
    meetupStartTime,
    meetupStartDateTimeGMT,
    eventTimeZone,
    eventType,
    eventendDateTimeGMT,
    eventStartDateTimeGMT,
    mode,
    availableBundles,
  } = workshop;

  const isSKYType =
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(productTypeId) >= 0;
  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(productTypeId) >= 0;
  const isSahajSamadhiMeditationType =
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(productTypeId) >= 0;

  const isMeditationDeluxe =
    COURSE_TYPES.MEDITATION_DELUXE_COURSE.value === productTypeId;
  const gatewayToInfinity =
    COURSE_TYPES.GATEWAY_TO_INFINITY_COURSE.value === productTypeId;

  const newTitle = title || meetupTitle;
  const duration = 2;

  let startDatetime = null;
  if (eventStartDateTimeGMT) {
    startDatetime = moment.utc(`${eventStartDateTimeGMT || ""}`);
  } else if (eventStartDate) {
    startDatetime = moment.utc(
      `${eventStartDate || ""} ${eventStartTime || ""}`,
    );
  } else {
    startDatetime = moment.utc(`${meetupStartDateTimeGMT || ""}`);
  }
  let endDatetime = null;
  if (eventendDateTimeGMT) {
    endDatetime = moment.utc(`${eventendDateTimeGMT || ""}`);
  } else if (eventEndDate) {
    endDatetime = moment.utc(`${eventEndDate || ""} ${eventEndTime || ""}`);
  } else {
    endDatetime = moment.utc(`${meetupStartDateTimeGMT || ""}`).add(2, "hours");
  }

  const event = {
    timezone: "Etc/GMT",
    description: newTitle,
    duration,
    endDatetime: endDatetime.format("YYYYMMDDTHHmmss"),
    location: `${streetAddress1 || ""} ${streetAddress2 || ""} ${city || ""} ${
      country || ""
    }`,
    startDatetime: startDatetime.format("YYYYMMDDTHHmmss"),
    title: newTitle,
  };

  const addToCalendarAction = (e) => {
    if (e) e.preventDefault();
    showAlert(ALERT_TYPES.CUSTOM_ALERT, {
      title: "Add to Calendar",

      children: <AddToCalendarModal event={event} />,
      closeModalAction: () => {
        hideAlert();
      },
    });

    track("click_button", {
      screen_name: "course_registration_thank_you",
      event_target: "add_to_calendar_button",
      course_type: courseType,
      payment_intent: paymentIntent,
      referral: "course_scheduling_checkout",
    });
  };

  const showTiming = (timeZone, option) => {
    let weekdayTiming = (
      <p className="program_card_subtitle c_text c_timing">
        {option.weekdayStartTime} - {option.weekdayEndTime} {timeZone}{" "}
        {option.weekendStartTime &&
          calculateBusinessDays(
            dayjs.utc(option.startDate),
            dayjs.utc(option.endDate),
          ).weekday}
      </p>
    );
    let weekendTiming = option.weekendStartTime && (
      <p className="program_card_subtitle c_text c_timing">
        {option.weekendStartTime} - {option.weekendEndTime} {timeZone}{" "}
        {
          calculateBusinessDays(
            dayjs.utc(option.startDate),
            dayjs.utc(option.endDate),
          ).weekend
        }
      </p>
    );
    if (
      dayjs.utc(option.startDate).day() === 0 ||
      dayjs.utc(option.startDate).day() === 6
    ) {
      return (
        <>
          {weekendTiming}
          {weekdayTiming}
        </>
      );
    } else {
      return (
        <>
          {weekdayTiming}
          {weekendTiming}
        </>
      );
    }
  };

  const getSelectedTimeSlotDetails = (selectedTimeSlot) => {
    if (selectedTimeSlot) {
      return (
        <>
          <p className="program_card_subtitle c_text">
            {dayjs.utc(selectedTimeSlot.startDate).format("MMM D") +
              " - " +
              dayjs.utc(selectedTimeSlot.endDate).format("D, YYYY")}
          </p>
          <>{showTiming(selectedTimeSlot.timeZone, selectedTimeSlot)}</>
        </>
      );
    }
    return null;
  };

  const RenderJourneyContent = () => {
    if (mode === COURSE_MODES.IN_PERSON.name) {
      if (isSilentRetreatType) {
        return <SilentRetreat />;
      }
      if (isSKYType) {
        return <SKYBreathMeditation />;
      }
      if (isSahajSamadhiMeditationType) {
        return <SahajSamadhi />;
      }
      return <InPersonGenericCourse />;
    }
    return <OnlineCourse />;
  };

  const handleSecondCourseRedirection = () => {
    const secondCourseType = isSKYType
      ? "SAHAJ_SAMADHI_MEDITATION"
      : "SKY_BREATH_MEDITATION";

    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/course`,
      query: {
        instructor: JSON.stringify({
          value: primaryTeacherSfid,
          label: primaryTeacherName,
        }),
        courseType: secondCourseType,
      },
    });
  };

  const iosAppDownloadAction = () => {
    track("click_button", {
      screen_name: "course_registration_thank_you",
      event_target: "ios_app_link",
      course_type: courseType,
      payment_intent: paymentIntent,
      referral: "course_scheduling_checkout",
    });
  };

  const androidAppDownloadAction = () => {
    track("click_button", {
      screen_name: "course_registration_thank_you",
      event_target: "android_app_link",
      course_type: courseType,
      payment_intent: paymentIntent,
      referral: "course_scheduling_checkout",
    });
  };

  return (
    <>
      <main>
        <NextSeo
          noindex={true}
          nofollow={true}
          robotsProps={{
            nosnippet: true,
            notranslate: true,
            noimageindex: true,
            noarchive: true,
            maxSnippet: -1,
            maxImagePreview: "none",
            maxVideoPreview: -1,
          }}
        />

        {!isSahajSamadhiMeditationType && (
          <>
            <section className="get-started">
              <div className="container-md">
                <div className="row align-items-center">
                  <div className="col-lg-5 col-md-12 p-md-0">
                    <div className="get-started__info">
                      <h3 className="get-started__subtitle">You’re going!</h3>
                      <h1 className="get-started__title section-title">
                        {title}
                      </h1>
                      <p className="get-started__text">
                        You're registered for the {title}{" "}
                        {!isGenericWorkshop &&
                          !isMeditationDeluxe &&
                          !gatewayToInfinity && (
                            <>
                              {" "}
                              from {formattedStartDateOnly} -{" "}
                              {formattedEndDateOnly}
                            </>
                          )}
                      </p>
                      {!isGenericWorkshop &&
                        !isMeditationDeluxe &&
                        !gatewayToInfinity && (
                          <a
                            className="get-started__link"
                            href="#"
                            onClick={addToCalendarAction}
                          >
                            Add to Calendar
                          </a>
                        )}

                      <p className="get-started__text">
                        Next step: You will receive an email with details about
                        your {title}.
                      </p>
                    </div>
                    {orgConfig.name !== "HB" && (
                      <>
                        <p className="get-started__text">
                          <br />
                          To get started, download the app.{" "}
                          {isGenericWorkshop && (
                            <>
                              <span>
                                We will reach out to schedule dates for your
                                course.
                              </span>
                            </>
                          )}
                        </p>
                        <div className="btn-wrapper">
                          <a
                            className="btn-outline tw-mr-2"
                            onClick={iosAppDownloadAction}
                            href="https://apps.apple.com/us-en/app/art-of-living-journey/id1469587414?ls=1"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img src="/img/ic-apple.svg" alt="apple" />
                            iOS App
                          </a>
                          <a
                            className="btn-outline"
                            onClick={androidAppDownloadAction}
                            href="https://play.google.com/store/apps/details?id=com.aol.app"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img src="/img/ic-android.svg" alt="android" />
                            Android App
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="col-lg-6 col-md-12 offset-lg-1 p-0">
                    <div className="get-started__video">
                      {renderVideo(productTypeId)}
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className="journey-starts !tw-mb-0">
              <div className="container">
                {!isMeditationDeluxe && !gatewayToInfinity && (
                  <>
                    <h2 className="journey-starts__title section-title">
                      Your journey starts here
                    </h2>
                    <RenderJourneyContent />
                  </>
                )}
              </div>
            </section>
          </>
        )}
      </main>
      <div className="course-bottom-card show">
        <div className="container">
          <div className="course-bottom-card__container">
            <div className="course-bottom-card__info-block">
              <div className="course-bottom-card__img d-none d-lg-block tw-relative tw-h-[60px] tw-max-w-[60px]">
                {isSilentRetreatType && (
                  <img
                    src="/img/course-card-4.png"
                    alt="course-photo"
                    layout="fill"
                  />
                )}
                {isSKYType && (
                  <img
                    src="/img/course-card-2.png"
                    alt="course-photo"
                    layout="fill"
                  />
                )}
                {isSahajSamadhiMeditationType && (
                  <img
                    src="/img/course-card-5.png"
                    alt="course-photo"
                    layout="fill"
                  />
                )}
                {!isSilentRetreatType &&
                  !isSKYType &&
                  !isSahajSamadhiMeditationType && (
                    <img
                      src="/img/course-card-1.png"
                      alt="course-photo"
                      layout="fill"
                    />
                  )}
              </div>
              <div className="course-bottom-card__info">
                {!isGenericWorkshop &&
                  !isMeditationDeluxe &&
                  !gatewayToInfinity && (
                    <p>
                      {dayjs.utc(eventStartDate).format("MMMM D") +
                        " - " +
                        dayjs.utc(eventEndDate).format("MMMM D") +
                        ", " +
                        dayjs.utc(eventEndDate).format("YYYY")}
                    </p>
                  )}
                <div>
                  <h3>{title}</h3>
                </div>
              </div>
            </div>
            {!isMeditationDeluxe && !gatewayToInfinity && (
              <button
                id="register-button-2"
                className="btn-secondary"
                onClick={addToCalendarAction}
              >
                Add to Calendar
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Workshop.requiresAuth = true;
// Workshop.redirectUnauthenticated = "/login";

export default Thankyou;
