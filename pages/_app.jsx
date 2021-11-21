import React, { useEffect, useState } from "react";
import Amplify from "aws-amplify";
import { Hub } from "@aws-amplify/core";
import dynamic from "next/dynamic";
import Head from "next/head";
import { withSSRContext } from "aws-amplify";
import { DefaultSeo } from "next-seo";
import { ReactQueryDevtools } from "react-query/devtools";
import { api, Compose } from "@utils";
import { QueryClient, QueryClientProvider } from "react-query";
import { Hydrate } from "react-query/hydration";
import { Layout } from "@components";
import { GlobalModal } from "@components/globalModal";
import { GlobalAlert } from "@components/globalAlert";
import { GlobalAudioPlayer } from "@components/globalAudioPlayer";
import { GlobalVideoPlayer } from "@components/globalVideoPlayer";
import { GlobalLoading } from "@components/globalLoading";
import { AuthProvider } from "@contexts";
import { GTMProvider } from "@elgorditosalsero/react-gtm-hook";

import "nprogress/nprogress.css";
import "@styles/global-customize/style.scss";
import "@styles/style.scss";
import "@styles/global.scss";
import "@styles/old-design/style.scss";

import config from "./../src/aws-exports";
import SEO from "../next-seo.config";

const TopProgressBar = dynamic(
  () => {
    return import("@components/topProgressBar");
  },
  { ssr: false },
);

Amplify.configure({
  ...config,
  ssr: true,
});

function App({ Component, pageProps, userInfo = {} }) {
  const [user, setUser] = useState(userInfo);
  useEffect(() => {
    Hub.listen("auth", async ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn": {
          const user = await Amplify.Auth.currentAuthenticatedUser();
          const token = user.signInUserSession.idToken.jwtToken;
          const res = await api.get({
            path: "profile",
            token,
          });
          const userInfo = {
            authenticated: true,
            username: user.username,
            profile: res,
          };
          setUser(userInfo);
          break;
        }
        case "signOut": {
          setUser({});
        }
      }
    });
    async function fetchData() {
      // You can await here
      const user = await Amplify.Auth.currentAuthenticatedUser();
      const token = user.signInUserSession.idToken.jwtToken;
      const res = await api.get({
        path: "profile",
        token,
      });
      const userInfo = {
        authenticated: true,
        username: user.username,
        profile: res,
      };
      setUser(userInfo);
    }
    fetchData();
  }, []);

  const queryClient = new QueryClient();
  const gtmParams = { id: process.env.NEXT_PUBLIC_GTM_ID };
  return (
    <>
      <DefaultSeo {...SEO} />

      <GTMProvider state={gtmParams}>
        <QueryClientProvider client={queryClient}>
          <Hydrate state={pageProps.dehydratedState}>
            <AuthProvider userInfo={user}>
              <Compose
                components={[
                  GlobalModal,
                  GlobalAlert,
                  GlobalAudioPlayer,
                  GlobalVideoPlayer,
                  GlobalLoading,
                ]}
              >
                <Layout hideHeader={Component.hideHeader}>
                  <TopProgressBar />
                  <Component {...pageProps} />
                  <ReactQueryDevtools initialIsOpen={false} />
                </Layout>
              </Compose>
            </AuthProvider>
          </Hydrate>
        </QueryClientProvider>
      </GTMProvider>
    </>
  );
}

// App.getInitialProps = async ({ Component, ctx }) => {
//   let pageProps = {};
//   if (Component.getInitialProps) {
//     pageProps = await Component.getInitialProps(ctx);
//   }
//   try {
//     const { Auth } = await withSSRContext(ctx);
//     const user = await Auth.currentAuthenticatedUser();
//     const token = user.signInUserSession.idToken.jwtToken;
//     const res = await api.get({
//       path: "profile",
//       token,
//     });
//     const userInfo = {
//       authenticated: true,
//       username: user.username,
//       profile: res,
//     };

//     return { pageProps, userInfo };
//   } catch (err) {
//     console.log(err);
//     return { pageProps, userInfo: {} };
//   }
// };

export default App;
