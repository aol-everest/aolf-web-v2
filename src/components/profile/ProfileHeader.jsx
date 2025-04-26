/* eslint-disable no-inline-styles/no-inline-styles */
import { COURSE_TYPES, MEMBERSHIP_TYPES, MODAL_TYPES } from '@constants';
import { useGlobalModalContext } from '@contexts';
import { orgConfig } from '@org';
import { pushRouteWithUTMQuery } from '@service';
import { api } from '@utils';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

export const ProfileHeader = ({
  subscriptions = [],
  userSubscriptions = {},
}) => {
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
        const modalBody = (
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
          </>
        );

        if (userSubscriptions[subscriptionId]) {
          showModal(MODAL_TYPES.CUSTOM_MODAL, {
            title: `Your ${modalSubscription.name}`,
            children: modalBody,
            className: 'course-details-card',
            footer: () => {
              return (
                <div className="course-details-card__footer">
                  {userSubscriptions[subscriptionId]
                    .subscriptionBuyingChannel !== 'WEB' && (
                    <a
                      data-tip
                      data-htmlFor="Popover1"
                      href="#"
                      className="link link_gray"
                    >
                      Cancel Membership
                    </a>
                  )}
                  {userSubscriptions[subscriptionId]
                    .subscriptionBuyingChannel === 'WEB' && (
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
            },
          });
        } else {
          showModal(MODAL_TYPES.CUSTOM_MODAL, {
            title: `Unlock ${modalSubscription.name}`,
            children: modalBody,
            className: 'course-join-card',
            footer: () => {
              return (
                <div className="course-join-card__footer">
                  {modalSubscription.activeSubscriptions &&
                    modalSubscription.activeSubscriptions.length > 0 && (
                      <h6>
                        All for only $
                        {modalSubscription.activeSubscriptions[0].price} per
                        month
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
            },
          });
        }
      }
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
      {subscriptions.map((subscription) => (
        <div
          key={subscription.sfid || subscription.subscriptionMasterSfid}
          className="subscription-container"
        >
          {subscriptionPanel(subscription)}
        </div>
      ))}
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
