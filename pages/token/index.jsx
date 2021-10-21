import { useEffect } from "react";
import { useRouter } from "next/router";
import { Auth } from "aws-amplify";
import { withSSRContext } from "aws-amplify";
import { useGlobalModalContext } from "@contexts";
import { MODAL_TYPES } from "@constants";
import { api } from "@utils";

export const getServerSideProps = async (context) => {
  const { query, req, res } = context;
  const { next } = query;
  const { Auth } = await withSSRContext(context);
  const user = await Auth.currentAuthenticatedUser();
  const token = user.signInUserSession.idToken.jwtToken;
  await api.get({
    path: "profile",
    token,
  });
  res.writeHead(302, {
    Location: next ? next : `/`,
  });
  res.end();

  return { props: {} };
};

function Token() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  });

  return null;
}
Token.hideHeader = true;

export default Token;
