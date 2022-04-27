import React, { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PaymentForm, PaymentFormHB, PaymentFormGeneric } from "@components";
import { api } from "@utils";
import { useRouter } from "next/router";
import { useQueryString } from "@hooks";
import { NextSeo } from "next-seo";
import { ALERT_TYPES } from "@constants";
import { useAuth } from "@contexts";
import { useGlobalAlertContext } from "@contexts";
import { trackEvent } from "@phntms/react-gtm";
import { COURSE_TYPES } from "@constants";
import { withAuth } from "@hoc";
import { PageLoading } from "@components";
import ErrorPage from "next/error";
import { useQuery } from "react-query";

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
        <a href="tel:8552024400">(855) 202-4400</a> or email us at{" "}
        <a href="mailto:app.support@us.artofliving.org">
          app.support@us.artofliving.org
        </a>
        . We will be happy to help you so you can sign up for the {title}.
      </p>
    </>
  );
};

const Checkout = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { id: workshopId, coupon } = router.query;
  const {
    data: workshop = {},
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
        },
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const [mbsy_source] = useQueryString("mbsy_source");
  const [campaignid] = useQueryString("campaignid");
  const [mbsy] = useQueryString("mbsy");
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const [showTopMessage, setShowTopMessage] = useState(false);

  useEffect(() => {
    if (!user || !workshop) return;

    const {
      title,
      name,
      productTypeId,
      unitPrice,
      id: courseId,
      preRequisiteFailedReason = [],
      isPreRequisiteCompleted,
      earlyBirdFeeIncreasing,
    } = workshop;
    setShowTopMessage(!!earlyBirdFeeIncreasing);

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

    trackEvent({
      event: "eec.checkout",
      data: {
        page: `Art of Living ${title} workshop registration page`,
        viewType: "workshop",
        title: title,
        ctype: productTypeId,
        amount: unitPrice,
        requestType: "Detail",
        hitType: "paymentpage",
        user: user.profile.id,
        ecommerce: {
          checkout: {
            actionField: {
              step: 1,
            },
            products: products,
          },
        },
      },
    });

    if (!isPreRequisiteCompleted) {
      showAlert(ALERT_TYPES.CUSTOM_ALERT, {
        className: "retreat-prerequisite-big",
        title: "Retreat Prerequisite",
        closeModalAction: closeRetreatPrerequisiteWarning,
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
  }, [user, workshop]);

  const closeRetreatPrerequisiteWarning = (e) => {
    if (e) e.preventDefault();
    hideAlert();
    router.push({
      pathname: "/us-en/course",
      query: {
        courseType: "SKY_BREATH_MEDITATION",
      },
    });
  };

  const enrollmentCompletionAction = ({ attendeeId }) => {
    router.replace({
      pathname: `/us-en/course/thankyou/${attendeeId}`,
      query: {
        ctype: workshop.productTypeId,
        page: "ty",
        type: `local${mbsy_source ? "&mbsy_source=" + mbsy_source : ""}`,
        campaignid,
        mbsy,
      },
    });
  };

  const isSKYType =
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(workshop.productTypeId) >=
    0;
  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(workshop.productTypeId) >= 0;
  const isSahajSamadhiMeditationType =
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(
      workshop.productTypeId,
    ) >= 0;
  const isSriSriYogaMeditationType =
    COURSE_TYPES.SRI_SRI_YOGA_MEDITATION.value.indexOf(
      workshop.productTypeId,
    ) >= 0;
  const isVolunteerTrainingProgram =
    COURSE_TYPES.VOLUNTEER_TRAINING_PROGRAM.value.indexOf(
      workshop.productTypeId,
    ) >= 0;
  const isHealingBreathProgram =
    COURSE_TYPES.HEALING_BREATH.value.indexOf(workshop.productTypeId) >= 0;

  const renderPaymentForm = () => {
    if (isHealingBreathProgram) {
      return (
        <PaymentFormHB
          workshop={workshop}
          profile={user.profile}
          enrollmentCompletionAction={enrollmentCompletionAction}
        />
      );
    }
    if (
      isSKYType ||
      isSilentRetreatType ||
      isSahajSamadhiMeditationType ||
      isSriSriYogaMeditationType ||
      isVolunteerTrainingProgram
    ) {
      return (
        <PaymentForm
          workshop={workshop}
          profile={user.profile}
          enrollmentCompletionAction={enrollmentCompletionAction}
        />
      );
    }
    return (
      <PaymentFormGeneric
        workshop={workshop}
        profile={user.profile}
        enrollmentCompletionAction={enrollmentCompletionAction}
      />
    );
  };
  if (isError) return <ErrorPage statusCode={500} title={error} />;
  if (isLoading) return <PageLoading />;
  return (
    <>
      <NextSeo title={workshop.title} />
      <main>
        {showTopMessage && (
          <aside className="tw-relative tw-whitespace-normal tw-text-center">
            <img src="/img/ic-timer-white.svg" alt="timer" />
            <span>
              Register soon. Course fee will go up by $
              {workshop.earlyBirdFeeIncreasing.increasingFee} on{" "}
              {workshop.earlyBirdFeeIncreasing.increasingBy}
            </span>
          </aside>
        )}
        <section className="order">
          <div className="container">
            <h1 className="title">{workshop.title}</h1>
            {workshop.isGenericWorkshop ? (
              <p className="order__detail">
                Once you register, you will be contacted to schedule your course
                date
                <br />
                <span>
                  SKY is offered every week of the year across time zones.
                </span>
              </p>
            ) : (
              <p className="order__detail">
                The Most Effective Way to Feel Calm & Clear, Day After Day
              </p>
            )}

            {workshop.isCorporateEvent && (
              <div className="tw-mb-[60px]">
                <h1 className="tw-text-4xl tw-font-bold tw-text-center tw-text-[#31364e]">
                  {workshop.corporateName}
                </h1>
              </div>
            )}
            <Elements
              stripe={stripePromise}
              fonts={[
                {
                  cssSrc:
                    "https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
                },
              ]}
            >
              {renderPaymentForm()}
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

export default withAuth(Checkout);
