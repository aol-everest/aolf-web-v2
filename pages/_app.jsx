/* eslint-disable @next/next/inline-script-id */
import React, { useEffect, useState } from "react";
import Amplify from "aws-amplify";
import { Auth } from "aws-amplify";
import { Hub } from "@aws-amplify/core";
import dynamic from "next/dynamic";
import { DefaultSeo } from "next-seo";
import { ReactQueryDevtools } from "react-query/devtools";
import { api, Compose, isSSR, Clevertap } from "@utils";
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
import Script from "next/script";
import * as snippet from "@segment/snippet";
import "@styles/global.scss";
import "nprogress/nprogress.css";
import "@styles/global-customize/style.scss";
import "@styles/style.scss";

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

const renderSnippet = () => {
  const opts = {
    apiKey: process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY,
    // note: the page option only covers SSR tracking.
    // Page.js is used to track other events using `window.analytics.page()`
    page: true,
  };

  if (process.env.NODE_ENV === "development") {
    return snippet.max(opts);
  }

  return snippet.min(opts);
};

function App({ Component, pageProps, userInfo = {} }) {
  const [user, setUser] = useState(userInfo);

  useEffect(() => {
    Hub.listen("auth", async ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn": {
          try {
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
            Clevertap.profile({
              Site: {
                Name: userInfo.name, // String
                Identity: userInfo.id, // String or number
                Email: userInfo.email, // Email address of the user
                Phone: userInfo.personMobilePhone, // Phone (with the country code)
              },
            });
          } catch (ex) {
            await Auth.signOut();
          }
          break;
        }
        case "signOut": {
          setUser({});
          Clevertap.logout();
        }
      }
    });

    if (!isSSR) {
      Clevertap.initialize();
    }

    async function fetchProfile() {
      try {
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

        Clevertap.profile({
          Site: {
            Name: userInfo.profile.name, // String
            Identity: userInfo.profile.id, // String or number
            Email: userInfo.profile.email, // Email address of the user
          },
        });
      } catch (ex) {
        await Auth.signOut();
      }
    }
    fetchProfile();
  }, []);

  const queryClient = new QueryClient();
  const gtmParams = { id: process.env.NEXT_PUBLIC_GTM_ID };
  return (
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
              <Script dangerouslySetInnerHTML={{ __html: renderSnippet() }} />
              <Layout hideHeader={Component.hideHeader}>
                <DefaultSeo {...SEO} />
                <TopProgressBar />
                <Component {...pageProps} />
                <ReactQueryDevtools initialIsOpen={false} />
              </Layout>
            </Compose>
          </AuthProvider>
        </Hydrate>
      </QueryClientProvider>
    </GTMProvider>
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
