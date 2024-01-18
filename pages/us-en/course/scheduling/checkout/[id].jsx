import dayjs from 'dayjs';
import { PageLoading } from '@components';
import { ABBRS, ALERT_TYPES, COURSE_MODES } from '@constants';
import { useQueryString } from '@hooks';
import queryString from 'query-string';
import { useGlobalAlertContext } from '@contexts';
import {
  PaymentElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { api, priceCalculation, tConvert, phoneRegExp } from '@utils';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import * as Yup from 'yup';
import ErrorPage from 'next/error';
import { useQuery } from 'react-query';
import { filterAllowedParams, removeNull } from '@utils/utmParam';
import { DiscountInputNew } from '@components/discountInputNew';
import { ScheduleAgreementForm } from '@components/scheduleAgreementForm';
import { replaceRouteWithUTMQuery } from '@service';
import { useEffectOnce } from 'react-use';
import { useAnalytics } from 'use-analytics';
import isUrl from 'is-url';
import { UserInfoFormNewCheckout } from '@components/checkout/UserInfoFormNewCheckout';

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
  const [discount] = useQueryString('discountCode');
  const [courseType] = useQueryString('courseType');
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
  } = useQuery(
    'workshopDetail',
    async () => {
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
    {
      refetchOnWindowFocus: false,
      enabled: !!workshopId,
    },
  );

  useEffectOnce(() => {
    page({
      category: 'course_registration',
      name: 'course_scheduling_checkout',
      course_type: courseType,
    });
  });

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !workshopId) return <PageLoading />;

  const { fee, delfee } = priceCalculation({
    workshop,
    discount: discountResponse,
  });

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );

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
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const { showAlert } = useGlobalAlertContext();

  const {
    complianceQuestionnaire,
    title,
    id: productId,
    addOnProducts,
    phone1,
    email,
    eventEndDate,
    eventStartDate,
    primaryTeacherName,
    coTeacher1Name,
    coTeacher2Name,
    mode,
    phone2,
    timings = [],
  } = workshop;

  const questionnaireArray = complianceQuestionnaire
    ? complianceQuestionnaire.map((current) => ({
        key: current.questionSfid,
        value: isReferBySameSite,
      }))
    : [];

  const completeEnrollmentAction = async (values) => {
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

    const { id: productId, addOnProducts, productTypeId } = workshop;

    const {
      questionnaire,
      firstName,
      lastName,
      email,
      couponCode,
      contactPhone,
    } = values;

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
          },
          billingAddress: {
            billingPhone: contactPhone,
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
          const returnUrl = `${window.location.origin}/us-en/course/thankyou/${
            data.attendeeId
          }?${queryString.stringify(filteredParams)}`;
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

  const handleFormSubmit = () => {
    if (formRef.current) {
      formRef.current.handleSubmit();
    }
  };

  return (
    <>
      {loading && <div className="cover-spin"></div>}
      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          questionnaire: questionnaireArray,
          ppaAgreement: isReferBySameSite,
          couponCode: discount ? discount : '',
          contactPhone: '',
        }}
        validationSchema={Yup.object().shape({
          firstName: Yup.string().required('First Name is required'),
          lastName: Yup.string().required('Last Name is required'),
          email: Yup.string()
            .email('Email is invalid!')
            .required('Email is required!'),
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
        })}
        innerRef={formRef}
        onSubmit={async (values) => {
          await completeEnrollmentAction(values);
        }}
      >
        {(formikProps) => {
          const { values, handleSubmit } = formikProps;
          formikOnChange(values);
          return (
            <section>
              <div className="container">
                <div className="row">
                  <div className="col-12 col-lg-7">
                    <div className="section--title">
                      <h1 className="page-title">{title}</h1>
                    </div>
                    <div className="section-box">
                      <h2 className="section__title">Account Details</h2>
                      <div className="section__body">
                        <form id="my-form">
                          <div className="row pt-3 mx-n2">
                            <UserInfoFormNewCheckout
                              formikProps={formikProps}
                            />
                          </div>
                        </form>
                      </div>
                    </div>
                    <div className="section-box">
                      {fee > 0 && (
                        <>
                          <h2 className="section__title">Pay with</h2>
                          <div className="section__body">
                            <PaymentElement />
                          </div>
                        </>
                      )}
                    </div>
                    <div className="section-box features-desktop">
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
                  <div className="col-12 col-lg-5">
                    <div className="checkout-sidebar">
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
                              Contact Date:
                            </div>
                            <div className="value col-7">
                              {dayjs
                                .utc(eventStartDate)
                                .isSame(dayjs.utc(eventEndDate), 'month') &&
                                `${dayjs
                                  .utc(eventStartDate)
                                  .format('MMMM DD')}-${dayjs
                                  .utc(eventEndDate)
                                  .format('DD, YYYY')}`}
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
                              <a href={`tel:${phone1}`}>{phone1}</a>
                              <br />
                              {phone2 && <a href={`tel:${phone2}`}>{phone2}</a>}
                              <a href={`mailto:${email}`}>{email}</a>
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
                                  src="./img/inner-peace-icon.svg"
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
                                  src="./img/calm-icon.svg"
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
                                  src="./img/spirituality-icon.svg"
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
                                  src="./img/experience-icon.svg"
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
