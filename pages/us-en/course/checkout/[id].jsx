import {
  PageLoading,
  PaymentForm,
  PaymentFormGeneric,
  PaymentFormHB,
} from "@components";
import {
  ALERT_TYPES,
  COURSE_TYPES,
  MESSAGE_EMAIL_VERIFICATION_SUCCESS,
  MODAL_TYPES,
} from "@constants";
import {
  useAuth,
  useGlobalAlertContext,
  useGlobalModalContext,
} from "@contexts";
import { useQueryString } from "@hooks";
import { orgConfig } from "@org";
import { pushRouteWithUTMQuery, replaceRouteWithUTMQuery } from "@service";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { api } from "@utils";
import dayjs from "dayjs";
import { NextSeo } from "next-seo";
import ErrorPage from "next/error";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useAnalytics } from "use-analytics";

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
        <a href={`tel:${orgConfig.contactNumberLink}`}>
          {orgConfig.contactNumber}
        </a>{" "}
        or email us at{" "}
        <a href="mailto:app.support@us.artofliving.org">
          app.support@us.artofliving.org
        </a>
        . We will be happy to help you so you can sign up for the {title}.
      </p>
    </>
  );
};

const validateStudentEmail = (email) => {
  const regex = new RegExp(process.env.NEXT_PUBLIC_STUDENT_EMAIL_REGEX);
  const isStudentEmail = regex.test(email) && email.indexOf("alumni") < 0;
  return isStudentEmail;
};

