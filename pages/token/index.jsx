import { PageLoading } from "@components";
import { ALERT_TYPES } from "@constants";
import { useAuth, useGlobalAlertContext } from "@contexts";
import { pushRouteWithUTMQuery } from "@service";
import { Auth } from "@utils";
import { useRouter } from "next/router";
import { useEffect } from "react";

// export const getServerSideProps = async (context) => {
// const { query, req, res } = context;
// const { next } = query;
// const { Auth } = await withSSRContext(context);
// const user = await Auth.currentAuthenticatedUser();
// const token = user.signInUserSession.idToken.jwtToken;
// await api.get({
//   path: "profile",
//   token,
// });
//   res.writeHead(302, {
//     Location: `/`,
//   });
//   res.end();

//   return { props: {} };
// };

function Token() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { showAlert, hideAlert } = useGlobalAlertContext();

  useEffect(() => {
    if (!router.isReady) return;
    authenticateUserFromToken();
  }, [router.isReady]);

  const authenticateUserFromToken = async () => {
    try {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      if (!params.code) {
        throw new Error("Failure parsing Cognito web response. No code found.");
      }
      const state = new URLSearchParams(location.search).get("state");
      await Auth.parseCognitoWebResponse(window.location.href);
      const userInfo = await Auth.reFetchProfile();
      setUser(userInfo);

      pushRouteWithUTMQuery(router, state || "/");
    } catch (error) {
      console.log(error);
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: error.message,
        closeModalAction: () => {
          pushRouteWithUTMQuery(router, "/");
        },
      });
    }
  };

  return (
    <main className="aol_mainbody login-screen">
      <PageLoading />
    </main>
  );
}
Token.hideHeader = true;

export default Token;
