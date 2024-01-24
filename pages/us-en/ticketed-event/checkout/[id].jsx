/* eslint-disable no-inline-styles/no-inline-styles */
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useLocalStorage } from 'react-use';
import {
  useAuth,
  useGlobalAlertContext,
  useGlobalModalContext,
} from '@contexts';
import { ALERT_TYPES, MODAL_TYPES, PAYMENT_MODES } from '@constants';
import { Formik } from 'formik';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import * as Yup from 'yup';
import { loadStripe } from '@stripe/stripe-js';
import { useAnalytics } from 'use-analytics';
import { filterAllowedParams } from '@utils/utmParam';
import queryString from 'query-string';
import {
  PaymentElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { Auth, api } from '@utils';
import { TicketPhoneInput } from '@components/ticketPhoneInput';
import { Loader } from '@components/loader';

export default function TicketCheckout() {
  const router = useRouter();
  const { track } = useAnalytics();

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );

  const elementsOptions = {
    mode: 'payment',
    amount: 1099,
    currency: 'usd',
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0570de',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: '"Work Sans",Ideal Sans, system-ui, sans-serif',
        spacingUnit: '2px',
        borderRadius: '4px',
      },
      rules: {
        '.Block': {
          backgroundColor: 'var(--colorBackground)',
          boxShadow: 'none',
          padding: '12px',
        },
        '.Input': {
          padding: '14px',
          width: '100%',
          maxHeight: '48px',
          borderRadius: '16px',
          border: '1px solid rgba(0, 0, 0, 0.15)',
        },
        '.Input:disabled, .Input--invalid:disabled': {
          color: 'lightgray',
        },
        '.Tab': {
          borderRadius: '16px',
          border: '1px solid rgba(0, 0, 0, 0.15)',
          padding: '16px 24px',
          color: '#FCA248',
        },
        '.Tab:hover': {
          borderRadius: '16px',
          border: '1px solid #FF9E1B',
          padding: '16px 24px',
          color: '#FCA248',
          boxShadow: 'none',
        },
        '.Tab--selected, .Tab--selected:focus, .Tab--selected:hover': {
          borderRadius: '16px',
          border: '1px solid #FF9E1B',
          padding: '16px 24px',
          color: '#FCA248',
          boxShadow: 'none',
        },
        '.TabIcon--selected, .TabIcon--selected:focus, .TabIcon--selected:hover':
          {
            color: '#FCA248',
            fill: '#FCA248',
          },
        '.TabIcon, .TabIcon:hover': {
          color: '#FCA248',
          fill: '#FCA248',
        },
        '.Label': {
          opacity: '0',
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <TicketCheckoutForm router={router} track={track} />
    </Elements>
  );
}

const TicketCheckoutForm = ({ router }) => {
  const [selectedPaymentType, setSelectedPaymentType] = useState('');
  const { user, authenticated: isUserLoggedIn, setUser } = useAuth();
  const { showModal } = useGlobalModalContext();
  const stripe = useStripe();
  const { id: workshopId } = router.query;

  const elements = useElements();
  const { showAlert } = useGlobalAlertContext();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useLocalStorage('ticket-events');
  const {
    selectedTickets,
    delfee,
    totalPrice,
    workshop,
    discountResponse,
    totalDiscount,
    productTypeId,
  } = value;

  const { eventImageUrl } = workshop;

  const { first_name, last_name, email } = user?.profile || {};

  const login = () => {
    showModal(MODAL_TYPES.LOGIN_MODAL);
  };

  const setFormInitialValues = () => {
    return {
      firstName: first_name || '',
      lastName: last_name || '',
      email: email || '',
      contactPhone: '',
    };
  };

  const completeEnrollmentAction = async (
    values,
    resetForm,
    isPaypal = false,
  ) => {
    if (loading) {
      return null;
    }

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      throw submitError;
    }

    const { id: productId, isCCNotRequired } = workshop;

    const { firstName, lastName, email, contactPhone } = values;

    try {
      setLoading(true);

      const products = {
        productType: 'ticketed_event',
        productSfId: productId,
      };

      let payLoad = {
        shoppingRequest: {
          couponCode: discountResponse?.couponCode || '',
          contactAddress: {
            contactPhone,
          },
          billingAddress: {
            billingPhone: contactPhone,
          },
          products,
          isStripeIntentPayment: true,
          isPaypalPayment: false,
          tickets: selectedTickets,
        },
      };
      if (isPaypal) {
        payLoad.shoppingRequest.isPaypalPayment = true;
        payLoad.shoppingRequest.isStripeIntentPayment = false;
      }

      if (isCCNotRequired) {
        payLoad.shoppingRequest.isStripeIntentPayment = false;
      }

      payLoad = {
        ...payLoad,
        user: {
          lastName: lastName,
          firstName: firstName,
          email: email,
        },
      };

      //token.saveCardForFuture = true;
      const {
        stripeIntentObj,
        status,
        error: errorMessage,
        isError,
        data,
        paypalObj,
      } = await api.post({
        path: 'createAndPayOrder',
        body: payLoad,
        isUnauthorized: true,
      });

      if (status === 400 || isError) {
        throw new Error(errorMessage);
      }

      if (data || paypalObj) {
        setValue({
          ...value,
          orderId: data?.orderId,
          attendeeId: data?.attendeeId,
          attendeeDetails: {
            lastName: lastName,
            firstName: firstName,
            email: email,
            contactPhone: contactPhone,
          },
        });
        let filteredParams = {
          ctype: productTypeId,
          page: 'ty',
          referral: 'ticketed_event_checkout',
          ...filterAllowedParams(router.query),
        };
        const returnUrl = `${
          window.location.origin
        }/us-en/ticketed-event/thankyou/${workshopId}?${queryString.stringify(
          filteredParams,
        )}`;
        const result = await stripe.confirmPayment({
          //`Elements` instance that was used to create the Payment Element
          elements,
          clientSecret: stripeIntentObj.client_secret,
          confirmParams: {
            return_url: returnUrl,
          },
        });
        if (result.error) {
          // Show error to your customer (for example, payment details incomplete)
          throw new Error(result.error.message);
        }
      }
      setLoading(false);
    } catch (ex) {
      console.error(ex);
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      setLoading(false);
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: message ? `Error: ${message} (${statusCode})` : ex.message,
      });
    }
  };

  const paypalBuyAcknowledgement = async (paypalData) => {
    setLoading(true);
    const {
      data,
      status,
      error: errorMessage,
      isError,
    } = await api.post({
      path: 'paypalBuyAcknowledgement',
      body: { orderID: paypalData.orderID },
    });

    setLoading(false);
    if (status === 400 || isError) {
      throw new Error(errorMessage);
    } else if (data) {
      showAlert(ALERT_TYPES.SUCCESS_ALERT, {
        children: 'You have successfully purchased ticket',
      });
    }
  };

  const formikOnChange = (values) => {
    if (!stripe || !elements) {
      return;
    }
    let finalPrice = totalPrice;
    // if (values.comboDetailId && values.comboDetailId !== workshop.id) {
    //   const selectedBundle = workshop.availableBundles.find(
    //     (b) => b.comboProductSfid === values.comboDetailId,
    //   );
    //   if (selectedBundle) {
    //     finalPrice = selectedBundle.comboUnitPrice;
    //   }
    // }
    if (finalPrice > 0) {
      elements.update({
        amount: finalPrice * 100,
      });
    }
    const paymentElement = elements.getElement(PaymentElement);
    if (paymentElement) {
      paymentElement.update({
        defaultValues: {
          billingDetails: {
            email: values.email,
            name: (values.firstName || '') + (values.lastName || ''),
            phone: values.contactPhone,
          },
        },
      });
    }
  };

  const handlePaymentSelect = (ev) => {
    setSelectedPaymentType(ev.target.name);
  };

  const logout = async (event) => {
    await Auth.logout();
    setUser(null);
    // pushRouteWithUTMQuery(
    //   router,
    //   `/login?next=${encodeURIComponent(location.pathname + location.search)}`,
    // );
  };

  return (
    <Formik
      enableReinitialize
      initialValues={setFormInitialValues()}
      validationSchema={Yup.object().shape({
        firstName: Yup.string().required('First Name is required!'),
        lastName: Yup.string().required('Last Name is required!'),
        email: Yup.string()
          .email('Email is invalid!')
          .required('Email is required!'),
        contactPhone: Yup.string().required('Phone is required'),
      })}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        await completeEnrollmentAction(values, resetForm);
      }}
    >
      {(formikProps) => {
        const { values, handleChange, handleBlur, handleSubmit, resetForm } =
          formikProps;
        formikOnChange(values);

        return (
          <form
            name="workshopEnroll"
            onSubmit={handleSubmit}
            className="workshopEnroll tw-bg-white tw-shadow-lg"
          >
            <div className="tickets-modal">
              <div className="tickets-modal__container products">
                <div className="tickets-modal__left-column">
                  <div className="tickets-modal__section-checkout">
                    <h2 className="tickets-modal__title">Checkout</h2>
                    {/* <p className="tickets-modal__date">Time left 19:55</p> */}

                    <div className="tickets-modal__billing">
                      <h3 className="tickets-modal__subtitle">
                        Billing information
                      </h3>

                      <p className="tickets-modal__billing-login">
                        {isUserLoggedIn ? (
                          <span className="tickets-modal__billing-login_main">
                            This is not your account?{' '}
                            <a
                              href="#"
                              className="tickets-modal--accent"
                              onClick={logout}
                            >
                              Logout
                            </a>
                          </span>
                        ) : (
                          <span className="tickets-modal__billing-login_main">
                            <a
                              href="#"
                              className="tickets-modal--accent"
                              onClick={login}
                            >
                              Login{' '}
                            </a>
                            for a faster experience
                          </span>
                        )}

                        <span className="tickets-modal__billing-login_required">
                          <span className="tickets-modal--accent">*</span>{' '}
                          Required
                        </span>
                      </p>

                      <div className="tickets-modal__form-person">
                        <label
                          className="tickets-modal__input-label"
                          htmlFor="firstName"
                        >
                          <input
                            className="tickets-modal__input"
                            type="text"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.firstName}
                            name="firstName"
                            id="firstName"
                            required
                            placeholder="First name"
                          />
                          <span className="tickets-modal__input-placeholder">
                            First name{' '}
                            <span className="tickets-modal--accent">*</span>
                          </span>
                        </label>

                        <label
                          className="tickets-modal__input-label"
                          htmlFor="lastName"
                        >
                          <input
                            className="tickets-modal__input"
                            type="text"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.lastName}
                            id="lastName"
                            name="lastName"
                            required
                            placeholder="Last name"
                          />
                          <span className="tickets-modal__input-placeholder">
                            Last name{' '}
                            <span className="tickets-modal--accent">*</span>
                          </span>
                        </label>

                        <label
                          className="tickets-modal__input-label"
                          htmlFor="email"
                        >
                          <input
                            className="tickets-modal__input"
                            type="email"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.email}
                            id="email"
                            name="email"
                            required
                            placeholder="email@example.com"
                          />
                          <span className="tickets-modal__input-placeholder">
                            Email address{' '}
                            <span className="tickets-modal--accent">*</span>
                          </span>
                        </label>

                        <label
                          className="tickets-modal__input-label scheduling-modal__content-wrapper-form-list-row"
                          htmlFor="confirmEmail"
                        >
                          <TicketPhoneInput
                            formikProps={formikProps}
                            formikKey="contactPhone"
                            label="Mobile Number"
                            placeholder="Mobile Number"
                            type="tel"
                          />
                        </label>
                      </div>

                      {/* <label
                        className="tickets-modal__distribution"
                        for="distribution"
                      >
                        <input
                          className="tickets-modal__distribution-input"
                          type="checkbox"
                          name="distribution"
                          id="distribution"
                          checked
                        />
                        <span className="tickets-modal__distribution-checkbox">
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

                        <p className="tickets-modal__distribution-text">
                          Keep me updated on more events and news from this
                          event
                        </p>
                      </label> */}
                    </div>

                    <div className="tickets-modal__pay">
                      <h3 className="tickets-modal__subtitle">Pay with</h3>

                      <div
                        className="tickets-modal__payment-dropdown"
                        data-dropdown-for="creditCard"
                      >
                        <label
                          className="tickets-modal__payment-label"
                          htmlFor="creditCard"
                        >
                          <input
                            className="tickets-modal__payment-input"
                            type="radio"
                            name={PAYMENT_MODES.STRIPE_PAYMENT_MODE}
                            onClick={handlePaymentSelect}
                            id="creditCard"
                            value={
                              selectedPaymentType ===
                              PAYMENT_MODES.STRIPE_PAYMENT_MODE
                            }
                            checked={
                              selectedPaymentType ===
                              PAYMENT_MODES.STRIPE_PAYMENT_MODE
                            }
                          />

                          <p className="tickets-modal__payment-checkbox">
                            Credit or debit card
                          </p>

                          <div className="tickets-modal__payment-border"></div>

                          <span className="tickets-modal__payment-icon">
                            <img src="/img/card-icon.svg" alt="violet" />
                          </span>
                        </label>
                      </div>

                      <label
                        className="tickets-modal__payment-label"
                        htmlFor="payPal"
                      >
                        <input
                          className="tickets-modal__payment-input"
                          type="radio"
                          name={PAYMENT_MODES.PAYPAL_PAYMENT_MODE}
                          id="payPal"
                          onClick={handlePaymentSelect}
                          value={
                            selectedPaymentType ===
                            PAYMENT_MODES.PAYPAL_PAYMENT_MODE
                          }
                          checked={
                            selectedPaymentType ===
                            PAYMENT_MODES.PAYPAL_PAYMENT_MODE
                          }
                        />

                        <p className="tickets-modal__payment-checkbox">
                          PayPal
                        </p>
                        <div className="tickets-modal__payment-border"></div>

                        <span className="tickets-modal__payment-icon">
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
                      {selectedPaymentType ===
                        PAYMENT_MODES.STRIPE_PAYMENT_MODE && <PaymentElement />}

                      {selectedPaymentType ===
                        PAYMENT_MODES.PAYPAL_PAYMENT_MODE && (
                        <>
                          <div className="paypal-info__sign-in tw-relative tw-z-0">
                            <PayPalScriptProvider
                              options={{
                                clientId:
                                  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                                debug: true,
                                currency: 'USD',
                              }}
                            >
                              <PayPalButtons
                                style={{
                                  layout: 'horizontal',
                                  color: 'blue',
                                  shape: 'pill',
                                  height: 40,
                                  tagline: false,
                                  label: 'pay',
                                }}
                                fundingSource="paypal"
                                forceReRender={[formikProps.values]}
                                disabled={
                                  !(formikProps.isValid && formikProps.dirty)
                                }
                                createOrder={async (data, actions) => {
                                  return await completeEnrollmentAction(
                                    formikProps.values,
                                    resetForm,
                                    true,
                                  );
                                }}
                                onApprove={paypalBuyAcknowledgement}
                              />
                            </PayPalScriptProvider>
                          </div>
                          <div className="paypal-info__sign-out d-none">
                            <button
                              type="button"
                              className="paypal-info__link sign-out-paypal"
                            >
                              Log out from Paypal
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="tickets-modal__checkout-footer">
                      <p className="tickets-modal__footer-terms">
                        By selecting Apple Pay, I agree to the{' '}
                        <a href="#" className="tickets-modal__footer-link">
                          Eventbrite Terms of Service
                        </a>
                      </p>

                      {loading && <Loader />}

                      <button
                        className={`tickets-modal__footer-button ${
                          loading || !(formikProps.isValid && formikProps.dirty)
                            ? 'disabled'
                            : ''
                        }`}
                        disabled={
                          loading || !(formikProps.isValid && formikProps.dirty)
                        }
                        type="submit"
                      >
                        Place order
                      </button>
                    </div>
                  </div>
                </div>

                <div className="tickets-modal__right-container">
                  <div className="tickets-modal__right-column">
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
                          ${parseFloat(delfee || totalPrice).toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        );
      }}
    </Formik>
  );
};
