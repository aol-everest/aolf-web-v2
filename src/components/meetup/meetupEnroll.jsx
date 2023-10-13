import { Loader } from '@components';
import { ABBRS, COURSE_MODES } from '@constants';
import { pushRouteWithUTMQuery } from '@service';
import { tConvert } from '@utils';
import classNames from 'classnames';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/router';

dayjs.extend(utc);

export const MeetupEnroll = ({
  checkoutMeetup,
  closeDetailAction,
  selectedMeetup,
  loading,
  checkoutLoading,
}) => {
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
    freeWithSubscription,
    isSubscriptionOfferingUsed,
    mode,
    locationStreet,
    locationCity,
    locationProvince,
    locationPostalCode,
    locationCountry,
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
              {description && (
                <div
                  className="description"
                  dangerouslySetInnerHTML={{ __html: description }}
                ></div>
              )}

              <p className="date">
                {`${dayjs.utc(meetupStartDate).format('MMMM DD')}, `}
                {`${tConvert(meetupStartTime)} ${ABBRS[eventTimeZone]}, `}
              </p>
              <ul>
                <li>Session Length: {meetupDuration} minutes</li>
                <li>Instructor: {primaryTeacherName}</li>
                {mode === COURSE_MODES.IN_PERSON.name ? (
                  <li>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${
                        locationStreet || ''
                      }, ${locationCity} ${locationProvince} ${locationPostalCode} ${locationCountry}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {locationStreet && <span>{locationStreet}</span>}
                      <span>
                        {' '}
                        {locationCity || ''}
                        {', '}
                        {locationProvince || ''} {locationPostalCode || ''}
                      </span>
                    </a>{' '}
                  </li>
                ) : (
                  <li>Livestreaming from {centerName} </li>
                )}
              </ul>
            </div>

            <div className="card-wrapper">
              <>
                {isSubscriptionOfferingUsed && (
                  <div className={classNames('card full card-preffered')}>
                    <div className="card-body">
                      <p className="card-title">For members</p>
                      <p className="card-text">
                        {loading && <Loader />}
                        {!loading && (
                          <>
                            {listPrice !== unitPrice && (
                              <>
                                <span className="prev-price">${listPrice}</span>{' '}
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
                  </div>
                )}

                {!isSubscriptionOfferingUsed && (
                  <div
                    className={classNames(
                      freeWithSubscription?.subscriptionName
                        ? 'card'
                        : 'card full',
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
                                <span className="prev-price">${listPrice}</span>{' '}
                                ${unitPrice}
                              </>
                            )}
                            {listPrice === unitPrice && <>${unitPrice}</>}
                          </>
                        )}
                      </p>
                      <button
                        className={
                          !freeWithSubscription ? 'btn btn-preffered' : 'btn'
                        }
                        onClick={checkoutMeetup}
                      >
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
