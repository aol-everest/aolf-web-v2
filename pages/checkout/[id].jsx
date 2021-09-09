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
        <section class="order">
          <div class="container">
            <h1 class="title title_thin">Silent Retreat</h1>
            <p class="order__detail">
              The ultimate vacation for mind, body, and spirit
            </p>
            <Elements stripe={stripePromise}>
              <PaymentForm workshop={workshop} profile={profile} />
            </Elements>
          </div>
        </section>
        <section class="additional-information">
          <div class="container">
            <div class="row">
              <div class="col-lg-4">
                <div class="information__blcok">
                  <h2 class="information__tile">UNPARALLELED CONVENIENCE</h2>
                  <p class="information__text">
                    Choose your schedule. Learn from the comfort of your own
                    home.
                  </p>
                </div>
              </div>
              <div class="col-lg-4 mt-3 mt-lg-0">
                <div class="information__blcok">
                  <h2 class="information__tile">EXPERIENCED FACILITATORS</h2>
                  <p class="information__text">
                    Real-time interaction with highly trained instructors
                    (minimum of 500+ training hours)
                  </p>
                </div>
              </div>
              <div class="col-lg-4 mt-3 mt-lg-0">
                <div class="information__blcok">
                  <h2 class="information__tile">UPLIFTING COMMUNITY</h2>
                  <p class="information__text">
                    Form deep, authentic connections and community with your
                    fellow participants.
                  </p>
                </div>
              </div>
            </div>

            <div class="featured-in featured-in_with-button">
              <h2 class="featured-in__title">Featured in</h2>
              <div class="featured-in__box d-none d-lg-flex">
                <img src="/img/featured-in-cnn.png" alt="cnn" />
                <img src="/img/featured-in-yoga.png" alt="yoga" />
                <img src="/img/featured-in-tnyt.png" alt="tnyt" />
                <img src="/img/featured-in-time.png" alt="time" />
                <img src="/img/featured-in-wsj.png" alt="wsj" />
                <img src="/img/featured-in-forbes.png" alt="forbes" />
                <img src="/img/featured-in-nbc.png" alt="nbc" />
              </div>
              <div class="featured-in__box d-flex d-lg-none">
                <img src="/img/featured-in-cnn.png" alt="cnn" />
                <img src="/img/featured-in-yoga.png" alt="yoga" />
                <img src="/img/featured-in-nbc.png" alt="nbc" />
                <img src="/img/featured-in-wsj.png" alt="wsj" />
                <img src="/img/featured-in-forbes.png" alt="forbes" />
                <img src="/img/featured-in-time.png" alt="time" />
                <img
                  class="m-auto"
                  src="/img/featured-in-tnyt.png"
                  alt="tnyt"
                />
              </div>
              <button type="button" class="btn-primary featured-in__button">
                <img src="/img/ic-chat.png" alt="chat" />
              </button>
            </div>
          </div>
        </section>
      </main>
      <div class="course-popup d-lg-none d-block">
        <div class="course-card">
          <div class="course-card__info">
            <div class="course-card__info-wrapper">
              <div class="d-flex justify-content-between align-items-center">
                <p class="course-card__date">May 5-7, 2020</p>
                <button id="course-details" class="link">
                  See details
                </button>
              </div>
              <h3 class="course-card__course-name">SKY Breath Meditation</h3>
            </div>
          </div>
        </div>
        <div class="mobile-modal">
          <div class="mobile-modal__header">
            <div class="close-modal">
              <div class="close-line"></div>
              <div class="close-line"></div>
            </div>
            <div class="course-name">Sky Breath Meditation</div>
          </div>
          <div class="mobile-modal__body">
            <div class="course-detail">
              Your course: <span>May 5-7, 2020</span>
            </div>
            <div class="course-detail">
              Timings:
              <span>Fr: 7-9:30 PM ET</span>
              <span>Sa: 10-12:30 PM ET</span>
              <span>Su: 10-12:30 PM ET</span>
            </div>
            <div class="course-detail">
              Instructor(s):
              <span>Mary Walker</span>
              <span>Rajesh Moksha</span>
            </div>
            <div class="course-detail">
              Location:
              <span>Online</span>
            </div>
            <div class="course-detail">
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
