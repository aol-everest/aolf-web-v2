import { api, tConvert } from '@utils';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import * as Yup from 'yup';
import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from 'react-query';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ABBRS, ALERT_TYPES } from '@constants';
import { DiscountCodeInput } from '@components/checkout';
import { pushRouteWithUTMQuery } from '@service';
import { useLocalStorage } from 'react-use';
import { StripeExpressCheckoutTicket } from '@components/checkout/StripeExpressCheckoutTicket';
import { Loader } from '@components/loader';
import { useGlobalAlertContext } from '@contexts';

dayjs.extend(utc);

function TicketedEvent() {
  const router = useRouter();
  const [, setValue] = useLocalStorage('ticket-events', {}, { raw: true });
  const [selectedTickets, setSelectedTickets] = useState([]);
  const { showAlert } = useGlobalAlertContext();
  const [selectedIds, setSelectedIds] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discountResponse, setDiscountResponse] = useState(null);
  const { id: workshopId } = router.query;
  const formRef = useRef();

  const { data: workshop, isLoading } = useQuery(
    'getTicketedEvent',
    async () => {
      const response = await api.get({
        path: 'getTicketedEvent',
        param: {
          id: workshopId,
        },
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!workshopId,
    },
  );

  const {
    eventStartTime,
    eventEndTime,
    title,
    eventStartDate,
    eventEndDate,
    eventTimeZone,
    pricingTiers,
    id: productId,
    addOnProducts,
    eventImageUrl,
    isEventFull,
    primaryTeacherName,
    contactName,
    phone1,
    phone2,
    email,
  } = workshop || {};

  useEffect(() => {
    let totalPrice = 0;
    let totalTicketQuantity = 0;

    selectedTickets.map((item) => {
      totalPrice = totalPrice + item.price * item.numberOfTickets;
      totalTicketQuantity = totalTicketQuantity + item.numberOfTickets;
    });
    setTotalPrice(totalPrice);
  }, [selectedTickets]);

  const handleTicketSelect = (e, type, item) => {
    if (item) {
      let selectedIdsLocal = [...selectedIds];
      const selectedTicketsCopy = !selectedIdsLocal.includes(
        item?.pricingTierId,
      )
        ? [...selectedTickets, item]
        : [...selectedTickets];

      const filteredItems = [];
      selectedTicketsCopy.forEach((newItem) => {
        if (newItem.pricingTierId === item?.pricingTierId) {
          if (type === 'add') {
            selectedIdsLocal = [...selectedIdsLocal, item.pricingTierId];
            newItem.numberOfTickets = (newItem.numberOfTickets || 0) + 1;
            filteredItems.push(newItem);
          } else {
            if (newItem.numberOfTickets === 1) {
              const filteredIds = selectedIdsLocal.filter(
                (id) => id !== item.pricingTierId,
              );

              selectedIdsLocal = [...filteredIds];
            }
            newItem.numberOfTickets = newItem.numberOfTickets
              ? newItem.numberOfTickets - 1
              : newItem.numberOfTickets;
            if (newItem.numberOfTickets) {
              filteredItems.push(newItem);
            }
          }
        } else {
          filteredItems.push(newItem);
        }
      });
      setSelectedIds(selectedIdsLocal);
      setSelectedTickets(filteredItems);
    }
  };

  const applyDiscount = (discount) => {
    setDiscountResponse(discount);
  };

  const { totalDiscount = 0, totalOrderAmountNew = 0 } = discountResponse || {};

  const handleTicketCheckout = (values) => {
    setValue({
      selectedTickets: selectedTickets,
      delfee: totalOrderAmountNew,
      discountResponse: discountResponse,
      totalPrice: totalPrice,
      workshop: workshop,
      totalDiscount: totalDiscount,
    });
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/ticketed-event/checkout/${workshopId}`,
    });
  };

  useEffect(() => {
    if (isEventFull) {
      try {
        showAlert(ALERT_TYPES.WARNING_ALERT, {
          children: 'The Event is full. Please try for some other event',
          closeModalAction: () => {
            pushRouteWithUTMQuery(router, {
              pathname: `/us-en/course`,
            });
          },
        });
      } catch (error) {
        console.log('error', error);
      }
    }
  }, [workshop]);

  return (
    <Formik
      initialValues={{
        couponCode: '',
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
          <form onSubmit={handleSubmit}>
            <div className="tickets-modal">
              <div className="tickets-modal__container products">
                <div className="tickets-modal__left-column">
                  <div className="tickets-modal__section-products">
                    <h2 className="tickets-modal__title">{title}</h2>
                    <p className="tickets-modal__date">
                      {`${dayjs
                        .utc(eventStartDate)
                        .format('ddd, MMM DD, YYYY')}`}{' '}
                      -{' '}
                      {`${dayjs.utc(eventEndDate).format('ddd, MMM DD, YYYY')}`}
                    </p>
                    <p className="tickets-modal__date">
                      {tConvert(eventStartTime, true)} -{' '}
                      {tConvert(eventEndTime, true)}{' '}
                      {' ' + ABBRS[eventTimeZone]}
                    </p>

                    <div className="tickets-modal__promo">
                      <label className="tickets-modal__promo-label" htmlFor="">
                        promo code
                      </label>

                      <div className="tickets-modal__promo-wrapper">
                        <DiscountCodeInput
                          placeholder="Discount Code"
                          formikProps={formikProps}
                          formikKey="couponCode"
                          product={productId}
                          applyDiscount={applyDiscount}
                          addOnProducts={addOnProducts}
                          inputClass="tickets-modal__input"
                          tagClass="tickets-modal__input ticket-discount"
                          isTicketDiscount
                          selectedTickets={selectedTickets}
                          productType="ticketed_event"
                        ></DiscountCodeInput>
                      </div>
                    </div>

                    <div className="tickets-modal__list">
                      {pricingTiers?.map((item, index) => {
                        const selectedValue = selectedTickets.find(
                          (ticket) =>
                            ticket.pricingTierId === item.pricingTierId,
                        );
                        return (
                          <div
                            className="tickets-modal__card"
                            key={item.pricingTierId}
                          >
                            <div className="tickets-modal__card-head">
                              <h3 className="tickets-modal__card-name">
                                {item.pricingTierName}
                              </h3>

                              <div className="tickets-modal__counter">
                                <button
                                  className="tickets-modal__counter-button"
                                  data-counter="decrease"
                                  data-product={`product-${index + 1}`}
                                  type="button"
                                  disabled={
                                    !selectedValue ||
                                    selectedValue?.numberOfTickets === 0
                                  }
                                  onClick={(e) =>
                                    handleTicketSelect(e, 'remove', item)
                                  }
                                >
                                  -
                                </button>
                                <input
                                  className="tickets-modal__counter-input"
                                  type="number"
                                  name={item.pricingTierId}
                                  id={item.pricingTierId}
                                  value={selectedValue?.numberOfTickets || 0}
                                  min="0"
                                  onChange={handleTicketSelect}
                                />
                                <button
                                  className="tickets-modal__counter-button"
                                  data-counter="increase"
                                  data-product={`product-${index + 1}`}
                                  type="button"
                                  disabled={
                                    selectedValue?.numberOfTickets >=
                                    item.availableSeats
                                  }
                                  onClick={(e) =>
                                    handleTicketSelect(e, 'add', item)
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="tickets-modal__card-left">
                              <h4 className="tickets-modal__card-amount">
                                ${item.price.toFixed(2)}
                                {/* <span>+ $3.31 Fee</span> */}
                              </h4>
                              <h4 className="tickets-modal__card-left">
                                * {item.availableSeats} left
                              </h4>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="tickets-modal__language"></div>

                    <div className="tickets-modal__footer">
                      {workshop && (
                        <div className="tickets-modal__footer-button-link">
                          <StripeExpressCheckoutTicket workshop={workshop} />
                        </div>
                      )}
                      <button
                        id="next-step"
                        className="tickets-modal__footer-button"
                        type="submit"
                        disabled={selectedTickets.length === 0}
                      >
                        Pay Another Way
                      </button>
                    </div>
                    {isLoading && <Loader />}
                  </div>
                </div>
                <div className="tickets-modal__right-container">
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
                      <h2 className="tickets-modal__cart-summary">
                        Order Summary
                      </h2>
                      {selectedTickets.map((item) => {
                        return (
                          <p
                            className="tickets-modal__cart-product"
                            key={item.pricingTierId}
                          >
                            x{item?.numberOfTickets} {item.pricingTierName}{' '}
                            <span>
                              ${(item.price * item?.numberOfTickets).toFixed(2)}
                            </span>
                          </p>
                        );
                      })}

                      <p className="tickets-modal__cart-subtotal">
                        Subtotal
                        <span>${parseFloat(totalPrice).toFixed(2)}</span>
                      </p>
                      {totalDiscount > 0 && (
                        <p className="tickets-modal__cart-discount">
                          Discount(-)
                          <span>${parseFloat(totalDiscount).toFixed(2)}</span>
                        </p>
                      )}

                      <p className="tickets-modal__cart-total">
                        Total
                        <span>
                          ${(parseFloat(totalPrice) - totalDiscount).toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="tickets-modal__contact-info">
                    <h2 className="section-title">
                      <i
                        className="fa fa-address-book-o"
                        aria-hidden="true"
                      ></i>{' '}
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
                        <i className="fa fa-phone" aria-hidden="true"></i>{' '}
                        <span>Teacher Name: </span>
                        {primaryTeacherName}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </form>
        );
      }}
    </Formik>
  );
}

TicketedEvent.hideFooter = true;

export default TicketedEvent;
