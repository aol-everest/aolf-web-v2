import React from "react";
import classNames from "classnames";
import moment from "moment";
import { Loader } from "@components";
import { tConvert } from "@utils";
import { ABBRS, MEMBERSHIP_TYPES } from "@constants";
import { useAuth } from "@contexts";
import { useRouter } from "next/router";

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
    router.push({
      pathname: "/membership-checkout",
      query: {
        id: MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value,
      },
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

  const isDigitalMember = userSubscriptions.hasOwnProperty(
    MEMBERSHIP_TYPES.DIGITAL_MEMBERSHIP.value,
  );

  const isPremiumMember = userSubscriptions.hasOwnProperty(
    MEMBERSHIP_TYPES.JOURNEY_PREMIUM.value,
  );
  const isBasicMember = userSubscriptions.hasOwnProperty(
    MEMBERSHIP_TYPES.BASIC_MEMBERSHIP.value,
  );

  return (
    <div
      class={classNames(
        "alert__modal modal-window modal-window_no-log modal fixed-right fade",
        {
          active: true,
          show: true,
        },
      )}
    >
      <div
        class={classNames(` modal-dialog modal-dialog-centered`, {
          active: true,
          show: true,
        })}
      >
        <div class="modal-content">
          <div class="logo">
            <img src="/static/media/ic-logo.807a6f6a.svg" alt="logo" />
          </div>
          <div class="close-modal d-lg-none" onClick={closeDetailAction}>
            <div class="close-line"></div>
            <div class="close-line"></div>
          </div>
          <div class="mobile-wrapper">
            <div class="modal-header">
              <button
                type="button"
                class="close"
                data-dismiss="modal"
                onClick={closeDetailAction}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
              <span class="modal-title">RSVP for {meetupTitle}</span>
            </div>
            <div class="modal-body">
              {/* <p class="description">Refresh your {meetupType} practice live with the original recording and a
              certified teacher.</p> */}
              <p class="description">{description}</p>
              <p class="date">
                {`${moment.utc(meetupStartDate).format("MMMM DD")}, `}
                {`${tConvert(meetupStartTime)} ${ABBRS[eventTimeZone]}, `}
              </p>
              <ul>
                <li>Session Length: {meetupDuration}</li>
                <li>Instructor: {primaryTeacherName}</li>
                <li>Livestreaming from {centerName} </li>
              </ul>
            </div>

            <div class="card-wrapper">
              {(isDigitalMember || isPremiumMember || isBasicMember) && (
                <div class={classNames("card full card-preffered")}>
                  <div class="card-body">
                    <p class="card-title">
                      For {isDigitalMember && "Digital"}
                      {isPremiumMember && "Premium"}
                      {isBasicMember && "Basic"} members
                    </p>
                    <p class="card-text">
                      {loading && <Loader />}
                      {!loading && (
                        <>
                          <span class="prev-price">${listPrice}</span> $
                          {memberPrice}
                        </>
                      )}
                    </p>
                    <button class="btn btn-preffered" onClick={checkoutMeetup}>
                      {checkoutLoading && (
                        <div className="loaded" style={{ padding: "0px 58px" }}>
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
                  <div class={classNames("card")}>
                    <div class="card-body">
                      <p class="card-title">For non-members</p>
                      <p class="card-text">
                        {loading && <Loader />}
                        {!loading && (
                          <>
                            {listPrice !== unitPrice && (
                              <>
                                <span class="prev-price">${listPrice}</span> $
                                {unitPrice}
                              </>
                            )}
                            {listPrice === unitPrice && <>${unitPrice}</>}
                          </>
                        )}
                      </p>
                      <button class="btn" onClick={checkoutMeetup}>
                        {checkoutLoading && (
                          <div
                            className="loaded"
                            style={{ padding: "0px 58px" }}
                          >
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
                  <div class="card card-preffered">
                    <div class="card-body">
                      <p class="card-title">For Digital members</p>
                      <p class="card-text">
                        {loading && <Spinner />}
                        {!loading && (
                          <>
                            <span class="prev-price">${listPrice}</span> $
                            {memberPrice}
                          </>
                        )}
                      </p>
                      <button class="btn btn-preffered" onClick={goToCheckout}>
                        Join Digital and RSVP
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div class="close-modal d-none d-lg-flex" onClick={closeDetailAction}>
            <div class="close-line"></div>
            <div class="close-line"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
