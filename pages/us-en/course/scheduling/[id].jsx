import React, { useState, useRef, useEffect, useTransition } from 'react';
import { useQueryState, parseAsString, parseAsStringLiteral } from 'nuqs';
import { useRouter } from 'next/router';
import queryString from 'query-string';
import ErrorPage from 'next/error';
import { Loader, PageLoading } from '@components';
import { replaceRouteWithUTMQuery } from '@service';
import dayjs from 'dayjs';
import {
  tConvert,
  api,
  phoneRegExp,
  priceCalculation,
  parsedAddress,
  findCourseTypeByKey,
} from '@utils';
import { useAuth, useGlobalAlertContext } from '@contexts';
import { useAnalytics } from 'use-analytics';
import { ABBRS, ALERT_TYPES, COURSE_TYPES } from '@constants';
import { NextSeo } from 'next-seo';
import { useQuery } from '@tanstack/react-query';
import { ScheduleAgreementForm } from '@components/scheduleAgreementForm';
import {
  StyledInputNewCheckout,
  UserInfoFormNewCheckout,
} from '@components/checkout';
import {
  PaymentElement,
  useStripe,
  Elements,
  useElements,
} from '@stripe/react-stripe-js';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { loadStripe } from '@stripe/stripe-js';
import { filterAllowedParams, removeNull } from '@utils/utmParam';
import { DiscountInputNew } from '@components/discountInputNew';

const CheckoutStates = {
  EMAIL_INPUT: 'EMAIL_INPUT',
  USER_INFO: 'USER_INFO',
};

