import React, { Fragment } from "react";
import { Field, ErrorMessage } from "formik";

const PAYPAL_PAYMENT_MODE = "PAYPAL_PAYMENT_MODE";
const STRIPE_PAYMENT_MODE = "STRIPE_PAYMENT_MODE";
export const PayWith = ({ formikProps, otherPaymentOptions }) => {
  return (
    <div class="order__card__payment">
      <h6 class="order__card__payment-title">Pay with</h6>
      <div class="select-box order__card__payment-select">
        <div tabindex="1" class="select-box__current">
          <span class="select-box__placeholder">Select payment method</span>
          <div class="select-box__value">
            <Field
              class="select-box__input"
              type="radio"
              id="payment-method-card"
              name="paymentMode"
              checked={formikProps.values.paymentMode === STRIPE_PAYMENT_MODE}
              value={STRIPE_PAYMENT_MODE}
            />

            <span class="select-box__input-text">
              Credit card or debit card
            </span>
          </div>
          {otherPaymentOptions && otherPaymentOptions.indexOf("Paypal") > -1 && (
            <div class="select-box__value">
              <Field
                class="select-box__input"
                type="radio"
                id="payment-method-paypal"
                name="paymentMode"
                checked={formikProps.values.paymentMode === PAYPAL_PAYMENT_MODE}
                value={PAYPAL_PAYMENT_MODE}
              />
              <span class="select-box__input-text paypal-nickname">PayPal</span>
            </div>
          )}
        </div>
        <ul class="select-box__list">
          <li>
            <label
              for="payment-method-card"
              aria-hidden="aria-hidden"
              data-value="card"
              class="select-box__option"
            >
              <span>Credit card or debit card</span>
              <img src="/img/ic-tick-blue-lg.svg" alt="Option selected" />
            </label>
          </li>
          {otherPaymentOptions && otherPaymentOptions.indexOf("Paypal") > -1 && (
            <li>
              <label
                for="payment-method-paypal"
                aria-hidden="aria-hidden"
                data-value="paypal"
                class="select-box__option"
              >
                <span class="paypal-nickname">PayPal</span>
                <img src="/img/ic-tick-blue-lg.svg" alt="Option selected" />
              </label>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
