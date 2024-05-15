import React, { useEffect, useState } from 'react';
import { groupBy } from 'lodash';
import { FaUser } from 'react-icons/fa6';

export default function AttendeeDetails({ tickets, handleSubmitAttendees }) {
  const [expanded, setExpanded] = useState(0);
  const [ticketData, setTicketData] = useState([]);

  useEffect(() => {
    const updatedTickets = tickets.map((item, index) => {
      return {
        ...item,
        number: index + 1,
        attendeeRecordExternalId: generateUniqueId(),
      };
    });
    setExpanded(updatedTickets?.[0].attendeeRecordExternalId);
    console.log('updatedTickets', updatedTickets);
    setTicketData(updatedTickets);
  }, []);

  const ticketByTier = groupBy(ticketData, 'pricingTierName');
  const firstTicketId = ticketData?.[0]?.attendeeRecordExternalId;

  function generateUniqueId() {
    const timestamp = ((new Date().getTime() / 1000) | 0).toString(16); // Convert timestamp to hexadecimal
    const randomNum1 = Math.floor(Math.random() * 0x1000)
      .toString(16)
      .padStart(3, '0'); // Generate random number and ensure it has 3 characters
    const randomNum2 = Math.floor(Math.random() * 0x10000)
      .toString(16)
      .padStart(4, '0'); // Generate random number and ensure it has 4 characters

    return timestamp + '-' + randomNum1 + '-' + randomNum2;
  }

  const handleExpandItem = (ticket) => {
    setExpanded(ticket.attendeeRecordExternalId);
  };

  const handleInputChange = (ticket, fieldName) => (e) => {
    const value = e.target.value;
    const newTicketData = ticketData.map((d) => {
      if (d.attendeeRecordExternalId === ticket.attendeeRecordExternalId) {
        d[fieldName] = value;
      }
      return d;
    });
    setTicketData(newTicketData);
  };

  const handleCopyData = (ticket) => (e) => {
    const value = e.target.value;
    if (value !== null) {
      console.log('value', value);
      const ticketId = ticket.attendeeRecordExternalId;
      console.log('ticketId', ticketId);
      console.log('ticketData', ticketData);
      const fromTicket = ticketData.find((d) => {
        return d.attendeeRecordExternalId == value;
      });
      console.log('fromTicket', fromTicket);
      const newTicketData = ticketData.map((d) => {
        if (d.attendeeRecordExternalId === ticketId) {
          if (fromTicket) {
            d.firstName = fromTicket.firstName;
            d.lastName = fromTicket.lastName;
            d.contactPhone = fromTicket.contactPhone;
            d.email = fromTicket.email;
          } else {
            d.firstName = '';
            d.lastName = '';
            d.contactPhone = '';
            d.email = '';
          }
        }
        return d;
      });
      setTicketData(newTicketData);
    }
  };

  const isButtonDisabled = ticketData.some((item) => !item.firstName);

  return (
    <main className="course-filter calendar-online">
      <section className="calendar-top-section">
        <div className="container checkout-congratulations">
          <div className="calendar-benefits-wrapper row">
            <div className="tw-w-full">
              <form className="attendee-info-form">
                <h2 className="section-title">
                  <FaUser className="fa fa-user-o" /> Provide Attendee
                  Information
                </h2>
                <div className="attendee-info-wrapper">
                  {Object.entries(ticketByTier).map(([key, value]) => {
                    return (
                      <>
                        <div className="subsection-title">
                          <span className="ticket-type">{key}</span>
                        </div>
                        <div
                          className="accordion ticket-holder-accordion"
                          id="programAccordion"
                        >
                          {value.map((t) => {
                            const ticket = ticketData.find(
                              (ti) =>
                                ti.attendeeRecordExternalId ===
                                t.attendeeRecordExternalId,
                            );
                            const isExpanded =
                              expanded === ticket.attendeeRecordExternalId;
                            const ticketId = ticket.attendeeRecordExternalId;

                            return (
                              <div
                                className="accordion-item ticket-holder-accordion__item"
                                key={ticketId}
                                onClick={() => handleExpandItem(ticket)}
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
                                    Ticket Holder #{ticket.number}
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
                                    {ticketData.length > 0 &&
                                      firstTicketId !== ticketId && (
                                        <div className="form-item other">
                                          <label htmlFor="other">
                                            Copy data from
                                          </label>
                                          <select
                                            name="other"
                                            onChange={handleCopyData(ticket)}
                                          >
                                            <option value="">
                                              Other Attendee
                                            </option>
                                            {ticketData.map(
                                              (ticketAttendee) => {
                                                if (
                                                  ticketAttendee.attendeeRecordExternalId !==
                                                  ticketId
                                                ) {
                                                  return (
                                                    <option
                                                      value={
                                                        ticketAttendee.attendeeRecordExternalId
                                                      }
                                                      key={
                                                        ticketAttendee.attendeeRecordExternalId
                                                      }
                                                    >
                                                      {
                                                        ticketAttendee?.pricingTierName
                                                      }{' '}
                                                      Ticket Holder #
                                                      {ticketAttendee.number}
                                                    </option>
                                                  );
                                                }
                                                return null;
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
                                        value={ticket?.firstName || ''}
                                        onChange={handleInputChange(
                                          ticket,
                                          'firstName',
                                        )}
                                      />
                                    </div>
                                    <div className="form-item required">
                                      <label htmlFor="lname required">
                                        Last Name
                                      </label>
                                      <input
                                        type="text"
                                        name="lastName"
                                        value={ticket?.lastName || ''}
                                        onChange={handleInputChange(
                                          ticket,
                                          'lastName',
                                        )}
                                      />
                                    </div>
                                    <div className="form-item required">
                                      <label htmlFor="email">
                                        Email Address
                                      </label>
                                      <input
                                        type="email"
                                        name="email"
                                        value={ticket?.email || ''}
                                        onChange={handleInputChange(
                                          ticket,
                                          'email',
                                        )}
                                      />
                                    </div>
                                    <div className="form-item required">
                                      <label htmlFor="phone">
                                        Phone Number
                                      </label>
                                      <input
                                        type="tel"
                                        name="contactPhone"
                                        value={ticket?.contactPhone || ''}
                                        minLength={11}
                                        maxLength={15}
                                        onChange={handleInputChange(
                                          ticket,
                                          'contactPhone',
                                        )}
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
                <button
                  type="button"
                  className="btn btn-submit"
                  disabled={isButtonDisabled}
                  onClick={() => handleSubmitAttendees(false, ticketData)}
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
