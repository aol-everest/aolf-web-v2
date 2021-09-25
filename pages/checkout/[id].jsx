import React, { useState } from "react";
import { withSSRContext } from "aws-amplify";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PaymentForm } from "@components";
import { api } from "@utils";
import { useRouter } from "next/router";
import { useQueryString } from "@hooks";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

export const getServerSideProps = async (context) => {
  const { query, req, res } = context;
  const { id } = query;
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
      token,
    };
  } catch (err) {
    console.error(err);
    res.writeHead(302, {
      Location: `/login?next=${encodeURIComponent(
        location.pathname + location.search,
      )}`,
    });
    res.end();
    return;
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
    console.error(err);
    res.writeHead(302, {
      Location: `/workshop`,
    });
    res.end();
  }
  // Pass data to the page via props
  return { props };
};

const Checkout = ({ workshop, profile, token }) => {
  const router = useRouter();

  const [mbsy_source] = useQueryString("mbsy_source");
  const [campaignid] = useQueryString("campaignid");
  const [mbsy] = useQueryString("mbsy");

  const enrollmentCompletionAction = ({ attendeeId }) => {
    router.replace({
      pathname: "/thankyou",
      query: {
        aid: attendeeId,
        ctype: workshop.productTypeId,
        type: `local${mbsy_source ? "&mbsy_source=" + mbsy_source : ""}`,
        campaignid,
        mbsy,
      },
    });
  };

  return (
    <>
      <main>
        <section className="order">
          <div className="container">
            <h1 className="title title_thin">Silent Retreat</h1>
            <p className="order__detail">
              The ultimate vacation for mind, body, and spirit
            </p>
            <Elements
              stripe={stripePromise}
              fonts={[
                {
                  cssSrc:
                    "https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
                },
              ]}
            >
              <PaymentForm
                workshop={workshop}
                profile={profile}
                token={token}
                enrollmentCompletionAction={enrollmentCompletionAction}
              />
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
