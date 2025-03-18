import { api, tConvert } from '@utils';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import * as Yup from 'yup';
import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ABBRS, ALERT_TYPES, COURSE_MODES } from '@constants';
import { pushRouteWithUTMQuery } from '@service';
import { StripeExpressCheckoutTicket } from '@components/checkout/StripeExpressCheckoutTicket';
import { Loader } from '@components/loader';
import { useGlobalAlertContext } from '@contexts';
import { useQueryState, parseAsJson, parseAsString } from 'nuqs';
import ErrorPage from 'next/error';
import { PageLoading } from '@components';
import { z } from 'zod';
import { DiscountInputNew } from '@components/discountInputNew';
import { AiTwotoneAlert } from 'react-icons/ai';

const ticketSchema = z.record(z.string(), z.number());

dayjs.extend(utc);

const TicketLineItem = ({ item, handleTicketSelect, selectedTickets }) => {
  let count = 0;
  if (item.pricingTierId in selectedTickets) {
    count = selectedTickets[item.pricingTierId];
  }
  return (
    <div className="tickets-modal__card" key={item.pricingTierId}>
      <div className="tickets-modal__card-head">
        <h3 className="tickets-modal__card-name">{item.pricingTierName}</h3>

        <div className="tickets-modal__counter">
          <button
            className="tickets-modal__counter-button"
            type="button"
            disabled={!count === 0}
            onClick={handleTicketSelect('remove', item)}
          >
            -
          </button>
          <input
            className="tickets-modal__counter-input"
            type="number"
            name={item.pricingTierId}
            id={item.pricingTierId}
            value={count}
            min="0"
            onChange={handleTicketSelect('input', item)}
          />
          <button
            className="tickets-modal__counter-button"
            type="button"
            disabled={count >= item.availableSeats}
            onClick={handleTicketSelect('add', item)}
          >
            +
          </button>
        </div>
      </div>
      <div className="tickets-modal__card-left">
        <p className="tickets-modal__card-heading">Price</p>
        <p className="tickets-modal__card-amount">
          ${item.price.toFixed(2)}
          {/* <span>+ $3.31 Fee</span> */}
        </p>
      </div>
      <div className="tickets-modal__card-left tw-mt-2">
        {item.increasingBy && (
          <p className="tw-text-sm tw-text-slate-500">
            {/* add alert icon here using react icon */}
            <AiTwotoneAlert className="tw-w-4 tw-h-4 tw-mr-2 tw-mb-1" />
            Fee increases by ${item.increasingFee} starting {item.increasingBy}
          </p>
        )}
      </div>
    </div>
  );
};

