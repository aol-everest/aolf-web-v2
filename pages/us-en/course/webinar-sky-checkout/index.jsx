import { PageLoading } from '@components';
import { PaymentFormWebinar } from '@components/PaymentFormWebinar';
import {
  ALERT_TYPES,
  MESSAGE_EMAIL_VERIFICATION_SUCCESS,
  MODAL_TYPES,
  COURSE_TYPES,
} from '@constants';
import {
  useAuth,
  useGlobalAlertContext,
  useGlobalModalContext,
} from '@contexts';
import { withAuth } from '@hoc';
import { useQueryString } from '@hooks';
import { orgConfig } from '@org';
import { pushRouteWithUTMQuery, replaceRouteWithUTMQuery } from '@service';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { api, convertToUpperCaseAndReplaceSpacesForURL } from '@utils';
import dayjs from 'dayjs';
import { NextSeo } from 'next-seo';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAnalytics } from 'use-analytics';

const RetreatPrerequisiteWarning = ({ firstPreRequisiteFailedReason }) => {
  return (
    <>
      <p
        className="course-join-card__text"
        dangerouslySetInnerHTML={{
          __html: firstPreRequisiteFailedReason.preRequisiteFailedReason,
        }}
      ></p>
    </>
  );
};

const validateStudentEmail = (email) => {
  const regex = new RegExp(process.env.NEXT_PUBLIC_STUDENT_EMAIL_REGEX);
  const isStudentEmail = regex.test(email) && email.indexOf('alumni') < 0;
  return isStudentEmail;
};

const WebinarSkyCheckout = () => {
  const router = useRouter();
  const { profile } = useAuth();

  const {
    data: workshops,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: 'workshops',
    queryFn: async () => {
      const response = await api.get({
        path: 'workshops',
        param: {
          ctype: process.env.NEXT_PUBLIC_WEBINAR_SKY_CTYPE,
          org: 'AOL',
        },
      });
      return response.data;
    },
  });

  const [mbsy_source] = useQueryString('mbsy_source');
  const [campaignid] = useQueryString('campaignid');
  const [mbsy] = useQueryString('mbsy');
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const { showModal } = useGlobalModalContext();
  const [showTopMessage, setShowTopMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState('');
  const [workshop, setSelectedWorkshop] = useState({});
  const { track } = useAnalytics();

  useEffect(() => {
    if (workshops?.length > 0) {
      setSelectedWorkshop(workshops[0]);
      setSelectedWorkshopId(workshops[0]?.sfid);
    }
  }, [workshops]);

  useEffect(() => {
    if (!profile && !workshop.id) return;
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
    track('eec.checkout', {
      page: `Art of Living ${title} workshop registration page`,
      viewType: 'workshop',
      title: title,
      ctype: productTypeId,
      amount: unitPrice,
      requestType: 'Detail',
      hitType: 'paymentpage',
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
  }, [profile, workshop]);

  useEffect(() => {
    if (!profile && !workshop.id) return;
    const { businessRules = [], isPreRequisiteCompleted } = workshop;

    const firstPreRequisiteFailedReason = businessRules.find(
      (rule) => !rule.isPreRequisiteCompleted,
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
  }, [workshop.sfid]);

  useEffect(() => {
    const getWorshopDetails = async () => {
      const response = await api.get({
        path: 'workshopDetail',
        param: {
          id: selectedWorkshopId,
          rp: 'checkout',
        },
      });
      if (response?.data) {
        setSelectedWorkshop(response?.data);
      }
    };
    if (selectedWorkshopId) {
      getWorshopDetails();
    }
  }, [selectedWorkshopId]);

  const closeRetreatPrerequisiteWarning =
    (firstPreRequisiteFailedReason) => (e) => {
      if (e) e.preventDefault();
      hideAlert();
      if (firstPreRequisiteFailedReason.actionButtonLink) {
        pushRouteWithUTMQuery(router, {
          pathname: firstPreRequisiteFailedReason.actionButtonLink,
        });
      }
    };

  const enrollmentCompletionAction = ({ attendeeId }) => {
    const title = convertToUpperCaseAndReplaceSpacesForURL(workshop.title);
    replaceRouteWithUTMQuery(router, {
      pathname: `/us-en/course/thankyou/${attendeeId}`,
      query: {
        ctype: workshop.productTypeId,
        comboId: '',
        page: 'ty',
        type: `local${mbsy_source ? '&mbsy_source=' + mbsy_source : ''}`,
        campaignid,
        mbsy,
      },
    });
  };

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading) return <PageLoading />;

  const stripePromise = loadStripe(workshop.publishableKey);

  const handleWorkshopSelectionChange = (workshopId) => {
    setSelectedWorkshopId(workshopId);
  };

  const renderPaymentForm = () => {
    return (
      <PaymentFormWebinar
        workshop={workshop}
        selectedWorkshopId={selectedWorkshopId}
        handleWorkshopSelectionChange={handleWorkshopSelectionChange}
        workshops={workshops}
        profile={profile}
        enrollmentCompletionAction={enrollmentCompletionAction}
      />
    );
  };

  const {
    email,
    isStudentVerified,
    studentVerificationDate,
    studentVerificationExpiryDate,
  } = profile;

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
    validateStudentEmail(email) &&
    workshop.isStudentFeeAllowed &&
    (!isStudentVerified ||
      (isStudentVerified &&
        dayjs(new Date()).diff(dayjs(studentVerificationDate), 'y', true) > 1 &&
        dayjs(studentVerificationExpiryDate).isAfter(dayjs(new Date()))));

  return (
    <>
      <NextSeo title={workshop.title} />
      {loading && <div className="cover-spin"></div>}
      <main>
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
        <section className="order">
          <div className="container">
            <h1 className="title">
              {workshop.title || COURSE_TYPES.SKY_BREATH_MEDITATION.name}
            </h1>
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
                <h1 className="tw-text-center tw-text-4xl tw-font-bold tw-text-[#31364e]">
                  {workshop.corporateName}
                </h1>
              </div>
            )}
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

WebinarSkyCheckout.hideHeader = true;

export default withAuth(WebinarSkyCheckout);
