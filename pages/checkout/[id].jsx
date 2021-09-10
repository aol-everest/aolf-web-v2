import React, { useState } from "react";
import { withSSRContext } from "aws-amplify";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PaymentForm } from "@components";
import { api } from "@utils";

const stripePromise = loadStripe(
  "pk_test_51BTUDGJAJfZb9HEBwDg86TN1KNprHjkfipXmEDMb0gSCassK5T3ZfxsAbcgKVmAIXF7oZ6ItlZZbXO6idTHE67IM007EwQ4uN3",
);

export const getServerSideProps = async (context) => {
  const { id } = context.query;
  let props = {};
  let token = "";
  try {
    const { Auth } = await withSSRContext(context);
    const user = await Auth.currentAuthenticatedUser();
    token = user.signInUserSession.idToken.jwtToken;
    const res = await api.get({
      path: "profile",
      token,
    });
    props = {
      authenticated: true,
      username: user.username,
      profile: res,
    };
  } catch (err) {
    props = {
      authenticated: false,
    };
  }
  try {
    const res = await api.get({
      path: "workshopDetail",
      token,
      param: {
        id,
      },
    });
    props = {
      ...props,
      workshop: res.data,
    };
  } catch (err) {
    props = {
      ...props,
      error: { message: err.message },
    };
  }
  // Pass data to the page via props
  return { props };
};

const Checkout = ({ workshop, profile }) => {
  return (
    <>
      <main>
        <section className="order">
          <div className="container">
            <h1 className="title title_thin">Silent Retreat</h1>
            <p className="order__detail">
              The ultimate vacation for mind, body, and spirit
            </p>
            <Elements stripe={stripePromise}>
              <PaymentForm workshop={workshop} profile={profile} />
            </Elements>
          </div>
        </section>
        <section className="additional-information">
          <div className="container">
            <div className="row">
              <div className="col-lg-4">
                <div className="information__blcok">
                  <h2 className="information__tile">
                    UNPARALLELED CONVENIENCE
                  </h2>
                  <p className="information__text">
                    Choose your schedule. Learn from the comfort of your own
                    home.
                  </p>
                </div>
              </div>
              <div className="col-lg-4 mt-3 mt-lg-0">
                <div className="information__blcok">
                  <h2 className="information__tile">
                    EXPERIENCED FACILITATORS
                  </h2>
                  <p className="information__text">
                    Real-time interaction with highly trained instructors
                    (minimum of 500+ training hours)
                  </p>
                </div>
              </div>
              <div className="col-lg-4 mt-3 mt-lg-0">
                <div className="information__blcok">
                  <h2 className="information__tile">UPLIFTING COMMUNITY</h2>
                  <p className="information__text">
                    Form deep, authentic connections and community with your
                    fellow participants.
                  </p>
                </div>
              </div>
            </div>

            <div className="featured-in featured-in_with-button">
              <h2 className="featured-in__title">Featured in</h2>
              <div className="featured-in__box d-none d-lg-flex">
                <img src="/img/featured-in-cnn.png" alt="cnn" />
                <img src="/img/featured-in-yoga.png" alt="yoga" />
                <img src="/img/featured-in-tnyt.png" alt="tnyt" />
                <img src="/img/featured-in-time.png" alt="time" />
                <img src="/img/featured-in-wsj.png" alt="wsj" />
                <img src="/img/featured-in-forbes.png" alt="forbes" />
                <img src="/img/featured-in-nbc.png" alt="nbc" />
              </div>
              <div className="featured-in__box d-flex d-lg-none">
                <img src="/img/featured-in-cnn.png" alt="cnn" />
                <img src="/img/featured-in-yoga.png" alt="yoga" />
                <img src="/img/featured-in-nbc.png" alt="nbc" />
                <img src="/img/featured-in-wsj.png" alt="wsj" />
                <img src="/img/featured-in-forbes.png" alt="forbes" />
                <img src="/img/featured-in-time.png" alt="time" />
                <img
                  className="m-auto"
                  src="/img/featured-in-tnyt.png"
                  alt="tnyt"
                />
              </div>
              <button type="button" className="btn-primary featured-in__button">
                <img src="/img/ic-chat.png" alt="chat" />
              </button>
            </div>
          </div>
        </section>
      </main>
      <div className="course-popup d-lg-none d-block">
        <div className="course-card">
          <div className="course-card__info">
            <div className="course-card__info-wrapper">
              <div className="d-flex justify-content-between align-items-center">
                <p className="course-card__date">May 5-7, 2020</p>
                <button id="course-details" className="link">
                  See details
                </button>
              </div>
              <h3 className="course-card__course-name">
                SKY Breath Meditation
              </h3>
            </div>
          </div>
        </div>
        <div className="mobile-modal">
          <div className="mobile-modal__header">
            <div className="close-modal">
              <div className="close-line"></div>
              <div className="close-line"></div>
            </div>
            <div className="course-name">Sky Breath Meditation</div>
          </div>
          <div className="mobile-modal__body">
            <div className="course-detail">
              Your course: <span>May 5-7, 2020</span>
            </div>
            <div className="course-detail">
              Timings:
              <span>Fr: 7-9:30 PM ET</span>
              <span>Sa: 10-12:30 PM ET</span>
              <span>Su: 10-12:30 PM ET</span>
            </div>
            <div className="course-detail">
              Instructor(s):
              <span>Mary Walker</span>
              <span>Rajesh Moksha</span>
            </div>
            <div className="course-detail">
              Location:
              <span>Online</span>
            </div>
            <div className="course-detail">
              Contact details:
              <span>(809)751-1436</span>
              <span>socal@us.artofliving.org</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

Checkout.hideHeader = true;

export default Checkout;
