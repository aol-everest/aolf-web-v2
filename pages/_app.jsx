/* eslint-disable @next/next/inline-script-id */
import React, { useEffect, useState } from "react";
import { Amplify, Auth, Hub } from "aws-amplify";
import { DefaultSeo } from "next-seo";
import { ReactQueryDevtools } from "react-query/devtools";
import { api, Compose, isSSR, Clevertap, Segment } from "@utils";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  Layout,
  ReInstate,
  CardUpdateRequired,
  PendingAgreement,
  UsePagesViews,
} from "@components";
import { GlobalModal } from "@components/globalModal";
import { GlobalAlert } from "@components/globalAlert";
import { GlobalAudioPlayer } from "@components/globalAudioPlayer";
import { GlobalVideoPlayer } from "@components/globalVideoPlayer";
import { GlobalLoading } from "@components/globalLoading";
import { AuthProvider } from "@contexts";
import { TrackingHeadScript } from "@phntms/next-gtm";
import TopProgressBar from "@components/topProgressBar";
import Script from "next/script";
import * as snippet from "@segment/snippet";
import "@styles/global.scss";
import "@styles/global-customize/style.scss";
import "@styles/style.scss";

import "@styles/old-design/style.scss";

import config from "./../src/aws-exports";
import SEO from "../next-seo.config";

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
  const [isReInstateRequired, setIsReInstateRequired] = useState(false);
  const [reinstateRequiredSubscription, setReinstateRequiredSubscription] =
    useState(null);
  const [isCCUpdateRequired, setIsCCUpdateRequired] = useState(false);
  const [isPendingAgreement, setIsPendingAgreement] = useState(false);

  useEffect(() => {
    Hub.listen("auth", async ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn": {
          try {
            fetchProfile();
          } catch (ex) {
            await Auth.signOut();
          }
          break;
        }
        case "signOut": {
          setUser({});
          Clevertap.logout();
          Segment.logout();
        }
      }
    });

    if (!isSSR) {
      Clevertap.initialize();
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const currentSession = await Auth.currentSession();
      const token = currentSession.idToken.jwtToken;
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

      const pendingAgreementRes = await api.get({
        path: "getPendingHealthQuestionAgreement",
        token,
      });

      setIsPendingAgreement(
        pendingAgreementRes && pendingAgreementRes.length > 0,
      );

      const { subscriptions = [], isCCUpdateRequiredForSubscription } =
        userInfo.profile;
      setIsCCUpdateRequired(isCCUpdateRequiredForSubscription);
      const reinstateRequiredForSubscription = subscriptions.find(
        ({ isReinstateRequiredForSubscription }) =>
          isReinstateRequiredForSubscription,
      );
      if (reinstateRequiredForSubscription) {
        setIsReInstateRequired(true);
        setReinstateRequiredSubscription(reinstateRequiredForSubscription);
      }

      // Clevertap.profile({
      //   Site: {
      //     Name: userInfo.profile.name, // String
      //     Identity: userInfo.profile.id, // String or number
      //     Email: userInfo.profile.email, // Email address of the user
      //   },
      // });
      // Segment.profile(userInfo.profile.id, {
      //   email: userInfo.profile.email,
      //   name: userInfo.profile.name,
      // });
    } catch (ex) {
      await Auth.signOut();
    }
  };

  const queryClient = new QueryClient();
  return (
    <>
      {process.env.NEXT_PUBLIC_GTM_ID && (
        <TrackingHeadScript id={process.env.NEXT_PUBLIC_GTM_ID} />
      )}
      <QueryClientProvider client={queryClient}>
        <AuthProvider userInfo={user} reloadProfile={fetchProfile}>
          <Compose
            components={[
              GlobalModal,
              GlobalAlert,
              GlobalAudioPlayer,
              GlobalVideoPlayer,
              GlobalLoading,
            ]}
          >
            {process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY && (
              <Script dangerouslySetInnerHTML={{ __html: renderSnippet() }} />
            )}
            <Layout
              hideHeader={Component.hideHeader}
              hideFooter={Component.hideFooter}
            >
              <DefaultSeo {...SEO} />
              <UsePagesViews />
              <TopProgressBar />
              {isReInstateRequired && (
                <ReInstate subscription={reinstateRequiredSubscription} />
              )}
              {isCCUpdateRequired && <CardUpdateRequired />}
              {isPendingAgreement && <PendingAgreement />}
              <Component {...pageProps} />
              <ReactQueryDevtools initialIsOpen={false} />
            </Layout>
          </Compose>
        </AuthProvider>
      </QueryClientProvider>
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
