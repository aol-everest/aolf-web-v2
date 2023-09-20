import React from "react";

export default function TicketCheckout() {
  return (
    <div class="tickets-modal">
      <div class="tickets-modal__container products">
        <div class="tickets-modal__left-column">
          <div class="tickets-modal__section-checkout">
            <h2 class="tickets-modal__title">Checkout</h2>
            <p class="tickets-modal__date">Time left 19:55</p>

            <div class="tickets-modal__billing">
              <h3 class="tickets-modal__subtitle">Billing information</h3>

              <p class="tickets-modal__billing-login">
                <span class="tickets-modal__billing-login_main">
                  <a href="#" class="tickets-modal--accent">
                    Login{" "}
                  </a>
                  for a faster experience
                </span>
                <span class="tickets-modal__billing-login_required">
                  <span class="tickets-modal--accent">*</span> Required
                </span>
              </p>

              <div class="tickets-modal__form-person">
                <label class="tickets-modal__input-label" for="first-name">
                  <input
                    class="tickets-modal__input"
                    type="text"
                    name="first-name"
                    id="first-name"
                    required
                    placeholder="First name"
                  />
                  <span class="tickets-modal__input-placeholder">
                    First name <span class="tickets-modal--accent">*</span>
                  </span>
                </label>

                <label class="tickets-modal__input-label" for="last-name">
                  <input
                    class="tickets-modal__input"
                    type="text"
                    name="last-name"
                    id="last-name"
                    required
                    placeholder="Last name"
                  />
                  <span class="tickets-modal__input-placeholder">
                    Last name <span class="tickets-modal--accent">*</span>
                  </span>
                </label>

                <label class="tickets-modal__input-label" for="email">
                  <input
                    class="tickets-modal__input"
                    type="email"
                    name="email"
                    id="email"
                    required
                    placeholder="email@example.com"
                  />
                  <span class="tickets-modal__input-placeholder">
                    Email address <span class="tickets-modal--accent">*</span>
                  </span>
                </label>

                <label class="tickets-modal__input-label" for="confirm-email">
                  <input
                    class="tickets-modal__input"
                    type="text"
                    name="confirm-email"
                    id="confirm-email"
                    required
                    placeholder="email@example.com"
                  />
                  <span class="tickets-modal__input-placeholder">
                    Confirm email <span class="tickets-modal--accent">*</span>
                  </span>
                </label>
              </div>

              <label class="tickets-modal__distribution" for="distribution">
                <input
                  class="tickets-modal__distribution-input"
                  type="checkbox"
                  name="distribution"
                  id="distribution"
                  checked
                />
                <span class="tickets-modal__distribution-checkbox">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M16.6416 8.85537L10.3522 15.1448L7.35815 12.1508"
                      stroke="white"
                      stroke-miterlimit="10"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>

                <p class="tickets-modal__distribution-text">
                  Keep me updated on more events and news from this event
                </p>
              </label>
            </div>

            <div class="tickets-modal__pay">
              <h3 class="tickets-modal__subtitle">Pay with</h3>

              <div
                class="tickets-modal__payment-dropdown"
                data-dropdown-for="credit-card"
              >
                <label class="tickets-modal__payment-label" for="credit-card">
                  <input
                    class="tickets-modal__payment-input"
                    type="radio"
                    name="payment-type"
                    id="credit-card"
                  />

                  <p class="tickets-modal__payment-checkbox">
                    Credit or debit card
                  </p>

                  <div class="tickets-modal__payment-border"></div>

                  <span class="tickets-modal__payment-icon">
                    <img src="/img/card-icon.svg" alt="violet" />
                  </span>
                </label>

                <div class="tickets-modal__payment-form">
                  <label class="tickets-modal__input-label" for="card-number">
                    <input
                      class="tickets-modal__input"
                      type="number"
                      name="card-number"
                      id="card-number"
                      required
                      placeholder="Card number"
                    />
                    <span class="tickets-modal__input-placeholder">
                      Card number <span class="tickets-modal--accent">*</span>
                    </span>
                  </label>

                  <label
                    class="tickets-modal__input-label tickets-modal__input-label--top"
                    for="expiration-day"
                  >
                    <input
                      class="tickets-modal__input"
                      type="text"
                      name="expiration-day"
                      id="expiration-day"
                      required
                      placeholder="MM / YY"
                    />
                    <span class="tickets-modal__input-placeholder--top">
                      EXPIRATION DAY{" "}
                      <span class="tickets-modal--accent">*</span>
                    </span>
                  </label>

                  <label
                    class="tickets-modal__input-label tickets-modal__input-label--top"
                    for="cvv"
                  >
                    <input
                      class="tickets-modal__input"
                      type="text"
                      name="cvv"
                      id="cvv"
                      required
                      placeholder="123"
                    />
                    <span class="tickets-modal__input-placeholder--top">
                      CVV <span class="tickets-modal--accent">*</span>
                    </span>
                  </label>

                  <label
                    class="tickets-modal__input-label tickets-modal__input-label--top"
                    for="zip"
                  >
                    <input
                      class="tickets-modal__input"
                      type="text"
                      name="zip"
                      id="zip"
                      required
                      placeholder="123"
                    />
                    <span class="tickets-modal__input-placeholder--top">
                      ZIP CODE <span class="tickets-modal--accent">*</span>
                    </span>
                  </label>
                </div>
              </div>

              <label class="tickets-modal__payment-label" for="pay-pal">
                <input
                  class="tickets-modal__payment-input"
                  type="radio"
                  name="payment-type"
                  id="pay-pal"
                />

                <p class="tickets-modal__payment-checkbox">PayPal</p>
                <div class="tickets-modal__payment-border"></div>

                <span class="tickets-modal__payment-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                  >
                    <path
                      d="M23.5968 5.82527C22.4687 4.54743 20.4272 4 17.8155 4H10.2362C9.70236 4 9.24869 4.38562 9.16401 4.90734L6.00802 24.7645C5.94602 25.1562 6.25149 25.5101 6.65072 25.5101H11.3296L12.5046 18.1152L12.4683 18.3481C12.5515 17.8264 13.0036 17.4408 13.5374 17.4408H15.7604C20.1293 17.4408 23.5485 15.6805 24.548 10.5888C24.5783 10.4376 24.6252 10.1472 24.6252 10.1472C24.9094 8.26299 24.6236 6.98516 23.5968 5.82527Z"
                      fill="#FF9E1B"
                    />
                    <path
                      d="M25.8092 11.1121C24.7234 16.1251 21.2588 18.7776 15.7603 18.7776H13.7672L12.2792 28.1958H15.5123C15.9796 28.1958 16.3773 27.8586 16.4499 27.4004L16.4877 27.2007L17.2317 22.5264L17.2801 22.2693C17.3527 21.8111 17.7504 21.4739 18.2162 21.4739H18.8075C22.6289 21.4739 25.6201 19.9344 26.4942 15.4809C26.845 13.6934 26.6757 12.1948 25.8092 11.1121Z"
                      fill="#FF9E1B"
                    />
                  </svg>
                </span>
              </label>
            </div>

            <div class="tickets-modal__checkout-footer">
              <div class="tickets-modal__checkout-total">
                <p class="tickets-modal__checkout-amount">$22</p>
              </div>

              <p class="tickets-modal__footer-terms">
                By selecting Apple Pay, I agree to the{" "}
                <a href="#" class="tickets-modal__footer-link">
                  Eventbrite Terms of Service
                </a>
              </p>

              <button class="tickets-modal__footer-button">Place order</button>
            </div>
          </div>
        </div>

        <div class="tickets-modal__right-column">
          <img class="tickets-modal__photo" src="./img/Gurudev_1.png" alt="" />

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
