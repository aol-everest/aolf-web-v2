/* eslint-disable @next/next/inline-script-id */
import {
  CardUpdateRequired,
  Layout,
  PendingAgreement,
  ReInstate,
  UsePagesViews,
} from "@components";
import { GlobalAlert } from "@components/globalAlert";
import { GlobalAudioPlayer } from "@components/globalAudioPlayer";
import { GlobalBottomBanner } from "@components/globalBottomBanner";
import { GlobalLoading } from "@components/globalLoading";
import { GlobalModal } from "@components/globalModal";
import { GlobalVideoPlayer } from "@components/globalVideoPlayer";
import { AuthProvider } from "@contexts";
import { orgConfig } from "@org";
import { analytics } from "@service";
import { Auth, Compose, Talkable, api } from "@utils";
import { DefaultSeo } from "next-seo";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { AnalyticsProvider } from "use-analytics";
// import { SurveyRequest } from "@components/surveyRequest";

// import TopProgressBar from "@components/topProgressBar";
// import Script from "next/script";
// import * as snippet from "@segment/snippet";
import "@styles/global-customize/style.scss";
import "@styles/global.scss";
import "@styles/style.scss";

import "@styles/old-design/style.scss";

import SEO from "../next-seo.config";

const ClevertapAnalytics = dynamic(
  () => import("@components/clevertapAnalytics"),
  {
    ssr: false,
  },
);

function App({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReInstateRequired, setIsReInstateRequired] = useState(false);
  // const [pendingSurveyInvite, setPendingSurveyInvite] = useState(null);
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
      // setPendingSurveyInvite(userInfo.profile.surveyInvite);
      setIsCCUpdateRequired(isCCUpdateRequiredForSubscription);
      const reinstateRequiredForSubscription = subscriptions.find(
        ({ isReinstateRequiredForSubscription }) =>
          isReinstateRequiredForSubscription,
      );
      if (reinstateRequiredForSubscription) {
        setIsReInstateRequired(true);
        setReinstateRequiredSubscription(reinstateRequiredForSubscription);
      }
      Talkable.authenticate({
        email: userInfo.profile.email,
        first_name: userInfo.profile.first_name,
        last_name: userInfo.profile.last_name,
      });
      let userSubscriptions = "";
      if (userInfo.profile.subscriptions) {
        userSubscriptions = JSON.stringify(
          userInfo.profile.subscriptions.map(({ sfid, name }) => {
            return {
              id: sfid,
              name,
            };
          }),
        );
      }
      analytics.identify(userInfo.profile.email, {
        id: userInfo.profile.username,
        sfid: userInfo.profile.id,
        email: userInfo.profile.email,
        name: userInfo.profile.name,
        first_name: userInfo.profile.first_name,
        last_name: userInfo.profile.last_name,
        avatar: userInfo.profile.userProfilePic,
        state: userInfo.profile.personMailingState, // State
        country: userInfo.profile.personMailingCountry, // Country
        subscriptions: userSubscriptions,
        sky_flag: userInfo.profile.isMandatoryWorkshopAttended,
        sahaj_flag: userInfo.profile.isSahajGraduate,
        silence_course_count: userInfo.profile.aosCountTotal,
      });
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
            <img
              src={`/img/${orgConfig.logo}`}
              alt="logo"
              className="logo__image"
            />
          </div>
          <div className="message">
            <div className="dot-flashing dot"></div>
            please wait!
          </div>
        </div>
      </div>
    );
  }
  return (
    <AnalyticsProvider instance={analytics}>
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
              GlobalBottomBanner,
            ]}
          >
            <Layout
              hideHeader={Component.hideHeader}
              hideFooter={Component.hideFooter}
              wcfHeader={Component.wcfHeader}
            >
              <DefaultSeo {...SEO} />
              <UsePagesViews />
              {/* <TopProgressBar /> */}
              {isReInstateRequired && (
                <ReInstate subscription={reinstateRequiredSubscription} />
              )}
              {/* {pendingSurveyInvite && (
                <SurveyRequest surveyInvite={pendingSurveyInvite} />
              )} */}
              {isCCUpdateRequired && <CardUpdateRequired />}
              {isPendingAgreement && <PendingAgreement />}
              <Component {...pageProps} />
              <ClevertapAnalytics></ClevertapAnalytics>
              <ReactQueryDevtools initialIsOpen={false} />
            </Layout>
          </Compose>
        </AuthProvider>
      </QueryClientProvider>
    </AnalyticsProvider>
  );
}

export default App;
