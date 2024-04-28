import { Loader } from '@components/loader';
import { api, emailRegExp, tConvert } from '@utils';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';
import { useEffectOnce, useLocalStorage } from 'react-use';
import { useState } from 'react';
import {
  FaTicket,
  FaAngellist,
  FaHashtag,
  FaMoneyBill,
  FaUser,
  FaList,
} from 'react-icons/fa6';
import { FaInfoCircle } from 'react-icons/fa';
import { ALERT_TYPES, COURSE_MODES } from '@constants';
import { AddToCalendarModal } from '@components/addToCalendarModal';
import { useGlobalAlertContext } from '@contexts';
import { useAnalytics } from 'use-analytics';
import { pushRouteWithUTMQuery } from '@service';

dayjs.extend(utc);
dayjs.extend(localizedFormat);

const TicketCongratulations = () => {
  const router = useRouter();
  const { track, page } = useAnalytics();
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const [expanded, setExpanded] = useState(0);
  const [ticketData, setTicketData] = useState({});
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useLocalStorage('ticket-events');
  const {
    selectedTickets,
    delfee,
    orderId,
    attendeeDetails,
    workshop: selectedWorkshop,
    totalPrice,
  } = value;
  const firstItemId = selectedTickets[0]?.pricingTierId || '';

  useEffectOnce(() => {
    page({
      category: 'ticketed_event',
      name: 'ticketed_event_thank_you',
      referral: 'ticketed_event_checkout',
    });
    setValue({
      ...value,
      orderId: orderId,
    });
  });

  useEffectOnce(() => {
    const newTicketData = { ...ticketData };
    const ticketId = `${firstItemId}-${1}`;
    newTicketData[ticketId] = {
      ...newTicketData[ticketId],
      firstName: attendeeDetails?.firstName,
      lastName: attendeeDetails?.lastName,
      contactPhone: attendeeDetails?.contactPhone,
      email: attendeeDetails?.email,
      tierName: selectedTickets[0]?.pricingTierName || '',
    };
    setTicketData(newTicketData);
  });

  const { data: workshop, isLoading } = useQuery({
    queryKey: 'getTicketedEvent',
    queryFn: async () => {
      const response = await api.get({
        path: 'getTicketedEvent',
        param: {
          id: selectedWorkshop?.id,
        },
      });
      return response.data;
    },
    enabled: !!selectedWorkshop?.id,
  });

  useEffect(() => {
    if (selectedTickets.length > 0) {
      setExpanded(firstItemId + 1);
    }
  }, [selectedTickets]);

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
  } = workshop || {};

  if (isLoading) {
    return <Loader />;
  }
  let ticketType = [];
  let totalNoOfTickets = 0;

  selectedTickets.map((item) => {
    ticketType.push(item.pricingTierName);
    totalNoOfTickets = totalNoOfTickets + item.numberOfTickets;
  });

  const handleExpandItem = (parentItem, item) => {
    setExpanded(parentItem.pricingTierId + item);
  };

  const handleInputChange = (childItem, parentItem, fieldName, value) => {
    const newTicketData = { ...ticketData };
    const ticketId = `${parentItem.pricingTierId}-${childItem}`;
    newTicketData[ticketId] = {
      ...newTicketData[ticketId],
      [fieldName]: value?.trim(),
      tierName: parentItem?.pricingTierName,
    };
    setTicketData(newTicketData);
  };

  const handleCopyData = (childItem, parentItem, value) => {
    if (value) {
      const ticketId = `${parentItem.pricingTierId}-${childItem}`;
      const newTicketData = { ...ticketData };
      newTicketData[ticketId] = {
        ...(newTicketData[ticketId] || {}),
        ...newTicketData[value],
        tierName: parentItem?.pricingTierName,
      };
      setTicketData(newTicketData);
    }
  };

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
      mode === COURSE_MODES.IN_PERSON.name
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

  const gotToTicketsPage = (e) => {
    if (e) e.preventDefault();
    hideAlert();
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/ticketed-event/tickets/${selectedWorkshop?.id}`,
    });
  };

  const handleSubmitAttendees = async () => {
    setLoading(true);
    let allFieldsValid = true;
    console.log('ticketData', ticketData);
    console.log('selectedTickets', selectedTickets);
    console.log('totalNoOfTickets', totalNoOfTickets);
    if (totalNoOfTickets !== Object.keys(ticketData).length) {
      allFieldsValid = false;
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: "Please input all attendee details. Details can't be empty",
      });
      setLoading(false);
      return;
    }
    const attendeeInfo = Object.keys(ticketData).map((attendeId) => {
      const item = ticketData[attendeId];
      return item;
    });
    if (attendeeInfo.length === 0) {
      allFieldsValid = false;
      setLoading(false);
      return showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: "Please input attendee details. Details can't be empty",
      });
    }
    attendeeInfo.forEach((item) => {
      if (!item || !item.firstName || !item.lastName) {
        allFieldsValid = false;
        setLoading(false);
        return showAlert(ALERT_TYPES.ERROR_ALERT, {
          children:
            "Please input first and last name details. Details can't be empty",
        });
      } else if (!emailRegExp.test(item.email)) {
        allFieldsValid = false;
        setLoading(false);
        return showAlert(ALERT_TYPES.ERROR_ALERT, {
          children:
            'Please input correct email address. Email address is not valid',
        });
      } else if (item.contactPhone.length < 11) {
        allFieldsValid = false;
        setLoading(false);
        return showAlert(ALERT_TYPES.ERROR_ALERT, {
          children: 'Please input correct phone details with country code.',
        });
      }
    });
    if (allFieldsValid) {
      const payload = {
        orderId: orderId,
        attendeeInfo: attendeeInfo,
      };
      try {
        const {
          status,
          error: errorMessage,
          isError,
          data,
        } = await api.post({
          path: 'updateTicketedEventAttendees',
          body: payload,
          isUnauthorized: true,
        });
        setLoading(false);
        if (status === 400 || isError) {
          throw new Error(errorMessage);
        }
        if (data || status === 200) {
          showAlert(ALERT_TYPES.SUCCESS_ALERT, {
            title: 'Confirmed',
            children: 'We have received your attendee details.',
            closeModalAction: () => {
              gotToTicketsPage();
            },
          });
        }
      } catch (ex) {
        console.error(ex);
        const data = ex.response?.data;
        const { message, statusCode } = data || {};
        setLoading(false);
        showAlert(ALERT_TYPES.ERROR_ALERT, {
          children: message ? `Error: ${message} (${statusCode})` : ex.message,
        });
      }
    }
  };

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
                    <span>Ticket Type: </span>
                    {ticketType?.join(', ')}
                  </li>
                  <li className="order-item">
                    <FaAngellist className="fa fa-hand-peace-o" />{' '}
                    <span>Number of Tickets: </span>
                    {totalNoOfTickets}
                  </li>
                  <li className="order-item">
                    <FaHashtag className="fa fa-hashtag" />{' '}
                    <span>Order Number: </span>
                    {orderId}
                  </li>
                  <li className="order-item">
                    <FaMoneyBill className="fa fa-money" />{' '}
                    <span>Order Total: </span> $
                    {parseFloat(delfee || totalPrice).toFixed(2)}
                  </li>
                </ul>
                <div className="bottom-info">
                  <FaInfoCircle className="fa fa-info-circle" /> You should
                  receive the tickets in your email
                </div>
              </div>
              <form className="attendee-info-form">
                <h2 className="section-title">
                  <FaUser className="fa fa-user-o" /> Provide Attendee
                  Information
                </h2>
                <div className="attendee-info-wrapper">
                  {selectedTickets.map((item) => {
                    const ticketCountArray = Array.from(
                      { length: item.numberOfTickets },
                      (_, index) => index + 1,
                    );
                    return (
                      <>
                        <div className="subsection-title">
                          <span className="ticket-type">
                            {item?.pricingTierName}
                          </span>
                        </div>
                        <div
                          className="accordion ticket-holder-accordion"
                          id="programAccordion"
                        >
                          {ticketCountArray.map((ticket) => {
                            const isExpanded =
                              expanded === item.pricingTierId + ticket;
                            const ticketId = `${item.pricingTierId}-${ticket}`;
                            const ticketItemData = ticketData[ticketId];

                            return (
                              <div
                                className="accordion-item ticket-holder-accordion__item"
                                key={ticketId}
                                onClick={() => handleExpandItem(item, ticket)}
                              >
                                <div
                                  className="accordion-item-header accordion-item__header"
                                  id="heading2"
                                  data-toggle="collapse"
                                  data-target="#collapse2"
                                  aria-expanded={isExpanded}
                                  aria-controls="collapse2"
                                >
                                  <h6 className="accordion-item-header__text">
                                    Ticket Holder #{ticket}
                                  </h6>
                                  <img
                                    src="/img/ic-arrow-down.svg"
                                    alt="Expand"
                                    className="accordion-item-header__icon"
                                  />
                                </div>
                                <div
                                  className={`accordion-item-body accordion-item__body collapse ${
                                    isExpanded && 'show'
                                  }`}
                                  id="collapse2"
                                  aria-labelledby="heading2"
                                  data-parent="#programAccordion"
                                >
                                  <div className="attendee-details-form">
                                    {Object.keys(ticketData)?.length > 0 &&
                                      `${firstItemId}-1` !== ticketId && (
                                        <div className="form-item other">
                                          <label htmlFor="other">
                                            Copy data from
                                          </label>
                                          <select
                                            name="other"
                                            onChange={(ev) =>
                                              handleCopyData(
                                                ticket,
                                                item,
                                                ev.target.value,
                                              )
                                            }
                                          >
                                            <option value="">
                                              Other Attendee
                                            </option>
                                            {Object.keys(ticketData)?.map(
                                              (ticketAttende, attendeIndex) => {
                                                const attendeItem =
                                                  ticketAttende.split('-');
                                                const tierItem =
                                                  selectedTickets?.find(
                                                    (item) =>
                                                      item.pricingTierId ===
                                                      attendeItem?.[0],
                                                  );
                                                return (
                                                  <option
                                                    value={ticketAttende}
                                                    key={ticketAttende}
                                                  >
                                                    {tierItem?.pricingTierName}{' '}
                                                    Ticket Holder #
                                                    {attendeItem?.[1]}
                                                  </option>
                                                );
                                              },
                                            )}
                                          </select>
                                        </div>
                                      )}

                                    <div className="form-item required">
                                      <label htmlFor="fname">First Name</label>
                                      <input
                                        type="text"
                                        name="firstName"
                                        value={ticketItemData?.firstName || ''}
                                        onChange={(e) =>
                                          handleInputChange(
                                            ticket,
                                            item,
                                            'firstName',
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="form-item required">
                                      <label htmlFor="lname required">
                                        Last Name
                                      </label>
                                      <input
                                        type="text"
                                        name="lastName"
                                        value={ticketItemData?.lastName || ''}
                                        onChange={(e) =>
                                          handleInputChange(
                                            ticket,
                                            item,
                                            'lastName',
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="form-item required">
                                      <label htmlFor="email">
                                        Email Address
                                      </label>
                                      <input
                                        type="email"
                                        name="email"
                                        value={ticketItemData?.email || ''}
                                        onChange={(e) =>
                                          handleInputChange(
                                            ticket,
                                            item,
                                            'email',
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="form-item required">
                                      <label htmlFor="phone">
                                        Phone Number
                                      </label>
                                      <input
                                        type="tel"
                                        name="contactPhone"
                                        value={
                                          ticketItemData?.contactPhone || ''
                                        }
                                        minLength={11}
                                        maxLength={15}
                                        onChange={(e) =>
                                          handleInputChange(
                                            ticket,
                                            item,
                                            'contactPhone',
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    );
                  })}
                </div>
                {loading && <Loader />}
                <button
                  type="button"
                  className="btn btn-submit"
                  onClick={handleSubmitAttendees}
                >
                  Submit
                </button>
              </form>
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
                    <span>Day: </span> {dayjs.utc(eventStartDate).format('ddd')}
                    {eventEndDate &&
                      ` - ${dayjs.utc(eventEndDate).format('ddd')}`}
                  </li>
                  <li className="event-item">
                    <i className="fa fa-calendar" aria-hidden="true"></i>{' '}
                    <span>Start Date: </span>
                    {dayjs.utc(eventStartDate).format('MMM D, YYYY')}
                  </li>
                  <li className="event-item">
                    <i className="fa fa-calendar" aria-hidden="true"></i>{' '}
                    <span>End Date: </span>
                    {dayjs.utc(eventEndDate).format('MMM D, YYYY')}
                  </li>
                  <li className="event-item">
                    <i className="fa fa-clock" aria-hidden="true"></i>{' '}
                    <span>Time: </span> {tConvert(eventStartTime, true)} -{' '}
                    {tConvert(eventEndTime, true)}
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
                    <li className="event-item">
                      <i className="fa fa-map-marker" aria-hidden="true"></i>{' '}
                      <span>Location: </span>
                      {mode === COURSE_MODES.ONLINE.name
                        ? mode
                        : (mode === COURSE_MODES.IN_PERSON.name ||
                            mode ===
                              COURSE_MODES.DESTINATION_RETREATS.name) && (
                            <>
                              {!isLocationEmpty && (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${
                                    locationStreet || ''
                                  }, ${locationCity} ${locationProvince} ${locationPostalCode} ${locationCountry}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {locationStreet && locationStreet}
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
