import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  ExpressCheckoutElement,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ScheduleAgreementForm } from '@components/scheduleAgreementForm';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  api,
  priceCalculation,
  convertToUpperCaseAndReplaceSpacesForURL,
} from '@utils';
import { useGlobalAlertContext } from '@contexts';
import { ALERT_TYPES } from '@constants';
import queryString from 'query-string';
import { removeNull } from '@utils/utmParam';
import { useRouter } from 'next/router';
import Style from './StripeExpressCheckoutElement.module.scss';
import { BiErrorCircle } from 'react-icons/bi';
import { useAnalytics } from 'use-analytics';

export const StripeExpressElement = ({
  workshop,
  loading = false,
  nextPageUrl,
  parentStyle,
  field,
  form,
  email,
}) => {
  const stripePromise = loadStripe(workshop.publishableKey);
  const { fee } = priceCalculation({
    workshop,
  });
  const elementsOptions = {
    mode: 'payment',
    amount: fee * 100,
    currency: 'usd',
    appearance: {
      theme: 'stripe',
      variables: {
        borderRadius: '36px',
        height: '62.5px',
      },
    },
  };
  return (
    <div className="express-checkout-element-only">
      <Elements stripe={stripePromise} options={elementsOptions}>
        <CheckoutPage
          email={email}
          workshop={workshop}
          loading={loading}
          parentStyle={parentStyle}
          nextPageUrl={nextPageUrl}
          field={field}
          form={form}
        />
      </Elements>
    </div>
  );
};

const options = {
  buttonType: {
    applePay: 'buy',
    googlePay: 'buy',
  },
  wallets: {
    applePay: 'always',
    googlePay: 'always',
  },
  paymentMethodOrder: ['apple_pay', 'google_pay'],
};

const CheckoutPage = ({
  workshop,
  loading: buttonLoading,
  parentStyle,
  nextPageUrl = '/us-en/course/thankyou',
  field,
  form,
  email,
}) => {
  console.log(email);
  const { track, page } = useAnalytics();
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const { showAlert } = useGlobalAlertContext();

  const getThankYouPageUrl = () => {
    return encodeURIComponent(nextPageUrl);
  };

  const onConfirm = async (event) => {
    console.log('onConfirm');
    if (loading) {
      return null;
    }
    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const { error: submitError } = await elements.submit();
    if (submitError) {
      throw submitError;
    }
    try {
      // Create the PaymentIntent and obtain clientSecret
      let filteredParams = {
        ctype: workshop.productTypeId,
        ...router.query,
      };
      filteredParams = removeNull(filteredParams);

      const complianceQuestionnaire = form.values.questionnaire.reduce(
        (res, current) => ({
          ...res,
          [current.key]: current.value ? 'Yes' : 'No',
        }),
        {},
      );

      const {
        stripeIntentObj,
        status,
        orderId,
        error: errorMessage,
        isError,
      } = await api.post({
        path: 'createIntentForExpressCheckout',
        body: {
          shoppingRequest: {
            products: {
              productSfId: workshop.id,
              productType: 'workshop',
            },
            complianceQuestionnaire,
            ...(email && { accountEmail: email }),
            utmParams: filteredParams,
          },
        },
      });

      filteredParams = {
        ...filteredParams,
        referral: 'course_search_scheduling',
      };

      if (status === 400 || isError) {
        throw new Error(errorMessage);
      }

      const returnUrl = `${
        window.location.origin
      }/us-en/payment-status/${orderId}?next=${getThankYouPageUrl()}&${queryString.stringify(
        filteredParams,
      )}`;

      // Confirm the PaymentIntent using the details collected by the Express Checkout Element
      const { error } = await stripe.confirmPayment({
        // `elements` instance used to create the Express Checkout Element
        elements,
        // `clientSecret` from the created PaymentIntent
        clientSecret: stripeIntentObj.client_secret,
        confirmParams: {
          return_url: returnUrl,
        },
      });

      if (error) {
        throw new Error(error.message);
      }
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

  const questionnaireArray = workshop.complianceQuestionnaire
    ? workshop.complianceQuestionnaire.map((current) => ({
        key: current.questionSfid,
        value: false,
      }))
    : [];

  const expressCheckoutElementOnClick = ({ resolve }) => {
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
    const options = {
      emailRequired: true,
      phoneNumberRequired: true,
      billingAddressRequired: true,
    };
    resolve(options);
  };

  const dummyValidationMessage = () => {
    setShowMessage(true);
  };
  const hidePayMessage =
    form.values.email &&
    form?.values?.ppaAgreement &&
    (form?.values?.questionnaire?.length === 0 ||
      form.values.questionnaire.some((item) => item.value));

  const getValidationMessage = () => {
    const missingItems = [];

    if (!form.values.email) {
      missingItems.push('email');
    }
    if (!form.values.ppaAgreement) {
      missingItems.push('agreements');
    }
    if (
      form.values.questionnaire?.length > 0 &&
      !form.values.questionnaire.every((q) => q.value)
    ) {
      missingItems.push('questionnaire');
    }

    if (missingItems.length === 0) return '';

    if (missingItems.length === 1) {
      return `Please provide your ${missingItems[0]} to proceed.`;
    }

    const lastItem = missingItems.pop();
    return `Please provide your ${missingItems.join(', ')} and ${lastItem} to proceed.`;
  };

  return (
    <div>
      {!hidePayMessage && showMessage && (
        <div className={Style.pay_message}>
          <BiErrorCircle />
          {'  '}
          {getValidationMessage()}
        </div>
      )}

      <div className="tw-relative" style={parentStyle}>
        <div
          className={
            !form.values.email ||
            !form.values.ppaAgreement ||
            (form.values.questionnaire?.length > 0 &&
              !form.values.questionnaire.every((q) => q.value)) ||
            !form.isValid
              ? Style.express_checkout_block
              : ''
          }
          onClick={dummyValidationMessage}
        ></div>
        <ExpressCheckoutElement
          options={options}
          onConfirm={onConfirm}
          onClick={expressCheckoutElementOnClick}
          disabled={!hidePayMessage}
        />
      </div>
    </div>
  );
};
