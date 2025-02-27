import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  ExpressCheckoutElement,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { api } from '@utils';
import { useGlobalAlertContext } from '@contexts';
import { ALERT_TYPES } from '@constants';
import queryString from 'query-string';
import { removeNull } from '@utils/utmParam';
import { useRouter } from 'next/router';
import Style from './StripeExpressCheckoutElement.module.scss';

export const StripeExpressCheckoutTicket = ({
  workshop,
  total = 1,
  selectedTickets,
}) => {
  const stripePromise = loadStripe(workshop.publishableKey);
  const elementsOptions = {
    mode: 'payment',
    amount: total ? total * 100 : 100,
    currency: 'usd',
    appearance: {
      theme: 'stripe',
      variables: {
        borderRadius: '44px',
        height: '62px',
      },
    },
  };
  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <CheckoutPage
        workshop={workshop}
        total={total}
        selectedTickets={selectedTickets}
      />
    </Elements>
  );
};

const options = {
  buttonType: {
    applePay: 'book',
    googlePay: 'book',
  },
  wallets: {
    applePay: 'always',
    googlePay: 'always',
  },
  paymentMethodOrder: ['apple_pay', 'google_pay'],
};

const CheckoutPage = ({ workshop, total, selectedTickets }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showAlert } = useGlobalAlertContext();

  const onConfirm = async (event) => {
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

      const tickets = Object.entries(selectedTickets).map(([key, value]) => {
        return {
          numberOfTickets: value,
          pricingTierId: key,
        };
      });

      const {
        stripeIntentObj,
        status,
        data,
        error: errorMessage,
        isError,
      } = await api.post({
        path: 'createIntentForExpressCheckout',
        body: {
          shoppingRequest: {
            isStripeIntentPayment: true,
            products: {
              productSfId: workshop.id,
              productType: 'ticketed_event',
              isStripeIntentPayment: true,
              tickets,
            },
            utmParams: filteredParams,
          },
        },
        isUnauthorized: true,
      });

      if (status === 400 || isError) {
        throw new Error(errorMessage);
      }

      filteredParams = {
        ...filteredParams,
        referral: 'ticketed_event_checkout',
      };

      if (status === 400 || isError) {
        throw new Error(errorMessage);
      }

      const returnUrl = `${
        window.location.origin
      }/us-en/ticketed-event/express/thankyou/${workshop.id}?${queryString.stringify(
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

  const expressCheckoutElementOnClick = ({ resolve }) => {
    const options = {
      emailRequired: true,
      phoneNumberRequired: true,
      billingAddressRequired: true,
    };
    resolve(options);
  };

  return (
    <div className="tw-relative">
      <div className={!total ? Style.express_checkout_block : ''}></div>
      <ExpressCheckoutElement
        options={options}
        onConfirm={onConfirm}
        onClick={expressCheckoutElementOnClick}
      />
    </div>
  );
};
