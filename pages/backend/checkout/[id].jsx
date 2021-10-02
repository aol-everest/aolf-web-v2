import React from "react";
import { withSSRContext } from "aws-amplify";
import { api } from "@utils";

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
  try {
    const res = await api.get({
      path: "workshopDetail",
      token,
      param: {
        id,
      },
    });
    props = {
      ...props,
      workshop: res.data,
    };
  } catch (err) {
    console.error(err);
    res.writeHead(302, {
      Location: `/course`,
    });
    res.end();
  }
  // Pass data to the page via props
  return { props };
};

const BackEndCheckout = ({ workshop, profile, token }) => {
  return <div></div>;
};

export default BackEndCheckout;
