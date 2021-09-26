import React, { Fragment } from "react";
import { Field, ErrorMessage } from "formik";
import classNames from "classnames";

const PAYPAL_PAYMENT_MODE = "PAYPAL_PAYMENT_MODE";
const STRIPE_PAYMENT_MODE = "STRIPE_PAYMENT_MODE";
export const PayWith = ({ formikProps, otherPaymentOptions }) => {
  return (
    <div
      className={classNames("input-block order__card__payment", {
        error:
          formikProps.errors.paymentMode && formikProps.touched.paymentMode,
        "validate-error":
          formikProps.errors.paymentMode && formikProps.touched.paymentMode,
      })}
    >
      <h6 className="order__card__payment-title">Pay with</h6>
      <div className="select-box order__card__payment-select">
        <div tabIndex="1" className="select-box__current">
          <span className="select-box__placeholder">Select payment method</span>
          <div className="select-box__value">
            <Field
              className="select-box__input"
              type="radio"
              id="payment-method-card"
              name="paymentMode"
              checked={formikProps.values.paymentMode === STRIPE_PAYMENT_MODE}
              value={STRIPE_PAYMENT_MODE}
            />

            <span className="select-box__input-text">
              Credit card or debit card
            </span>
          </div>
          {otherPaymentOptions && otherPaymentOptions.indexOf("Paypal") > -1 && (
            <div className="select-box__value">
              <Field
                className="select-box__input"
                type="radio"
                id="payment-method-paypal"
                name="paymentMode"
                checked={formikProps.values.paymentMode === PAYPAL_PAYMENT_MODE}
                value={PAYPAL_PAYMENT_MODE}
              />
              <span className="select-box__input-text paypal-nickname">
                PayPal
              </span>
            </div>
          )}
        </div>
        <ul className="select-box__list">
          <li>
            <label
              htmlhtmlFor="payment-method-card"
              aria-hidden="aria-hidden"
              data-value="card"
              className="select-box__option"
            >
              <span>Credit card or debit card</span>
              <img src="/img/ic-tick-blue-lg.svg" alt="Option selected" />
            </label>
          </li>
          {otherPaymentOptions && otherPaymentOptions.indexOf("Paypal") > -1 && (
            <li>
              <label
                htmlhtmlFor="payment-method-paypal"
                aria-hidden="aria-hidden"
                data-value="paypal"
                className="select-box__option"
              >
                <span className="paypal-nickname">PayPal</span>
                <img src="/img/ic-tick-blue-lg.svg" alt="Option selected" />
              </label>
            </li>
          )}
        </ul>
      </div>
      {formikProps.errors.paymentMode && formikProps.touched.paymentMode && (
        <div className="validation-message validation-mobile-message show">
          {formikProps.errors.paymentMode}
        </div>
      )}
    </div>
  );
};