const Checkout = () => {
  const router = useRouter();
  const { user, authenticated } = useAuth();
  const { id: workshopId, coupon } = router.query;
  const [mbsy_source] = useQueryString("mbsy_source", {
    defaultValue: null,
  });
  const [campaignid] = useQueryString("campaignid", {
    defaultValue: null,
  });
  const [mbsy] = useQueryString("mbsy", {
    defaultValue: null,
  });
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const { showModal } = useGlobalModalContext();
  const [showTopMessage, setShowTopMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comboProductSfid, setComboProductSfid] = useState("");
  const { track } = useAnalytics();

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
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!workshopId,
    },
  );

  useEffect(() => {
    if (workshop && !authenticated && !workshop.isGuestCheckoutEnabled) {
      pushRouteWithUTMQuery(router, {
        pathname: "/login",
        query: {
          next: router.asPath,
        },
      });
    }
    setTimeout(() => {
      setLoading(false);
    }, 2000);
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
    track("eec.checkout", {
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
    });

    if (isPreRequisiteCompleted === false) {
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
    pushRouteWithUTMQuery(router, {
      pathname: "/us-en/course",
      query: {
        courseType: "SKY_BREATH_MEDITATION",
      },
    });
  };

  const enrollmentCompletionAction = ({ attendeeId }) => {
    replaceRouteWithUTMQuery(router, {
      pathname: `/us-en/course/thankyou/${attendeeId}`,
      query: {
        ctype: workshop.productTypeId,
        comboId: comboProductSfid,
        page: "ty",
        type: `local${mbsy_source ? "&mbsy_source=" + mbsy_source : ""}`,
        campaignid,
        mbsy,
      },
    });
  };

  const login = () => {
    showModal(MODAL_TYPES.LOGIN_MODAL);
  };

  const handleCouseSelection = (selectedId) => {
    if (selectedId === workshop.id) {
      setComboProductSfid("");
    } else {
      setComboProductSfid(selectedId);
    }
  };

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !workshopId) return <PageLoading />;

  const stripePromise = loadStripe(workshop.publishableKey);

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

  const isInstitutionalProgram =
    COURSE_TYPES.INSTITUTIONAL_COURSE.value.indexOf(workshop.productTypeId) >=
    0;

  const isStripeIntentPayment =
    workshop.otherPaymentOptions.indexOf("Stripe Intent Payment") >= 0;

  const renderPaymentForm = () => {
    if (isHealingBreathProgram || isInstitutionalProgram) {
      return (
        <PaymentFormHB
          workshop={workshop}
          profile={user?.profile}
          enrollmentCompletionAction={enrollmentCompletionAction}
          handleCouseSelection={handleCouseSelection}
          login={login}
          isLoggedUser={authenticated}
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
          isStripeIntentPayment={isStripeIntentPayment}
          campaignid={campaignid}
          mbsy={mbsy}
          mbsy_source={mbsy_source}
          workshop={workshop}
          profile={user?.profile}
          enrollmentCompletionAction={enrollmentCompletionAction}
          handleCouseSelection={handleCouseSelection}
          login={login}
          isLoggedUser={authenticated}
        />
      );
    }
    return (
      <PaymentFormGeneric
        workshop={workshop}
        profile={user?.profile}
        enrollmentCompletionAction={enrollmentCompletionAction}
        handleCouseSelection={handleCouseSelection}
        login={login}
        isLoggedUser={authenticated}
      />
    );
  };

  const {
    email,
    isStudentVerified,
    studentVerificationDate,
    studentVerificationExpiryDate,
  } = user?.profile || {};

  const handleVerifyStudentEmail = async () => {
    setLoading(true);
    try {
      await api.post({
        path: "verify-email",
        body: {
          email: email,
        },
      });
    } catch (ex) {
      console.log(ex);
    }
    setLoading(false);
    showModal(MODAL_TYPES.EMPTY_MODAL, {
      title: "Verification code sent.",
      children: (handleModalToggle) => (
        <div className="alert__modal modal-window modal-window_no-log modal fixed-right fade active show">
          <div className=" modal-dialog modal-dialog-centered active">
            <div className="modal-content">
              <h2 className="modal-content-title !tw-text-2xl">
                {MESSAGE_EMAIL_VERIFICATION_SUCCESS}
              </h2>

              <p className="tw-flex tw-justify-center">
                <a
                  href="#"
                  className="btn btn-lg btn-primary tw-mt-6"
                  onClick={handleModalToggle}
                >
                  Close
                </a>
              </p>
            </div>
          </div>
        </div>
      ),
    });
  };

  const showVerifyStudentStatus =
    user?.profile &&
    validateStudentEmail(email) &&
    workshop.isStudentFeeAllowed &&
    (!isStudentVerified ||
      (isStudentVerified &&
        dayjs(new Date()).diff(dayjs(studentVerificationDate), "y", true) > 1 &&
        dayjs(studentVerificationExpiryDate).isAfter(dayjs(new Date()))));

  const elementsOptions = {
    mode: "payment",
    amount: 1099,
    currency: "usd",
    appearance: {
      theme: "flat",
      variables: {
        fontFamily: ' "Gill Sans", sans-serif',
        fontLineHeight: "1.5",
        borderRadius: "10px",
        colorBackground: "#F6F8FA",
        colorPrimaryText: "#262626",
      },
      rules: {
        ".Block": {
          backgroundColor: "var(--colorBackground)",
          boxShadow: "none",
          padding: "12px",
        },
        ".Input": {
          padding: "12px",
        },
        ".Input:disabled, .Input--invalid:disabled": {
          color: "lightgray",
        },
        ".Tab": {
          padding: "10px 12px 8px 12px",
          border: "none",
        },
        ".Tab:hover": {
          border: "none",
          boxShadow:
            "0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)",
        },
        ".Tab--selected, .Tab--selected:focus, .Tab--selected:hover": {
          border: "none",
          backgroundColor: "#fff",
          boxShadow:
            "0 0 0 1.5px var(--colorPrimaryText), 0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)",
        },
        ".Label": {
          fontWeight: "500",
        },
      },
    },
  };

  return (
    <>
      <NextSeo title={workshop.title} />
      {loading && <div className="cover-spin"></div>}
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
        {showVerifyStudentStatus && (
          <aside className="tw-relative tw-whitespace-normal tw-text-center">
            <span>
              We notice that you might be a student. Please{" "}
              <a
                className="tw-text-blue-900"
                onClick={handleVerifyStudentEmail}
                rel="noreferrer"
              >
                {" "}
                verify your student status{" "}
              </a>
              to get discounted Student rates.
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
              <p className="order__detail">{workshop?.description || ""}</p>
            )}

            {workshop.isCorporateEvent && (
              <div className="tw-mb-[60px]">
                <h1 className="tw-text-center tw-text-4xl tw-font-bold tw-text-[#31364e]">
                  {workshop.corporateName}
                </h1>
              </div>
            )}
            {isStripeIntentPayment && (
              <Elements stripe={stripePromise} options={elementsOptions}>
                {renderPaymentForm()}
              </Elements>
            )}
            {!isStripeIntentPayment && (
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
            )}
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
