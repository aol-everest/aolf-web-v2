import { useRouter } from "next/router";
import React from "react";

export default function TicketedEvent() {
  const router = useRouter();
  const { id: workshopId } = router.query;

  return (
    <div class="tickets-modal">
      <div class="tickets-modal__container products">
        <div class="tickets-modal__left-column">
          <div class="tickets-modal__section-products">
            <h2 class="tickets-modal__title">
              The Journey Within - Wisdom and Meditation with Gurudev
            </h2>
            <p class="tickets-modal__date">Wednesday, July 26 • 6 - 7 pm CDt</p>

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
              <div class="tickets-modal__card">
                <div class="tickets-modal__card-head">
                  <h3 class="tickets-modal__card-name">Silver</h3>

                  <div class="tickets-modal__counter">
                    <button
                      class="tickets-modal__counter-button"
                      data-counter="decrease"
                      data-product="product-1"
                    >
                      -
                    </button>
                    <input
                      class="tickets-modal__counter-input"
                      type="number"
                      name="product-1"
                      id="product-1"
                      value="0"
                      min="0"
                      max="10"
                    />
                    <button
                      class="tickets-modal__counter-button"
                      data-counter="increase"
                      data-product="product-1"
                    >
                      +
                    </button>
                  </div>
                </div>

                <h4 class="tickets-modal__card-amount">
                  $22.00
                  <span>+ $3.31 Fee</span>
                </h4>

                <p class="tickets-modal__card-sale">
                  Sales end on Jul 26, 2023
                </p>
              </div>

              <div class="tickets-modal__card">
                <div class="tickets-modal__card-head">
                  <h3 class="tickets-modal__card-name">Silver</h3>

                  <div class="tickets-modal__counter">
                    <button
                      class="tickets-modal__counter-button"
                      data-counter="decrease"
                      data-product="product-2"
                    >
                      -
                    </button>
                    <input
                      class="tickets-modal__counter-input"
                      type="number"
                      name="product-2"
                      id="product-2"
                      value="0"
                      min="0"
                      max="10"
                    />
                    <button
                      class="tickets-modal__counter-button"
                      data-counter="increase"
                      data-product="product-2"
                    >
                      +
                    </button>
                  </div>
                </div>

                <h4 class="tickets-modal__card-amount">
                  $22.00
                  <span>+ $3.31 Fee</span>
                </h4>

                <p class="tickets-modal__card-sale">
                  Sales end on Jul 26, 2023
                </p>
              </div>

              <div class="tickets-modal__card">
                <div class="tickets-modal__card-head">
                  <h3 class="tickets-modal__card-name">Silver</h3>

                  <div class="tickets-modal__counter">
                    <button
                      class="tickets-modal__counter-button"
                      data-counter="decrease"
                      data-product="product-1"
                    >
                      -
                    </button>
                    <input
                      class="tickets-modal__counter-input"
                      type="number"
                      name="product-1"
                      id="product-1"
                      value="0"
                      min="0"
                      max="10"
                    />
                    <button
                      class="tickets-modal__counter-button"
                      data-counter="increase"
                      data-product="product-1"
                    >
                      +
                    </button>
                  </div>
                </div>

                <h4 class="tickets-modal__card-amount">
                  $22.00
                  <span>+ $3.31 Fee</span>
                </h4>

                <p class="tickets-modal__card-sale">
                  Sales end on Jul 26, 2023
                </p>
              </div>

              <div class="tickets-modal__card">
                <div class="tickets-modal__card-head">
                  <h3 class="tickets-modal__card-name">Silver</h3>

                  <div class="tickets-modal__counter">
                    <button
                      class="tickets-modal__counter-button"
                      data-counter="decrease"
                      data-product="product-2"
                    >
                      -
                    </button>
                    <input
                      class="tickets-modal__counter-input"
                      type="number"
                      name="product-2"
                      id="product-2"
                      value="0"
                      min="0"
                      max="10"
                    />
                    <button
                      class="tickets-modal__counter-button"
                      data-counter="increase"
                      data-product="product-2"
                    >
                      +
                    </button>
                  </div>
                </div>

                <h4 class="tickets-modal__card-amount">
                  $22.00
                  <span>+ $3.31 Fee</span>
                </h4>

                <p class="tickets-modal__card-sale">
                  Sales end on Jul 26, 2023
                </p>
              </div>
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
          <img class="tickets-modal__photo" src="/img/Gurudev_1.png" alt="" />

          <div class="tickets-modal__cart-empty">
            <img src="/img/empty-cart.svg" alt="violet" />
          </div>

          <div class="tickets-modal__cart">
            <h2 class="tickets-modal__cart-summary">Order Summary</h2>

            <p class="tickets-modal__cart-product">
              x1 SILVER <span>$22</span>
            </p>

            <p class="tickets-modal__cart-subtotal">
              Subtotal <span>$22</span>
            </p>

            <p class="tickets-modal__cart-total">
              Total <span>$22</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
