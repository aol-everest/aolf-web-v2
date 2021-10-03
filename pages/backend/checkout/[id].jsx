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
  const { id } = query;
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
    props = {
      authenticated: true,
      username: user.username,
      profile: res,
      token,
    };
  } catch (err) {
    console.error(err);
    res.writeHead(302, {
      Location: `/login?next=${resolvedUrl}`,
    });
    res.end();
    return;
  }

  const workshopDetail = await api.get({
    path: "workshopDetail",
    token,
    param: {
      id,
    },
  });
  props = {
    ...props,
    workshop: workshopDetail.data,
  };

  // Pass data to the page via props
  return { props };
};

const BackEndCheckout = ({ workshop, profile, token }) => {
  return (
    <main className="body_wrapper backend-reg-body">
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
              token={token}
            />
          </Elements>
        </div>
      </div>
    </main>
  );
};
BackEndCheckout.hideHeader = true;

export default BackEndCheckout;
