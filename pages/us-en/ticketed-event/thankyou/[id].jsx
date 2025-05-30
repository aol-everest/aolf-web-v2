import { api, concatenateStrings, tConvert } from '@utils';
import { useRouter } from 'next/router';
import React from 'react';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';
import { useEffectOnce } from 'react-use';
import { FaTicket, FaAngellist, FaMoneyBill, FaList } from 'react-icons/fa6';
import { FaInfoCircle } from 'react-icons/fa';
import { ABBRS, ALERT_TYPES, COURSE_MODES } from '@constants';
import { AddToCalendarModal } from '@components/addToCalendarModal';
import { useGlobalAlertContext } from '@contexts';
import { useAnalytics } from 'use-analytics';
import { PageLoading } from '@components';
import ErrorPage from 'next/error';

dayjs.extend(utc);
dayjs.extend(localizedFormat);

const TicketCongratulations = () => {
  const router = useRouter();
  const { track, page } = useAnalytics();
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const { id: attendeeId } = router.query;

  useEffectOnce(() => {
    page({
      category: 'ticketed_event',
      name: 'ticketed_event_thank_you',
      referral: 'ticketed_event_checkout',
    });
  });

  const {
    data: attendeeDetail,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: 'getTicketedEventAttendees',
    queryFn: async () => {
      const response = await api.get({
        path: 'getTicketedEventAttendees',
        param: {
          orderId: attendeeId,
        },
      });
      return response.data;
    },
    enabled: !!attendeeId,
  });

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !router.isReady) return <PageLoading />;

  const duration = 2;

  const {
    title,
    phone1,
    phone2,
    email,
    eventStartTime,
    eventEndTime,
    eventStartDate,
    eventStartDateTimeGMT = '',
    eventendDateTimeGMT = '',
    locationStreet,
    locationCity,
    locationProvince,
    locationPostalCode,
    locationCountry,
    contactName,
    eventEndDate,
    eventImageUrl,
    mode,
    isLocationEmpty,
    streetAddress1,
    streetAddress2,
    city,
    state,
    zip,
    country,
    timings,
    primaryTeacherName,
    coTeacher1Name,
  } = attendeeDetail.ticketedEvent || {};

  const totalNoOfTickets = attendeeDetail.attendees.length;

  let startDatetime = null;
  if (eventStartDateTimeGMT) {
    startDatetime = moment.utc(`${eventStartDateTimeGMT || ''}`);
  } else if (eventStartDate) {
    startDatetime = moment.utc(
      `${eventStartDate || ''} ${eventStartTime || ''}`,
    );
  }

  let endDatetime = null;
  if (eventendDateTimeGMT) {
    endDatetime = moment.utc(`${eventendDateTimeGMT || ''}`);
  } else if (eventEndDate) {
    endDatetime = moment.utc(`${eventEndDate || ''} ${eventEndTime || ''}`);
  }

  const event = {
    timezone: 'Etc/GMT',
    description: title,
    duration,
    endDatetime: endDatetime.format('YYYYMMDDTHHmmss'),
    location:
      mode === COURSE_MODES.IN_PERSON.value
        ? `${locationStreet || ''}, ${locationCity || ''}, ${
            locationProvince || ''
          } ${locationPostalCode || ''}, ${locationCountry || ''}`
        : 'Online',
    startDatetime: startDatetime.format('YYYYMMDDTHHmmss'),
    title: title,
  };

  const addToCalendarAction = (e) => {
    if (e) e.preventDefault();
    showAlert(ALERT_TYPES.CUSTOM_ALERT, {
      title: 'Add to Calendar',
      children: <AddToCalendarModal event={event} />,
      closeModalAction: () => {
        hideAlert();
      },
    });

    track('click_button', {
      screen_name: 'ticketed_event_thank_you',
      event_target: 'add_to_calendar_button',
      referral: 'ticketed_event_checkout',
    });
  };

  const ticketTiers = attendeeDetail.attendees.map(
    (item) => item?.pricingTierName,
  );
  const uniqueTicketTiers = [...new Set(ticketTiers)];
  const tickets = attendeeDetail.attendees;
  // if (!attendeeDetail.ticketedEvent.isAllAttedeeInformationRequired) {
  //   tickets = [
  //     attendeeDetail.attendees.find(
  //       (obj) => obj.firstName && obj.lastName && obj.email,
  //     ),
  //   ];
  // }

  return (
    <main className="course-filter calendar-online">
      <section className="calendar-top-section">
        <div className="container calendar-benefits-section">
          <h2 className="section-title">
            <strong>Congratulations</strong>
          </h2>
          <div className="section-description">
            <strong>You are going</strong> to the {title}
          </div>
        </div>

        <div className="container checkout-congratulations">
          <div className="calendar-benefits-wrapper row">
            <div className="col-12 col-lg-8 paddingRight">
              <h2 className="section-title">
                <FaList className="fa fa-list-alt" /> Order Details
              </h2>
              <div className="order-details-wrapper">
                <ul className="order-items-list">
                  <li className="order-item">
                    <FaTicket className="fa fa-ticket" />{' '}
                    <span>Ticket Tiers: </span>
                    {uniqueTicketTiers?.join(', ')}
                  </li>
                  <li className="order-item">
                    <FaAngellist className="fa fa-hand-peace-o" />{' '}
                    <span>Number of Tickets: </span>
                    {totalNoOfTickets}
                  </li>
                  <li className="order-item">
                    <FaMoneyBill className="fa fa-money" />{' '}
                    <span>Order Total: </span> $
                    {(attendeeDetail?.totalAmountPaid || 0).toFixed(2)}
                  </li>
                </ul>
                <div className="bottom-info">
                  <FaInfoCircle className="fa fa-info-circle" /> You should
                  receive the tickets in your email
                </div>
              </div>

              {tickets?.length > 0 && (
                <>
                  <h2 className="section-title">
                    <FaList className="fa fa-list-alt" /> Ticket Information
                  </h2>
                  <div className="tickets-accepted">
                    {tickets.map((item, index) => {
                      return (
                        <div
                          className="ticket-box"
                          key={item.attendeeRecordExternalId}
                        >
                          <div className="ticket-header">
                            <div className="ticket-title">
                              TICKET HOLDER{' '}
                              {tickets.length > 1 ? `#${index + 1}` : ''}
                            </div>
                            <div className="ticket-type">
                              {item.pricingTierName}
                            </div>
                          </div>
                          <div className="ticket-body">
                            <div className="ticket-holder-name">
                              {item.name}
                            </div>
                            <div className="ticket-holder-email">
                              {item.email}
                            </div>
                            <div className="ticket-holder-mobile">
                              {item.contactPhone}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            <div className="col-12 col-lg-4 borderLeft">
              <div className="sidebar-banner">
                <img
                  className="w-full rounded-[12px]"
                  src={eventImageUrl}
                  alt="gurudev image"
                />
              </div>
              <div className="add-calendar-btn-wrap">
                <button
                  className="register-button"
                  onClick={addToCalendarAction}
                >
                  Add to Calendar <i className="fa fa-calendar-plus-o"></i>
                </button>
              </div>
              <div className="event-details-wrapper">
                <h2 className="section-title">
                  <i className="fa fa-list-alt" aria-hidden="true"></i> Event
                  Details
                </h2>
                <ul className="event-items-list">
                  <li className="event-item">
                    <i className="fa-ticket" aria-hidden="true"></i>{' '}
                    <span>Event: </span>
                    {title}
                  </li>
                  <li className="event-item">
                    <i className="fa fa-sun-o" aria-hidden="true"></i>{' '}
                    <span>Date: </span>{' '}
                    {eventStartDate === eventEndDate
                      ? dayjs.utc(eventStartDate).format('MMM DD, YYYY')
                      : `${dayjs.utc(eventStartDate).format('MMM DD')}-${dayjs
                          .utc(eventEndDate)
                          .format('DD, YYYY')}`}
                  </li>

                  <li className="event-item">
                    <i className="fa fa-clock" aria-hidden="true"></i>{' '}
                    <span>Timing: </span>
                    {timings &&
                      timings.map((time) => {
                        return (
                          <div className="info-item" key={time.startDate}>
                            <span className="p2">
                              {dayjs.utc(time.startDate).format('dd')}{' '}
                              {tConvert(time.startTime)}-
                              {tConvert(time.endTime)} {ABBRS[time.timeZone]}
                            </span>
                          </div>
                        );
                      })}
                  </li>
                  <li className="event-item">
                    <i className="fa fa-calendar" aria-hidden="true"></i>{' '}
                    <span>Instructors: </span>
                    {concatenateStrings([primaryTeacherName, coTeacher1Name])}
                  </li>
                  <li className="event-item">
                    <i className="fa fa-map-marker" aria-hidden="true"></i>{' '}
                    <span>Location: </span>
                    {mode === COURSE_MODES.ONLINE.value
                      ? mode
                      : (mode === COURSE_MODES.IN_PERSON.value ||
                          mode === COURSE_MODES.DESTINATION_RETREATS.value) && (
                          <>
                            {!isLocationEmpty && (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${
                                  locationStreet || ''
                                }, ${locationCity}, ${locationProvince} ${locationPostalCode} ${locationCountry}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {locationStreet && `${locationStreet}, `}
                                {locationCity || ''}
                                {', '}
                                {locationProvince || ''}{' '}
                                {locationPostalCode || ''}
                              </a>
                            )}
                            {isLocationEmpty && (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${
                                  streetAddress1 || ''
                                },${
                                  streetAddress2 || ''
                                } ${city} ${state} ${zip} ${country}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {streetAddress1 && streetAddress1}
                                {streetAddress2 && streetAddress2}
                                {city || ''}
                                {', '}
                                {state || ''} {zip || ''}
                              </a>
                            )}
                          </>
                        )}
                  </li>
                </ul>
                <div className="contact-info">
                  <h2 className="section-title">
                    <i className="fa fa-address-book-o" aria-hidden="true"></i>{' '}
                    Contact Details:
                  </h2>
                  <ul className="event-items-list">
                    <li className="event-item">
                      <i className="fa fa-phone" aria-hidden="true"></i>{' '}
                      <span>Name: </span>
                      {contactName}
                    </li>
                    <li className="event-item">
                      <i className="fa fa-phone" aria-hidden="true"></i>{' '}
                      <span>Call: </span>
                      {phone1 || phone2}
                    </li>
                    <li className="event-item">
                      <i className="fa fa-map-marker" aria-hidden="true"></i>{' '}
                      <span>Email: </span>
                      {email}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="float-bar congratulations-float">
        <div className="float-wrapper clearfix">
          <div className="bar-left">
            <div className="bar-title">You are going to {title}</div>
          </div>
          <div className="bar-right">
            <button className="register-button" onClick={addToCalendarAction}>
              Add to Calendar <i className="fa fa-calendar-plus-o"></i>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TicketCongratulations;
