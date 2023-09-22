import { api, tConvert } from "@utils";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { ABBRS } from "@constants";

dayjs.extend(utc);

export default function TicketedEvent() {
  const router = useRouter();
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const { id: workshopId } = router.query;

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
  } = workshop || {};

  useEffect(() => {
    let totalPrice = 0;
    selectedTickets.map((item) => {
      totalPrice = totalPrice + item.price;
    });
    setTotalPrice(totalPrice);
  }, [selectedTickets]);

  const handleTicketSelect = (e, type, item) => {
    if (type === "add") {
      setSelectedTickets((prevState) => {
        return [...prevState, item];
      });
    } else {
      const filteredItem = selectedTickets.filter(
        (newItem) => newItem.ruleId !== item.ruleId,
      );
      setSelectedTickets([...filteredItem]);
    }
  };

  console.log("selectedTickets", selectedTickets);

  return (
    <div class="tickets-modal">
      <div class="tickets-modal__container products">
        <div class="tickets-modal__left-column">
          <div class="tickets-modal__section-products">
            <h2 class="tickets-modal__title">{title}</h2>
            <p class="tickets-modal__date">
              {`${dayjs.utc(eventStartDate).format("dddd, MMM DD ")}`}•{" "}
              {tConvert(eventStartTime, true)} - {tConvert(eventEndTime, true)}{" "}
              {" " + ABBRS[eventTimeZone]}
            </p>

            <div class="tickets-modal__promo">
              <label class="tickets-modal__promo-label" for="">
                promo code
              </label>

              <div class="tickets-modal__promo-wrapper">
                <input
                  type="text"
                  name=""
                  id=""
                  class="tickets-modal__input"
                  placeholder="Enter your promo code here"
                />
                <button class="tickets-modal__promo-button" type="button">
                  Apply
                </button>
              </div>
            </div>

            <div class="tickets-modal__list">
              {pricingTiers?.map((item, index) => {
                const selectedIds = selectedTickets.map(
                  (ticket) => ticket.ruleId,
                );
                return (
                  <div class="tickets-modal__card" key={item.ruleId}>
                    <div class="tickets-modal__card-head">
                      <h3 class="tickets-modal__card-name">
                        {item.pricingTierName}
                      </h3>

                      <div class="tickets-modal__counter">
                        <button
                          class="tickets-modal__counter-button"
                          data-counter="decrease"
                          data-product={`product-${index + 1}`}
                          onClick={(e) => handleTicketSelect(e, "remove", item)}
                          disabled={!selectedIds.includes(item.ruleId)}
                        >
                          -
                        </button>
                        <input
                          class="tickets-modal__counter-input"
                          type="number"
                          name={item.ruleId}
                          id={item.ruleId}
                          value={selectedIds.includes(item.ruleId) ? "1" : "0"}
                          min="0"
                          max="1"
                          onChange={handleTicketSelect}
                        />
                        <button
                          class="tickets-modal__counter-button"
                          data-counter="increase"
                          data-product={`product-${index + 1}`}
                          disabled={selectedIds.includes(item.ruleId)}
                          onClick={(e) => handleTicketSelect(e, "add", item)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <h4 class="tickets-modal__card-amount">
                      ${item.price.toFixed(2)}
                      {/* <span>+ $3.31 Fee</span> */}
                    </h4>

                    {/* <p class="tickets-modal__card-sale">
                      Sales end on Jul 26, 2023
                    </p> */}
                  </div>
                );
              })}
            </div>

            <div class="tickets-modal__language" />

            <div class="tickets-modal__footer">
              <button id="next-step" class="tickets-modal__footer-button">
                Pay
              </button>
            </div>
          </div>
        </div>

        <div class="tickets-modal__right-column">
          {/* <img class="tickets-modal__photo" src={workshop?.coverImage} alt="" /> */}
          <img class="tickets-modal__photo" src="/img/Gurudev_1.png" alt="" />

          <div class="tickets-modal__cart-empty">
            <img src="/img/empty-cart.svg" alt="violet" />
          </div>

          <div class="tickets-modal__cart">
            <h2 class="tickets-modal__cart-summary">Order Summary</h2>
            {selectedTickets.map((item) => {
              return (
                <p class="tickets-modal__cart-product" key={item.ruleId}>
                  x1 {item.pricingTierName}{" "}
                  <span>${item.price.toFixed(2)}</span>
                </p>
              );
            })}

            <p class="tickets-modal__cart-subtotal">
              Subtotal <span>${totalPrice.toFixed(2)}</span>
            </p>

            <p class="tickets-modal__cart-total">
              Total <span>${totalPrice.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
