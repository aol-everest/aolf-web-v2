import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';
import { useGlobalAlertContext } from '@contexts';
import { api } from '@utils';
import { ALERT_TYPES } from '@constants';
import { useSearchParams } from 'next/navigation';

function ProcessPayment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showAlert } = useGlobalAlertContext();
  const { id, stripeOrg } = router.query;
  console.log('stripeOrg', stripeOrg);
  const next = searchParams.get('next');
  const previous = searchParams.get('previous');
  const clientSecret = searchParams.get('payment_intent_client_secret');

  useEffect(() => {
    if (!router.isReady) return;
    if (!stripeOrg) {
      //router.replace(next);
      console.log('stripeOrg not found');
      return;
    }

    async function checkPaymentStatus() {
      if (!clientSecret) {
        router.replace(next);
        return;
      }

      const data = await api.get({
        path: 'getStripePublishableKey',
        query: { stripeOrg },
      });
      const { publishableKey } = data;

      if (!publishableKey) {
        showAlert(ALERT_TYPES.INLINE_ERROR_ALERT, {
          message: 'Stripe publishable key not found!',
        });
        return;
      }

      const stripePromise = loadStripe(publishableKey);
      const stripe = await stripePromise;
      if (!stripe) {
        showAlert(ALERT_TYPES.INLINE_ERROR_ALERT, {
          message: 'Stripe publishable key not found!',
        });
        return;
      }

      try {
        const { paymentIntent, error } =
          await stripe.retrievePaymentIntent(clientSecret);

        /*
        paymentIntent object:
        {
            "id": "pi_3RCkgpCsHgSgjHcg1gVuoIe1",
            "object": "payment_intent",
            "allowed_source_types": [
                "card",
                "afterpay_clearpay",
                "klarna",
                "link",
                "affirm",
                "cashapp"
            ],
            "amount": 10000,
            "amount_details": {
                "tip": {}
            },
            "automatic_payment_methods": {
                "allow_redirects": "always",
                "enabled": true
            },
            "canceled_at": null,
            "cancellation_reason": null,
            "capture_method": "automatic",
            "client_secret": "pi_3RCkgpCsHgSgjHcg1gVuoIe1_secret_sjgngDBmgvFJi9TYydLMTPjG5",
            "confirmation_method": "automatic",
            "created": 1744389867,
            "currency": "usd",
            "description": "Course detail - Art of Living Part 1, Date : 04-12-2025, Workshop Order placed by Praj Amr (email - aoflpraj+030325@gmail.com)",
            "last_payment_error": {
                "code": "payment_intent_payment_attempt_failed",
                "decline_code": "affirm_checkout_canceled",
                "doc_url": "https://stripe.com/docs/error-codes/payment-intent-payment-attempt-failed",
                "message": "The payment failed.",
                "payment_method": {
                    "id": "pm_1RCkgpCsHgSgjHcgXQzAhoFT",
                    "object": "payment_method",
                    "affirm": {},
                    "allow_redisplay": "unspecified",
                    "billing_details": {
                        "address": {
                            "city": null,
                            "country": null,
                            "line1": null,
                            "line2": null,
                            "postal_code": null,
                            "state": null
                        },
                        "email": null,
                        "name": null,
                        "phone": null
                    },
                    "created": 1744389867,
                    "customer": null,
                    "livemode": false,
                    "type": "affirm"
                },
                "type": "card_error"
            },
            "livemode": false,
            "next_action": null,
            "next_source_action": null,
            "payment_method": null,
            "payment_method_configuration_details": {
                "id": "pmc_1NWgboCsHgSgjHcgJbkaVGTo",
                "parent": null
            },
            "payment_method_types": [
                "card",
                "afterpay_clearpay",
                "klarna",
                "link",
                "affirm",
                "cashapp"
            ],
            "processing": null,
            "receipt_email": null,
            "setup_future_usage": null,
            "shipping": {
                "address": {
                    "city": "ABC",
                    "country": "US",
                    "line1": "ABC",
                    "line2": null,
                    "postal_code": "12345",
                    "state": "AL"
                },
                "carrier": null,
                "name": "Praj Amr",
                "phone": null,
                "tracking_number": null
            },
            "source": null,
            "status": "requires_source"
        }
        */

        if (error) {
          const errorMessage =
            error.message || 'Unknown error retrieving payment status.';

          showAlert(ALERT_TYPES.INLINE_ERROR_ALERT, {
            message: errorMessage,
          });
          router.replace({
            pathname: `/us-en/payment-failed/${id}`,
            query: {
              error: encodeURIComponent(errorMessage),
              previous,
            },
          });
          return;
        }

        switch (paymentIntent.status) {
          case 'succeeded':
            showAlert(ALERT_TYPES.INLINE_SUCCESS_ALERT, {
              message: 'Payment Successful!',
            });
            router.replace(next);
            break;
          case 'requires_payment_method':
            router.replace({
              pathname: `/us-en/payment-failed/${id}`,
              query: {
                error: encodeURIComponent('Payment failed. Please try again.'),
                previous,
              },
            });
            break;
          case 'canceled':
            router.replace({
              pathname: `/us-en/payment-failed/${id}`,
              query: {
                error: encodeURIComponent('Payment was canceled by the user.'),
                previous,
              },
            });
            break;
          case 'processing':
            // recheck payment status in 5 seconds
            setTimeout(checkPaymentStatus, 5000);
            break;
          default: {
            const internalErrorMessage =
              `${paymentIntent.last_payment_error?.message} with code ${paymentIntent.last_payment_error?.decline_code}` ||
              `Unexpected payment status ${paymentIntent.status}.`;

            console.log('internalErrorMessage', internalErrorMessage);
            router.replace({
              pathname: `/us-en/payment-failed/${id}`,
              query: {
                error: encodeURIComponent(internalErrorMessage),
                previous,
              },
            });
          }
        }
      } catch (err) {
        const errorMessage =
          err.message || 'Something went wrong. Please try again.';
        console.error('Payment Status Error:', err);
        showAlert(ALERT_TYPES.INLINE_ERROR_ALERT, {
          message: errorMessage,
        });
        router.replace({
          pathname: `/us-en/payment-failed/${id}`,
          query: {
            error: encodeURIComponent(errorMessage),
            previous,
          },
        });
      }
    }

    checkPaymentStatus();
  }, [router.isReady, stripeOrg]);

  return (
    <main className="login-register-page">
      <section className="section-login-register">
        <div className="loading-overlay no-bg">
          <div className="overlay-loader"></div>
          <div className="loading-text">
            <p className="tw-font-bold tw-py-5">Processing payment...</p>
            <p>
              Please wait a few minutes. We appreciate your patience during this
              time!
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

ProcessPayment.noHeader = true;
ProcessPayment.hideFooter = true;

export default ProcessPayment;
