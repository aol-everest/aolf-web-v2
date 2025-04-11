import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';
import { useGlobalAlertContext } from '@contexts';
import { api } from '@utils';
import { ALERT_TYPES } from '@constants';
import { useSearchParams } from 'next/navigation';
import { replaceRouteWithUTMQuery } from '@service';

function ProcessPayment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showAlert } = useGlobalAlertContext();
  const { id } = router.query;
  const next = searchParams.get('next');
  const previous = searchParams.get('previous');
  const clientSecret = searchParams.get('payment_intent_client_secret');

  useEffect(() => {
    async function checkPaymentStatus() {
      if (!clientSecret) {
        router.replace(next);
        return;
      }

      const data = await api.get({ path: 'getStripePublishableKey' });
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

        if (error) {
          const errorMessage =
            error.message || 'Unknown error retrieving payment status.';

          showAlert(ALERT_TYPES.INLINE_ERROR_ALERT, {
            message: errorMessage,
          });
          replaceRouteWithUTMQuery(router, {
            pathname: `/us-en/payment-failed/${id}`,
            query: {
              error: encodeURIComponent(errorMessage),
              previous,
            },
          });
          return;
        }

        console.log('paymentIntent', paymentIntent);

        // switch (paymentIntent.status) {
        //   case 'succeeded':
        //     showAlert(ALERT_TYPES.INLINE_SUCCESS_ALERT, {
        //       message: 'Payment Successful!',
        //     });
        //     router.replace(next);
        //     break;
        //   case 'requires_payment_method':
        //     router.replace(`/us-en/payment-failed/${id}`, {
        //       query: {
        //         error: encodeURIComponent('Payment failed. Please try again.'),
        //         previous,
        //       },
        //     });
        //     break;
        //   case 'canceled':
        //     router.replace(`/us-en/payment-failed/${id}`, {
        //       query: {
        //         error: encodeURIComponent('Payment was canceled by the user.'),
        //         previous,
        //       },
        //     });
        //     break;
        //   case 'processing':
        //     // recheck payment status in 5 seconds
        //     setTimeout(checkPaymentStatus, 5000);
        //     break;
        //   default:
        //     router.replace(`/us-en/payment-failed/${id}`, {
        //       query: {
        //         error: encodeURIComponent('Unexpected payment status.'),
        //         previous,
        //       },
        //     });
        // }
      } catch (err) {
        const errorMessage =
          err.message || 'Something went wrong. Please try again.';
        console.error('Payment Status Error:', err);
        showAlert(ALERT_TYPES.INLINE_ERROR_ALERT, {
          message: errorMessage,
        });
        router.replace(`/us-en/payment-failed/${id}`, {
          query: {
            error: encodeURIComponent(errorMessage),
            previous,
          },
        });
      }
    }

    checkPaymentStatus();
  }, [router]);

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
