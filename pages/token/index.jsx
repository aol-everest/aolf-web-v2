import { useEffect } from "react";
import { useRouter } from "next/router";
import { Loader } from "@components";
import { Hub } from "@aws-amplify/core";

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

  useEffect(() => {
    Hub.listen("auth", async ({ payload: { event, data } }) => {
      switch (event) {
        case "customOAuthState": {
          const originalUrl = decodeURIComponent(data);
          router.replace(originalUrl);
          break;
        }
      }
    });
  });

  return (
    <main className="aol_mainbody login-screen">
      <Loader />
    </main>
  );
}
Token.hideHeader = true;

export default Token;
