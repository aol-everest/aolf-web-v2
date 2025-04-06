import React, { useEffect, useState } from 'react';
import { groupBy } from 'lodash';
import { FaUser } from 'react-icons/fa6';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import classNames from 'classnames';
import styles from './AttendeeDetails.module.scss';

const phoneRegExp = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

const validationSchema = Yup.object().shape({
  tickets: Yup.array().of(
    Yup.object().shape({
      firstName: Yup.string()
        .required('First name is required')
        .matches(/\S/, 'First name cannot be empty'),
      lastName: Yup.string()
        .required('Last name is required')
        .matches(/\S/, 'Last name cannot be empty'),
      email: Yup.string()
        .email('Invalid email format')
        .required('Email is required'),
      contactPhone: Yup.string()
        .required('Phone number is required')
        .matches(phoneRegExp, 'Phone number is not valid'),
    }),
  ),
});

export default function AttendeeDetails({
  tickets,
  handleSubmitAttendees,
  detailsRequired,
}) {
  const [expanded, setExpanded] = useState(null);
  const [initialTickets, setInitialTickets] = useState([]);

  function generateUniqueId() {
    const timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
    const randomNum1 = Math.floor(Math.random() * 0x1000)
      .toString(16)
      .padStart(3, '0');
    const randomNum2 = Math.floor(Math.random() * 0x10000)
      .toString(16)
      .padStart(4, '0');

    return timestamp + '-' + randomNum1 + '-' + randomNum2;
  }

  useEffect(() => {
    let updatedTickets;
    if (!tickets?.[0]?.attendeeRecordExternalId) {
      updatedTickets = tickets.flatMap((item) => {
        return Array.from({ length: item.numberOfTickets }, (_, index) => ({
          ...item,
          number: index + 1,
          attendeeRecordExternalId: generateUniqueId(),
          numberOfTickets: 1,
          firstName: '',
          lastName: '',
          email: '',
          contactPhone: '',
        }));
      });
    } else {
      updatedTickets = tickets;
    }

    // Set the first ticket's ID as expanded by default
    if (updatedTickets.length > 0) {
      setExpanded(updatedTickets[0].attendeeRecordExternalId);
    }
    setInitialTickets(updatedTickets);
  }, [tickets]);

  const handleExpandItem = (ticket) => {
    setExpanded(ticket.attendeeRecordExternalId);
  };

  const handleCopyData = (formik, ticket, index) => (e) => {
    const value = e.target.value;
    if (value !== null) {
      const fromTicket = formik.values.tickets.find(
        (d) => d.attendeeRecordExternalId === value,
      );
      if (fromTicket) {
        formik.setFieldValue(
          `tickets.${index}.firstName`,
          fromTicket.firstName,
        );
        formik.setFieldValue(`tickets.${index}.lastName`, fromTicket.lastName);
        formik.setFieldValue(
          `tickets.${index}.contactPhone`,
          fromTicket.contactPhone,
        );
        formik.setFieldValue(`tickets.${index}.email`, fromTicket.email);
        // Trigger validation after copying
        formik.validateForm().then(() => {
          formik.setTouched({
            tickets: formik.values.tickets.map(() => ({
              firstName: true,
              lastName: true,
              email: true,
              contactPhone: true,
            })),
          });
        });
      }
    }
  };

  if (!initialTickets.length) {
    return null;
  }

  return (
    <main className="course-filter calendar-online">
      <section className="calendar-top-section">
        <div className="container checkout-congratulations">
          <div className="calendar-benefits-wrapper row">
            <div className="tw-w-full">
              <Formik
                initialValues={{ tickets: initialTickets }}
                validationSchema={detailsRequired ? validationSchema : null}
                enableReinitialize={true}
                validateOnMount={true}
                onSubmit={(values) => {
                  handleSubmitAttendees(false, values.tickets);
                }}
              >
                {(formik) => {
                  console.log('formik.errors', formik.errors);
                  console.log('formik.isValid', formik.isValid);
                  console.log('formik.dirty', formik.dirty);

                  const ticketByTier = groupBy(
                    formik.values.tickets,
                    'pricingTierName',
                  );
                  const firstTicketId =
                    formik.values.tickets?.[0]?.attendeeRecordExternalId;

                  return (
                    <Form className={styles.attendeeForm}>
                      <div className={styles.optional}>
                        <h2 className={styles.title}>
                          <FaUser className="fa fa-user-o" /> Provide Attendee
                          Information
                        </h2>
                        <span>{`${!detailsRequired ? '(Optional)' : ''}`}</span>
                      </div>
                      <div className="attendee-info-wrapper">
                        {Object.entries(ticketByTier).map(([key, value]) => (
                          <React.Fragment key={key}>
                            <div className="subsection-title">
                              <span className="ticket-type">{key}</span>
                            </div>
                            <div
                              className="accordion ticket-holder-accordion"
                              id="programAccordion"
                            >
                              {value.map((ticket, index) => {
                                const actualIndex =
                                  formik.values.tickets.findIndex(
                                    (t) =>
                                      t.attendeeRecordExternalId ===
                                      ticket.attendeeRecordExternalId,
                                  );
                                const isExpanded =
                                  expanded === ticket.attendeeRecordExternalId;
                                const ticketId =
                                  ticket.attendeeRecordExternalId;

                                return (
                                  <div
                                    className="accordion-item ticket-holder-accordion__item"
                                    key={ticketId}
                                    onClick={() => handleExpandItem(ticket)}
                                  >
                                    <div
                                      className="accordion-item-header accordion-item__header"
                                      id={`heading${ticketId}`}
                                      data-toggle="collapse"
                                      data-target={`#collapse${ticketId}`}
                                      aria-expanded={isExpanded}
                                      aria-controls={`collapse${ticketId}`}
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
                                        isExpanded ? 'show' : ''
                                      }`}
                                      id={`collapse${ticketId}`}
                                      aria-labelledby={`heading${ticketId}`}
                                      data-parent="#programAccordion"
                                    >
                                      <div className="attendee-details-form">
                                        {formik.values.tickets.length > 0 &&
                                          firstTicketId !== ticketId && (
                                            <div
                                              className={classNames(
                                                styles.formItem,
                                                'other',
                                              )}
                                            >
                                              <label htmlFor="other">
                                                Copy data from
                                              </label>
                                              <select
                                                name="other"
                                                onChange={handleCopyData(
                                                  formik,
                                                  ticket,
                                                  actualIndex,
                                                )}
                                              >
                                                <option value="">
                                                  Other Attendee
                                                </option>
                                                {formik.values.tickets.map(
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
                                                          {
                                                            ticketAttendee.number
                                                          }
                                                        </option>
                                                      );
                                                    }
                                                    return null;
                                                  },
                                                )}
                                              </select>
                                            </div>
                                          )}

                                        <div
                                          className={classNames(
                                            styles.formItem,
                                            {
                                              [styles.required]:
                                                detailsRequired,
                                            },
                                          )}
                                        >
                                          <label
                                            htmlFor={`tickets.${actualIndex}.firstName`}
                                          >
                                            First Name
                                          </label>
                                          <Field
                                            type="text"
                                            name={`tickets.${actualIndex}.firstName`}
                                            maxLength={40}
                                            className={classNames({
                                              [styles.inputError]:
                                                formik.touched.tickets?.[
                                                  actualIndex
                                                ]?.firstName &&
                                                formik.errors.tickets?.[
                                                  actualIndex
                                                ]?.firstName,
                                            })}
                                          />
                                          {formik.touched.tickets?.[actualIndex]
                                            ?.firstName &&
                                            formik.errors.tickets?.[actualIndex]
                                              ?.firstName && (
                                              <div
                                                className={styles.errorMessage}
                                              >
                                                {
                                                  formik.errors.tickets[
                                                    actualIndex
                                                  ].firstName
                                                }
                                              </div>
                                            )}
                                        </div>

                                        <div
                                          className={classNames(
                                            styles.formItem,
                                            {
                                              [styles.required]:
                                                detailsRequired,
                                            },
                                          )}
                                        >
                                          <label
                                            htmlFor={`tickets.${actualIndex}.lastName`}
                                          >
                                            Last Name
                                          </label>
                                          <Field
                                            type="text"
                                            name={`tickets.${actualIndex}.lastName`}
                                            maxLength={40}
                                            className={classNames({
                                              [styles.inputError]:
                                                formik.touched.tickets?.[
                                                  actualIndex
                                                ]?.lastName &&
                                                formik.errors.tickets?.[
                                                  actualIndex
                                                ]?.lastName,
                                            })}
                                          />
                                          {formik.touched.tickets?.[actualIndex]
                                            ?.lastName &&
                                            formik.errors.tickets?.[actualIndex]
                                              ?.lastName && (
                                              <div
                                                className={styles.errorMessage}
                                              >
                                                {
                                                  formik.errors.tickets[
                                                    actualIndex
                                                  ].lastName
                                                }
                                              </div>
                                            )}
                                        </div>

                                        <div
                                          className={classNames(
                                            styles.formItem,
                                            {
                                              [styles.required]:
                                                detailsRequired,
                                            },
                                          )}
                                        >
                                          <label
                                            htmlFor={`tickets.${actualIndex}.email`}
                                          >
                                            Email Address
                                          </label>
                                          <Field
                                            type="email"
                                            name={`tickets.${actualIndex}.email`}
                                            className={classNames({
                                              [styles.inputError]:
                                                formik.touched.tickets?.[
                                                  actualIndex
                                                ]?.email &&
                                                formik.errors.tickets?.[
                                                  actualIndex
                                                ]?.email,
                                            })}
                                          />
                                          {formik.touched.tickets?.[actualIndex]
                                            ?.email &&
                                            formik.errors.tickets?.[actualIndex]
                                              ?.email && (
                                              <div
                                                className={styles.errorMessage}
                                              >
                                                {
                                                  formik.errors.tickets[
                                                    actualIndex
                                                  ].email
                                                }
                                              </div>
                                            )}
                                        </div>

                                        <div
                                          className={classNames(
                                            styles.formItem,
                                            {
                                              [styles.required]:
                                                detailsRequired,
                                            },
                                          )}
                                        >
                                          <label
                                            htmlFor={`tickets.${actualIndex}.contactPhone`}
                                          >
                                            Phone Number
                                          </label>
                                          <Field
                                            type="tel"
                                            name={`tickets.${actualIndex}.contactPhone`}
                                            minLength={11}
                                            maxLength={15}
                                            className={classNames({
                                              [styles.inputError]:
                                                formik.touched.tickets?.[
                                                  actualIndex
                                                ]?.contactPhone &&
                                                formik.errors.tickets?.[
                                                  actualIndex
                                                ]?.contactPhone,
                                            })}
                                          />
                                          {formik.touched.tickets?.[actualIndex]
                                            ?.contactPhone &&
                                            formik.errors.tickets?.[actualIndex]
                                              ?.contactPhone && (
                                              <div
                                                className={styles.errorMessage}
                                              >
                                                {
                                                  formik.errors.tickets[
                                                    actualIndex
                                                  ].contactPhone
                                                }
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                      <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={
                          detailsRequired &&
                          (!formik.isValid ||
                            formik.values.tickets.some(
                              (ticket) =>
                                !ticket.firstName ||
                                !ticket.lastName ||
                                !ticket.email ||
                                !ticket.contactPhone,
                            ))
                        }
                      >
                        Continue
                      </button>
                    </Form>
                  );
                }}
              </Formik>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
