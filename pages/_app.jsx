/* eslint-disable @next/next/inline-script-id */
import {
  CardUpdateRequired,
  Layout,
  PendingAgreement,
  ReInstate,
  UsePagesViews,
} from '@components';
import { GlobalAlert } from '@components/globalAlert';
import { GlobalAudioPlayer } from '@components/globalAudioPlayer';
import { GlobalBottomBanner } from '@components/globalBottomBanner';
import { GlobalLoading } from '@components/globalLoading';
import { GlobalModal } from '@components/globalModal';
import { GlobalVideoPlayer } from '@components/globalVideoPlayer';
import { AuthProvider } from '@contexts';
import { orgConfig } from '@org';
import { analytics } from '@service';
import { Auth, Compose, Talkable, api } from '@utils';
import { DefaultSeo } from 'next-seo';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AnalyticsProvider } from 'use-analytics';
import { Amplify } from 'aws-amplify';
import { Passwordless } from '@components/passwordLessAuth/passwordless';
import { Hub } from 'aws-amplify/utils';
import { useRouter } from 'next/router';
// import { SurveyRequest } from "@components/surveyRequest";

// import TopProgressBar from "@components/topProgressBar";
// import Script from "next/script";

import '@styles/global-customize/style.scss';
import '@styles/global.scss';
import '@styles/style.scss';

import '@styles/old-design/style.scss';

import SEO from '../next-seo.config';

Passwordless.configure({
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USERPOOL,
  cognitoIdpEndpoint: process.env.NEXT_PUBLIC_COGNITO_REGION,
  fido2: {
    baseUrl: process.env.NEXT_PUBLIC_PASSWORD_LESS_API_BASE_URL,
    authenticatorSelection: {
      userVerification: 'required',
    },
  },
  debug: console.debug,
});
Amplify.configure({
  Auth: {
    Cognito: {
      region: process.env.NEXT_PUBLIC_COGNITO_REGION,
      //  Amazon Cognito User Pool ID
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USERPOOL,
      // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
      // OPTIONAL - This is used when autoSignIn is enabled for Auth.signUp
      // 'code' is used for Auth.confirmSignUp, 'link' is used for email link verification
      signUpVerificationMethod: 'code', // 'code' | 'link'
      loginWith: {
        // OPTIONAL - Hosted UI configuration
        oauth: {
          domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
          scopes: [
            'phone',
            'email',
            'profile',
            'openid',
            'aws.cognito.signin.user.admin',
          ],
          redirectSignIn: [process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGNIN],
          redirectSignOut: 'about:blank',
          responseType: 'code',
        },
      },
    },
  },
});

function App({ Component, pageProps }) {
  const router = useRouter();
  const [user, setUser] = useState({ isAuthenticated: false });
  const [loading, setLoading] = useState(true);
  const [isReInstateRequired, setIsReInstateRequired] = useState(false);
  // const [pendingSurveyInvite, setPendingSurveyInvite] = useState(null);
  const [reinstateRequiredSubscription, setReinstateRequiredSubscription] =
    useState(null);
  const [isCCUpdateRequired, setIsCCUpdateRequired] = useState(false);
  const [isPendingAgreement, setIsPendingAgreement] = useState(false);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // default: true
      },
    },
  });

  useEffect(() => {
    console.log('Hub.listen===>');
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      console.log(payload.event);
      console.log('payload.event===>');
      switch (payload.event) {
        case 'customOAuthState':
          if (payload.data && payload.data !== '') {
            router.push(payload.data);
          }
          break;
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userInfo = await Auth.fetchUserProfile();
      setUser(userInfo);

      const pendingAgreementRes = await api.get({
        path: 'getPendingHealthQuestionAgreement',
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
      let userSubscriptions = '';
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
        <AuthProvider userInfo={user} enableLocalUserCache={true}>
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
              noHeader={Component.noHeader}
              hideFooter={Component.hideFooter}
              wcfHeader={Component.wcfHeader}
              sideGetStartedAction={Component.sideGetStartedAction}
            >
              <DefaultSeo {...SEO} />
              {/* <UsePagesViews /> */}
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
              {/* <ClevertapAnalytics></ClevertapAnalytics> */}
              <ReactQueryDevtools initialIsOpen={false} />
            </Layout>
          </Compose>
        </AuthProvider>
      </QueryClientProvider>
    </AnalyticsProvider>
  );
}

export default App;
