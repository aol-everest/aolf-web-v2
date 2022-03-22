/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/router";
import { UpdateCC } from "./UpdateCC";
import { useGlobalAlertContext } from "@contexts";
import { ALERT_TYPES } from "@constants";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

export const ReInstateModal = ({ subscription }) => {
  const [loading, setLoading] = useState(false);
  const [enableEditCC, setEnableEditCC] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [amount, setAmount] = useState(0);

  const updateSuccess = (amount) => {
    setLoading(false);
    setIsSuccess(true);
    setAmount(amount);
  };

  const updateError = (error) => {
    setLoading(false);
    setError(error);
  };

  const enableEditCCAction = (e) => {
    if (e) e.preventDefault();
    setEnableEditCC((enableEditCC) => !enableEditCC);
  };
  return (
    <>
      {loading && <div className="cover-spin"></div>}
      <div>
        {!isSuccess && (
          <>
            {!enableEditCC && (
              <>
                <span>
                  Your membership has become delinquent, please{" "}
                  <a href="#" onClick={enableEditCCAction}>
                    click here
                  </a>{" "}
                  to update you cc information and reinstate your membership.
                </span>
              </>
            )}
            {error && (
              <div className="error-block">
                <p className="error-message">
                  We're sorry, but something went wrong. Please try again or
                  contact support.
                  <p className="error-detail">{error}</p>
                </p>
              </div>
            )}
            {!error && enableEditCC && (
              <Elements
                stripe={stripePromise}
                fonts={[
                  {
                    cssSrc:
                      "https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
                  },
                ]}
              >
                <UpdateCC
                  updateSuccess={updateSuccess}
                  updateError={updateError}
                  subscription={subscription}
                />
              </Elements>
            )}
          </>
        )}
        {isSuccess && (
          <>
            <div>
              You will be charged ${amount} for missing payment and your
              membership has been reinstated.
            </div>
          </>
        )}
      </div>
    </>
  );
};

export const ReInstate = ({ subscription }) => {
  const router = useRouter();
  const { showAlert } = useGlobalAlertContext();

  useEffect(() => {
    if (!router.isReady) return;
    showAlert(ALERT_TYPES.CUSTOM_ALERT, {
      children: <ReInstateModal subscription={subscription} />,
      title: "Action required",
    });
  }, [router.isReady]);

  return null;
};
