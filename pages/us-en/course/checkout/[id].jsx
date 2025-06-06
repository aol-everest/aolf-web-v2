import {
  Loader,
  PageLoading,
  PaymentFormGeneric,
  PaymentFormHB,
  PaymentFormCheckoutNew,
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
import { useQueryState, parseAsBoolean, parseAsString } from 'nuqs';
import {
  pushRouteWithUTMQuery,
  replaceRouteWithUTMQuery,
  returnRouteWithUTMQuery,
} from '@service';
import { Elements } from '@stripe/react-stripe-js';
import {
  api,
  convertToUpperCaseAndReplaceSpacesForURL,
  findKeyByProductTypeId,
} from '@utils';
import dayjs from 'dayjs';
import { NextSeo } from 'next-seo';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';
import { useAnalytics } from 'use-analytics';
import { PaymentFormNew } from '@components/paymentFormNew';
import { navigateToLogin } from '@utils';
import { useStripeLoader } from '@hooks';
import CourseNotFoundError from '@components/errors/CourseNotFoundError';

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
  if (!email) {
    return false;
  }
  const regex = new RegExp(process.env.NEXT_PUBLIC_STUDENT_EMAIL_REGEX);
  const isStudentEmail = regex.test(email) && email.indexOf('alumni') < 0;
  return isStudentEmail;
};

