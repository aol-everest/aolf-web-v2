import React from "react";
import classNames from "classnames";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Loader } from "@components";
import { tConvert } from "@utils";
import { ABBRS, COURSE_MODES, MEMBERSHIP_TYPES } from "@constants";
import { useAuth } from "@contexts";
import { useRouter } from "next/router";

dayjs.extend(utc);

export const MeetupEnroll = ({
  checkoutMeetup,
  closeDetailAction,
  selectedMeetup,
  loading,
  checkoutLoading,
}) => {
  const { user } = useAuth();
  const router = useRouter();

  const {
    meetupTitle,
    meetupDuration,
    centerName,
    primaryTeacherName,
    meetupStartDate,
    meetupStartTime,
    eventTimeZone,
    unitPrice,
    listPrice,
    description,
    mode,
    subscriptionPlanRequired,
    freeWithSubscription,
    isSubscriptionOfferingUsed,
  } = selectedMeetup;

  const goToCheckout = (e) => {
    if (e) e.preventDefault();
    closeDetailAction();
    router.push({
      pathname: `/us-en/membership/${freeWithSubscription?.subscriptionMasterId}`,
      query: {
        mid: selectedMeetup.sfid,
        page: "checkout",
      },
    });
  };

  // const isMandatoryWorkshopRequired = meetupMandatoryWorkshopId && isLoggedIn;
  const { subscriptions = [] } = user.profile;
  const inPersonMeetup = mode === COURSE_MODES.IN_PERSON.name;

  const userSubscriptions =
    subscriptions &&
    subscriptions.reduce((accumulator, currentValue) => {
      return {
        ...accumulator,
        [currentValue.subscriptionMasterSfid]: currentValue,
      };
    }, {});

  const noUpsellSubscriptions =
    inPersonMeetup &&
    subscriptions.filter((item) =>
      subscriptionPlanRequired?.includes(item.subscriptionType),
    )?.length === 0;

  const isDigitalMember =
    userSubscriptions[MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value];

  const isPremiumMember =
    userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PREMIUM.value];
  const isBasicMember =
    userSubscriptions[MEMBERSHIP_TYPES.BASIC_MEMBERSHIP.value];

  return (
    <div className="alert__modal modal-window modal-window_no-log modal fixed-right fade active show">
      <div className=" modal-dialog modal-dialog-centered active">
        <div className="modal-content">
          <div className="logo">
            <img src="/img/ic-logo.svg" alt="logo" />
          </div>
          <div className="close-modal d-lg-none" onClick={closeDetailAction}>
            <div className="close-line"></div>
            <div className="close-line"></div>
          </div>
          <div className="mobile-wrapper">
            <div className="modal-header">
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                onClick={closeDetailAction}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
              <span className="modal-title">RSVP for {meetupTitle}</span>
            </div>
            <div className="modal-body">
              {/* <p className="description">Refresh your {meetupType} practice live with the original recording and a
              certified teacher.</p> */}
              <p className="description">{description}</p>
              <p className="date">
                {`${dayjs.utc(meetupStartDate).format("MMMM DD")}, `}
                {`${tConvert(meetupStartTime)} ${ABBRS[eventTimeZone]}, `}
              </p>
              <ul>
                <li>Session Length: {meetupDuration}</li>
                <li>Instructor: {primaryTeacherName}</li>
                <li>Livestreaming from {centerName} </li>
              </ul>
            </div>

            <div className="card-wrapper">
              <>
                {isSubscriptionOfferingUsed && (
                  <div className={classNames("card full card-preffered")}>
                    <div className="card-body">
                      <p className="card-title">For members</p>
                      <p className="card-text">
                        {loading && <Loader />}
                        {!loading && (
                          <>
                            {listPrice !== unitPrice && (
                              <>
                                <span className="prev-price">${listPrice}</span>{" "}
                                ${unitPrice}
                              </>
                            )}
                            {listPrice === unitPrice && <>${unitPrice}</>}
                          </>
                        )}
                      </p>
                      <button
                        className="btn btn-preffered"
                        onClick={checkoutMeetup}
                      >
                        {checkoutLoading && (
                          <div className="loaded tw-py-0 tw-px-7">
                            <div className="loader">
                              <div className="loader-inner ball-clip-rotate">
                                <div />
                              </div>
                            </div>
                          </div>
                        )}
                        {!checkoutLoading && `RSVP`}
                      </button>
                    </div>
                  </div>
                )}

                {!isSubscriptionOfferingUsed && (
                  <div
                    className={classNames(
                      freeWithSubscription?.subscriptionName
                        ? "card"
                        : "card full",
                    )}
                  >
                    <div className="card-body">
                      <p className="card-title">For non-members</p>
                      <p className="card-text">
                        {loading && <Loader />}
                        {!loading && (
                          <>
                            {listPrice !== unitPrice && (
                              <>
                                <span className="prev-price">${listPrice}</span>{" "}
                                ${unitPrice}
                              </>
                            )}
                            {listPrice === unitPrice && <>${unitPrice}</>}
                          </>
                        )}
                      </p>
                      <button
                        className={
                          !freeWithSubscription ? "btn btn-preffered" : "btn"
                        }
                        onClick={checkoutMeetup}
                      >
                        {checkoutLoading && (
                          <div className="loaded tw-py-0 tw-px-7">
                            <div className="loader">
                              <div className="loader-inner ball-clip-rotate">
                                <div />
                              </div>
                            </div>
                          </div>
                        )}
                        {!checkoutLoading && `RSVP`}
                      </button>
                    </div>
                  </div>
                )}
                {!isSubscriptionOfferingUsed &&
                  freeWithSubscription?.subscriptionName && (
                    <div className="card card-preffered">
                      <div className="card-body">
                        <p className="card-title">
                          {`For ${freeWithSubscription?.subscriptionName} members`}
                        </p>
                        <p className="card-text">
                          {/* {loading && <Spinner />} */}
                          {!loading && (
                            <>
                              <span className="prev-price">${listPrice}</span> $
                              {0}
                            </>
                          )}
                        </p>
                        <button
                          className="btn btn-preffered"
                          onClick={goToCheckout}
                        >
                          {`Join and RSVP`}
                        </button>
                      </div>
                    </div>
                  )}
              </>
            </div>
          </div>
          <div
            className="close-modal d-none d-lg-flex"
            onClick={closeDetailAction}
          >
            <div className="close-line"></div>
            <div className="close-line"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
