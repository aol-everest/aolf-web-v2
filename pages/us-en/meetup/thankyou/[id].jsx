/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-irregular-whitespace */
import { AddToCalendarModal, PageLoading } from '@components';
import {
  InPersonGenericMeetup,
  OnlineMeetup,
  SKYMeetup,
  SahajSamadhiMeetup,
} from '@components/meetupthankYouDetails';
import { ABBRS, ALERT_TYPES, COURSE_MODES, MEETUP_TYPES } from '@constants';
import { useAuth, useGlobalAlertContext } from '@contexts';
import { api, calculateBusinessDays, tConvert } from '@utils';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';
import moment from 'moment';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAnalytics } from 'use-analytics';

dayjs.extend(utc);
dayjs.extend(localizedFormat);

/* export async function getServerSideProps(context) {
  const { query, req, res } = context;
  const { Auth } = withSSRContext({ req });
  const { id } = query;
  try {
    const user = await Auth.currentAuthenticatedUser();
    const currentSession = await Auth.currentSession();
    const token = currentSession.idToken.jwtToken;
    const { data, attendeeRecord } = await api.get({
      path: "getWorkshopByAttendee",
      param: {
        aid: id,
        skipcheck: 1,
      },
      token,
    });
    return {
      props: {
        authenticated: true,
        username: user.username,
        meetup: data,
        attendeeRecord,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      redirect: {
        permanent: false,
        destination: `/us-en/meetup`,
      },
      props: {},
    };
  }
} */

