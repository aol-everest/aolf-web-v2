/* eslint-disable no-inline-styles/no-inline-styles */
import { useState } from 'react';
import {
  COURSE_TYPES,
  MEMBERSHIP_TYPES,
  MODAL_TYPES,
  MESSAGE_EMAIL_VERIFICATION_SUCCESS,
} from '@constants';
import { Loader } from '@components';
import { useGlobalModalContext } from '@contexts';
import { orgConfig } from '@org';
import { pushRouteWithUTMQuery } from '@service';
import { api } from '@utils';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Tooltip } from 'react-tooltip';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { UpdateCC } from '../reInstate/UpdateCC';
import 'react-tooltip/dist/react-tooltip.css';

export const ProfileHeader = ({
  subscriptions = [],
  userSubscriptions = {},
  isStudentVerified,
  email,
  studentVerificationDate,
  studentVerificationExpiryDate,
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState(null);
  const [showReinstate, setShowReinstate] = useState(false);
  const [modalKey, setModalKey] = useState(0);

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );

  const reinstateRequired = subscriptions?.find(
    ({ isReinstateRequiredForSubscription }) =>
      isReinstateRequiredForSubscription,
  );

  const validateStudentEmail = (email) => {
    if (!email) {
      return false;
    }
    const regex = new RegExp(process.env.NEXT_PUBLIC_STUDENT_EMAIL_REGEX);
    const isStudentEmail = regex.test(email) && email.indexOf('alumni') < 0;
    return isStudentEmail;
  };

  const isStudentFlowEnabled =
    process.env.NEXT_PUBLIC_ENABLE_STUDENT_FLOW === 'true';

  const showVerifyStudentStatus =
    isStudentFlowEnabled &&
    validateStudentEmail(email) &&
    (!isStudentVerified ||
      (isStudentVerified &&
        dayjs(new Date()).diff(dayjs(studentVerificationDate), 'y', true) > 1 &&
        dayjs(studentVerificationExpiryDate).isAfter(dayjs(new Date()))));

  const router = useRouter();

  const { showModal, hideModal } = useGlobalModalContext();

  const { data: subsciptionCategories = [] } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const response = await api.get({
        path: 'subsciption',
      });
      return response.data;
    },
  });

  const updateSuccess = (amount, modalProps) => {
    setIsSuccess(true);
    setAmount(amount);
    renderModal({
      ...modalProps,
      amount: amount,
      showReinstate: true,
      className: 'course-details-card',
      isJoinModal: false,
    });
  };

  const updateError = (error, modalProps) => {
    setError(error);
    renderModal({
      ...modalProps,
      error: error,
      showReinstate: true,
      className: 'course-details-card',
      isJoinModal: false,
    });
  };

  const cancelMembershipAction = (modalSubscriptionId) => (e) => {
    if (e) e.preventDefault();
    hideModal();
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/membership/cancellation/${modalSubscriptionId}`,
    });
  };

  const purchaseMembershipAction = (id) => (e) => {
    if (e) e.preventDefault();
    hideModal();
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/membership/${id}`,
    });
  };

  const MembershipModalContent = ({
    modalSubscription,
    subscription,
    error,
    isSuccess,
    amount,
    showReinstate,
    updateSuccess,
    updateError,
    userSubscriptions,
    subscriptionId,
    setShowReinstate,
  }) => {
    return (
      <>
        {modalSubscription.descriptionHeader && (
          <div
            className="course-join-card__text-container"
            dangerouslySetInnerHTML={{
              __html: modalSubscription.descriptionHeader,
            }}
          ></div>
        )}

        <h6 className="course-details-card__subtitle">
          {subscription?.name || modalSubscription.name} benefits:
        </h6>
        {(subscription?.subscriptionOfferingDescription ||
          modalSubscription.description) && (
          <div
            className="course-details-card__list"
            dangerouslySetInnerHTML={{
              __html:
                subscription?.subscriptionOfferingDescription ||
                modalSubscription.description,
            }}
          ></div>
        )}
        {(subscription?.subscriptionOfferingCondition ||
          modalSubscription.condition) && (
          <p
            className="course-join-card__excludes d-lg-block d-none"
            dangerouslySetInnerHTML={{
              __html:
                subscription?.subscriptionOfferingCondition ||
                modalSubscription.condition,
            }}
          ></p>
        )}

        {error && showReinstate && (
          <div className="reinstate-container">
            <div className="error-block">
              <p className="error-message">
                {
                  "We're sorry, but something went wrong. Please try again or contact support."
                }
                <p className="error-detail tw-pt-2 tw-text-xs tw-italic tw-text-orange-600">
                  Error: {error}
                </p>
              </p>
            </div>
          </div>
        )}

        {isSuccess && showReinstate && (
          <div className="reinstate-container">
            <div>
              You will be charged ${amount} for missing payment and your
              membership has been reinstated.
            </div>
          </div>
        )}

        {!error && showReinstate && (
          <div className="reinstate-container">
            <Elements
              stripe={stripePromise}
              fonts={[
                {
                  cssSrc:
                    'https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
                },
              ]}
            >
              <UpdateCC
                updateSuccess={updateSuccess}
                updateError={updateError}
                subscription={subscription}
                modalProps={{
                  modalSubscription,
                  subscription,
                  error,
                  isSuccess,
                  amount,
                  showReinstate,
                  updateSuccess,
                  updateError,
                  userSubscriptions,
                  subscriptionId,
                  setShowReinstate,
                }}
              />
            </Elements>
          </div>
        )}
      </>
    );
  };

  const renderModal = ({
    modalSubscription,
    subscription,
    modalKey,
    userSubscriptions,
    error,
    isSuccess,
    amount,
    setShowReinstate,
    updateSuccess,
    updateError,
    subscriptionId,
    showReinstate = false,
    title,
    className,
    isJoinModal = false,
  }) => {
    showModal(MODAL_TYPES.CUSTOM_MODAL, {
      title: title,
      className: className,
      children: (
        <MembershipModalContent
          key={modalKey}
          modalSubscription={modalSubscription}
          subscription={subscription}
          userSubscriptions={userSubscriptions}
          error={error}
          isSuccess={isSuccess}
          amount={amount}
          showReinstate={showReinstate}
          setShowReinstate={setShowReinstate}
          updateSuccess={updateSuccess}
          updateError={updateError}
          subscriptionId={subscriptionId}
        />
      ),
      footer: () => {
        if (isJoinModal) {
          return (
            <div className="course-join-card__footer">
              {modalSubscription.activeSubscriptions &&
                modalSubscription.activeSubscriptions.length > 0 && (
                  <h6>
                    All for only $
                    {modalSubscription.activeSubscriptions[0].price} per month
                  </h6>
                )}

              <button
                className="btn-secondary v2"
                onClick={purchaseMembershipAction(modalSubscription.sfid)}
              >
                Join {modalSubscription.name}
              </button>
            </div>
          );
        } else {
          return (
            <div className="course-details-card__footer">
              {reinstateRequired && (
                <a
                  href="#"
                  className="link link_gray reinstate"
                  onClick={(e) => {
                    e.preventDefault();
                    setModalKey((k) => k + 1);
                    setError(null);
                    setIsSuccess(false);
                    setAmount(0);
                    renderModal({
                      modalSubscription,
                      subscription,
                      modalKey,
                      userSubscriptions,
                      error: null,
                      isSuccess: false,
                      amount: 0,
                      setShowReinstate,
                      updateSuccess,
                      updateError,
                      subscriptionId,
                      showReinstate: true,
                      className: 'course-details-card',
                      isJoinModal: false,
                    });
                  }}
                >
                  Reinstate
                </a>
              )}
              {userSubscriptions[subscriptionId].subscriptionBuyingChannel ===
                'WEB' && (
                <a
                  href="#"
                  className="link link_gray"
                  onClick={cancelMembershipAction(
                    userSubscriptions[subscriptionId].sfid,
                  )}
                >
                  Cancel Membership
                </a>
              )}
              <Tooltip anchorId="Popover1">
                {modalSubscription.subscriptionBuyingChannel === 'WEB' && (
                  <div className="tw-max-w-[210px] tw-text-left">
                    Please contact customer service at{' '}
                    <a href={`tel:${orgConfig.contactNumberLink}`}>
                      {orgConfig.contactNumber}
                    </a>{' '}
                    or{' '}
                    <a href="mailto:app.support@us.artofliving.org">
                      app.support@us.artofliving.org
                    </a>{' '}
                    to cancel your membership
                  </div>
                )}
                {modalSubscription.subscriptionBuyingChannel !== 'WEB' && (
                  <div className="tw-max-w-[210px] tw-text-left">
                    Our records indicate that you signed up for the digital
                    membership from the Journey Mobile App. To cancel your
                    membership, you will need to initiate the cancellation
                    process from the mobile app.
                  </div>
                )}
              </Tooltip>
            </div>
          );
        }
      },
    });
  };

  const showPurchaseMembershipModalAction =
    (subscriptionId, subscription = null) =>
    () => {
      const allSubscriptions = subsciptionCategories.reduce(
        (accumulator, currentValue) => {
          return {
            ...accumulator,
            [currentValue.sfid]: currentValue,
          };
        },
        {},
      );
      if (allSubscriptions[subscriptionId]) {
        const modalSubscription = allSubscriptions[subscriptionId];

        if (userSubscriptions[subscriptionId]) {
          renderModal({
            title: `Your ${modalSubscription.name}`,
            className: 'course-details-card',
            modalSubscription,
            subscription,
            modalKey,
            userSubscriptions,
            error,
            isSuccess,
            amount,
            setShowReinstate,
            updateSuccess,
            updateError,
            subscriptionId,
            showReinstate,
          });
        } else {
          renderModal({
            title: `Unlock ${modalSubscription.name}`,
            className: 'course-join-card',
            modalSubscription,
            subscription,
            modalKey,
            userSubscriptions,
            error,
            isSuccess,
            amount,
            setShowReinstate,
            updateSuccess,
            updateError,
            subscriptionId,
            showReinstate,
            isJoinModal: true,
          });
        }
      }
    };

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
            <div className="modal-content tw-justify-center">
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

  const subscriptionPanel = (subscription) => {
    return (
      <>
        <div className="user-type tw-pt-2">{subscription.name} member</div>
        <div className="user-since">
          since{' '}
          {dayjs(subscription.subscriptionStartDate).format('MMMM DD, YYYY')}
        </div>

        {MEMBERSHIP_TYPES.FREE_MEMBERSHIP.value !==
          subscription.subscriptionMasterSfid && (
          <a
            href="#"
            style={{ fontSize: 14 }}
            className="link link_dark link-modal"
            onClick={showPurchaseMembershipModalAction(
              subscription.subscriptionMasterSfid,
              subscription,
            )}
          >
            <strong>See details</strong>
          </a>
        )}
      </>
    );
  };

  return (
    <>
      {loading && <Loader />}
      {subscriptions.map((subscription) => (
        <div
          key={subscription.sfid || subscription.subscriptionMasterSfid}
          className="subscription-container"
        >
          {subscriptionPanel(subscription)}
        </div>
      ))}
      {showVerifyStudentStatus && (
        <a
          href="#"
          style={{ fontSize: 14 }}
          className="link link_dark link-modal"
          onClick={handleVerifyStudentEmail}
        >
          <strong>Verify student status</strong>
        </a>
      )}
      {subscriptionBuyBtnPanel(
        userSubscriptions,
        showPurchaseMembershipModalAction,
      )}
    </>
  );
};