const Checkout = () => {
  const router = useRouter();
  const { profile, isAuthenticated } = useAuth();
  const { id: workshopId, coupon, bundle } = router.query;
  const [mbsy_source] = useQueryState('mbsy_source', parseAsString);
  const [campaignid] = useQueryState('campaignid', parseAsString);
  const [sourceBundle] = useQueryState('source-bundle', parseAsString);
  const [mbsy] = useQueryState('mbsy', parseAsString);
  const [ctype] = useQueryState('ctype');
  const [isOldCheckout] = useQueryState(
    'isOldCheckout',
    parseAsBoolean.withDefault(false),
  );

  const {
    data: workshop,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['workshopDetail', workshopId, bundle],
    queryFn: async () => {
      let param = {
        id: workshopId,
      };
      if (bundle) {
        param = {
          ...param,
          bundleSfid: bundle,
          id: workshopId,
        };
      }
      const response = await api.get({
        path: bundle ? 'workshopDetailWithBundles' : 'workshopDetail',
        param,
      });
      return response.data;
    },
    enabled: !!workshopId,
  });

  const stripePromise = useStripeLoader(workshop?.publishableKey);

  // Add check for valid stripe initialization
  const isStripeReady = !!stripePromise;

  const CheckoutStates = {
    EMAIL_INPUT: 'EMAIL_INPUT',
    USER_INFO: 'USER_INFO',
  };

  const { showAlert, hideAlert } = useGlobalAlertContext();
  const { showModal } = useGlobalModalContext();
  const [showTopMessage, setShowTopMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comboProductSfid, setComboProductSfid] = useState('');
  const { track, page } = useAnalytics();
  const [validateDiscount, setValidateDiscount] = useState(false);
  const [activeStep, setActiveStep] = useQueryState(
    'step',
    parseAsString.withDefault(CheckoutStates.EMAIL_INPUT),
  );

  const [courseType, setCourseType] = useQueryState(
    'courseType',
    parseAsString.withDefault('SKY_BREATH_MEDITATION'),
  );

  useEffect(() => {
    if (ctype) {
      const courseTypeKey = findKeyByProductTypeId(ctype);
      setCourseType(courseTypeKey);
    }
  }, [ctype]);

  const handleValidateDiscount = (isValid) => {
    setValidateDiscount(isValid);
  };

  useEffect(() => {
    if (workshop && !isAuthenticated && !workshop.isGuestCheckoutEnabled) {
      router.push(
        `/us-en/signin?next=${encodeURIComponent(location.pathname + location.search)}`,
      );
    }
    setTimeout(() => {
      setLoading(false);
    }, 2000);
    if (!workshop) return;

    if (
      workshop.isInitialRequisiteCompleted === false &&
      workshop.initialBusinessRules.length > 0
    ) {
      const reason = workshop.initialBusinessRules[0];

      showAlert(ALERT_TYPES.CUSTOM_ALERT, {
        className: 'retreat-prerequisite-big',
        title: 'Prerequisite',
        closeModalAction: closeRetreatPrerequisiteWarning(reason),
        footer: () => {
          return (
            <button
              className="btn-secondary"
              onClick={closeRetreatPrerequisiteWarning(reason)}
            >
              {reason.actionButtonText}
            </button>
          );
        },
        children: (
          <RetreatPrerequisiteWarning firstPreRequisiteFailedReason={reason} />
        ),
      });
    }

    if (workshop?.bundleInfo) {
      workshop.listPrice = workshop?.bundleInfo.comboListPrice;
      workshop.unitPrice = workshop?.bundleInfo.comboUnitPrice;
    }

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
      user: profile?.id,
    });

    track('eec.checkout', {
      page: `Art of Living ${title} workshop registration page`,
      viewType: 'workshop',
      title: title,
      ctype: productTypeId,
      amount: unitPrice,
      requestType: 'Detail',
      hitType: 'paymentpage',
      user: profile?.id,
      ecommerce: {
        checkout: {
          actionField: {
            step: 1,
          },
          products: products,
        },
      },
    });

    track(
      'begin_checkout',
      {
        ecommerce: {
          currency: 'USD',
          value: workshop?.unitPrice,
          course_format: workshop?.productTypeId,
          course_name: workshop?.title,
          items: [
            {
              item_id: workshop?.id,
              item_name: workshop?.title,
              affiliation: 'NA',
              coupon: '',
              discount: 0.0,
              index: 0,
              item_brand: workshop?.businessOrg,
              item_category: workshop?.title,
              item_category2: workshop?.mode,
              item_category3: 'paid',
              item_category4: 'NA',
              item_category5: 'NA',
              item_list_id: workshop?.productTypeId,
              item_list_name: workshop?.title,
              item_variant: workshop?.workshopTotalHours,
              location_id: workshop?.locationCity,
              price: workshop?.unitPrice,
              quantity: 1,
            },
          ],
        },
      },
      {
        plugins: {
          all: false,
          'gtm-ecommerce-plugin': true,
        },
      },
    );

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
  }, [profile, workshop]);

  const businessOrg = workshop?.businessOrg || 'AOL';

  const closeRetreatPrerequisiteWarning =
    (firstPreRequisiteFailedReason) => (e) => {
      if (e) e.preventDefault();
      hideAlert();
      if (firstPreRequisiteFailedReason.actionButtonLink) {
        if (sourceBundle) {
          pushRouteWithUTMQuery(
            router,
            `/us-en/bundle/courses/${sourceBundle}?course-type=art-of-living-part-1`,
          );
        } else {
          pushRouteWithUTMQuery(
            router,
            firstPreRequisiteFailedReason.actionButtonLink,
          );
        }
      }
    };

  const enrollmentCompletionAction = ({ attendeeId }) => {
    const title = convertToUpperCaseAndReplaceSpacesForURL(workshop.title);
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
    const title = convertToUpperCaseAndReplaceSpacesForURL(workshop.title);
    const processPaymentLink = `/us-en/process-payment/${attendeeId}`;
    const nextUrl = returnRouteWithUTMQuery(router, {
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
    const previousUrl = returnRouteWithUTMQuery(router, {
      pathname: `/us-en/course/checkout/${workshopId}`,
      query: {
        ctype: workshop.productTypeId,
        comboId: comboProductSfid,
      },
    });
    const returnUrl = `${
      window.location.origin
    }${processPaymentLink}?${queryString.stringify({
      next: nextUrl,
      previous: previousUrl,
      stripeOrg: workshop.stripeOrg,
    })}`;
    return returnUrl;
  };

  const login = () => {
    navigateToLogin(router);
  };

  const handleCouseSelection = (selectedId) => {
    if (selectedId === workshop.id) {
      setComboProductSfid('');
    } else {
      setComboProductSfid(selectedId);
    }
  };

  if (isError) {
    if (error?.response?.data?.message === 'No Workshop found') {
      return <CourseNotFoundError />;
    }
    return <ErrorPage statusCode={500} title={error.message} />;
  }
  if (isLoading || !workshopId) return <PageLoading />;

  const isSkyHappinessRetreat =
    COURSE_TYPES.SKY_HAPPINESS_RETREAT.value.indexOf(workshop.productTypeId) >=
    0;

  const isSKYType =
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(workshop.productTypeId) >=
    0;

  const isSahajSamadhiMeditationType =
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(
      workshop.productTypeId,
    ) >= 0;

  const isStripeIntentPayment = !!workshop.isStripeIntentPaymentEnabled;

  const isHBCheckoutPage = businessOrg === 'HB';

  const renderPaymentForm = () => {
    if (isSahajSamadhiMeditationType || isSKYType) {
      return (
        <PaymentFormCheckoutNew
          isStripeIntentPayment={isStripeIntentPayment}
          workshop={workshop}
          courseType={courseType}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          enrollmentCompletionAction={enrollmentCompletionAction}
          enrollmentCompletionLink={enrollmentCompletionLink}
          isLoggedUser={isAuthenticated}
        />
      );
    }
    if (isOldCheckout) {
      return (
        <div className="order hb-checkout-page">
          <PaymentFormHB
            isStripeIntentPayment={isStripeIntentPayment}
            workshop={workshop}
            profile={profile}
            enrollmentCompletionAction={enrollmentCompletionAction}
            enrollmentCompletionLink={enrollmentCompletionLink}
            handleCouseSelection={handleCouseSelection}
            login={login}
            isLoggedUser={isAuthenticated}
            onValidateDiscount={handleValidateDiscount}
          />
        </div>
      );
    }
    if (isSkyHappinessRetreat) {
      return (
        <div className="order sky-checkout-page">
          <PaymentFormGeneric
            isStripeIntentPayment={isStripeIntentPayment}
            workshop={workshop}
            profile={profile}
            enrollmentCompletionAction={enrollmentCompletionAction}
            enrollmentCompletionLink={enrollmentCompletionLink}
            handleCouseSelection={handleCouseSelection}
            login={login}
            isLoggedUser={isAuthenticated}
          />
        </div>
      );
    }
    return (
      <div className="order eec-checkout-page">
        <PaymentFormNew
          isStripeIntentPayment={isStripeIntentPayment}
          workshop={workshop}
          profile={profile}
          enrollmentCompletionAction={enrollmentCompletionAction}
          enrollmentCompletionLink={enrollmentCompletionLink}
          handleCouseSelection={handleCouseSelection}
          login={login}
          isLoggedUser={isAuthenticated}
          onValidateDiscount={handleValidateDiscount}
          isHBForm={isHBCheckoutPage}
        />
      </div>
    );
  };

  const {
    email,
    isStudentVerified,
    studentVerificationDate,
    studentVerificationExpiryDate,
  } = profile || {};

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
    isAuthenticated &&
    validateStudentEmail(email) &&
    workshop.isStudentFeeAllowed &&
    validateDiscount &&
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
      {loading && <Loader />}
      <main>
        {showTopMessage && (
          <aside className="tw-relative tw-whitespace-normal tw-text-center">
            <img src="/img/ic-timer-white.svg" alt="timer" />
            <span>
              Fee increases by ${workshop.earlyBirdFeeIncreasing.increasingFee}{' '}
              starting{' '}
              {dayjs
                .utc(workshop.earlyBirdFeeIncreasing.increasingByDate)
                .format('MMM D, YYYY')}
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

        <section
          className={isOldCheckout || isSkyHappinessRetreat ? 'order' : ''}
        >
          <div className="container">
            {(isOldCheckout || isSkyHappinessRetreat) && (
              <>
                <h1 className="title">{workshop.title}</h1>
                {workshop.isGenericWorkshop ? (
                  <p className="order__detail">
                    Once you register, you will be contacted to schedule your
                    course date
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
              </>
            )}

            {workshop.isCorporateEvent && (
              <div className="tw-mb-[60px]">
                <h1 className="tw-text-center tw-text-4xl tw-font-bold tw-text-[#31364e]">
                  {workshop.corporateName}
                </h1>
              </div>
            )}
            {isStripeReady && (
              <>
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
              </>
            )}

            {!isStripeReady && (
              <div className="tw-p-4 tw-text-center tw-text-red-600">
                Unable to initialize payment system. Please try again later.
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

Checkout.hideHeader = true;
Checkout.hideFooter = true;

export default Checkout;
