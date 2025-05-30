import classNames from 'classnames';
import { Field } from 'formik';
import Select from 'react-select';

const PAYPAL_PAYMENT_MODE = 'PAYPAL_PAYMENT_MODE';
const STRIPE_PAYMENT_MODE = 'STRIPE_PAYMENT_MODE';

const SelectField = ({ options, field, form, placeholder }) => (
  <Select
    options={options}
    name={field.name}
    value={
      options ? options.find((option) => option.value === field.value) : ''
    }
    onChange={(option) =>
      form.setFieldValue(field.name, option ? option.value : '')
    }
    onBlur={field.onBlur}
    className="react-select-container-old"
    classNamePrefix="react-select"
    placeholder={placeholder}
    isSearchable
    isClearable
  />
);

export const PayWith = ({
  formikKey = 'paymentMode',
  formikProps,
  otherPaymentOptions,
  isBundlePaypalAvailable,
  isBundleSelected,
}) => {
  let options = [
    {
      label: 'Credit card or debit card',
      value: STRIPE_PAYMENT_MODE,
    },
  ];

  if (
    (!isBundleSelected &&
      otherPaymentOptions &&
      otherPaymentOptions.indexOf('Paypal') > -1 &&
      formikProps.values.paymentOption !== 'LATER') ||
    (isBundleSelected && isBundlePaypalAvailable)
  ) {
    options = [
      ...options,
      {
        label: 'PayPal',
        value: PAYPAL_PAYMENT_MODE,
      },
    ];
  }
  return (
    <div
      className={classNames('input-block order__card__payment', {
        error:
          formikProps.errors.paymentMode && formikProps.touched.paymentMode,
        'validate-error':
          formikProps.errors.paymentMode && formikProps.touched.paymentMode,
      })}
    >
      <h6 className="order__card__payment-title">Pay with</h6>
      <Field
        name={formikKey}
        component={SelectField}
        options={options}
        placeholder="Select payment method"
      />
      {/* <div className="select-box order__card__payment-select">
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
          {((!isBundleSelected &&
            otherPaymentOptions &&
            otherPaymentOptions.indexOf('Paypal') > -1 &&
            formikProps.values.paymentOption !== 'LATER') ||
            (isBundleSelected && isBundlePaypalAvailable)) && (
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
              htmlFor="payment-method-card"
              aria-hidden="aria-hidden"
              data-value="card"
              className="select-box__option"
            >
              <span>Credit card or debit card</span>
              <img src="/img/ic-tick-blue-lg.svg" alt="Option selected" />
            </label>
          </li>
          {((!isBundleSelected &&
            otherPaymentOptions &&
            otherPaymentOptions.indexOf('Paypal') > -1 &&
            formikProps.values.paymentOption !== 'LATER') ||
            (isBundleSelected && isBundlePaypalAvailable)) && (
            <li>
              <label
                htmlFor="payment-method-paypal"
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
      </div> */}
      {formikProps.errors.paymentMode && formikProps.touched.paymentMode && (
        <div className="validation-message validation-mobile-message show">
          {formikProps.errors.paymentMode}
        </div>
      )}
    </div>
  );
};
