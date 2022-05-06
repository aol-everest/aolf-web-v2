import React, { useState, useEffect } from "react";
import { api } from "@utils";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useAuth } from "@contexts";
import { useRouter } from "next/router";

const createOptions = {
  style: {
    base: {
      fontSize: "16px",
      lineHeight: 2,
      fontWeight: 200,
      fontStyle: "normal",
      color: "#303650",
      fontFamily: "Work Sans, sans-serif",
      "::placeholder": {
        color: "#9598a6",
        fontFamily: "Work Sans, sans-serif",
        fontSize: "16px",
      },
    },
    invalid: {
      color: "#9e2146",
    },
  },
};
export const UpdateCC = ({ updateSuccess, updateError, subscription }) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    async function fetchPendingSubscriptionInvoices() {
      setLoading(true);
      try {
        const response = await api.get({
          path: "pendingSubscriptionInvoices",
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
        updateError(ex.message);
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
        name: user?.profile.name,
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
        path: "pendingSubscriptionInvoices",
        param: {
          stripeSubscriptionId: subscription.stripeSubscriptionId,
        },
      });

      if (pendingSubscriptionInvoicesStatus === 400) {
        throw new Error(pendingSubscriptionInvoicesErrorMessage);
      }

      const { status, error: errorMessage } = await api.post({
        path: "reinstateSubscription",
        body: {
          stripeSubscriptionId: subscription.stripeSubscriptionId,
          amount_remaining: data.totalPendingAmount,
          ...payload,
        },
      });

      if (status === 400) {
        throw new Error(errorMessage);
      }
      updateSuccess(data.totalPendingAmount);
    } catch (ex) {
      updateError(ex.message);
    }
    setLoading(false);
  };
  return (
    <>
      {loading && <div className="cover-spin"></div>}
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