function TicketedEvent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTickets, setSelectedTickets] = useQueryState(
    'ticket',
    parseAsJson(ticketSchema.parse).withDefault({}),
  );
  const [couponCode, setCouponCode] = useQueryState(
    'couponCode',
    parseAsString,
  );
  const { showAlert } = useGlobalAlertContext();
  const { id: eventId } = router.query;
  const formRef = useRef();
  const [discountResponse, setDiscountResponse] = useState(null);

  const {
    data: event,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: 'getTicketedEvent',
    queryFn: async () => {
      const response = await api.get({
        path: 'getTicketedEvent',
        param: {
          id: eventId,
        },
      });
      return response.data;
    },
    enabled: !!eventId,
  });

  const {
    title,
    eventStartDate,
    eventEndDate,
    pricingTiers,
    eventImageUrl,
    isEventFull,
    mode,
    id: productId,
    isLocationEmpty,
    locationStreet,
    locationCity,
    locationProvince,
    locationPostalCode,
    streetAddress1,
    streetAddress2,
    city,
    state,
    zip,
    maxTicketsWithOneOrder,
    timings,
    contactName,
    phone1,
    email,
    notes,
    addOnProducts,
  } = event || {};

  useEffect(() => {
    if (isEventFull) {
      try {
        showAlert(ALERT_TYPES.WARNING_ALERT, {
          children: 'The Event is full. Please try for some other event',
          closeModalAction: () => {
            pushRouteWithUTMQuery(router, {
              pathname: `/us-en/ticketed-event`,
            });
          },
        });
      } catch (error) {
        console.log('error', error);
      }
    }
  }, [event]);

  useEffect(() => {
    if (pricingTiers?.length > 0) {
      const isPaidPricingTier = pricingTiers.some((item) => item.price > 0);
      if (!isPaidPricingTier) {
        const firstPricingTier = pricingTiers[0];
        const { pricingTierId } = firstPricingTier;
        const selectedTicketsCopy = {};
        selectedTicketsCopy[pricingTierId] = 1;
        setSelectedTickets(selectedTicketsCopy);
      }
    }
  }, [pricingTiers]);

  let pricingTiersLocal = pricingTiers?.filter((p) => {
    return p.pricingTierId in selectedTickets;
  });
  pricingTiersLocal = pricingTiersLocal?.map((p) => {
    p.numberOfTickets = selectedTickets[p.pricingTierId];
    return p;
  });
  const total = pricingTiersLocal?.reduce((accumulator, item) => {
    accumulator = accumulator + item.price * item?.numberOfTickets;
    return accumulator;
  }, 0);

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !router.isReady) return <PageLoading />;

  const handleTicketSelect = (type, item) => (e) => {
    if (!item) {
      console.error('Item is missing');
      return;
    }

    const selectedTicketsCopy = { ...selectedTickets };

    const { pricingTierId } = item;
    if (!(pricingTierId in selectedTicketsCopy)) {
      selectedTicketsCopy[pricingTierId] = 0;
    }
    if (type === 'input') {
      selectedTicketsCopy[pricingTierId] = Math.abs(e.target.value);
    } else if (type === 'add') {
      selectedTicketsCopy[pricingTierId]++;
    } else if (type === 'remove') {
      selectedTicketsCopy[pricingTierId]--;
    }

    const updatedSelectedTickets = Object.fromEntries(
      Object.entries(selectedTicketsCopy).filter(([key, value]) => value > 0),
    );

    setSelectedTickets(updatedSelectedTickets);
  };

  const handleTicketCheckout = () => {
    const totalTicketsQuantity = Object.entries(selectedTickets).reduce(
      (accumulator, [key, value]) => {
        accumulator = accumulator + value;
        return accumulator;
      },
      0,
    );
    if (
      maxTicketsWithOneOrder &&
      totalTicketsQuantity > maxTicketsWithOneOrder
    ) {
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: `Exceeded maximum tickets limit. Max allowed ${maxTicketsWithOneOrder}`,
      });
      return;
    }

    let queryParams = { ticket: JSON.stringify(selectedTickets) };

    if (couponCode) {
      queryParams = { ...queryParams, couponCode };
    }

    const showAddressFields = searchParams.get('showAddressFields');
    if (showAddressFields) {
      queryParams = { ...queryParams, showAddressFields };
    }

    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/ticketed-event/checkout/${eventId}`,
      query: queryParams,
    });
  };

  const applyDiscount = (discount) => {
    setDiscountResponse(discount);
    setCouponCode(discount?.couponCode || null);
  };

  const ticketsPayload = pricingTiersLocal.map((item) => {
    return {
      pricingTierId: item.pricingTierId,
      numberOfTickets: item.numberOfTickets,
    };
  });

  const { totalDiscount = 0 } = discountResponse || {};

  const renderSummary = () => {
    return (
      <>
        <div className="tickets-container">
          {pricingTiersLocal.map((item) => {
            return (
              <div className="tickets" key={item.pricingTierId}>
                <div className="label">
                  {item.pricingTierName} x{item?.numberOfTickets}{' '}
                </div>
                <div className="value">
                  ${(item.price * item?.numberOfTickets).toFixed(2)}
                </div>
              </div>
            );
          })}
          <div className="tickets">
            <div className="label">Subtotal</div>
            <div className="value">${parseFloat(total).toFixed(2)}</div>
          </div>
        </div>

        {totalDiscount > 0 && (
          <div className="tickets">
            <div className="label">Discount(-)</div>
            <div className="value">${parseFloat(totalDiscount).toFixed(2)}</div>
          </div>
        )}

        <div className="total">
          <div className="label">Total:</div>
          <div className="value">
            ${(parseFloat(total) - totalDiscount).toFixed(2)}
          </div>
        </div>
      </>
    );
  };

  const groupTimingsByDate = (timings = []) => {
    // Group timings by date
    const groupedTimings = timings.reduce((acc, time) => {
      const date = dayjs.utc(time.startDate).format('YYYY-MM-DD');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({
        startTime: time.startTime,
        endTime: time.endTime,
        timeZone: time.timeZone,
      });
      return acc;
    }, {});

    // Convert to array format
    return Object.entries(groupedTimings).map(([date, times]) => ({
      date: dayjs.utc(date),
      times,
    }));
  };

  return (
    <Formik
      initialValues={{
        couponCode: couponCode || '',
      }}
      validationSchema={Yup.object().shape({})}
      innerRef={formRef}
      onSubmit={async (values) => {
        await handleTicketCheckout(values);
      }}
    >
      {(formikProps) => {
        const { handleSubmit } = formikProps;
        return (
          <main className="checkout-aol">
            <form onSubmit={handleSubmit}>
              <div className="tickets-modal">
                <div className="tickets-modal__container products">
                  <div className="tickets-modal__left-column">
                    <div className="tickets-modal__section-products">
                      <h2 className="tickets-modal__title">{title}</h2>
                      <div className="section-wisdom-event-checkout-info">
                        {timings &&
                          groupTimingsByDate(timings).map((dateGroup) => {
                            return (
                              <div
                                className="info-item"
                                key={dateGroup.date.format('YYYY-MM-DD')}
                              >
                                <span className="icon-aol iconaol-calendar"></span>
                                <span className="p2">
                                  {dateGroup.date.format('ddd')},{' '}
                                  {dateGroup.date.format('MMM DD ○ ')}
                                  {dateGroup.times.map((time, index) => (
                                    <React.Fragment key={index}>
                                      {index > 0 && ' and '}
                                      {tConvert(time.startTime)}-
                                      {tConvert(time.endTime)}{' '}
                                      {ABBRS[time.timeZone]}
                                    </React.Fragment>
                                  ))}
                                </span>
                              </div>
                            );
                          })}

                        <div className="info-item">
                          <span className="icon-aol iconaol-location"></span>
                          <span className="p2">
                            {mode === COURSE_MODES.ONLINE.value
                              ? mode
                              : (mode === COURSE_MODES.IN_PERSON.value ||
                                  mode ===
                                    COURSE_MODES.DESTINATION_RETREATS
                                      .value) && (
                                  <>
                                    {!isLocationEmpty && (
                                      <span>
                                        {locationStreet &&
                                          `${locationStreet}, `}
                                        {locationCity || ''}
                                        {', '}
                                        {locationProvince || ''}{' '}
                                        {locationPostalCode || ''}
                                      </span>
                                    )}
                                    {isLocationEmpty && (
                                      <span>
                                        {streetAddress1 &&
                                          `${streetAddress1}, `}
                                        {streetAddress2 && streetAddress2}
                                        {city || ''}
                                        {', '}
                                        {state || ''} {zip || ''}
                                      </span>
                                    )}
                                  </>
                                )}
                          </span>
                        </div>

                        <div className="info-item contact-person">
                          <span className="icon-aol iconaol-call-calling"></span>
                          <span className="p2">
                            {contactName}
                            <br />
                            <span className="contact-detail">
                              <a href={`tel:${{ phone1 }}`}>{phone1}</a>
                            </span>{' '}
                            <span>|</span>{' '}
                            <span className="contact-detail">
                              <a href={`mailto:${email}`}>{email}</a>
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="tickets-modal__list">
                        {pricingTiers?.map((item, index) => (
                          <TicketLineItem
                            key={item.pricingTierId}
                            item={item}
                            handleTicketSelect={handleTicketSelect}
                            selectedTickets={selectedTickets}
                          ></TicketLineItem>
                        ))}
                        <div className="tickets-modal__card notes-desktop">
                          <div className="tickets notes">
                            <div className="label">Notes</div>
                            <div
                              className="value"
                              dangerouslySetInnerHTML={{ __html: notes }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="tickets-modal__language"></div>
                    </div>
                  </div>
                  <div className="tickets-modal__right-container ticketed-event">
                    <div className="tickets-modal__right-column">
                      {/* <img className="tickets-modal__photo" src={workshop?.coverImage} alt="" /> */}
                      <img
                        className="tickets-modal__photo"
                        src={eventImageUrl}
                        alt=""
                      />

                      <div className="tickets-modal__cart-empty">
                        <img src="/img/empty-cart.svg" alt="violet" />
                      </div>

                      <div className="tickets-modal__cart">
                        {renderSummary()}
                      </div>

                      {notes && (
                        <div className="tickets-modal__card notes-mobile">
                          <div className="tickets notes">
                            <div className="label">Notes</div>
                            <div
                              className="value"
                              dangerouslySetInnerHTML={{ __html: notes }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="tickets-modal__footer">
                        {event && total > 0 && (
                          <>
                            <div className="tickets-modal__promo tw-mb-4">
                              <div className="tickets-modal__promo-wrapper">
                                <div className="section__body">
                                  <div className="form-item required">
                                    <DiscountInputNew
                                      placeholder="Discount Code"
                                      formikProps={formikProps}
                                      formikKey="couponCode"
                                      product={productId}
                                      applyDiscount={applyDiscount}
                                      addOnProducts={addOnProducts}
                                      containerClass={`tickets-modal__input-label tickets-modal__input-label--top`}
                                      selectedTickets={selectedTickets}
                                      productType="ticketed_event"
                                      inputClass="tickets-modal__input"
                                      tagClass="tickets-modal__input ticket-discount"
                                      ticketsPayload={ticketsPayload}
                                    ></DiscountInputNew>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="tickets-modal__footer-button-link">
                              <StripeExpressCheckoutTicket
                                discountResponse={discountResponse}
                                workshop={event}
                                total={
                                  totalDiscount > 0
                                    ? total - totalDiscount
                                    : total
                                }
                                selectedTickets={selectedTickets}
                              />
                            </div>
                          </>
                        )}
                        <button
                          id="next-step"
                          className="tickets-modal__footer-button"
                          type="submit"
                          disabled={Object.keys(selectedTickets).length === 0}
                        >
                          Continue to Checkout
                        </button>
                      </div>
                      {isLoading && <Loader />}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </main>
        );
      }}
    </Formik>
  );
}

TicketedEvent.hideFooter = true;

export default TicketedEvent;
