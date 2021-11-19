/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-irregular-whitespace */
import React, { useEffect } from "react";
import { api } from "@utils";
import { withSSRContext } from "aws-amplify";
import { useGTMDispatch } from "@elgorditosalsero/react-gtm-hook";

export async function getServerSideProps(context) {
  const { query, req, res } = context;
  const { Auth } = withSSRContext(context);
  const { aid } = query;
  try {
    const user = await Auth.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    const { data, attendeeRecord } = await api.get({
      path: "getWorkshopByAttendee",
      param: {
        aid,
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
  } catch (err) {
    console.error(err);
    res.writeHead(302, { Location: "/workshop" });
    res.end();
  }
  return { props: {} };
}

const Thankyou = ({ workshop, attendeeRecord }) => {
  const sendDataToGTM = useGTMDispatch();

  const {
    meetupTitle,
    title,
    productTypeId,
    unitPrice,
    id: courseId,
  } = workshop;
  const { ammountPaid, orderExternalId, couponCode } = attendeeRecord;

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
                    You're registered for the {title} from Wed, October 23 -
                    Fri, October 25, 2020
                  </p>
                  <a className="get-started__link" href="#">
                    Add to Calendar
                  </a>
                  <p className="get-started__text">
                    Next step: You will receive an email with details about your
                    Silent Retreat orientation.
                  </p>
                </div>
              </div>
              <div className="col-lg-6 col-md-12 offset-lg-1 p-0">
                <div className="get-started__video">
                  <iframe
                    src="https://player.vimeo.com/video/432237531"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="journey-starts">
          <div className="container">
            <div className="program-details">
              <h2 className="program-details__title">Program Details</h2>
              <ul className="program-details__list-schedule">
                <li className="program-details__schedule">
                  <span className="program-details__schedule-date">
                    October 23, 2020
                  </span>
                  <span className="program-details__schedule-time">
                    6:00 PM - 9:30 PM ET
                  </span>
                </li>
                <li className="program-details__schedule">
                  <span className="program-details__schedule-date">
                    October 24, 2020
                  </span>
                  <span className="program-details__schedule-time">
                    7:00 AM - 9:30 PM ET
                  </span>
                </li>
                <li className="program-details__schedule">
                  <span className="program-details__schedule-date">
                    October 25, 2020
                  </span>
                  <span className="program-details__schedule-time">
                    7:00 AM - 5:00 PM ET
                  </span>
                </li>
              </ul>
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
                <p>October 23-35, 2020</p>
                <div>
                  <h3>{title}</h3>
                </div>
              </div>
            </div>
            <button id="register-button-2" className="btn-secondary">
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