const subscriptionBuyBtnPanel = (
  userSubscriptions,
  showPurchaseMembershipModalAction,
) => {
  if (userSubscriptions[MEMBERSHIP_TYPES.BASIC_MEMBERSHIP.value]) {
    return (
      <div className="btn-wrapper" key={MEMBERSHIP_TYPES.JOURNEY_PREMIUM.value}>
        <button
          data-href-modal="digital-member-join"
          className="btn-secondary link-modal v2"
          onClick={showPurchaseMembershipModalAction(
            MEMBERSHIP_TYPES.JOURNEY_PREMIUM.value,
          )}
        >
          Upgrade to Journey Premium Membership
        </button>
      </div>
    );
  }
  if (userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PREMIUM.value]) {
    return null;
  }
  let result = null;
  if (!userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PLUS.value]) {
    let message = null;
    if (userSubscriptions[MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value]) {
      message = `Take your journey deeper with a special offering for ${COURSE_TYPES.SILENT_RETREAT.name}.`;
    } else {
      message =
        'Take your journey deeper with two options for additional content and support';
    }
    if (message) {
      result = <div className="new-journey-header">{message}</div>;
    }
  }

  return (
    <>
      {result}
      <div className="new-journey-btn-wrapper">
        {!userSubscriptions[MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value] && (
          <button
            data-href-modal="digital-member-join"
            className="btn-secondary link-modal tw-mb-4"
            onClick={showPurchaseMembershipModalAction(
              MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value,
            )}
          >
            Learn about Digital Membership
          </button>
        )}

        {!userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PLUS.value] && (
          <button
            data-href-modal="journey-join"
            className="btn-secondary link-modal"
            onClick={showPurchaseMembershipModalAction(
              MEMBERSHIP_TYPES.JOURNEY_PLUS.value,
            )}
          >
            Discover Journey +
          </button>
        )}
      </div>
    </>
  );
};
