import React from "react";
import moment from "moment";
import ReactTooltip from "react-tooltip";
import { MEMBERSHIP_TYPES } from "@constants";
import { useRouter } from "next/router";
import { useGlobalModalContext } from "@contexts";
import { MODAL_TYPES } from "@constants";
import { useQuery } from "react-query";
import { api } from "@utils";
import renderHTML from "react-render-html";

export const ProfileHeader = ({
  subscriptions = [],
  userSubscriptions = {},
}) => {
  const router = useRouter();
  const { showModal, hideModal } = useGlobalModalContext();
  const { data: subsciptionCategories = [] } = useQuery(
    "subsciption",
    async () => {
      const response = await api.get({
        path: "subsciption",
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const cancelMembershipAction = (modalSubscriptionId) => (e) => {
    if (e) e.preventDefault();
    hideModal();
    router.push({
      pathname: `/membership/cancellation/${modalSubscriptionId}`,
    });
  };

  const purchaseMembershipAction = (id) => (e) => {
    if (e) e.preventDefault();
    hideModal();
    router.push({
      pathname: `/membership/${id}`,
    });
  };

  const showPurchaseMembershipModalAction = (subscriptionId) => () => {
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
            <div className="course-join-card__text-container">
              {renderHTML(modalSubscription.descriptionHeader)}
            </div>
          )}

          <h6 className="course-details-card__subtitle">
            {modalSubscription.name} benefits:
          </h6>
          <div className="course-details-card__list">
            {modalSubscription.description &&
              renderHTML(modalSubscription.description)}
          </div>
          {modalSubscription.condition && (
            <p className="course-join-card__excludes d-lg-block d-none">
              {renderHTML(modalSubscription.condition)}
            </p>
          )}
        </>
      );

      if (userSubscriptions[subscriptionId]) {
        showModal(MODAL_TYPES.CUSTOM_MODAL, {
          title: `Your ${modalSubscription.name} Membership`,
          children: modalBody,
          className: "course-details-card",
          footer: () => {
            return (
              <div className="course-join-card__footer">
                {userSubscriptions[subscriptionId].subscriptionBuyingChannel !==
                  "WEB" && (
                  <a
                    data-tip
                    data-htmlFor="Popover1"
                    href="#"
                    className="link link_gray"
                  >
                    Cancel Membership
                  </a>
                )}
                {userSubscriptions[subscriptionId].subscriptionBuyingChannel ===
                  "WEB" && (
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
                <ReactTooltip id="Popover1">
                  {modalSubscription.subscriptionBuyingChannel === "WEB" && (
                    <div style={{ maxWidth: "210px", textAlign: "left" }}>
                      Please contact customer service at{" "}
                      <a href="tel:8442735500">(844) 273-5500</a> or{" "}
                      <a href="mailto:app.support@us.artofliving.org">
                        app.support@us.artofliving.org
                      </a>{" "}
                      to cancel your membership
                    </div>
                  )}
                  {modalSubscription.subscriptionBuyingChannel !== "WEB" && (
                    <div style={{ maxWidth: "210px", textAlign: "left" }}>
                      Our records indicate that you signed up for the digital
                      membership from the Journey Mobile App. To cancel your
                      membership, you will need to initiate the cancellation
                      process from the mobile app.
                    </div>
                  )}
                </ReactTooltip>
              </div>
            );
          },
        });
      } else {
        showModal(MODAL_TYPES.CUSTOM_MODAL, {
          title: `Unlock ${modalSubscription.name}`,
          children: modalBody,
          className: "course-join-card",
          footer: () => {
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
          },
        });
      }
    }
  };

  const subscriptionPanel = (subscription) => {
    return (
      <>
        <div className="profile-header__course">
          <strong>{subscription.name} member </strong>
          <span className="profile-header__course-date">
            since{" "}
            {moment(subscription.subscriptionStartDate).format("MMMM DD, YYYY")}
          </span>{" "}
          {MEMBERSHIP_TYPES.FREE_MEMBERSHIP.value !==
            subscription.subscriptionMasterSfid && (
            <a
              href="#"
              className="link link_dark link-modal"
              onClick={showPurchaseMembershipModalAction(
                subscription.subscriptionMasterSfid,
              )}
            >
              <strong>See details</strong>
            </a>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      {subscriptions.map(subscriptionPanel)}
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
      <div className="btn-wrapper">
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
      message =
        "Take your journey deeper with a special offering for silent retreats.";
    } else {
      message =
        "Take your journey deeper with two options for additional content and support";
    }
    if (message) {
      result = <div className="profile-header__course">{message}</div>;
    }
  }

  return (
    <>
      {result}
      <div className="btn-wrapper">
        {!userSubscriptions[MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value] && (
          <button
            data-href-modal="digital-member-join"
            className="btn-secondary link-modal"
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
