/* eslint-disable @next/next/inline-script-id */
import React, { useEffect, useState } from "react";
import { DefaultSeo } from "next-seo";
import { ReactQueryDevtools } from "react-query/devtools";
import { api, Compose, Auth } from "@utils";
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
// import TopProgressBar from "@components/topProgressBar";
// import Script from "next/script";
// import * as snippet from "@segment/snippet";
import "@styles/global.scss";
import "@styles/global-customize/style.scss";
import "@styles/style.scss";

import "@styles/old-design/style.scss";

import SEO from "../next-seo.config";

// const renderSnippet = () => {
//   const opts = {
//     apiKey: process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY,
//     // note: the page option only covers SSR tracking.
//     // Page.js is used to track other events using `window.analytics.page()`
//     page: true,
//   };

//   if (process.env.NODE_ENV === "development") {
//     return snippet.max(opts);
//   }

//   return snippet.min(opts);
// };

function App({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReInstateRequired, setIsReInstateRequired] = useState(false);
  const [reinstateRequiredSubscription, setReinstateRequiredSubscription] =
    useState(null);
  const [isCCUpdateRequired, setIsCCUpdateRequired] = useState(false);
  const [isPendingAgreement, setIsPendingAgreement] = useState(false);
  const queryClient = new QueryClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userInfo = await Auth.reFetchProfile();
      setUser(userInfo);

      const pendingAgreementRes = await api.get({
        path: "getPendingHealthQuestionAgreement",
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
    } catch (ex) {
      console.log(ex);
      await Auth.logout();
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="global-loader-container-full">
        <div className="global-loader-container-inner">
          <div className="global-loader-container">
            <img src="/img/ic-logo.svg" alt="logo" className="logo__image" />
          </div>
          <div className="message">Fetching profile... please wait!</div>
        </div>
      </div>
    );
  }
  return (
    <>
      {process.env.NEXT_PUBLIC_GTM_ID && (
        <TrackingHeadScript id={process.env.NEXT_PUBLIC_GTM_ID} />
      )}
      <QueryClientProvider client={queryClient}>
        <AuthProvider
          userInfo={user}
          setUserInfo={setUser}
          reloadProfile={fetchProfile}
          authenticated={!!user}
        >
          <Compose
            components={[
              GlobalModal,
              GlobalAlert,
              GlobalAudioPlayer,
              GlobalVideoPlayer,
              GlobalLoading,
            ]}
          >
            {/* {process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY && (
              <Script dangerouslySetInnerHTML={{ __html: renderSnippet() }} />
            )} */}
            <Layout
              hideHeader={Component.hideHeader}
              hideFooter={Component.hideFooter}
            >
              <DefaultSeo {...SEO} />
              <UsePagesViews />
              {/* <TopProgressBar /> */}
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

export default App;
