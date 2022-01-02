/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-irregular-whitespace */
import React, { useEffect } from "react";
import { api, Clevertap, tConvert, calculateBusinessDays } from "@utils";
import { withSSRContext } from "aws-amplify";
import { useGTMDispatch } from "@elgorditosalsero/react-gtm-hook";
import { useAuth, useGlobalAlertContext } from "@contexts";
import { COURSE_TYPES, ALERT_TYPES, ABBRS } from "@constants";
import { AddToCalendarModal } from "@components";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Image from "next/image";

dayjs.extend(utc);

export async function getServerSideProps(context) {
  const { query, req, res } = context;
  const { Auth } = withSSRContext(context);
  const { id } = query;
  const user = await Auth.currentAuthenticatedUser();
  const token = user.signInUserSession.idToken.jwtToken;
  const { data, attendeeRecord } = await api.get({
    path: "getWorkshopByAttendee",
    param: {
      aid: id,
      skipcheck: 1,
    },
    token,
  });
  return {
    props: {
      authenticated: true,
      username: user.username,
      workshop: data,
      attendeeRecord,
    },
  };
}

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

const Thankyou = ({ workshop, attendeeRecord }) => {
  const sendDataToGTM = useGTMDispatch();
  const { profile } = useAuth();
  const { showAlert, hideAlert } = useGlobalAlertContext();

  const {
    title,
    productTypeId,
    unitPrice,
    id: courseId,
    formattedStartDateOnly,
    formattedEndDateOnly,
    shortAddress,
    primaryTeacherName,
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
  } = workshop;

  const isSKYType =
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(productTypeId) >= 0;
  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(productTypeId) >= 0;
  const isSahajSamadhiMeditationType =
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(productTypeId) >= 0;

  const {
    ammountPaid,
    orderExternalId,
    couponCode,
    selectedGenericSlot = {},
  } = attendeeRecord;

  useEffect(() => {
    if (!profile) return;
    sendDataToGTM({
      event: "transactionComplete",
      viewType: "workshop",
      amount: unitPrice,
      title: title,
      ctype: productTypeId,
      requestType: "Thankyou",
      // user,
      ecommerce: {
        currencyCode: "USD",
        purchase: {
          actionField: {
            id: orderExternalId,
            affiliation: "Website",
            revenue: ammountPaid,
            tax: "0.00",
            shipping: "0.00",
            coupon: couponCode || "",
          },
          products: [
            {
              id: courseId,
              courseId: courseId,
              name: title,
              category: "workshop",
              variant: "N/A",
              brand: "Art of Living Foundation",
              quantity: 1,
              // price: totalOrderAmount,
            },
          ],
        },
      },
    });
    Clevertap.event("Product Purchase Completed", {
      "Request Type": "Thankyou",
      "Product name": title,
      Category: "Workshop",
      "Product Type": productTypeId,
      "Product Id": courseId,
      Price: ammountPaid,
      affiliation: "Website",
      coupon: couponCode || "",
    });
  }, [profile]);

  const addToCalendarAction = (e) => {
    if (e) e.preventDefault();
    showAlert(ALERT_TYPES.CUSTOM_ALERT, {
      title: "Add to Calendar",

      children: <AddToCalendarModal event={workshop} />,
      closeModalAction: () => {
        hideAlert();
      },
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

  return (
    <>
      <main>
        <section className="get-started">
          <div className="container-md">
            <div className="row align-items-center">
              <div className="col-lg-5 col-md-12 p-md-0">
                <div className="get-started__info">
                  <h3 className="get-started__subtitle">You’re going!</h3>
                  <h1 className="get-started__title section-title">{title}</h1>
                  <p className="get-started__text">
                    You're registered for the {title}{" "}
                    {!isGenericWorkshop && (
                      <>
                        {" "}
                        from {formattedStartDateOnly} - {formattedEndDateOnly}
                      </>
                    )}
                  </p>
                  {!isGenericWorkshop && (
                    <a
                      className="get-started__link"
                      href="#"
                      onClick={addToCalendarAction}
                    >
                      Add to Calendar
                    </a>
                  )}

                  <p className="get-started__text">
                    Next step: You will receive an email with details about your{" "}
                    {title}.
                  </p>
                </div>
                <p className="get-started__text">
                  <br />
                  To get started, download the app.{" "}
                  {isGenericWorkshop && (
                    <>
                      <span>
                        We will reach out to schedule dates for your course.
                      </span>
                    </>
                  )}
                </p>
                <div className="btn-wrapper">
                  <a
                    className="btn-outline tw-mr-2"
                    href="https://apps.apple.com/us/app/art-of-living-journey/id1469587414?ls=1"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src="/img/ic-apple.svg" alt="apple" />
                    iOS App
                  </a>
                  <a
                    className="btn-outline"
                    href="https://play.google.com/store/apps/details?id=com.aol.app"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src="/img/ic-android.svg" alt="android" />
                    Android App
                  </a>
                </div>
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
            <div className="program-details">
              <h2 className="program-details__title">Program Details</h2>
              {selectedGenericSlot.startDate &&
                getSelectedTimeSlotDetails(selectedGenericSlot)}
              {!selectedGenericSlot.startDate && (
                <ul className="program-details__list-schedule tw-overflow-y-auto tw-max-h-[400px]">
                  {timings &&
                    timings.map((time, i) => {
                      return (
                        <li className="program-details__schedule" key={i}>
                          <span className="program-details__schedule-date">
                            {dayjs.utc(time.startDate).format("LL")}
                          </span>
                          <span className="program-details__schedule-time">{`${tConvert(
                            time.startTime,
                          )} - ${tConvert(time.endTime)} ${
                            ABBRS[time.timeZone]
                          }`}</span>
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>
            <h2 className="journey-starts__title section-title">
              Your journey starts here
            </h2>
            <div className="journey-starts__step">
              <div className="journey-starts__step-number">
                <span>1</span>
              </div>
              <div className="journey-starts__detail">
                <h3 className="journey-starts__step-title">This is you-time</h3>
                <p className="journey-starts__step-text">
                  Block your calendar to attend all the sessions via Zoom.
                  Before the session begins, you will receive your Zoom meeting
                  ID and password in your welcome email.
                </p>
              </div>
            </div>
            <div className="journey-starts__step">
              <div className="journey-starts__step-number">
                <span>2</span>
              </div>
              <div className="journey-starts__detail">
                <h3 className="journey-starts__step-title">
                  Getting your tech ready in advance
                </h3>
                <p className="journey-starts__step-text">
                  Download Zoom - When you clock on the zoom call link, it will
                  promp you to download the Zoom app.
                </p>
              </div>
            </div>
            <div className="journey-starts__step">
              <div className="journey-starts__step-number">
                <span>3</span>
              </div>
              <div className="journey-starts__detail">
                <h3 className="journey-starts__step-title">
                  Get comfy, set up your space
                </h3>
                <p className="journey-starts__step-text">
                  Find a qiet, comfortable space where you can enjoy your course
                  undisturbed.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <div className="course-bottom-card show">
        <div className="container">
          <div className="course-bottom-card__container">
            <div className="course-bottom-card__info-block">
              <div className="course-bottom-card__img d-none d-lg-block tw-max-w-[60px] tw-h-[60px] tw-relative">
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
              <div className="course-bottom-card__info">
                {!isGenericWorkshop && (
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
            <button
              id="register-button-2"
              className="btn-secondary"
              onClick={addToCalendarAction}
            >
              Add to Calendar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Workshop.requiresAuth = true;
// Workshop.redirectUnauthenticated = "/login";

export default Thankyou;
