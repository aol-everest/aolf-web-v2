/* eslint-disable react/no-unescaped-entities */
import dayjs from 'dayjs';
import { PageLoading } from '@components';
import { ABBRS, ALERT_TYPES, COURSE_MODES } from '@constants';
import { useQueryState } from 'nuqs';
import queryString from 'query-string';
import { useAuth, useGlobalAlertContext } from '@contexts';
import {
  PaymentElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { NextSeo } from 'next-seo';
import { loadStripe } from '@stripe/stripe-js';
import {
  api,
  priceCalculation,
  tConvert,
  phoneRegExp,
  convertToUpperCaseAndReplaceSpacesForURL,
} from '@utils';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import { useRef, useState, useEffect } from 'react';
import * as Yup from 'yup';
import ErrorPage from 'next/error';
import { useQuery } from '@tanstack/react-query';
import { filterAllowedParams, removeNull } from '@utils/utmParam';
import { DiscountInputNew } from '@components/discountInputNew';
import { ScheduleAgreementForm } from '@components/scheduleAgreementForm';
import { replaceRouteWithUTMQuery } from '@service';
import { useEffectOnce } from 'react-use';
import { useAnalytics } from 'use-analytics';
import isUrl from 'is-url';
import { UserInfoFormNewCheckout } from '@components/checkout';

var advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);

function getDomainFromUrl(url) {
  if (!isUrl(url)) {
    return url;
  }
  const domain = new URL(url);
  return domain.origin;
}

export const getServerSideProps = async (context) => {
  const referringURL = context.req.headers.referer || '';
  const requestingURL = context.req.reqPath || '';
  return { props: { referringURL, requestingURL } };
};

const SchedulingPayment = (props) => {
  const router = useRouter();
  const [discount] = useQueryState('discountCode');
  const [courseType] = useQueryState('courseType');
  const [discountResponse, setDiscountResponse] = useState(null);
  const { id: workshopId } = router.query;
  const { track, page } = useAnalytics();

  const isReferBySameSite =
    getDomainFromUrl(props.referringURL) ===
    getDomainFromUrl(process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGNOUT);

  const {
    data: workshop,
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

  useEffectOnce(() => {
    page({
      category: 'course_registration',
      name: 'course_scheduling_checkout',
      course_type: courseType,
    });
  });

  useEffect(() => {
    if (workshop) {
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
    }
  }, [workshop]);

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !workshopId) return <PageLoading />;

  const { fee, delfee } = priceCalculation({
    workshop,
    discount: discountResponse,
  });

  const stripePromise = loadStripe(workshop.publishableKey);

  const applyDiscount = (discount) => {
    setDiscountResponse(discount);
  };

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
    <>
      <header className="checkout-header">
        <img className="checkout-header__logo" src="/img/ic-logo.svg" alt="" />
      </header>

      <main className="checkout-aol">
        <Elements stripe={stripePromise} options={elementsOptions}>
          <SchedulingPaymentForm
            workshop={workshop}
            applyDiscount={applyDiscount}
            discount={discount}
            discountResponse={discountResponse}
            fee={fee}
            delfee={delfee}
            router={router}
            track={track}
            courseType={courseType}
            isReferBySameSite={isReferBySameSite}
          />
        </Elements>
      </main>
    </>
  );
};

