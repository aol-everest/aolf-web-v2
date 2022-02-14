import React from "react";
import classNames from "classnames";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Loader } from "@components";
import { tConvert } from "@utils";
import { ABBRS, MEMBERSHIP_TYPES } from "@constants";
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
  const { authenticated = false, profile } = useAuth();
  const router = useRouter();

  const goToCheckout = (e) => {
    if (e) e.preventDefault();
    closeDetailAction();
    router.push({
      pathname: `/us/membership/${MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value}`,
    });
  };

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
    memberPrice,
    description,
  } = selectedMeetup;

  // const isMandatoryWorkshopRequired = meetupMandatoryWorkshopId && isLoggedIn;
  const { subscriptions = [] } = profile;

  const userSubscriptions =
    subscriptions &&
    subscriptions.reduce((accumulator, currentValue) => {
      return {
        ...accumulator,
        [currentValue.subscriptionMasterSfid]: currentValue,
      };
    }, {});

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
              {(isDigitalMember || isPremiumMember || isBasicMember) && (
                <div className={classNames("card full card-preffered")}>
                  <div className="card-body">
                    <p className="card-title">
                      For {isDigitalMember && "Digital"}
                      {isPremiumMember && "Premium"}
                      {isBasicMember && "Basic"} members
                    </p>
                    <p className="card-text">
                      {loading && <Loader />}
                      {!loading && (
                        <>
                          <span className="prev-price">${listPrice}</span> $
                          {memberPrice}
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

              {!isDigitalMember && !isPremiumMember && !isBasicMember && (
                <>
                  <div className={classNames("card")}>
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
                      <button className="btn" onClick={checkoutMeetup}>
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
                  <div className="card card-preffered">
                    <div className="card-body">
                      <p className="card-title">For Digital members</p>
                      <p className="card-text">
                        {/* {loading && <Spinner />} */}
                        {!loading && (
                          <>
                            <span className="prev-price">${listPrice}</span> $
                            {memberPrice}
                          </>
                        )}
                      </p>
                      <button
                        className="btn btn-preffered"
                        onClick={goToCheckout}
                      >
                        Join Digital and RSVP
                      </button>
                    </div>
                  </div>
                </>
              )}
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
