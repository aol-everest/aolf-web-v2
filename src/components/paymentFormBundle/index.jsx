/* eslint-disable no-inline-styles/no-inline-styles */
/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  ProgramQuestionnaire,
  UserInfoFormNewCheckout,
} from '@components/checkout';
import dayjs from 'dayjs';
import {
  ABBRS,
  ALERT_TYPES,
  COURSE_MODES,
  PAYMENT_MODES,
  PAYMENT_TYPES,
} from '@constants';
import { useAuth, useGlobalAlertContext } from '@contexts';
import { useQueryString } from '@hooks';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { pushRouteWithUTMQuery } from '@service';
import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import {
  Auth,
  api,
  isEmpty,
  priceCalculation,
  phoneRegExp,
  tConvert,
} from '@utils';
import { filterAllowedParams } from '@utils/utmParam';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { DiscountInputNew } from '@components/discountInputNew';
import { ScheduleAgreementForm } from '@components/scheduleAgreementForm';
import { useRef } from 'react';
import { PayWithNewCheckout } from '@components/checkout/PayWithNewCheckout';
import CostDetailsCardNewCheckout from '@components/checkout/CostDetailsCardNewCheckout';
import { Loader } from '@components';

const advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);

const createOptions = {
  style: {
    base: {
      fontSize: '16px',
      lineHeight: 2,
      fontWeight: 200,
      fontStyle: 'normal',
      color: '#303650',
      fontFamily: 'Work Sans, sans-serif',
      '::placeholder': {
        color: '#9598a6',
        fontFamily: 'Work Sans, sans-serif',
        fontSize: '16px',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

export const PaymentFormBundle = ({
  bundle = {},
  profile = {},
  enrollmentCompletionAction = () => {},
  enrollmentCompletionLink,
  login = () => {},
  isLoggedUser = false,
}) => {
  const formRef = useRef();
  const { showAlert } = useGlobalAlertContext();
  const stripe = useStripe();
  const elements = useElements();
  const { setUser, passwordLess } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isChangingCard, setIsChangingCard] = useState(false);
  const [enrollFormValues, setEnrollFormValues] = useState(null);

  const router = useRouter();
  const { signOut } = passwordLess;

  const {
    mainProductCtypeIds,
    isPartialPaymentAllowedOnBundle,
    minimumPartialPaymentOnBundle,
    remainPartialPaymentDateCap,
    comboSfid: id,
    comboName: title,
    comboDescription: description,
    comboIsActive,
    comboUnitPrice: unitPrice,
    comboListPrice: listPrice,
    comboProductSfid: comboProductSfid,
    comboDetails,
    masterPriceBookId,
    masterPriceBookEntryId,
    otherPaymentOptionAvailable,
    showSecondCourseButton,
    isOnlyBundleCheckout,
  } = bundle || {};

  const {
    first_name,
    last_name,
    email,
    personMailingPostalCode,
    personMailingState,
    personMobilePhone,
    personMailingStreet,
    personMailingCity,
  } = profile;

  const logout = async (e) => {
    if (e) e.preventDefault();
    await signOut();
    pushRouteWithUTMQuery(
      router,
      `/us-en/signin?next=${encodeURIComponent(location.pathname + location.search)}`,
    );
  };

  const stripeConfirmPayment = async (values) => {
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

    if (loading) {
      return null;
    }

    const {
      contactPhone,
      contactAddress,
      contactCity,
      contactState,
      contactZip,
      firstName,
      lastName,
      email,
    } = values;

    try {
      setLoading(true);

      const products = {
        productType: 'bundle',
        productSfId: comboProductSfid,
      };

      let payLoad = {
        shoppingRequest: {
          couponCode: '',
          contactAddress: {
            contactPhone,
            contactAddress,
            contactCity,
            contactState,
            contactZip,
          },
          billingAddress: {
            billingPhone: contactPhone,
            billingAddress: contactAddress,
            billingCity: contactCity,
            billingState: contactState,
            billingZip: contactZip,
          },
          products,
          complianceQuestionnaire: [],
          isInstalmentOpted: false,
          isStripeIntentPayment: true,
        },
        utm: filterAllowedParams(router.query),
      };

      if (!isLoggedUser) {
        payLoad = {
          ...payLoad,
          user: {
            lastName: lastName,
            firstName: firstName,
            email: email,
          },
        };
      }

      //token.saveCardForFuture = true;
      const {
        stripeIntentObj,
        status,
        data,
        error: errorMessage,
        isError,
      } = await api.post({
        path: 'createAndPayOrder',
        body: payLoad,
      });

      if (status === 400 || isError) {
        throw new Error(errorMessage);
      }

      if (data && data.totalOrderAmount > 0) {
        const returnUrl = enrollmentCompletionLink(data);
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
      if (data) {
        enrollmentCompletionAction(data);
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

  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .required('First Name is required')
      .matches(/\S/, 'String should not contain empty spaces'),
    lastName: Yup.string()
      .required('Last Name is required')
      .matches(/\S/, 'String should not contain empty spaces'),
    email: Yup.string().required('Email is required').email(),
    contactAddress: Yup.string().required('Address is required'),
    contactCity: Yup.string().required('City is required'),
    contactState: Yup.string().required('State is required'),
    contactZip: Yup.string()
      .required('Zip is required!')
      //.matches(/^[0-9]+$/, { message: 'Zip is invalid' })
      .min(2, 'Zip is invalid')
      .max(10, 'Zip is invalid'),
    contactPhone: Yup.string()
      .required('Phone number required')
      .matches(phoneRegExp, 'Phone number is not valid'),
    ppaAgreement: Yup.boolean()
      .label('Terms')
      .test(
        'is-true',
        'Please check the box in order to continue.',
        (value) => value === true,
      ),
  });

  const paymentElementOptions = {
    layout: {
      type: 'accordion',
      defaultCollapsed: true,
      radios: true,
      spacedAccordionItems: false,
    },
    defaultValues: {
      billingDetails: {
        email: email || '',
        name: (first_name || '') + (last_name || ''),
        phone: personMobilePhone || '',
      },
    },
  };

  const formikOnChange = (values) => {
    let finalPrice = unitPrice;

    if (!stripe || !elements) {
      return;
    }

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

  const handleFormSubmit = () => {
    if (formRef.current) {
      formRef.current.submitForm();
    }
  };

  return (
    <>
      {loading && <Loader />}
      <Formik
        initialValues={{
          firstName: first_name || '',
          lastName: last_name || '',
          email: email || '',
          contactPhone: personMobilePhone || '',
          contactAddress: personMailingStreet || '',
          contactCity: personMailingCity || '',
          contactState: personMailingState || '',
          contactZip: personMailingPostalCode || '',
          ppaAgreement: false,
        }}
        validationSchema={validationSchema}
        innerRef={formRef}
        onSubmit={async (values) => {
          await stripeConfirmPayment(values);
        }}
      >
        {(formikProps) => {
          const { values } = formikProps;
          formikOnChange(values);

          return (
            <>
              <main className="checkout-aol">
                <section>
                  <div className="row">
                    <div className="col-12 col-lg-7">
                      <div className="section--title">
                        <h1 className="page-title">{title}</h1>

                        <div
                          className="description"
                          dangerouslySetInnerHTML={{
                            __html: description,
                          }}
                        ></div>
                      </div>
                      <div className="section-box account-details">
                        <h2 className="section__title">Account Details</h2>
                        <div className="section__body">
                          {isLoggedUser && (
                            <p className="details__content">
                              This is not your account?{' '}
                              <a href="#" className="link" onClick={logout}>
                                Logout
                              </a>
                            </p>
                          )}
                          {!isLoggedUser && (
                            <p className="details__content">
                              Already have an Account?{' '}
                              <a href="#" className="link" onClick={login}>
                                Login
                              </a>
                            </p>
                          )}
                          <form id="my-form">
                            <UserInfoFormNewCheckout
                              formikProps={formikProps}
                              isLoggedUser={isLoggedUser}
                            />
                          </form>
                        </div>
                      </div>
                      <div className="section-box">
                        <h2 className="section__title d-flex">
                          Pay with
                          <span className="ssl-info">
                            <svg
                              width="20"
                              height="21"
                              viewBox="0 0 20 21"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M15.4497 3.93312L10.8663 2.21646C10.3913 2.04146 9.61634 2.04146 9.14134 2.21646L4.55801 3.93312C3.67467 4.26645 2.95801 5.29979 2.95801 6.24145V12.9915C2.95801 13.6665 3.39967 14.5581 3.94134 14.9581L8.52467 18.3831C9.33301 18.9915 10.658 18.9915 11.4663 18.3831L16.0497 14.9581C16.5913 14.5498 17.033 13.6665 17.033 12.9915V6.24145C17.0413 5.29979 16.3247 4.26645 15.4497 3.93312ZM12.8997 8.59979L9.31634 12.1831C9.19134 12.3081 9.03301 12.3665 8.87467 12.3665C8.71634 12.3665 8.55801 12.3081 8.43301 12.1831L7.09967 10.8331C6.85801 10.5915 6.85801 10.1915 7.09967 9.94979C7.34134 9.70812 7.74134 9.70812 7.98301 9.94979L8.88301 10.8498L12.0247 7.70812C12.2663 7.46645 12.6663 7.46645 12.908 7.70812C13.1497 7.94979 13.1497 8.35812 12.8997 8.59979Z"
                                fill="#31364E"
                              />
                            </svg>
                            SSL Secured
                          </span>
                        </h2>
                        <div
                          className="order__card__payment-method"
                          data-method="card"
                        >
                          <PaymentElement options={paymentElementOptions} />
                        </div>

                        <div className="trust-score">
                          <div className="first-row">
                            Excellent
                            <img
                              src="/img/Trustpilo_stars-5.png"
                              alt="Trust Pilot"
                            />
                            <img
                              src="/img/TrustPilot-logo2x.webp"
                              alt="Trust Pilot"
                              width="90"
                            />
                          </div>
                          <div className="second-row">
                            TrustScore <strong>4.7</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-lg-5">
                      <div className="checkout-sidebar">
                        <div className="room-board-pricing">
                          <div className="total">
                            <div className="label">Total:</div>
                            <div className="value">
                              {' '}
                              {listPrice && <s>${listPrice.toFixed(2)}</s>} $
                              {unitPrice.toFixed(2) || '0'.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="section-box confirm-submit">
                          <div className="section__body">
                            <ScheduleAgreementForm
                              formikProps={formikProps}
                              complianceQuestionnaire={[]}
                              isCorporateEvent={false}
                              questionnaireArray={[]}
                              screen="DESKTOP"
                            />

                            {/* <div className="note">
                              For any health related questions, please contact
                              us at{' '}
                              <a href="mailto:healthinfo@us.artofliving.org">
                                healthinfo@us.artofliving.org
                              </a>
                            </div> */}
                            <div className="form-item submit-item">
                              <button
                                className="submit-btn"
                                id="pay-button"
                                type="button"
                                disabled={
                                  loading ||
                                  formikProps.values.priceType === 'premium' ||
                                  formikProps.values.paymentMode ===
                                    PAYMENT_MODES.PAYPAL_PAYMENT_MODE
                                }
                                form="my-form"
                                onClick={handleFormSubmit}
                              >
                                Confirm and Pay
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </main>
            </>
          );
        }}
      </Formik>
    </>
  );
};
