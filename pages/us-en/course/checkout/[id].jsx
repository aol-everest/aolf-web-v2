import {
  PageLoading,
  PaymentForm,
  PaymentFormGeneric,
  PaymentFormHB,
} from '@components';
import {
  ALERT_TYPES,
  COURSE_TYPES,
  MESSAGE_EMAIL_VERIFICATION_SUCCESS,
  MODAL_TYPES,
} from '@constants';
import {
  useAuth,
  useGlobalAlertContext,
  useGlobalModalContext,
} from '@contexts';
import { useQueryString } from '@hooks';
import { orgConfig } from '@org';
import { pushRouteWithUTMQuery, replaceRouteWithUTMQuery } from '@service';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { api } from '@utils';
import dayjs from 'dayjs';
import { NextSeo } from 'next-seo';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import queryString from 'query-string';
import { useAnalytics } from 'use-analytics';
import { filterAllowedParams, removeNull } from '@utils/utmParam';

const RetreatPrerequisiteWarning = ({ firstPreRequisiteFailedReason }) => {
  return (
    <p
      className="course-join-card__text"
      dangerouslySetInnerHTML={{
        __html: firstPreRequisiteFailedReason.preRequisiteFailedReason,
      }}
    ></p>
  );
};

const validateStudentEmail = (email) => {
  const regex = new RegExp(process.env.NEXT_PUBLIC_STUDENT_EMAIL_REGEX);
  const isStudentEmail = regex.test(email) && email.indexOf('alumni') < 0;
  return isStudentEmail;
};

