import { api, priceCalculation, tConvert } from "@utils";
import { Formik } from "formik";
import { useRouter } from "next/router";
import * as Yup from "yup";
import React, { useEffect, useState, useRef } from "react";
import { useQuery } from "react-query";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { ABBRS } from "@constants";
import { DiscountCodeInput } from "@components/checkout";
import { pushRouteWithUTMQuery } from "@service";
import { useLocalStorage } from "react-use";
import { StripeExpressCheckoutElement } from "@components/checkout/StripeExpressCheckoutElement";
import { ExpressCheckoutElement } from "@stripe/react-stripe-js";
import { StripeExpressCheckoutTicket } from "@components/checkout/StripeExpressCheckoutTicket";

dayjs.extend(utc);

export default function TicketedEvent() {
  const router = useRouter();
  const [, setValue] = useLocalStorage("ticket-events", {}, { raw: true });
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discountResponse, setDiscountResponse] = useState(null);
  const { id: workshopId } = router.query;
  const formRef = useRef();

  const { data: workshop } = useQuery(
    "getTicketedEvent",
    async () => {
      const response = await api.get({
        path: "getTicketedEvent",
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
    eventTimeZone,
    pricingTiers,
    id: productId,
    addOnProducts,
  } = workshop || {};

  useEffect(() => {
    let totalPrice = 0;
    selectedTickets.map((item) => {
      totalPrice = totalPrice + item.price;
    });
    setTotalPrice(totalPrice);
  }, [selectedTickets]);

  const handleTicketSelect = (e, type, item) => {
    setSelectedIds((prevState) => [...prevState, item.ruleId]);
    const selectedTicketsCopy = !selectedIds.includes(item.ruleId)
      ? [...selectedTickets, item]
      : [...selectedTickets];

    const filteredItems = [];
    selectedTicketsCopy.forEach((newItem) => {
      if (newItem.ruleId === item.ruleId) {
        if (type === "add") {
          newItem.quantity = (newItem.quantity || 0) + 1;
          filteredItems.push(newItem);
        } else {
          newItem.quantity = newItem.quantity - 1;
          if (newItem.quantity) {
            filteredItems.push(newItem);
          }
        }
      } else {
        filteredItems.push(newItem);
      }
    });
    setSelectedTickets(filteredItems);
  };

  const applyDiscount = (discount) => {
    setDiscountResponse(discount);
  };

  const { delfee } = priceCalculation({
    workshop,
    discount: discountResponse,
  });

  const handleTicketCheckout = (values) => {
    setValue({
      selectedTickets: selectedTickets,
      delfee: delfee,
      discountResponse: discountResponse,
      totalPrice: totalPrice,
      workshop: workshop,
    });
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/ticketed-event/checkout/${workshopId}`,
      query: {
        selectedTickets: selectedTickets,
        delfee: delfee,
        totalPrice: totalPrice,
        page: "ticketed-event/checkout",
      },
    });
  };

  return (
    <Formik
      initialValues={{
        couponCode: "",
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
                      {`${dayjs.utc(eventStartDate).format("dddd, MMM DD ")}`}•{" "}
                      {tConvert(eventStartTime, true)} -{" "}
                      {tConvert(eventEndTime, true)}{" "}
                      {" " + ABBRS[eventTimeZone]}
                    </p>

                    <div className="tickets-modal__promo">
                      <label className="tickets-modal__promo-label" for="">
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
                        ></DiscountCodeInput>
                      </div>
                    </div>

                    <div className="tickets-modal__list">
                      {pricingTiers?.map((item, index) => {
                        const selectedValue = selectedTickets.find(
                          (ticket) => ticket.ruleId === item.ruleId,
                        );
                        return (
                          <div
                            className="tickets-modal__card"
                            key={item.ruleId}
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
                                    selectedValue?.quantity === 0
                                  }
                                  onClick={(e) =>
                                    handleTicketSelect(e, "remove", item)
                                  }
                                >
                                  -
                                </button>
                                <input
                                  className="tickets-modal__counter-input"
                                  type="number"
                                  name={item.ruleId}
                                  id={item.ruleId}
                                  value={selectedValue?.quantity || 0}
                                  min="0"
                                  onChange={handleTicketSelect}
                                />
                                <button
                                  className="tickets-modal__counter-button"
                                  data-counter="increase"
                                  data-product={`product-${index + 1}`}
                                  type="button"
                                  disabled={
                                    selectedValue?.quantity >= item.maxQuantity
                                  }
                                  onClick={(e) =>
                                    handleTicketSelect(e, "add", item)
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <h4 className="tickets-modal__card-amount">
                              ${item.price.toFixed(2)}
                              {/* <span>+ $3.31 Fee</span> */}
                            </h4>

                            {/* <p className="tickets-modal__card-sale">
                      Sales end on Jul 26, 2023
                    </p> */}
                          </div>
                        );
                      })}
                    </div>

                    <div className="tickets-modal__language" />

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
                  </div>
                </div>

                <div className="tickets-modal__right-column">
                  {/* <img className="tickets-modal__photo" src={workshop?.coverImage} alt="" /> */}
                  <img
                    className="tickets-modal__photo"
                    src="/img/Gurudev_1.png"
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
                          key={item.ruleId}
                        >
                          x{item?.quantity} {item.pricingTierName}{" "}
                          <span>${item.price.toFixed(2)}</span>
                        </p>
                      );
                    })}

                    <p className="tickets-modal__cart-subtotal">
                      Subtotal
                      <span>${(parseInt(totalPrice) - delfee).toFixed(2)}</span>
                    </p>

                    <p className="tickets-modal__cart-total">
                      Total
                      <span>${(parseInt(totalPrice) - delfee).toFixed(2)}</span>
                    </p>
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