const SchedulingPaymentForm = ({
  workshop,
  applyDiscount,
  discount,
  discountResponse,
  fee,
  delfee,
  router,
  track,
  courseType,
  isReferBySameSite,
}) => {
  const { user = {} } = useAuth();
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const [isDirectCheckoutFlow] = useQueryState('direct');

  const { showAlert } = useGlobalAlertContext();

  const {
    complianceQuestionnaire,
    title,
    id: productId,
    addOnProducts,
    phone1,
    email: contactEmail,
    eventEndDate,
    eventStartDate,
    primaryTeacherName,
    coTeacher1Name,
    coTeacher2Name,
    mode,
    phone2,
    timings = [],
    contactName,
    isGenericWorkshop,
  } = workshop;

  const {
    first_name,
    last_name,
    email,
    personMailingPostalCode,
    personMailingState,
    personMobilePhone,
    personMailingStreet,
    personMailingCity,
  } = user?.profile || {};

  const questionnaireArray = complianceQuestionnaire
    ? complianceQuestionnaire.map((current) => ({
        key: current.questionSfid,
        value: isReferBySameSite,
      }))
    : [];

  const completeEnrollmentAction = async (values) => {
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

    if (loading) {
      return null;
    }

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
      setLoading(true);

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
        const title = convertToUpperCaseAndReplaceSpacesForURL(workshop.title);
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

      setLoading(false);
    } catch (ex) {
      console.error(ex);
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      setLoading(false);
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

  return (
    <>
      <NextSeo title={title + ' Course Checkout'} />
      {loading && <div className="cover-spin"></div>}
      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          contactAddress: personMailingStreet || '',
          contactCity: personMailingCity || '',
          contactState: personMailingState || '',
          contactZip: personMailingPostalCode || '',
          questionnaire: questionnaireArray,
          ppaAgreement: isReferBySameSite,
          couponCode: discount ? discount : '',
          contactPhone: '',
        }}
        validationSchema={Yup.object().shape({
          firstName: Yup.string()
            .required('First Name is required')
            .matches(/\S/, 'String should not contain empty spaces'),
          lastName: Yup.string()
            .required('Last Name is required')
            .matches(/\S/, 'String should not contain empty spaces'),
          email: Yup.string()
            .email('Email is invalid!')
            .required('Email is required!')
            .email(),
          contactPhone: Yup.string()
            .required('Phone number required')
            .matches(phoneRegExp, 'Phone number is not valid'),
          contactAddress: Yup.string().required('Address is required'),
          contactCity: Yup.string().required('City is required'),
          contactState: Yup.string().required('State is required'),
          contactZip: Yup.string()
            .required('Zip is required!')
            //.matches(/^[0-9]+$/, { message: 'Zip is invalid' })
            .min(2, 'Zip is invalid')
            .max(10, 'Zip is invalid'),
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
          const { values } = formikProps;
          formikOnChange(values);
          return (
            <section>
              <div className="container">
                <div className="row">
                  <div className="col-12 col-lg-7">
                    <div className="section--title">
                      <h1 className="page-title">{title}</h1>
                    </div>
                    <div className="section-box account-details">
                      <h2 className="section__title">Account Details</h2>
                      <div className="section__body">
                        <form id="my-form">
                          <UserInfoFormNewCheckout formikProps={formikProps} />
                        </form>
                      </div>
                    </div>
                    <div className="section-box">
                      {fee > 0 && (
                        <>
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
                          <div className="section__body">
                            <PaymentElement options={paymentElementOptions} />
                          </div>
                        </>
                      )}
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
                            height="33"
                          />
                        </div>
                        <div className="second-row">
                          TrustScore <strong>4.7</strong>
                        </div>
                      </div>
                    </div>

                    <div className="section-box features-desktop">
                      <div className="section__body">
                        <div className="features">
                          <div className="feature__box">
                            <div className="feature__title">
                              <img
                                src="/img/inner-peace-icon.svg"
                                width="24"
                                height="24"
                                alt=""
                              />
                              Evidence-Based Practice
                            </div>
                            <div className="feature__content">
                              Scientifically proven to reduce stress, anxiety,
                              and improve sleep through hundreds of scientific
                              studies.
                            </div>
                          </div>

                          <div className="feature__box">
                            <div className="feature__title">
                              <img
                                src="/img/calm-icon.svg"
                                width="24"
                                height="24"
                                alt=""
                              />
                              Authentic Meditation Practice
                            </div>
                            <div className="feature__content">
                              Drawing from Vedic principles of meditation, SKY
                              offers an authentic and deeply profound
                              experience, effortlessly allowing anyone to
                              connect with the depth of their being.
                            </div>
                          </div>

                          <div className="feature__box">
                            <div className="feature__title">
                              <img
                                src="/img/spirituality-icon.svg"
                                width="24"
                                height="24"
                                alt=""
                              />
                              Certified SKY Instructors
                            </div>
                            <div className="feature__content">
                              Learn from the best! Our SKY instructors are
                              certified and go through over 500 hours of
                              training to provide you with an interactive and
                              enriching learning experience.
                            </div>
                          </div>

                          <div className="feature__box">
                            <div className="feature__title">
                              <img
                                src="/img/experience-icon.svg"
                                width="24"
                                height="24"
                                alt=""
                              />
                              Millions of Lives Touched
                            </div>
                            <div className="feature__content">
                              Join a community of over 500 million people whose
                              lives have been positively transformed through SKY
                              Breath Meditation and other events.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-lg-5">
                    <div className="checkout-sidebar">
                      {isDirectCheckoutFlow && (
                        <div className="d-flex flex-row tw-py-[12px] tw-px-[16px] tw-bg-[#EDF5FC] tw-rounded-2xl tw-text-[#3D8BE8] tw-text-[16px] tw-font-medium">
                          <i className="d-flex tw-pr-[16px] tw-justify-center">
                            <svg
                              className="tw-self-center"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 21.9998C17.5 21.9998 22 17.4998 22 11.9998C22 6.49976 17.5 1.99976 12 1.99976C6.5 1.99976 2 6.49976 2 11.9998C2 17.4998 6.5 21.9998 12 21.9998Z"
                                stroke="#3D8BE8"
                                stroke-width="1.8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M12 7.99976V12.9998"
                                stroke="#3D8BE8"
                                stroke-width="1.8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M11.9946 16.0002H12.0036"
                                stroke="#3D8BE8"
                                stroke-width="2.4"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </i>
                          <div>
                            Once you're registered, you'll be able to choose a
                            course date/time to suit you! Coursed are offered
                            every weekend and throughout the week.
                          </div>
                        </div>
                      )}
                      <div className="room-board-pricing">
                        <div className="total">
                          <div className="label">Total:</div>
                          <div className="value">
                            {' '}
                            {discountResponse && delfee && (
                              <span className="discount">
                                ${delfee.toFixed(2)}
                              </span>
                            )}{' '}
                            ${fee.toFixed(2) || '0'.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="section-box checkout-details">
                        <h2 className="section__title">Details:</h2>
                        <div className="section__body">
                          <div className="detail-item row">
                            <div className="label col-5">
                              <svg
                                className="detailsIcon icon-calendar"
                                viewBox="0 0 34 32"
                              >
                                <path
                                  fill="none"
                                  stroke="#9598a6"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="4"
                                  strokeWidth="2.4"
                                  d="M29.556 16c0 7.36-5.973 13.333-13.333 13.333s-13.333-5.973-13.333-13.333c0-7.36 5.973-13.333 13.333-13.333s13.333 5.973 13.333 13.333z"
                                ></path>
                                <path
                                  fill="none"
                                  stroke="#9598a6"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="4"
                                  strokeWidth="2.4"
                                  d="M21.168 20.24l-4.133-2.467c-0.72-0.427-1.307-1.453-1.307-2.293v-5.467"
                                ></path>
                              </svg>{' '}
                              Date:
                            </div>
                            <div className="value col-7">
                              {dayjs
                                .utc(eventStartDate)
                                .isSame(dayjs.utc(eventEndDate), 'month') &&
                                `${dayjs
                                  .utc(eventStartDate)
                                  .format('MMM DD')}-${dayjs
                                  .utc(eventEndDate)
                                  .format('DD, YYYY')}`}

                              {!dayjs
                                .utc(eventStartDate)
                                .isSame(dayjs.utc(eventEndDate), 'month') &&
                                `${dayjs
                                  .utc(eventStartDate)
                                  .format('MMM DD')}-${dayjs
                                  .utc(eventEndDate)
                                  .format('MMM DD, YYYY')}`}
                            </div>
                          </div>
                          <div className="detail-item row">
                            <div className="label col-5">
                              <svg
                                className="detailsIcon icon-calendar"
                                viewBox="0 0 34 32"
                              >
                                <path
                                  fill="none"
                                  stroke="#9598a6"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="10"
                                  strokeWidth="2.4"
                                  d="M10.889 2.667v4"
                                ></path>
                                <path
                                  fill="none"
                                  stroke="#9598a6"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="10"
                                  strokeWidth="2.4"
                                  d="M21.555 2.667v4"
                                ></path>
                                <path
                                  fill="none"
                                  stroke="#9598a6"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="10"
                                  strokeWidth="2.4"
                                  d="M4.889 12.12h22.667"
                                ></path>
                                <path
                                  fill="none"
                                  stroke="#9598a6"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="10"
                                  strokeWidth="2.4"
                                  d="M28.222 11.333v11.333c0 4-2 6.667-6.667 6.667h-10.667c-4.667 0-6.667-2.667-6.667-6.667v-11.333c0-4 2-6.667 6.667-6.667h10.667c4.667 0 6.667 2.667 6.667 6.667z"
                                ></path>
                                <path
                                  fill="none"
                                  stroke="#9598a6"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="4"
                                  strokeWidth="3.2"
                                  d="M21.148 18.267h0.012"
                                ></path>
                                <path
                                  fill="none"
                                  stroke="#9598a6"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="4"
                                  strokeWidth="3.2"
                                  d="M21.148 22.267h0.012"
                                ></path>
                                <path
                                  fill="none"
                                  stroke="#9598a6"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="4"
                                  strokeWidth="3.2"
                                  d="M16.216 18.267h0.012"
                                ></path>
                                <path
                                  fill="none"
                                  stroke="#9598a6"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="4"
                                  strokeWidth="3.2"
                                  d="M16.216 22.267h0.012"
                                ></path>
                                <path
                                  fill="none"
                                  stroke="#9598a6"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="4"
                                  strokeWidth="3.2"
                                  d="M11.281 18.267h0.012"
                                ></path>
                                <path
                                  fill="none"
                                  stroke="#9598a6"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="4"
                                  strokeWidth="3.2"
                                  d="M11.281 22.267h0.012"
                                ></path>
                              </svg>{' '}
                              Timing:
                            </div>
                            <div className="value col-7">
                              {timings &&
                                timings.map((time) => {
                                  return (
                                    <div key={time.startDate}>
                                      {dayjs.utc(time.startDate).format('dd')}:{' '}
                                      {tConvert(time.startTime)}-
                                      {tConvert(time.endTime)}{' '}
                                      {ABBRS[time.timeZone]}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                          <div className="detail-item row">
                            <div className="label col-5">
                              <svg
                                className="detailsIcon icon-calendar"
                                viewBox="0 0 34 32"
                              >
                                <path
                                  fill="none"
                                  stroke="#9598a6"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="4"
                                  strokeWidth="2.4"
                                  d="M16.435 14.493c-0.133-0.013-0.293-0.013-0.44 0-3.173-0.107-5.693-2.707-5.693-5.907 0-3.267 2.64-5.92 5.92-5.92 3.267 0 5.92 2.653 5.92 5.92-0.013 3.2-2.533 5.8-5.707 5.907z"
                                ></path>
                                <path
                                  fill="none"
                                  stroke="#9598a6"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="4"
                                  strokeWidth="2.4"
                                  d="M9.768 19.413c-3.227 2.16-3.227 5.68 0 7.827 3.667 2.453 9.68 2.453 13.347 0 3.227-2.16 3.227-5.68 0-7.827-3.653-2.44-9.667-2.44-13.347 0z"
                                ></path>
                              </svg>{' '}
                              Instructor(s):
                            </div>
                            <div className="value col-7">
                              {primaryTeacherName && primaryTeacherName}
                              <br />
                              {coTeacher1Name && coTeacher1Name}
                              <br />
                              {coTeacher2Name && coTeacher2Name}
                            </div>
                          </div>
                          <div className="detail-item row">
                            <div className="label col-5">
                              <svg
                                className="detailsIcon icon-calendar"
                                viewBox="0 0 34 32"
                              >
                                <path
                                  fill="none"
                                  stroke="#9598a6"
                                  strokeLinejoin="miter"
                                  strokeLinecap="butt"
                                  strokeMiterlimit="4"
                                  strokeWidth="2.4"
                                  d="M16.223 17.907c2.297 0 4.16-1.863 4.16-4.16s-1.863-4.16-4.16-4.16c-2.298 0-4.16 1.863-4.16 4.16s1.863 4.16 4.16 4.16z"
                                ></path>
                                <path
                                  fill="none"
                                  stroke="#9598a6"
                                  strokeLinejoin="miter"
                                  strokeLinecap="butt"
                                  strokeMiterlimit="4"
                                  strokeWidth="2.4"
                                  d="M5.049 11.32c2.627-11.547 19.733-11.533 22.347 0.013 1.533 6.773-2.68 12.507-6.373 16.053-2.68 2.587-6.92 2.587-9.613 0-3.68-3.547-7.893-9.293-6.36-16.067z"
                                ></path>
                              </svg>{' '}
                              Location:
                            </div>
                            <div className="value col-7">
                              {mode === COURSE_MODES.ONLINE.name
                                ? mode
                                : (mode === COURSE_MODES.IN_PERSON.name ||
                                    mode ===
                                      COURSE_MODES.DESTINATION_RETREATS
                                        .name) && (
                                    <>
                                      {!workshop.isLocationEmpty && (
                                        <a
                                          href={`https://www.google.com/maps/search/?api=1&query=${
                                            workshop.locationStreet || ''
                                          }, ${workshop.locationCity} ${
                                            workshop.locationProvince
                                          } ${workshop.locationPostalCode} ${
                                            workshop.locationCountry
                                          }`}
                                          target="_blank"
                                          rel="noreferrer"
                                        >
                                          {workshop.locationStreet &&
                                            workshop.locationStreet}
                                          {workshop.locationCity || ''}
                                          {', '}
                                          {workshop.locationProvince || ''}{' '}
                                          {workshop.locationPostalCode || ''}
                                        </a>
                                      )}
                                      {workshop.isLocationEmpty && (
                                        <a
                                          href={`https://www.google.com/maps/search/?api=1&query=${
                                            workshop.streetAddress1 || ''
                                          },${workshop.streetAddress2 || ''} ${
                                            workshop.city
                                          } ${workshop.state} ${workshop.zip} ${
                                            workshop.country
                                          }`}
                                          target="_blank"
                                          rel="noreferrer"
                                        >
                                          {workshop.streetAddress1 &&
                                            workshop.streetAddress1}
                                          {workshop.streetAddress2 &&
                                            workshop.streetAddress2}
                                          {workshop.city || ''}
                                          {', '}
                                          {workshop.state || ''}{' '}
                                          {workshop.zip || ''}
                                        </a>
                                      )}
                                    </>
                                  )}
                            </div>
                          </div>
                          <div className="detail-item row">
                            <div className="label col-5">
                              <svg
                                className="detailsIcon icon-calendar"
                                viewBox="0 0 34 32"
                              >
                                <path
                                  fill="none"
                                  stroke="#9598a6"
                                  strokeLinejoin="miter"
                                  strokeLinecap="butt"
                                  strokeMiterlimit="10"
                                  strokeWidth="2.4"
                                  d="M29.516 24.44c0 0.48-0.107 0.973-0.333 1.453s-0.52 0.933-0.907 1.36c-0.653 0.72-1.373 1.24-2.187 1.573-0.8 0.333-1.667 0.507-2.6 0.507-1.36 0-2.813-0.32-4.347-0.973s-3.067-1.533-4.587-2.64c-1.533-1.12-2.987-2.36-4.373-3.733-1.373-1.387-2.613-2.84-3.72-4.36-1.093-1.52-1.973-3.040-2.613-4.547-0.64-1.52-0.96-2.973-0.96-4.36 0-0.907 0.16-1.773 0.48-2.573 0.32-0.813 0.827-1.56 1.533-2.227 0.853-0.84 1.787-1.253 2.773-1.253 0.373 0 0.747 0.080 1.080 0.24 0.347 0.16 0.653 0.4 0.893 0.747l3.093 4.36c0.24 0.333 0.413 0.64 0.533 0.933 0.12 0.28 0.187 0.56 0.187 0.813 0 0.32-0.093 0.64-0.28 0.947-0.173 0.307-0.427 0.627-0.747 0.947l-1.013 1.053c-0.147 0.147-0.213 0.32-0.213 0.533 0 0.107 0.013 0.2 0.040 0.307 0.040 0.107 0.080 0.187 0.107 0.267 0.24 0.44 0.653 1.013 1.24 1.707 0.6 0.693 1.24 1.4 1.933 2.107 0.72 0.707 1.413 1.36 2.12 1.96 0.693 0.587 1.267 0.987 1.72 1.227 0.067 0.027 0.147 0.067 0.24 0.107 0.107 0.040 0.213 0.053 0.333 0.053 0.227 0 0.4-0.080 0.547-0.227l1.013-1c0.333-0.333 0.653-0.587 0.96-0.747 0.307-0.187 0.613-0.28 0.947-0.28 0.253 0 0.52 0.053 0.813 0.173s0.6 0.293 0.933 0.52l4.413 3.133c0.347 0.24 0.587 0.52 0.733 0.853 0.133 0.333 0.213 0.667 0.213 1.040z"
                                ></path>
                              </svg>{' '}
                              Contact details:
                            </div>
                            <div className="value col-7">
                              <span>{contactName}</span>
                              <br />
                              <a href={`tel:${phone1}`}>{phone1}</a>
                              <br />
                              {phone2 && <a href={`tel:${phone2}`}>{phone2}</a>}
                              <a href={`mailto:${contactEmail}`}>
                                {contactEmail}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="section-box confirm-submit">
                        <div className="section__body">
                          <div className="form-item required">
                            <DiscountInputNew
                              formikProps={formikProps}
                              placeholder="Discount"
                              formikKey="couponCode"
                              product={productId}
                              applyDiscount={applyDiscount}
                              addOnProducts={addOnProducts}
                              containerClass={`tickets-modal__input-label tickets-modal__input-label--top`}
                              label="Discount Code"
                            ></DiscountInputNew>
                          </div>
                          <ScheduleAgreementForm
                            formikProps={formikProps}
                            complianceQuestionnaire={complianceQuestionnaire}
                            isCorporateEvent={false}
                            questionnaireArray={questionnaireArray}
                            screen="DESKTOP"
                          />

                          <div className="note">
                            For any health related questions, please contact us
                            at{' '}
                            <a href="mailto:healthinfo@us.artofliving.org">
                              healthinfo@us.artofliving.org
                            </a>
                          </div>
                          <div className="form-item submit-item">
                            <button
                              className="submit-btn"
                              id="pay-button"
                              type="button"
                              disabled={loading}
                              form="my-form"
                              onClick={handleFormSubmit}
                            >
                              Confirm and Pay
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="section-box features-mobile">
                      <div className="section__body">
                        <div className="features row mx-n2">
                          <div className="col-12 col-lg-6 px-2">
                            <div className="feature__box">
                              <div className="feature__title">
                                <img
                                  src="/img/inner-peace-icon.svg"
                                  width="24"
                                  height="24"
                                  alt=""
                                />
                                Evidence-Based Practice
                              </div>
                              <div className="feature__content">
                                Scientifically proven to reduce stress, anxiety,
                                and improve sleep through hundreds of scientific
                                studies.
                              </div>
                            </div>
                          </div>
                          <div className="col-12 col-lg-6 px-2">
                            <div className="feature__box">
                              <div className="feature__title">
                                <img
                                  src="/img/calm-icon.svg"
                                  width="24"
                                  height="24"
                                  alt=""
                                />
                                Authentic Meditation Practice
                              </div>
                              <div className="feature__content">
                                Drawing from Vedic principles of meditation, SKY
                                offers an authentic and deeply profound
                                experience, effortlessly allowing anyone to
                                connect with the depth of their being.
                              </div>
                            </div>
                          </div>
                          <div className="col-12 col-lg-6 px-2">
                            <div className="feature__box">
                              <div className="feature__title">
                                <img
                                  src="/img/spirituality-icon.svg"
                                  width="24"
                                  height="24"
                                  alt=""
                                />
                                Certified SKY Instructors
                              </div>
                              <div className="feature__content">
                                Learn from the best! Our SKY instructors are
                                certified and go through over 500 hours of
                                training to provide you with an interactive and
                                enriching learning experience.
                              </div>
                            </div>
                          </div>
                          <div className="col-12 col-lg-6 px-2">
                            <div className="feature__box">
                              <div className="feature__title">
                                <img
                                  src="/img/experience-icon.svg"
                                  width="24"
                                  height="24"
                                  alt=""
                                />
                                Millions of Lives Touched
                              </div>
                              <div className="feature__content">
                                Join a community of over 500 million people
                                whose lives have been positively transformed
                                through SKY Breath Meditation and other events.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        }}
      </Formik>
    </>
  );
};

SchedulingPayment.noHeader = true;
SchedulingPayment.hideFooter = true;

export default SchedulingPayment;