const Checkout = () => {
  const router = useRouter();
  const { user, authenticated } = useAuth();
  const { id: workshopId, coupon } = router.query;
  const [mbsy_source] = useQueryString('mbsy_source', {
    defaultValue: null,
  });
  const [campaignid] = useQueryString('campaignid', {
    defaultValue: null,
  });
  const [mbsy] = useQueryString('mbsy', {
    defaultValue: null,
  });
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const { showModal } = useGlobalModalContext();
  const [showTopMessage, setShowTopMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comboProductSfid, setComboProductSfid] = useState('');
  const { track, page } = useAnalytics();

  const {
    data: workshop,
    isLoading,
    isError,
    error,
  } = useQuery(
    'workshopDetail',
    async () => {
      const response = await api.get({
        path: 'workshopDetail',
        param: {
          id: workshopId,
          rp: 'checkout',
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
        pathname: '/login',
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
      isPreRequisiteCompleted,
      businessRules = [],
      earlyBirdFeeIncreasing,
    } = workshop;
    setShowTopMessage(!!earlyBirdFeeIncreasing);

    const firstPreRequisiteFailedReason = businessRules.find(
      (rule) => !rule.isPreRequisiteCompleted,
    );

    const products = [
      {
        id: name,
        name: title,
        courseId: courseId,
        category: 'workshop',
        ctype: productTypeId,
        variant: 'N/A',
        brand: 'Art of Living Foundation',
        quantity: 1,
        currencyCode: 'USD',
        price: unitPrice,
      },
    ];

    page({
      category: 'course_registration',
      name: 'course_checkout',
      title: title,
      ctype: productTypeId,
      amount: unitPrice,
      requestType: 'Detail',
      hitType: 'paymentpage',
      user: user.profile.id,
    });

    track('eec.checkout', {
      page: `Art of Living ${title} workshop registration page`,
      viewType: 'workshop',
      title: title,
      ctype: productTypeId,
      amount: unitPrice,
      requestType: 'Detail',
      hitType: 'paymentpage',
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

    if (isPreRequisiteCompleted === false && firstPreRequisiteFailedReason) {
      showAlert(ALERT_TYPES.CUSTOM_ALERT, {
        className: 'retreat-prerequisite-big',
        title: 'Prerequisite',
        closeModalAction: closeRetreatPrerequisiteWarning(
          firstPreRequisiteFailedReason,
        ),
        footer: () => {
          return (
            <button
              className="btn-secondary"
              onClick={closeRetreatPrerequisiteWarning(
                firstPreRequisiteFailedReason,
              )}
            >
              {firstPreRequisiteFailedReason.actionButtonText}
            </button>
          );
        },
        children: (
          <RetreatPrerequisiteWarning
            firstPreRequisiteFailedReason={firstPreRequisiteFailedReason}
          />
        ),
      });
    }
  }, [user, workshop]);

  const closeRetreatPrerequisiteWarning =
    (firstPreRequisiteFailedReason) => (e) => {
      if (e) e.preventDefault();
      hideAlert();
      if (firstPreRequisiteFailedReason.actionButtonLink) {
        pushRouteWithUTMQuery(
          router,
          firstPreRequisiteFailedReason.actionButtonLink,
        );
      }
    };

  const enrollmentCompletionAction = ({ attendeeId }) => {
    replaceRouteWithUTMQuery(router, {
      pathname: `/us-en/course/thankyou/${attendeeId}`,
      query: {
        ctype: workshop.productTypeId,
        comboId: comboProductSfid,
        page: 'ty',
        referral: 'course_checkout',
        type: `local${mbsy_source ? '&mbsy_source=' + mbsy_source : ''}`,
        campaignid,
        mbsy,
      },
    });
  };

  const enrollmentCompletionLink = ({ attendeeId }) => {
    let filteredParams = {
      ctype: workshop.productTypeId,
      comboId: comboProductSfid,
      page: 'ty',
      referral: 'course_checkout',
      type: `local${mbsy_source ? '&mbsy_source=' + mbsy_source : ''}`,
      campaignid,
      mbsy,
      ...filterAllowedParams(router.query),
    };
    filteredParams = removeNull(filteredParams);
    const returnUrl = `${
      window.location.origin
    }/us-en/course/thankyou/${attendeeId}?${queryString.stringify(
      filteredParams,
    )}`;
    return returnUrl;
  };

  const login = () => {
    showModal(MODAL_TYPES.LOGIN_MODAL);
  };

  const handleCouseSelection = (selectedId) => {
    if (selectedId === workshop.id) {
      setComboProductSfid('');
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

  const isHealingBreathSilentType =
    COURSE_TYPES.HEALING_BREATH_SILENT.value.indexOf(workshop.productTypeId) >=
    0;

  const isInstitutionalProgram =
    COURSE_TYPES.INSTITUTIONAL_COURSE.value.indexOf(workshop.productTypeId) >=
    0;

  const isStripeIntentPayment = !!workshop.isStripeIntentPaymentEnabled;

  const renderPaymentForm = () => {
    if (
      isHealingBreathProgram ||
      isInstitutionalProgram ||
      isHealingBreathSilentType
    ) {
      return (
        <PaymentFormHB
          isStripeIntentPayment={isStripeIntentPayment}
          workshop={workshop}
          profile={user?.profile}
          enrollmentCompletionAction={enrollmentCompletionAction}
          enrollmentCompletionLink={enrollmentCompletionLink}
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
          workshop={workshop}
          profile={user?.profile}
          enrollmentCompletionAction={enrollmentCompletionAction}
          enrollmentCompletionLink={enrollmentCompletionLink}
          handleCouseSelection={handleCouseSelection}
          login={login}
          isLoggedUser={authenticated}
        />
      );
    }
    return (
      <PaymentFormGeneric
        isStripeIntentPayment={isStripeIntentPayment}
        workshop={workshop}
        profile={user?.profile}
        enrollmentCompletionAction={enrollmentCompletionAction}
        enrollmentCompletionLink={enrollmentCompletionLink}
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
        path: 'verify-email',
        body: {
          email: email,
        },
      });
    } catch (ex) {
      console.log(ex);
    }
    setLoading(false);
    showModal(MODAL_TYPES.EMPTY_MODAL, {
      title: 'Verification code sent.',
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
        dayjs(new Date()).diff(dayjs(studentVerificationDate), 'y', true) > 1 &&
        dayjs(studentVerificationExpiryDate).isAfter(dayjs(new Date()))));

  const elementsOptions = {
    mode: 'payment',
    amount: 1099,
    currency: 'usd',
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0570de',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: '"Work Sans",Ideal Sans, system-ui, sans-serif',
        spacingUnit: '2px',
        borderRadius: '4px',
      },
      rules: {
        '.Block': {
          backgroundColor: 'var(--colorBackground)',
          boxShadow: 'none',
          padding: '12px',
        },
        '.Input': {
          padding: '12px',
        },
        '.Input:disabled, .Input--invalid:disabled': {
          color: 'lightgray',
        },
        '.Tab': {
          padding: '10px 12px 8px 12px',
          border: 'none',
        },
        '.Tab:hover': {
          border: 'none',
          boxShadow:
            '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)',
        },
        '.Tab--selected, .Tab--selected:focus, .Tab--selected:hover': {
          border: '1px solid #89beec',
          backgroundColor: '#fff',
          boxShadow: '0 2px 25px 0 rgba(61,139,232,.2)',
        },
        '.Label': {
          fontWeight: '500',
        },
      },
    },
  };

  return (
    <>
      <NextSeo title={workshop.title} />
      {loading && <div className="cover-spin"></div>}
      <main className="main">
        {showTopMessage && (
          <aside className="tw-relative tw-whitespace-normal tw-text-center">
            <img src="/img/ic-timer-white.svg" alt="timer" />
            <span>
              A ${workshop.earlyBirdFeeIncreasing.increasingFee} late fee will
              apply starting {workshop.earlyBirdFeeIncreasing.increasingBy}
            </span>
          </aside>
        )}
        {showVerifyStudentStatus && (
          <aside className="tw-relative tw-whitespace-normal tw-text-center">
            <span>
              We notice that you might be a student. Please{' '}
              <a
                className="tw-text-blue-900"
                onClick={handleVerifyStudentEmail}
                rel="noreferrer"
              >
                {' '}
                verify your student status{' '}
              </a>
              to get discounted Student rates.
            </span>
          </aside>
        )}
        <div className="scheduling-modal__step">
          <div id="modal-header" className="scheduling-modal__header">
            <svg
              fill="none"
              height="40"
              viewBox="0 0 40 40"
              width="40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.97338 37.5C6.97338 37.5 5.84838 37.125 5.09838 36.375C3.97338 35.5 3.34838 34.125 3.34838 32.75C3.34838 32.25 3.47338 31.75 3.59838 31.375C2.72338 31.125 2.09838 30.5 1.59838 29.625C0.848379 28.125 1.34838 26.375 2.72338 25.5C4.18413 24.6426 7.07961 22.925 8.29299 22.2048C8.6583 21.9879 8.9647 21.686 9.18735 21.3241L11.8484 17C13.0984 15 14.9734 13.625 17.2234 13.125C15.7234 12 14.7234 10.375 14.7234 8.375C14.7234 5.125 17.3484 2.5 20.5984 2.5C23.8484 2.5 26.4734 5.125 26.4734 8.375C26.4734 10.25 25.5984 12 24.0984 13C26.2234 13.5 28.0984 14.875 29.2234 16.75L32.0984 21.625C32.2234 21.75 32.2234 21.875 32.4734 22L38.2234 25.375C39.5984 26.125 40.2234 28 39.4734 29.5C39.0984 30.25 38.3484 30.875 37.5984 31.125C37.8484 31.625 37.8484 32.25 37.8484 32.75C37.8484 34.125 37.2234 35.375 36.2234 36.25C35.2234 37.125 33.8484 37.625 32.4734 37.375L20.4734 35.75L8.72338 37.375C8.47338 37.5 8.22338 37.5 7.97338 37.5ZM20.7234 30.5H7.97338C6.84838 30.5 5.84838 31.625 5.84838 32.75C5.84838 33.375 6.09838 34 6.59838 34.5C7.09838 34.875 7.72338 35 8.22338 35L20.4734 33.375C20.5984 33.375 20.7234 33.375 20.8484 33.375L32.9734 35C33.5984 35.125 34.2234 34.875 34.7234 34.5C35.2234 34.125 35.4734 33.5 35.4734 32.875C35.4734 31.75 34.4734 30.625 33.3484 30.625L20.7234 30.5ZM22.0984 15.25L19.0984 15.375C16.8484 15.375 15.0984 16.375 13.9734 18.125L11.0984 22.875C10.8484 23.375 10.3484 23.875 9.72338 24.25L4.09838 27.5C3.84838 27.625 3.59838 28 3.84838 28.375C3.97338 28.625 4.22338 28.875 4.47338 28.875H4.59838L4.84838 28.75L11.0984 26C12.0984 25.5 12.7234 24.375 13.3484 23C13.5984 22.5 13.8484 22 14.0984 21.5C14.3484 21 14.9734 20.75 15.4734 20.875C15.9734 21 16.4734 21.5 16.4734 22.125V27.875H20.7234H24.8484V22.125C24.8484 21.5 25.2234 21.125 25.7234 20.875C26.2234 20.75 26.8484 21 27.0984 21.5C27.3484 22 27.5984 22.5 27.9734 23.125C28.5984 24.375 29.0984 25.625 30.2234 26.125L36.4734 28.625C36.5984 28.625 36.5984 28.75 36.7234 28.75C36.7234 28.75 36.7234 28.75 36.8484 28.75C37.0984 28.75 37.3484 28.625 37.4734 28.25C37.5984 27.875 37.4734 27.5 37.2234 27.375L31.5984 24C30.9734 23.75 30.4734 23.25 30.2234 22.625L27.3484 17.875C26.0984 16.375 24.0984 15.25 22.0984 15.25ZM13.8484 27.125C13.5984 27.5 13.2234 27.75 12.8484 28H13.8484V27.125ZM27.3484 28H28.3484C27.9734 27.75 27.5984 27.375 27.3484 27V28ZM20.5984 5C18.7234 5 17.2234 6.5 17.2234 8.375C17.2234 10.25 18.7234 11.75 20.5984 11.75C22.4734 11.75 23.9734 10.25 23.9734 8.375C23.9734 6.5 22.4734 5 20.5984 5Z"
                fill="#FCA248"
              />
            </svg>
            <div className="scheduling-modal__header-text">
              <h3>{workshop?.title}</h3>
            </div>
          </div>

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
            <p
              className="order__detail-description"
              dangerouslySetInnerHTML={{
                __html: workshop?.description,
              }}
            ></p>
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
                    'https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
                },
              ]}
            >
              {renderPaymentForm()}
            </Elements>
          )}
        </div>
      </main>
    </>
  );
};

Checkout.hideHeader = true;

export default Checkout;
