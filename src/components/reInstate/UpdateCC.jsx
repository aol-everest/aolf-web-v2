import { useAuth } from '@contexts';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { api } from '@utils';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Loader } from '@components';

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
export const UpdateCC = ({
  updateSuccess,
  updateError,
  subscription,
  modalProps,
}) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const stripe = useStripe();
  const elements = useElements();
  const { profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    async function fetchPendingSubscriptionInvoices() {
      setLoading(true);
      try {
        const response = await api.get({
          path: 'pendingSubscriptionInvoices',
          param: {
            stripeSubscriptionId: subscription.stripeSubscriptionId,
          },
        });
        const {
          status: pendingSubscriptionInvoicesStatus,
          error: pendingSubscriptionInvoicesErrorMessage,
          data,
        } = response;
        if (pendingSubscriptionInvoicesStatus === 400) {
          throw new Error(pendingSubscriptionInvoicesErrorMessage);
        }
        setAmount(data.totalPendingAmount);
      } catch (ex) {
        console.log('ex', ex);
        updateError(ex.message, modalProps);
      }
      setLoading(false);
    }
    fetchPendingSubscriptionInvoices();
  }, [router.isReady]);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      const cardElement = elements.getElement(CardElement);
      let createTokenRespone = await stripe.createToken(cardElement, {
        name: profile.name,
      });
      let { error, token } = createTokenRespone;
      if (error) {
        throw error;
      }
      const payload = {
        tokenizeCC: token,
      };

      const {
        status: pendingSubscriptionInvoicesStatus,
        error: pendingSubscriptionInvoicesErrorMessage,
        data,
      } = await api.get({
        path: 'pendingSubscriptionInvoices',
        param: {
          stripeSubscriptionId: subscription.stripeSubscriptionId,
        },
      });

      if (pendingSubscriptionInvoicesStatus === 400) {
        throw new Error(pendingSubscriptionInvoicesErrorMessage);
      }

      const { status, error: errorMessage } = await api.post({
        path: 'reinstateSubscription',
        body: {
          stripeSubscriptionId: subscription.stripeSubscriptionId,
          amount_remaining: data.totalPendingAmount,
          ...payload,
        },
      });

      if (status === 400) {
        throw new Error(errorMessage);
      }
      updateSuccess(data.totalPendingAmount, modalProps);
    } catch (ex) {
      updateError(ex.message);
    }
    setLoading(false);
  };
  return (
    <>
      {loading && <Loader />}
      <form name="profile-edit" onSubmit={handleSubmit}>
        <span>Current Balance due - {amount}</span>
        <div className="input_card">
          <div className="card-element">
            <CardElement options={createOptions} />
          </div>
        </div>
        {!loading && (
          <button type="submit" className="btn btn-link">
            <img src="/img/check-circle.png" alt="img" /> Save card
          </button>
        )}
      </form>
    </>
  );
};