const Thankyou = () => {
  const { isAuthenticated, reloadProfile } = useAuth();
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const router = useRouter();
  const { track } = useAnalytics();

  const { id: attendeeId } = router.query;
  const {
    data: result,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: 'attendeeRecord',
    queryFn: async () => {
      const response = await api.get({
        path: 'getWorkshopByAttendee',
        param: {
          aid: attendeeId,
          skipcheck: '1',
        },
      });
      return response;
    },
  });

  useEffect(() => {
    if (!isAuthenticated || !result) return;
    track('transactionComplete', {
      viewType: 'workshop',
      amount: unitPrice,
      title: meetupTitle || title,
      ctype: productTypeId,
      requestType: 'Thankyou',
      // user,
      ecommerce: {
        currencyCode: 'USD',
        purchase: {
          actionField: {
            id: orderExternalId,
            affiliation: 'Website',
            revenue: ammountPaid,
            tax: '0.00',
            shipping: '0.00',
            coupon: couponCode || '',
          },
          products: [
            {
              id: courseId,
              courseId: courseId,
              name: title,
              category: 'workshop',
              variant: 'N/A',
              brand: 'Art of Living Foundation',
              quantity: 1,
              // price: totalOrderAmount,
            },
          ],
        },
      },
    });
    reloadProfile();
  }, [isAuthenticated, result]);

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading) return <PageLoading />;
  const { data: meetup, attendeeRecord } = result;

  const {
    title,
    meetupTitle,
    eventStartDate,
    eventEndDate,
    productTypeId,
    locationStreet,
    locationCity,
    locationProvince,
    locationPostalCode,
    locationCountry,
    eventStartTime,
    eventEndTime,
    meetupStartDate,
    meetupStartTime,
    meetupStartDateTimeGMT,
    eventTimeZone,
    eventendDateTimeGMT,
    eventStartDateTimeGMT,
    unitPrice,
    id: courseId,
    mode,
    isLocationEmpty,
    meetupDuration,
  } = meetup || {};
  const {
    selectedGenericSlot = {},
    ammountPaid,
    orderExternalId,
    couponCode,
  } = attendeeRecord || {};

  const newTitle = title || meetupTitle;
  const duration = 2;

  const isInPersonSkyMeetup =
    MEETUP_TYPES.SKY_MEETUP.value.indexOf(productTypeId) >= 0;
  const isInPersonSahajSamadhiMeetup =
    MEETUP_TYPES.SAHAJ_SAMADHI_MEETUP.value.indexOf(productTypeId) >= 0;

  let startDatetime = null;
  if (eventStartDateTimeGMT) {
    startDatetime = moment.utc(`${eventStartDateTimeGMT || ''}`);
  } else if (eventStartDate) {
    startDatetime = moment.utc(
      `${eventStartDate || ''} ${eventStartTime || ''}`,
    );
  } else {
    startDatetime = moment.utc(`${meetupStartDateTimeGMT || ''}`);
  }
  let endDatetime = null;
  if (eventendDateTimeGMT) {
    endDatetime = moment.utc(`${eventendDateTimeGMT || ''}`);
  } else if (eventEndDate) {
    endDatetime = moment.utc(`${eventEndDate || ''} ${eventEndTime || ''}`);
  } else {
    endDatetime = moment
      .utc(`${meetupStartDateTimeGMT || ''}`)
      .add(meetupDuration, 'minutes');
  }

  const getSelectedTimeSlotDetails = (selectedTimeSlot) => {
    if (selectedTimeSlot) {
      return (
        <>
          <p className="program_card_subtitle c_text">
            {dayjs.utc(selectedTimeSlot.startDate).format('MMM D') +
              ' - ' +
              dayjs.utc(selectedTimeSlot.endDate).format('D, YYYY')}
          </p>
          <>{showTiming(selectedTimeSlot.timeZone, selectedTimeSlot)}</>
        </>
      );
    }
    return null;
  };

  const showTiming = (timeZone, option) => {
    let weekdayTiming = (
      <p className="program_card_subtitle c_text c_timing">
        {option.weekdayStartTime} - {option.weekdayEndTime} {timeZone}{' '}
        {option.weekendStartTime &&
          calculateBusinessDays(
            dayjs.utc(option.startDate),
            dayjs.utc(option.endDate),
          ).weekday}
      </p>
    );
    let weekendTiming = option.weekendStartTime && (
      <p className="program_card_subtitle c_text c_timing">
        {option.weekendStartTime} - {option.weekendEndTime} {timeZone}{' '}
        {
          calculateBusinessDays(
            dayjs.utc(option.startDate),
            dayjs.utc(option.endDate),
          ).weekend
        }
      </p>
    );
    if (
      dayjs.utc(option.startDate).day() === 0 ||
      dayjs.utc(option.startDate).day() === 6
    ) {
      return (
        <>
          {weekendTiming}
          {weekdayTiming}
        </>
      );
    } else {
      return (
        <>
          {weekdayTiming}
          {weekendTiming}
        </>
      );
    }
  };

  const event = {
    timezone: 'Etc/GMT',
    description: newTitle,
    duration,
    endDatetime: endDatetime.format('YYYYMMDDTHHmmss'),
    location:
      mode === COURSE_MODES.IN_PERSON.name
        ? `${locationStreet || ''}, ${locationCity || ''}, ${
            locationProvince || ''
          } ${locationPostalCode || ''}, ${locationCountry || ''}`
        : 'Online',
    startDatetime: startDatetime.format('YYYYMMDDTHHmmss'),
    title: newTitle,
  };

  const addToCalendarAction = () => {
    showAlert(ALERT_TYPES.CUSTOM_ALERT, {
      title: 'Add to Calendar',

      children: <AddToCalendarModal event={event} />,
      closeModalAction: () => {
        hideAlert();
      },
    });
  };

  const getMeetupImage = () => {
    switch (meetup.meetupType) {
      case 'Short SKY Meditation Meetup':
        return (
          <img className="img-fluid" src="/img/meetup_image.png" alt="bg" />
        );
      case 'Guided Meditation Meetup':
        return (
          <img className="img-fluid" src="/img/meetup_1_image.png" alt="bg" />
        );
      default:
        return (
          <img className="img-fluid" src="/img/meetup_image.png" alt="bg" />
        );
    }
  };

  const RenderJourneyContent = () => {
    if (mode === COURSE_MODES.IN_PERSON.name) {
      if (isInPersonSkyMeetup) {
        return <SKYMeetup />;
      }
      if (isInPersonSahajSamadhiMeetup) {
        return <SahajSamadhiMeetup />;
      }
      return <InPersonGenericMeetup />;
    }
    return <OnlineMeetup />;
  };

  return (
    <>
      <main>
        <section className="get-started">
          <div className="container-md">
            <div className="row align-items-center">
              <div className="col-lg-5 col-md-12 p-md-0">
                <div className="get-started__info">
                  <h3 className="get-started__subtitle">You’re going!</h3>
                  <h1 className="get-started__title section-title">
                    {meetupTitle || title}
                  </h1>
                  <p className="get-started__text">
                    You're registered for the {meetupTitle || title} on{' '}
                    {dayjs.utc(meetupStartDate).format('LL')}
                  </p>
                  <a
                    className="get-started__link"
                    onClick={addToCalendarAction}
                    href="#"
                  >
                    Add to Calendar
                  </a>
                  <p className="get-started__text">
                    You will receive an email confirmation with meetup details.
                  </p>
                </div>
              </div>
              <div className="col-lg-6 col-md-12 offset-lg-1 p-0">
                <div className="get-started__video">{getMeetupImage()}</div>
              </div>
            </div>
          </div>
        </section>
        <section className="journey-starts">
          <div className="container">
            <div className="program-details">
              <h2 className="program-details__title">Program Details</h2>
              {selectedGenericSlot.startDate &&
                getSelectedTimeSlotDetails(selectedGenericSlot)}
              {!selectedGenericSlot.startDate && (
                <>
                  <ul className="program-details__list-schedule">
                    <li className="program-details__schedule tw-flex">
                      <span className="program-details__schedule-date">
                        {dayjs.utc(meetupStartDate).format('LL')}
                      </span>
                      <span className="program-details__schedule-time tw-ml-2">{`${tConvert(
                        meetupStartTime,
                      )} ${ABBRS[eventTimeZone]}`}</span>
                    </li>
                  </ul>
                </>
              )}
              {mode === COURSE_MODES.IN_PERSON.name && (
                <>
                  {!isLocationEmpty && (
                    <ul className="program-details__list-schedule tw-mt-2">
                      <span className="program-details__schedule-date">
                        Location
                      </span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${
                          meetup.locationStreet || ''
                        }, ${meetup.locationCity} ${meetup.locationProvince} ${
                          meetup.locationPostalCode
                        } ${meetup.locationCountry}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {meetup.locationStreet && (
                          <li className="tw-truncate tw-text-sm tw-tracking-tighter !tw-text-[#3d8be8]">
                            {meetup.locationStreet}
                          </li>
                        )}
                        <li className="tw-truncate tw-text-sm tw-tracking-tighter !tw-text-[#3d8be8]">
                          {meetup.locationCity || ''}
                          {', '}
                          {meetup.locationProvince || ''}{' '}
                          {meetup.locationPostalCode || ''}
                        </li>
                      </a>
                    </ul>
                  )}
                  {isLocationEmpty && (
                    <ul className="program-details__list-schedule tw-mt-2">
                      <span className="program-details__schedule-date">
                        Location
                      </span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${
                          meetup.streetAddress1 || ''
                        },${meetup.streetAddress2 || ''} ${meetup.city} ${
                          meetup.state
                        } ${meetup.zip} ${meetup.country}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {meetup.streetAddress1 && (
                          <li className="tw-truncate tw-text-sm tw-tracking-tighter !tw-text-[#3d8be8]">
                            {meetup.streetAddress1}
                          </li>
                        )}
                        {meetup.streetAddress2 && (
                          <li className="tw-truncate tw-text-sm tw-tracking-tighter !tw-text-[#3d8be8]">
                            {meetup.streetAddress2}
                          </li>
                        )}
                        <li className="tw-truncate tw-text-sm tw-tracking-tighter !tw-text-[#3d8be8]">
                          {meetup.city || ''}
                          {', '}
                          {meetup.state || ''} {meetup.zip || ''}
                        </li>
                      </a>
                    </ul>
                  )}
                </>
              )}
            </div>
            <h2 className="journey-starts__title section-title">
              Your journey starts here
            </h2>
            <RenderJourneyContent />
          </div>
        </section>
      </main>
      <div className="course-bottom-card show">
        <div className="container">
          <div className="course-bottom-card__container">
            <div className="course-bottom-card__info-block">
              <div className="course-bottom-card__img d-none d-lg-block">
                <img src="/img/silent-card-img.png" alt="img" />
              </div>
              <div className="course-bottom-card__info">
                <p>{dayjs.utc(meetupStartDate).format('LL')}</p>
                <div>
                  <h3>{meetupTitle}</h3>
                </div>
              </div>
            </div>
            <button
              id="register-button-2"
              className="btn-secondary"
              onClick={addToCalendarAction}
            >
              Add to Calendar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Workshop.requiresAuth = true;
// Workshop.redirectUnauthenticated = "/login";

export default Thankyou;
