/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-irregular-whitespace */
import React, { useEffect } from "react";
import { api, calculateBusinessDays, tConvert } from "@utils";
import { withSSRContext } from "aws-amplify";
import { useGTMDispatch } from "@elgorditosalsero/react-gtm-hook";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { useGlobalAlertContext, useGlobalModalContext } from "@contexts";
import { AddToCalendarModal } from "@components";
import { ALERT_TYPES, ABBRS } from "@constants";

dayjs.extend(utc);
dayjs.extend(localizedFormat);

export async function getServerSideProps(context) {
  const { query, req, res } = context;
  const { Auth } = withSSRContext({ req });
  const { id } = query;
  try {
    const user = await Auth.currentAuthenticatedUser();
    const currentSession = await Auth.currentSession();
    const token = currentSession.idToken.jwtToken;
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
        meetup: data,
        attendeeRecord,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      redirect: {
        permanent: false,
        destination: `/us-en/meetup`,
      },
      props: {},
    };
  }
}

const Thankyou = ({ meetup, attendeeRecord }) => {
  const sendDataToGTM = useGTMDispatch();
  const router = useRouter();
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const { id: attendeeId } = router.query;

  const {
    formattedStartDateOnly,
    formattedEndDateOnly,
    shortAddress,
    title,
    meetupTitle,
    primaryTeacherName,
    eventStartDate,
    eventEndDate,
    phone1,
    productTypeId,
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
    unitPrice,
    id: courseId,
  } = meetup || {};
  const {
    email: attendeeEmail,
    selectedGenericSlot = {},
    sfid: attendeeSfid,
    ammountPaid,
    orderExternalId,
    couponCode,
  } = attendeeRecord || {};

  useEffect(() => {
    sendDataToGTM({
      event: "transactionComplete",
      viewType: "workshop",
      amount: unitPrice,
      title: meetupTitle || title,
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
  }, []);

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

  const addToCalendarAction = () => {
    showAlert(ALERT_TYPES.CUSTOM_ALERT, {
      title: "Add to Calendar",

      children: <AddToCalendarModal event={meetup} />,
      closeModalAction: () => {
        hideAlert();
      },
    });
  };

  const getMeetupImage = () => {
    switch (meetup.meetupType) {
      case "Short SKY Meditation Meetup":
        return (
          <img className="img-fluid" src="/img/meetup_image.png" alt="bg" />
        );
      case "Guided Meditation Meetup":
        return (
          <img className="img-fluid" src="/img/meetup_1_image.png" alt="bg" />
        );
      default:
        return (
          <img className="img-fluid" src="/img/meetup_image.png" alt="bg" />
        );
    }
  };

  return (
    <>
      <main>
        <section className="get-started">
          <img
            src={`https://www.shareasale.com/sale.cfm?tracking=${attendeeId}&amount=${ammountPaid}&merchantID=103115&transtype=sale`}
            width="1"
            height="1"
          ></img>
          <div className="container-md">
            <div className="row align-items-center">
              <div className="col-lg-5 col-md-12 p-md-0">
                <div className="get-started__info">
                  <h3 className="get-started__subtitle">You’re going!</h3>
                  <h1 className="get-started__title section-title">
                    {meetupTitle || title}
                  </h1>
                  <p className="get-started__text">
                    You're registered for the Silent Retreat on{" "}
                    {dayjs.utc(meetupStartDate).format("LL")}
                  </p>
                  <a
                    className="get-started__link"
                    onClick={addToCalendarAction}
                    href="#"
                  >
                    Add to Calendar
                  </a>
                  <p className="get-started__text">
                    You will receive an email confirmation with meetup details.
                  </p>
                </div>
              </div>
              <div className="col-lg-6 col-md-12 offset-lg-1 p-0">
                <div className="get-started__video">{getMeetupImage()}</div>
              </div>
            </div>
          </div>
        </section>
        <section className="journey-starts">
          <div className="container">
            <div className="program-details">
              <h2 className="program-details__title">Program Details</h2>
              {selectedGenericSlot.startDate &&
                getSelectedTimeSlotDetails(selectedGenericSlot)}
              {!selectedGenericSlot.startDate && (
                <>
                  <ul className="program-details__list-schedule">
                    <li className="program-details__schedule">
                      <span className="program-details__schedule-date">
                        {dayjs.utc(meetupStartDate).format("LL")}
                      </span>
                      <span className="program-details__schedule-time">{`${tConvert(
                        meetupStartTime,
                      )} ${ABBRS[eventTimeZone]}`}</span>
                    </li>
                  </ul>
                </>
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
              <div className="course-bottom-card__img d-none d-lg-block">
                <img src="/img/silent-card-img.png" alt="img" />
              </div>
              <div className="course-bottom-card__info">
                <p>{dayjs.utc(meetupStartDate).format("LL")}</p>
                <div>
                  <h3>{meetupTitle}</h3>
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
