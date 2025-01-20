/* eslint-disable no-inline-styles/no-inline-styles */
import { StripeExpressCheckoutElement } from '@components/checkout/StripeExpressCheckoutElement';
import { ABBRS, COURSE_MODES } from '@constants';
import { pushRouteWithUTMQuery } from '@service';
import { tConvert } from '@utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/router';
import { useCallback, useRef } from 'react';

dayjs.extend(utc);

export const MeetupEnroll = ({
  checkoutMeetup,
  closeDetailAction,
  selectedMeetup,
  checkoutLoading,
}) => {
  const router = useRouter();
  const backdropRef = useRef(null);

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
    freeWithSubscription,
    isSubscriptionOfferingUsed,
    mode,
    locationStreet,
    locationCity,
    locationProvince,
    locationPostalCode,
    locationCountry,
    isCCNotRequired,
  } = selectedMeetup;

  const goToCheckout = (e) => {
    if (e) e.preventDefault();
    closeDetailAction();
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/membership/${freeWithSubscription?.subscriptionMasterId}`,
      query: {
        mid: selectedMeetup.sfid,
        page: 'checkout',
      },
    });
  };

  const handleClick = useCallback(
    (event) => {
      // Check if the clicked element is the backdrop or one of its descendants
      if (event.target === backdropRef.current) {
        // If the clicked element is the backdrop itself, close the modal
        closeDetailAction();
      }
    },
    [closeDetailAction],
  );

  return (
    <div
      className="meetup-rsvp modal modal-window modal-window_no-log fade bd-example-modal-lg show"
      ref={backdropRef}
      onClick={handleClick}
    >
      <div className=" modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="title">RSVP for {meetupTitle}</h2>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={closeDetailAction}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body tw-py-5">
            {/* <div
              className="modal-main-text"
              dangerouslySetInnerHTML={{ __html: description }}
            ></div> */}
            <div className="rsvp-details">
              <div className="rsvp-detail-item">
                <label>
                  <span className="icon-aol iconaol-clock"></span>Date:
                </label>
                <div className="rsvp-detail-text">
                  {' '}
                  {`${dayjs.utc(meetupStartDate).format('MMMM DD')}, `}
                  {`${tConvert(meetupStartTime)} ${ABBRS[eventTimeZone]}, `}
                </div>
              </div>
              <div className="rsvp-detail-item">
                <label>
                  <span className="icon-aol iconaol-calendar"></span>Session
                  Length:
                </label>
                <div className="rsvp-detail-text">{meetupDuration} minutes</div>
              </div>
              <div className="rsvp-detail-item">
                <label>
                  <span className="icon-aol iconaol-profile"></span>
                  Instructor(s)
                </label>
                <div className="rsvp-detail-text">{primaryTeacherName}</div>
              </div>
              <div className="rsvp-detail-item">
                <label>
                  <span className="icon-aol iconaol-location"></span>Location:
                </label>
                <div className="rsvp-detail-text">
                  {mode === COURSE_MODES.IN_PERSON.value ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${
                        locationStreet || ''
                      }, ${locationCity} ${locationProvince} ${locationPostalCode} ${locationCountry}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {locationStreet && <span>{`${locationStreet}, `}</span>}
                      <span>
                        {locationCity && `${locationCity}, `}
                        {locationProvince || ''} {locationPostalCode || ''}
                      </span>
                    </a>
                  ) : (
                    <span>Livestreaming from {centerName}</span>
                  )}
                </div>
              </div>
            </div>
            {isSubscriptionOfferingUsed && (
              <div className="rsvp-price-info">
                <label>For members:</label>
                <div className="rsvp-price">
                  <>
                    {listPrice !== unitPrice && (
                      <>
                        <s>${listPrice}</s>${unitPrice}
                      </>
                    )}
                    {listPrice === unitPrice && <>${unitPrice}</>}
                  </>
                </div>
              </div>
            )}
            {!isSubscriptionOfferingUsed && !isCCNotRequired && (
              <div className="rsvp-member-types">
                <div className="member-detail non-member">
                  <div className="for-member">For non-members</div>
                  <div className="membership-price">
                    <>
                      {listPrice !== unitPrice && (
                        <>
                          <s>${listPrice}</s> ${unitPrice}
                        </>
                      )}
                      {listPrice === unitPrice && <>${unitPrice}</>}
                    </>
                  </div>
                  <button className="member-btn" onClick={checkoutMeetup(null)}>
                    {checkoutLoading && (
                      <div className="loaded tw-px-7 tw-py-0">
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
                {freeWithSubscription?.subscriptionName && (
                  <div className="member-detail plus-member">
                    <div className="for-member">
                      {' '}
                      {`For ${freeWithSubscription?.subscriptionName} members`}
                    </div>
                    <div className="membership-price">
                      <s>${listPrice}</s>$0
                    </div>
                    <button className="member-btn" onClick={goToCheckout}>
                      {`Join and RSVP`}
                    </button>
                  </div>
                )}
              </div>
            )}
            {(isSubscriptionOfferingUsed || isCCNotRequired) && (
              <>
                <div className="payment-agreements"></div>
                <div className="payment-actions modal-actions">
                  {selectedMeetup && selectedMeetup.sfid && (
                    <StripeExpressCheckoutElement
                      workshop={selectedMeetup}
                      goToPaymentModal={checkoutMeetup}
                      selectedWorkshopId={selectedMeetup.sfid}
                      btnText="RSVP"
                      loading={checkoutLoading}
                      showHealthLink={true}
                      buttonClass="btn btn-primary find-courses submit-btn"
                      parentStyle={{ display: 'flex' }}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