const SchedulingPaymentForm = ({
  workshopMaster,
  workshop,
  fee,
  delfee,
  router,
  track,
  courseType,
  activeStep,
  setActiveStep,
  discountResponse,
  setDiscountResponse,
  handleChangeDates,
}) => {
  const { profile = {}, passwordLess, isAuthenticated } = useAuth();
  const { signOut } = passwordLess;
  const formRef = useRef();

  const [isPending, startTransition] = useTransition();
  // const [loading, setLoading] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  const { showAlert } = useGlobalAlertContext();

  const {
    complianceQuestionnaire,
    title,
    eventEndDate,
    eventStartDate,
    primaryTeacherName,
    timings = [],
    isGenericWorkshop,
    unitPrice,
  } = workshop;

  const {
    first_name,
    last_name,
    email,
    personMobilePhone,
    personMailingPostalCode,
    personMailingState,
    personMailingStreet,
    personMailingCity,
  } = profile || {};

  const questionnaireArray = complianceQuestionnaire
    ? complianceQuestionnaire.map((current) => ({
        key: current.questionSfid,
        value: true,
      }))
    : [];

  const completeEnrollmentAction = (values) => {
    startTransition(async () => {
      const {
        questionnaire,
        firstName,
        lastName,
        email,
        couponCode,
        contactPhone,
        contactAddress,
        contactCity,
        contactState,
        contactZip,
      } = values;

      if (!stripe || !elements) {
        // Stripe.js hasn't yet loaded.
        // Make sure to disable form submission until Stripe.js has loaded.
        return;
      }

      track(
        'add_payment_info',
        {
          ecommerce: {
            currency: 'USD',
            value: workshop?.unitPrice,
            coupon: couponCode || '',
            payment_type: 'credit_card/gpay/apple_pay',
            course_format: workshop?.productTypeId,
            course_name: workshop?.title,
            items: [
              {
                item_id: workshop?.id,
                item_name: workshop?.title,
                affiliation: 'NA',
                coupon: couponCode || '',
                discount: 0.0,
                index: 0,
                item_brand: workshop?.businessOrg,
                item_category: workshop?.title,
                item_category2: workshop?.mode,
                item_category3: 'paid',
                item_category4: 'NA',
                item_category5: 'NA',
                item_list_id: workshop?.productTypeId,
                item_list_name: workshop?.title,
                item_variant: workshop?.workshopTotalHours,
                location_id: workshop?.locationCity,
                price: workshop?.unitPrice,
                quantity: 1,
              },
            ],
          },
        },
        {
          plugins: {
            all: false,
            'gtm-ecommerce-plugin': true,
          },
        },
      );

      // Trigger form validation and wallet collection
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const { id: productId, addOnProducts, productTypeId } = workshop;

      const complianceQuestionnaire = questionnaire.reduce(
        (res, current) => ({
          ...res,
          [current.key]: current.value ? 'Yes' : 'No',
        }),
        {},
      );

      try {
        const selectedAddOn = null;

        let addOnProductsList = addOnProducts
          ? addOnProducts.map((product) => {
              if (!product.isAddOnSelectionRequired) {
                const value = values[product.productName];
                if (value) {
                  return product.productSfid;
                } else {
                  return null;
                }
              }
              return product.productSfid;
            })
          : [];

        let AddOnProductIds = [selectedAddOn, ...addOnProductsList];

        AddOnProductIds = AddOnProductIds.filter((AddOn) => AddOn !== null);

        const isRegularOrder = values.comboDetailId
          ? values.comboDetailId === productId
          : true;

        const products = isRegularOrder
          ? {
              productType: 'workshop',
              productSfId: productId,
              AddOnProductIds: AddOnProductIds,
            }
          : {
              productType: 'bundle',
              productSfId: values.comboDetailId,
              childProduct: {
                productType: 'workshop',
                productSfId: productId,
                AddOnProductIds: AddOnProductIds,
                complianceQuestionnaire,
              },
            };

        let payLoad = {
          shoppingRequest: {
            couponCode: couponCode || '',
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
            complianceQuestionnaire,
            isInstalmentOpted: false,
            isStripeIntentPayment: true,
          },
          utm: filterAllowedParams(router.query),
        };

        if (fee <= 0) {
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
          data,
          error: errorMessage,
          isError,
        } = await api.post({
          path: 'createAndPayOrder',
          body: payLoad,
          isUnauthorized: true,
        });

        if (status === 400 || isError) {
          throw new Error(errorMessage);
        }

        if (data) {
          if (data.totalOrderAmount > 0) {
            let filteredParams = {
              ctype: productTypeId,
              page: 'ty',
              referral: 'course_scheduling_checkout',
              courseType,
              ...filterAllowedParams(router.query),
            };
            filteredParams = removeNull(filteredParams);
            let returnUrl = `${window.location.origin}/us-en/course/thankyou/${
              data.attendeeId
            }?${queryString.stringify(filteredParams)}`;
            if (isGenericWorkshop) {
              returnUrl = `${window.location.origin}/us-en/course/scheduling?aid=${data.attendeeId}&${queryString.stringify(filteredParams)}`;
            }

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
          } else {
            if (isGenericWorkshop) {
              replaceRouteWithUTMQuery(router, {
                pathname: `/us-en/course/scheduling/thankyou/${data.attendeeId}`,
                query: {
                  aid: data.attendeeId,
                },
              });
            } else {
              replaceRouteWithUTMQuery(router, {
                pathname: `/us-en/course/thankyou/${data.attendeeId}`,
                query: {
                  ctype: productTypeId,
                  page: 'ty',
                  courseType,
                  referral: 'course_scheduling_checkout',
                },
              });
            }
          }
        }
      } catch (ex) {
        console.error(ex);
        const data = ex.response?.data;
        const { message, statusCode } = data || {};
        showAlert(ALERT_TYPES.ERROR_ALERT, {
          children: message ? `Error: ${message} (${statusCode})` : ex.message,
        });
        track('show_error', {
          screen_name: 'course_scheduling_checkout_error',
          course_type: courseType,
          error_message: message
            ? `Error: ${message} (${statusCode})`
            : ex.message,
        });
      }
    });
  };

  const formikOnChange = (values) => {
    if (!stripe || !elements) {
      return;
    }
    let finalPrice = fee;
    if (values.comboDetailId && values.comboDetailId !== workshop.id) {
      const selectedBundle = workshop.availableBundles.find(
        (b) => b.comboProductSfid === values.comboDetailId,
      );
      if (selectedBundle) {
        finalPrice = selectedBundle.comboUnitPrice;
      }
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

  const handleFormSubmit = () => {
    if (formRef.current) {
      formRef.current.submitForm();
    }
  };

  useEffect(() => {
    const paymentBox = document.querySelector('.payment-box');
    if (paymentBox) {
      window.scrollTo({
        top: document.documentElement.scrollHeight, // Scroll to the bottom
        behavior: 'smooth',
      });
    }
  }, []); // Runs only on component mount (when the pa

  const handleTrackEvent = () => {
    track(
      'begin_checkout',
      {
        ecommerce: {
          currency: 'USD',
          value: workshop?.unitPrice,
          course_format: workshop?.productTypeId,
          course_name: workshop?.title,
          items: [
            {
              item_id: workshop?.id,
              item_name: workshop?.title,
              affiliation: 'NA',
              coupon: '',
              discount: 0.0,
              index: 0,
              item_brand: workshop?.businessOrg,
              item_category: workshop?.title,
              item_category2: workshop?.mode,
              item_category3: 'paid',
              item_category4: 'NA',
              item_category5: 'NA',
              item_list_id: workshop?.productTypeId,
              item_list_name: workshop?.title,
              item_variant: workshop?.workshopTotalHours,
              location_id: workshop?.locationCity,
              price: workshop?.unitPrice,
              quantity: 1,
            },
          ],
        },
      },
      {
        plugins: {
          all: false,
          'gtm-ecommerce-plugin': true,
        },
      },
    );
  };

  const handleLocationFilterChange = async (value, formikProps) => {
    if (value) {
      const { street, city, state, zip } = parsedAddress(value?.locationName);

      // Batch all updates together to prevent multiple validations
      formikProps.setValues(
        {
          ...formikProps.values,
          contactAddress: street,
          contactCity: city,
          contactState: state,
          contactZip: zip,
        },
        true,
      ); // true to run validation once after all values are set
    }
  };

  const applyDiscount = (discount) => {
    setDiscountResponse(discount);
  };

  const initialValue = {
    firstName: '',
    lastName: '',
    email: '',
    contactAddress: '',
    contactCity: '',
    contactState: '',
    contactZip: '',
    contactPhone: '',
  };

  return (
    <>
      {isPending && <Loader />}
      <Formik
        initialValues={{
          firstName: first_name,
          lastName: last_name,
          email: email,
          contactAddress: personMailingStreet || '',
          contactCity: personMailingCity || '',
          contactState: personMailingState || '',
          contactZip: personMailingPostalCode || '',
          contactPhone: personMobilePhone,
          questionnaire: questionnaireArray,
          ppaAgreement: true,
        }}
        validationSchema={Yup.object().shape({
          firstName: Yup.string().when('email', {
            is: (value) => !!value,
            then: Yup.string()
              .required('First Name is required')
              .matches(/\S/, 'String should not contain empty spaces'),
            otherwise: Yup.string().notRequired(),
          }),
          lastName: Yup.string().when('email', {
            is: (value) => !!value,
            then: Yup.string()
              .required('Last Name is required')
              .matches(/\S/, 'String should not contain empty spaces'),
            otherwise: Yup.string().notRequired(),
          }),
          contactPhone: Yup.string().when('email', {
            is: (value) => !!value,
            then: Yup.string()
              .required('Phone number required')
              .matches(phoneRegExp, 'Phone number is not valid'),
            otherwise: Yup.string().notRequired(),
          }),
          email: Yup.string()
            .email('Email is invalid!')
            .required('Email is required!')
            .matches(/\S/, 'String should not contain empty spaces')
            .email(),
          contactAddress: Yup.string().when('email', {
            is: (value) => !!value,
            then: Yup.string()
              .required('Address is required')
              .matches(/\S/, 'String should not contain empty spaces'),
            otherwise: Yup.string().notRequired(),
          }),
          contactCity: Yup.string().when(['contactAddress', 'email'], {
            is: (address, email) => !!address && !!email,
            then: Yup.string()
              .required('City is required')
              .matches(/\S/, 'String should not contain empty spaces'),
            otherwise: Yup.string().notRequired(),
          }),
          contactState: Yup.string().when(['contactAddress', 'email'], {
            is: (address, email) => !!address && !!email,
            then: Yup.string()
              .required('State is required')
              .matches(/\S/, 'String should not contain empty spaces'),
            otherwise: Yup.string().notRequired(),
          }),
          contactZip: Yup.string().when(['contactAddress', 'email'], {
            is: (address, email) => !!address && !!email,
            then: Yup.string()
              .required('Zip code is required!')
              .matches(/\S/, 'String should not contain empty spaces')
              .min(2, 'Zip must be at least 2 characters')
              .max(10, 'Zip can be at most 10 characters'),
            otherwise: Yup.string().notRequired(),
          }),
          ppaAgreement: Yup.boolean()
            .label('Terms')
            .test(
              'is-true',
              'Please check the box in order to continue.',
              (value) => value === true,
            ),
        })}
        innerRef={formRef}
        onSubmit={async (values) => {
          await completeEnrollmentAction(values);
        }}
      >
        {(formikProps) => {
          const {
            values,
            setTouched,
            setErrors,
            errors,
            setFieldTouched,
            resetForm,
          } = formikProps;
          formikOnChange(values);

          const isNotAllQuestionnaireChecked = values?.questionnaire?.some(
            (item) => !item.value,
          );

          return (
            <main className="scheduling-page">
              <section className="scheduling-top">
                <div className="container">
                  <h1 className="page-title">
                    {title || workshopMaster?.title}
                  </h1>
                  <div
                    className="page-description"
                    dangerouslySetInnerHTML={{
                      __html: workshopMaster?.calenderViewDescription,
                    }}
                  ></div>
                </div>
              </section>
              <section className="scheduling-stepper">
                <div className="container">
                  <div className="step-wrapper">
                    <div className="step completed">
                      <div className="step-icon">
                        <span></span>
                      </div>
                      <div className="step-text">Select the date</div>
                    </div>
                    <div className="step completed">
                      <div className="step-icon">
                        <span></span>
                      </div>
                      <div className="step-text">Select the course time</div>
                    </div>
                    <div className="step active">
                      <div className="step-icon">
                        <span></span>
                      </div>
                      <div className="step-text">Checkout</div>
                    </div>
                  </div>
                </div>
              </section>
              <section className="checkout-section">
                <div className="container">
                  <div className="checkout-area-wrap">
                    <div className="first-col">
                      <div className="checkout-title">{workshop.title}</div>
                      <div className="checkout-subtitle">
                        with {primaryTeacherName}
                      </div>
                      <div className="payment-box center-one">
                        <div className="payment-total-box">
                          <label>Total:</label>
                          <div className="amount">
                            {delfee && <s>${delfee}</s>} $
                            {fee.toFixed(2) || '0'}
                          </div>
                        </div>
                        <div className="payment-details">
                          <div className="payby">
                            Pay As Low As{' '}
                            <img src="/img/logo-affirm.webp" height="22" />
                          </div>
                          <div className="price-breakup">
                            <div className="price-per-month">
                              ${workshop?.instalmentAmount}/<span>month</span>
                            </div>
                            <div className="payment-tenure">for 12 months</div>
                          </div>
                        </div>
                      </div>
                      <div className="checkout-course-info-box">
                        <div className="info-box-icon">
                          <span className="icon-aol iconaol-calendar "></span>
                        </div>
                        <div className="info-box-details">
                          <div className="info-box-title">Date:</div>
                          <div className="info-detail">
                            {' '}
                            {dayjs
                              .utc(eventStartDate)
                              .isSame(dayjs.utc(eventEndDate), 'month') &&
                              `${dayjs.utc(eventStartDate).format('MMMM DD')}-${dayjs
                                .utc(eventEndDate)
                                .format('DD, YYYY')}`}
                            {!dayjs
                              .utc(eventStartDate)
                              .isSame(dayjs.utc(eventEndDate), 'month') &&
                              `${dayjs.utc(eventStartDate).format('MMM DD')}-${dayjs
                                .utc(eventEndDate)
                                .format('MMM DD, YYYY')}`}
                          </div>
                          <div className="info-link">
                            <a href="#" onClick={handleChangeDates}>
                              Change Dates
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="checkout-course-info-box">
                        <div className="info-box-icon">
                          <span className="icon-aol iconaol-clock"></span>
                        </div>
                        <div className="info-box-details">
                          <div className="info-box-title">Timing:</div>
                          {timings &&
                            timings.map((time) => {
                              return (
                                <div
                                  className="info-detail"
                                  key={time.startDate}
                                >
                                  {dayjs.utc(time.startDate).format('dd')}:{' '}
                                  {tConvert(time.startTime)}-
                                  {tConvert(time.endTime)}{' '}
                                  {ABBRS[time.timeZone]}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                      <div className="checkout-course-info-box">
                        <div className="info-box-icon">
                          <span className="icon-aol iconaol-location"></span>
                        </div>
                        <div className="info-box-details">
                          <div className="info-box-title">Location:</div>
                          <div className="info-detail">{`${workshop?.mode} (The instructor will email you the Zoom meeting details prior to course start date)`}</div>
                        </div>
                      </div>
                    </div>
                    <div className="second-col">
                      <div className="payment-box">
                        <div
                          className={`checkout-title ${activeStep === CheckoutStates.USER_INFO ? 'mb-1 ' : 'mb-3'}`}
                        >
                          {activeStep === CheckoutStates.USER_INFO ||
                          (activeStep === CheckoutStates.EMAIL_INPUT && email)
                            ? 'Pay and enroll'
                            : 'Enter Your Email'}
                        </div>
                        {activeStep === CheckoutStates.EMAIL_INPUT &&
                        !values.email ? (
                          <StyledInputNewCheckout
                            type="email"
                            label="Email Address"
                            className="form-item required mb-4"
                            placeholder="Email"
                            formikProps={formikProps}
                            formikKey="email"
                            isReadOnly={false}
                            onCut={(event) => {
                              event.preventDefault();
                            }}
                            onCopy={(event) => {
                              event.preventDefault();
                            }}
                            onPaste={(event) => {
                              event.preventDefault();
                            }}
                          ></StyledInputNewCheckout>
                        ) : (
                          <div class="checkout-user-info">
                            {values.email}{' '}
                            {!isAuthenticated && (
                              <a
                                href="#"
                                onClick={() => {
                                  resetForm({
                                    values: {
                                      ...values,
                                      ...initialValue,
                                    },
                                    errors: {},
                                  });
                                  setActiveStep(CheckoutStates.EMAIL_INPUT);
                                }}
                              >
                                not you?
                              </a>
                            )}
                            {isAuthenticated &&
                              activeStep === CheckoutStates.USER_INFO && (
                                <a
                                  href="#"
                                  onClick={() => {
                                    setActiveStep(CheckoutStates.EMAIL_INPUT);
                                  }}
                                >
                                  not you?
                                </a>
                              )}
                            {email &&
                              activeStep === CheckoutStates.EMAIL_INPUT && (
                                <a
                                  href="#"
                                  onClick={async () => {
                                    resetForm({
                                      values: {
                                        ...values,
                                        ...initialValue,
                                      },
                                      errors: {},
                                    });
                                    await signOut();
                                  }}
                                >
                                  logout?
                                </a>
                              )}
                          </div>
                        )}

                        {activeStep === CheckoutStates.USER_INFO && (
                          <>
                            <UserInfoFormNewCheckout
                              formikProps={formikProps}
                              showContactEmail={false}
                              showStreetAddress={false}
                              showContactCity={!!values.contactAddress}
                              showContactZip={!!values.contactAddress}
                              showContactState={!!values.contactAddress}
                              showLocationSearch={true}
                              locationValue={values.contactAddress}
                              handleLocationFilterChange={(value) =>
                                handleLocationFilterChange(value, formikProps)
                              }
                            />
                            {unitPrice > 0 && (
                              <div className="form-item fullw mt-3 mb-3">
                                <DiscountInputNew
                                  formikProps={formikProps}
                                  placeholder="Discount"
                                  formikKey="couponCode"
                                  product={workshop.id}
                                  applyDiscount={applyDiscount}
                                  addOnProducts={workshop.addOnProducts}
                                  containerClass={`tickets-modal__input-label tickets-modal__input-label--top`}
                                  label="Discount Code"
                                ></DiscountInputNew>
                              </div>
                            )}

                            <div className="section-box !tw-border-y-0">
                              {fee > 0 && (
                                <>
                                  <h2 className="section__title d-flex">
                                    Payment Method
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
                                  <div className="section__body">
                                    <PaymentElement
                                      options={paymentElementOptions}
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </>
                        )}

                        {activeStep === CheckoutStates.EMAIL_INPUT && (
                          <div class="payment-agreements">
                            <ScheduleAgreementForm
                              formikProps={formikProps}
                              complianceQuestionnaire={complianceQuestionnaire}
                              isCorporateEvent={false}
                              questionnaireArray={questionnaireArray}
                              screen="DESKTOP"
                              parentClass=""
                            />
                          </div>
                        )}

                        <div className="note">
                          For any health related questions, please contact us at{' '}
                          <a href="mailto:healthinfo@us.artofliving.org">
                            healthinfo@us.artofliving.org
                          </a>
                        </div>

                        <div className="payment-actions">
                          {activeStep === CheckoutStates.USER_INFO ? (
                            <button
                              className="submit-btn"
                              id="pay-button"
                              type="button"
                              disabled={isPending}
                              form="my-form"
                              onClick={handleFormSubmit}
                            >
                              Pay and enroll
                            </button>
                          ) : (
                            <button
                              className="submit-btn"
                              type="button"
                              disabled={isPending}
                              onClick={(e) => {
                                if (
                                  !values.email ||
                                  errors.email ||
                                  !values.ppaAgreement ||
                                  isNotAllQuestionnaireChecked
                                ) {
                                  setFieldTouched('ppaAgreement', true);
                                  setFieldTouched('questionnaire', true);
                                } else {
                                  e.preventDefault();
                                  setActiveStep(CheckoutStates.USER_INFO);
                                  setTouched({}, false); // Reset touched fields
                                  setErrors({});
                                  handleTrackEvent();
                                }
                              }}
                            >
                              Continue
                            </button>
                          )}
                        </div>
                        <div className="checkout-tnc">
                          By continuing, you agree to{' '}
                          <a href="https://www.artofliving.org/us-en/terms-of-use?_gl=1*uug117*_gcl_au*NzgyODQ2MzUyLjE3MjUzODUxMTk.*_ga*MTM4MjM1NDQ1Ny4xNzA5NTc3NjY4*_ga_53SWQFSBV0*MTcyNzg4MzE0NC43MC4xLjE3Mjc4ODUxMTYuNTguMC4w">
                            Terms
                          </a>{' '}
                          and{' '}
                          <a href="https://www.artofliving.org/us-en/privacy-policy?_gl=1*ndkz6k*_gcl_au*NzgyODQ2MzUyLjE3MjUzODUxMTk.*_ga*MTM4MjM1NDQ1Ny4xNzA5NTc3NjY4*_ga_53SWQFSBV0*MTcyNzg4MzE0NC43MC4xLjE3Mjc4ODUxMjAuNTQuMC4w">
                            Privacy Policy
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </main>
          );
        }}
      </Formik>
    </>
  );
};

const SchedulingCheckoutFlow = () => {
  const router = useRouter();
  const { track } = useAnalytics();
  const [mode] = useQueryState('mode');
  const [discountResponse, setDiscountResponse] = useState(null);
  const [activeStep, setActiveStep] = useQueryState(
    'step',
    parseAsString.withDefault(CheckoutStates.EMAIL_INPUT),
  );

  const { id: workshopId } = router.query;
  const [courseType] = useQueryState(
    'courseType',
    parseAsString.withDefault('SKY_BREATH_MEDITATION'),
  );

  const courseMode = mode === 'online' ? 'Online' : 'In Person';

  const { data: workshopMaster = {} } = useQuery({
    queryKey: ['workshopMaster', mode],
    queryFn: async () => {
      let ctypeId = null;
      if (mode === 'both' && findCourseTypeByKey(courseType)?.subTypes) {
        ctypeId = findCourseTypeByKey(courseType)?.subTypes['Online'];
      } else if (
        findCourseTypeByKey(courseType)?.subTypes &&
        findCourseTypeByKey(courseType)?.subTypes[mode]
      ) {
        ctypeId = findCourseTypeByKey(courseType)?.subTypes[mode];
      } else {
        const courseTypeValue =
          findCourseTypeByKey(courseType)?.value ||
          COURSE_TYPES.SKY_BREATH_MEDITATION?.value;

        ctypeId = courseTypeValue ? courseTypeValue.split(';')[0] : undefined;
      }

      let param = {
        ctypeId,
      };
      const response = await api.get({
        path: 'workshopMaster',
        param,
      });
      return response.data;
    },
  });

  const {
    data: activeWorkshop,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: 'workshopDetail',
    queryFn: async () => {
      const response = await api.get({
        path: 'workshopDetail',
        param: {
          id: workshopId,
          rp: 'checkout',
        },
        isUnauthorized: true,
      });
      return response.data;
    },
    enabled: !!workshopId,
  });

  const handleChangeDates = () => {
    replaceRouteWithUTMQuery(router, {
      pathname: `/us-en/course/scheduling`,
      query: {
        ...router.query,
        productTypeId: null,
        mode: 'both',
        courseType: null,
        ctype: null,
      },
    });
  };

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !workshopId) return <PageLoading />;

  const { title: courseTitle } = activeWorkshop || {};

  const stripePromise = loadStripe(activeWorkshop.publishableKey);

  const { fee, delfee } = priceCalculation({
    workshop: activeWorkshop,
    discount: discountResponse,
  });

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
        borderRadius: '16px',
      },
      rules: {
        '.Block': {
          backgroundColor: 'var(--colorBackground)',
          boxShadow: 'none',
          padding: '12px',
        },
        '.Input': {
          padding: '16px',
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
    <main className="scheduling-page">
      <NextSeo
        title={
          (activeWorkshop?.title || workshopMaster?.title) + ' Course Checkout'
        }
      />
      <Elements stripe={stripePromise} options={elementsOptions}>
        <SchedulingPaymentForm
          workshopMaster={workshopMaster}
          workshop={activeWorkshop}
          fee={fee}
          delfee={delfee}
          router={router}
          track={track}
          courseType={courseType}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          discountResponse={discountResponse}
          setDiscountResponse={setDiscountResponse}
          handleChangeDates={handleChangeDates}
        />
      </Elements>
    </main>
  );
};

SchedulingCheckoutFlow.hideFooter = true;

export default SchedulingCheckoutFlow;
