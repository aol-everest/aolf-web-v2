import classNames from 'classnames';

const PAYPAL_PAYMENT_MODE = 'PAYPAL_PAYMENT_MODE';
const STRIPE_PAYMENT_MODE = 'STRIPE_PAYMENT_MODE';
export const PayWithNewCheckout = ({
  formikProps,
  otherPaymentOptions,
  isBundlePaypalAvailable,
  isBundleSelected,
}) => {
  return (
    <div
      className={classNames('input-block order__card__payment', {
        error:
          formikProps.errors.paymentMode && formikProps.touched.paymentMode,
        'validate-error':
          formikProps.errors.paymentMode && formikProps.touched.paymentMode,
      })}
    >
      <div className="order__card__payment-select">
        <div className="select-box__value">
          <p className="scheduling-modal__content-wrapper-form-checkbox">
            <input
              type="radio"
              id="payment-method-card"
              checked={formikProps.values.paymentMode === STRIPE_PAYMENT_MODE}
              value={STRIPE_PAYMENT_MODE}
              onChange={formikProps.handleChange('paymentMode')}
              name="paymentMode"
            />

            <label
              htmlFor="payment-method-card"
              data-value="card"
              aria-hidden="aria-hidden"
            >
              <span className="agreement__text">Credit card or debit card</span>
            </label>
          </p>
        </div>

        {((!isBundleSelected &&
          otherPaymentOptions &&
          otherPaymentOptions.indexOf('Paypal') > -1 &&
          formikProps.values.paymentOption !== 'LATER') ||
          (isBundleSelected && isBundlePaypalAvailable)) && (
          <div className="select-box__value">
            <p className="scheduling-modal__content-wrapper-form-checkbox">
              <input
                type="radio"
                id="payment-method-paypal"
                checked={formikProps.values.paymentMode === PAYPAL_PAYMENT_MODE}
                value={PAYPAL_PAYMENT_MODE}
                onChange={formikProps.handleChange('paymentMode')}
                name="paymentMode"
              />

              <label
                htmlFor="payment-method-paypal"
                aria-hidden="aria-hidden"
                data-value="paypal"
              >
                <span className="agreement__text">PayPal</span>
              </label>
            </p>
          </div>
        )}
      </div>
      {formikProps.errors.paymentMode && formikProps.touched.paymentMode && (
        <div className="validation-message validation-mobile-message show">
          {formikProps.errors.paymentMode}
        </div>
      )}
    </div>
  );
};
