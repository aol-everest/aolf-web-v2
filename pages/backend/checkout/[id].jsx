import React, { useState } from "react";
import { api } from "@utils";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { BackendPaymentForm } from "@components/backendPaymentForm";
import { withAuth } from "@hoc";
import { useAuth } from "@contexts";
import { PageLoading } from "@components";
import ErrorPage from "next/error";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

const BackEndCheckout = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { id: workshopId, coupon } = router.query;
  const {
    data: workshop = {},
    isLoading,
    isError,
    error,
  } = useQuery(
    "bcWorkshopDetail",
    async () => {
      const response = await api.get({
        path: "workshopDetail",
        param: {
          id: workshopId,
          isBackendRegistration: "1",
        },
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  if (isError) return <ErrorPage statusCode={500} title={error} />;
  if (isLoading) return <PageLoading />;

  return (
    <main className="body_wrapper backend-reg-body tw-bg-gray-300 tw-pt-5">
      <div className="container">
        <div className="row">
          <Elements
            stripe={stripePromise}
            fonts={[
              {
                cssSrc:
                  "https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
              },
            ]}
          >
            <BackendPaymentForm
              useWorkshop={workshop}
              profile={user.profile}
              coupon={coupon}
            />
          </Elements>
        </div>
      </div>
    </main>
  );
};
BackEndCheckout.hideHeader = false;

export default withAuth(BackEndCheckout, {
  role: ["Teacher", "Organizer", "Assistant Teacher"],
});
