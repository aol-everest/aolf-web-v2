import React, { useState, useEffect } from "react";
import { withSSRContext } from "aws-amplify";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PaymentForm } from "@components";
import { api } from "@utils";
import { useRouter } from "next/router";
import { useQueryString } from "@hooks";
import { NextSeo } from "next-seo";
import { ALERT_TYPES } from "@constants";
import { useGlobalAlertContext } from "@contexts";
import { useGTMDispatch } from "@elgorditosalsero/react-gtm-hook";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

const RetreatPrerequisiteWarning = ({
  firstPreRequisiteFailedReason,
  title,
}) => {
  return (
    <>
      <p className="course-join-card__text">
        Our records indicate that you have not yet taken the prerequisite for
        the {title}, which is{" "}
        <strong>
          {firstPreRequisiteFailedReason &&
          firstPreRequisiteFailedReason.totalCount <
            firstPreRequisiteFailedReason.requiredCount &&
          firstPreRequisiteFailedReason.requiredCount > 1
            ? firstPreRequisiteFailedReason.requiredCount
            : ""}{" "}
          {firstPreRequisiteFailedReason && firstPreRequisiteFailedReason.type}
        </strong>
        .
      </p>
      <p className="course-join-card__text">
        If our records are not accurate, please contact customer service at{" "}
        <a href="tel:8442735500">(844) 273-5500</a> or email us at{" "}
        <a href="mailto:app.support@us.artofliving.org">
          app.support@us.artofliving.org
        </a>
        . We will be happy to help you so you can sign up for the {title}.
      </p>
    </>
  );
};

export const getServerSideProps = async (context) => {
  const { query, req, res, resolvedUrl } = context;
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
    return {
      redirect: {
        destination: `/login?next=${resolvedUrl}`,
        permanent: false,
      },
    };
  }
  const workshopDetail = await api.get({
    path: "workshopDetail",
    token,
    param: {
      id,
    },
  });
  props = {
    ...props,
    workshop: workshopDetail.data,
  };

  // Pass data to the page via props
  return { props };
};

const Checkout = ({ workshop, profile }) => {
  const router = useRouter();

  const sendDataToGTM = useGTMDispatch();
  const [mbsy_source] = useQueryString("mbsy_source");
  const [campaignid] = useQueryString("campaignid");
  const [mbsy] = useQueryString("mbsy");
  const { showAlert, hideAlert } = useGlobalAlertContext();

  useEffect(() => {
    if (!router.isReady) return;

    const {
      title,
      name,
      productTypeId,
      unitPrice,
      id: courseId,
      preRequisiteFailedReason = [],
      isPreRequisiteCompleted,
    } = workshop;

    const [firstPreRequisiteFailedReason] = preRequisiteFailedReason;

    const products = [
      {
        id: name,
        name: title,
        courseId: courseId,
        category: "workshop",
        ctype: productTypeId,
        variant: "N/A",
        brand: "Art of Living Foundation",
        quantity: 1,
        currencyCode: "USD",
        price: unitPrice,
      },
    ];

    sendDataToGTM({
      page: `Art of Living ${title} workshop registration page`,
      event: "eec.checkout",
      viewType: "workshop",
      title: title,
      ctype: productTypeId,
      amount: unitPrice,
      requestType: "Detail",
      hitType: "paymentpage",
      user: profile.id,
      ecommerce: {
        checkout: {
          actionField: {
            step: 1,
          },
          products: products,
        },
      },
    });

    if (!isPreRequisiteCompleted) {
      showAlert(ALERT_TYPES.CUSTOM_ALERT, {
        className: "retreat-prerequisite-big",
        title: "Retreat Prerequisite",
        footer: () => {
          return (
            <button
              className="btn-secondary"
              onClick={closeRetreatPrerequisiteWarning}
            >
              Discover{" "}
              {firstPreRequisiteFailedReason &&
                firstPreRequisiteFailedReason.type}
            </button>
          );
        },
        children: (
          <RetreatPrerequisiteWarning
            firstPreRequisiteFailedReason={firstPreRequisiteFailedReason}
            title={workshop.title}
          />
        ),
      });
    }
  }, [router.isReady]);

  const closeRetreatPrerequisiteWarning = (e) => {
    if (e) e.preventDefault();
    hideAlert();
    router.push({
      pathname: "/us/course",
      query: {
        courseType: "SKY_BREATH_MEDITATION",
      },
    });
  };

  const enrollmentCompletionAction = ({ attendeeId }) => {
    router.replace({
      pathname: "/us/course/thankyou",
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
      <NextSeo title={workshop.title} />
      <main>
        <section className="order">
          <div className="container">
            <h1 className="title title_thin">{workshop.title}</h1>
            <p className="order__detail">
              The Most Effective Way to Feel Calm & Clear, Day After Day
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
    </>
  );
};

Checkout.hideHeader = true;

export default Checkout;
