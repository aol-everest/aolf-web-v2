import React, { useState } from "react";
import { withSSRContext } from "aws-amplify";
import { api } from "@utils";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { BackendPaymentForm } from "@components/backendPaymentForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

export const getServerSideProps = async (context) => {
  const { query, req, res, resolvedUrl } = context;
  const { id, coupon = null } = query;
  let props = {};
  let token = "";
  try {
    const { Auth } = await withSSRContext(context);
    const user = await Auth.currentAuthenticatedUser();
    token = user.signInUserSession.idToken.jwtToken;
    const res = await api.get({
      path: "profile",
      token,
    });
    if (
      res &&
      (res.userType === "Teacher" ||
        res.userType === "Organiser" ||
        res.userType === "Assistant Teacher")
    ) {
      props = {
        authenticated: true,
        username: user.username,
        profile: res,
        token,
        isTeacher: true,
      };
    } else {
      props = {
        authenticated: true,
        username: user.username,
        profile: res,
        token,
        isTeacher: false,
      };
    }
  } catch (err) {
    return {
      redirect: {
        permanent: false,
        destination: `/login?next=${resolvedUrl}`,
      },
      props: {},
    };
  }

  const workshopDetail = await api.get({
    path: "workshopDetail",
    token,
    param: {
      id,
      isBackendRegistration: "1",
    },
  });
  props = {
    ...props,
    workshop: workshopDetail.data,
    coupon,
  };

  // Pass data to the page via props
  return { props };
};

const BackEndCheckout = ({ workshop, profile, isTeacher, coupon }) => {
  if (!isTeacher) {
    return (
      <main className="body_wrapper backend-reg-body tw-bg-gray-300 tw-pt-5">
        <div className="container">
          <div className="row">
            <div className="col-12 tw-max-w-[450px] tw-m-auto tw-p-5 tw-my-[50px]">
              <h2>Forbidden!</h2>
              <h4>Code 403</h4>
              <div>
                Access Denied. You do not have the permission to access this
                page on this server.
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
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
              profile={profile}
              coupon={coupon}
            />
          </Elements>
        </div>
      </div>
    </main>
  );
};
BackEndCheckout.hideHeader = false;

export default BackEndCheckout;
