import React, { useState } from "react";
import { api } from "@utils";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useAuth } from "@contexts";
import { useQuery } from "react-query";

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
export const UpdateCC = ({ updateCompleteAction, subscription }) => {
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const { profile } = useAuth();

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
      updateCompleteAction({ payload: { editCardDetail: false } });
    } catch (ex) {
      updateCompleteAction({ message: ex.message, isError: true });
    }
    setLoading(false);
  };
  return (
    <>
      {loading && <div className="cover-spin"></div>}
      <form name="profile-edit" onSubmit={handleSubmit}>
        {/* <span>Current Balance due - {amount}</span> */}
        <div className="input_card">
          <div className="card-element">
            <CardElement options={createOptions} />
          </div>
        </div>
        {!loading && (
          <button type="submit" className="btn btn-link">
            <img src="assets/images/check-circle.png" alt="img" /> Save card
          </button>
        )}
      </form>
    </>
  );
};
