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
import { AuthProvider, MeditationProvider } from '@contexts';
import { orgConfig } from '@org';
import { analytics } from '@service';
import { Auth, Compose, Talkable, api, getParentDomain } from '@utils';
import { DefaultSeo, NextSeo } from 'next-seo';
import { useEffect, useState, useMemo, memo } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { AnalyticsProvider } from 'use-analytics';
import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { Passwordless } from '@components/passwordLessAuth/passwordless';
import { Hub } from 'aws-amplify/utils';
import { useRouter } from 'next/router';
import { clearInflightOAuth } from '@passwordLess/storage.js';
import CookieStorage from '@utils/cookieStorage';
import dynamic from 'next/dynamic';
// import { SurveyRequest } from "@components/surveyRequest";

// import TopProgressBar from "@components/topProgressBar";
// import Script from "next/script";

import '@styles/global-customize/style.scss';
import '@styles/global.scss';
import '@styles/style.scss';

import '@styles/old-design/style.scss';

import SEO from '../next-seo.config';

const isLocal = process.env.NODE_ENV === 'development';
const PARENT_DOMAIN = getParentDomain();

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
  storage: new CookieStorage({
    domain: PARENT_DOMAIN,
    secure: !isLocal,
  }),
  // debug: console.debug,
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

cognitoUserPoolsTokenProvider.setKeyValueStorage(
  new CookieStorage({
    domain: PARENT_DOMAIN,
    secure: !isLocal,
  }),
);

const useOAuthCleanup = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      clearInflightOAuth();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);
};

const useAuthHub = (router) => {
  useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'customOAuthState' && payload.data) {
        router.push(payload.data);
      }
    });
    return unsubscribe;
  }, [router]);
};

// Dynamically import heavy components
const ReactQueryDevtools = dynamic(
  () =>
    import('@tanstack/react-query-devtools').then(
      (mod) => mod.ReactQueryDevtools,
    ),
  { ssr: false },
);

// Create a HOC to ensure valid React components
const withProvider = (WrappedComponent) => {
  const Provider = ({ children, ...props }) => {
    return <WrappedComponent {...props}>{children}</WrappedComponent>;
  };
  Provider.displayName = `Provider(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return memo(Provider);
};

// Memoize static components
const MemoizedLayout = memo(Layout);
const MemoizedGlobalModal = withProvider(GlobalModal);
const MemoizedGlobalAlert = withProvider(GlobalAlert);
const MemoizedGlobalAudioPlayer = withProvider(GlobalAudioPlayer);
const MemoizedGlobalVideoPlayer = withProvider(GlobalVideoPlayer);
const MemoizedGlobalLoading = withProvider(GlobalLoading);
const MemoizedGlobalBottomBanner = withProvider(GlobalBottomBanner);
const MemoizedMeditationProvider = withProvider(MeditationProvider);

// Memoize the loading component
const LoadingScreen = memo(function LoadingScreen() {
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
});

// Memoize the compose components array
const globalComponents = [
  MemoizedGlobalModal,
  MemoizedGlobalAlert,
  MemoizedGlobalAudioPlayer,
  MemoizedGlobalVideoPlayer,
  MemoizedGlobalLoading,
  MemoizedGlobalBottomBanner,
];

const useUserProfile = () => {
  const queryClient = useQueryClient();

  const { data: userInfo, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: Auth.fetchUserProfile,
    onError: async (error) => {
      console.error('Profile fetch error:', error);
      await Auth.logout();
    },
    retry: 1,
    // Add suspense mode for better loading handling
    suspense: false,
    // Add error boundary handling
    useErrorBoundary: true,
  });

  const { mutate: checkPendingAction } = useMutation({
    mutationFn: async (userInfo) => {
      const [pendingAgreementRes] = await Promise.all([
        api.get({ path: 'getPendingHealthQuestionAgreement' }),
      ]);
      return {
        pendingAgreement: pendingAgreementRes && pendingAgreementRes.length > 0,
        ccUpdateRequired: userInfo.profile.isCCUpdateRequiredForSubscription,
        reinstateRequired: userInfo.profile.subscriptions?.find(
          ({ isReinstateRequiredForSubscription }) =>
            isReinstateRequiredForSubscription,
        ),
      };
    },
    onSuccess: (data) => {
      if (!userInfo?.profile) return data;

      // Move these side effects to a separate function for better organization
      handleUserAuthentication(userInfo.profile);
      return data;
    },
  });

  useEffect(() => {
    if (userInfo) {
      checkPendingAction(userInfo);
    }
  }, [userInfo, checkPendingAction]);

  return {
    userInfo: userInfo || { isAuthenticated: false, profile: {} },
    isLoading,
  };
};

// Separate authentication handling
const handleUserAuthentication = (profile) => {
  Talkable.authenticate({
    email: profile.email,
    first_name: profile.first_name,
    last_name: profile.last_name,
  });

  const userSubscriptions = profile.subscriptions
    ? JSON.stringify(
        profile.subscriptions.map(({ sfid, name }) => ({
          id: sfid,
          name,
        })),
      )
    : '';

  analytics.identify(profile.email, {
    id: profile.username,
    sfid: profile.id,
    email: profile.email,
    name: profile.name,
    first_name: profile.first_name,
    last_name: profile.last_name,
    avatar: profile.userProfilePic,
    state: profile.personMailingState,
    country: profile.personMailingCountry,
    subscriptions: userSubscriptions,
    sky_flag: profile.isMandatoryWorkshopAttended,
    sahaj_flag: profile.isSahajGraduate,
    silence_course_count: profile.aosCountTotal,
  });
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Create a memoized provider component that combines all providers
const CombinedProviders = memo(function CombinedProviders({ children }) {
  return <Compose components={globalComponents}>{children}</Compose>;
});

// Add display names
LoadingScreen.displayName = 'LoadingScreen';
CombinedProviders.displayName = 'CombinedProviders';

const AppContent = ({ Component, pageProps, err }) => {
  const router = useRouter();
  const [isReInstateRequired, setIsReInstateRequired] = useState(false);
  const [reinstateRequiredSubscription, setReinstateRequiredSubscription] =
    useState(null);
  const [isCCUpdateRequired, setIsCCUpdateRequired] = useState(false);
  const [isPendingAgreement, setIsPendingAgreement] = useState(false);

  useOAuthCleanup();
  useAuthHub(router);
  const { userInfo, isLoading } = useUserProfile();

  const checkUserPendingAction = useMemo(
    () => async (userInfo) => {
      const pendingAgreementRes = await api.get({
        path: 'getPendingHealthQuestionAgreement',
      });
      setIsPendingAgreement(
        pendingAgreementRes && pendingAgreementRes.length > 0,
      );
      setIsCCUpdateRequired(userInfo.profile.isCCUpdateRequiredForSubscription);

      const reinstateRequired = userInfo.profile.subscriptions?.find(
        ({ isReinstateRequiredForSubscription }) =>
          isReinstateRequiredForSubscription,
      );
      if (reinstateRequired) {
        setIsReInstateRequired(true);
        setReinstateRequiredSubscription(reinstateRequired);
      }
    },
    [],
  );

  // Memoize layout props
  const layoutProps = useMemo(
    () => ({
      hideHeader: Component.hideHeader,
      noHeader: Component.noHeader,
      hideFooter: Component.hideFooter,
      wcfHeader: Component.wcfHeader,
      sideGetStartedAction: Component.sideGetStartedAction,
    }),
    [Component],
  );

  // Get page-specific SEO from the component if available
  const pageSeo = Component.seo ? Component.seo(pageProps) : {};

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider
      checkUserPendingAction={checkUserPendingAction}
      userInfo={userInfo}
      enableLocalUserCache={true}
    >
      <CombinedProviders>
        <MemoizedMeditationProvider>
          <MemoizedLayout {...layoutProps}>
            {/* Default SEO configuration */}
            <DefaultSeo {...SEO} />
            {/* Add page-specific SEO */}
            {pageSeo && Object.keys(pageSeo).length > 0 && (
              <DefaultSeo {...pageSeo} />
            )}
            {isReInstateRequired && (
              <ReInstate subscription={reinstateRequiredSubscription} />
            )}
            {isCCUpdateRequired && <CardUpdateRequired />}
            {isPendingAgreement && <PendingAgreement />}
            <Component {...pageProps} err={err} />
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </MemoizedLayout>
        </MemoizedMeditationProvider>
      </CombinedProviders>
    </AuthProvider>
  );
};

// Memoize the entire AppContent component
const MemoizedAppContent = memo(AppContent);

function App(props) {
  return (
    <AnalyticsProvider instance={analytics}>
      <QueryClientProvider client={queryClient}>
        <MemoizedAppContent {...props} />
      </QueryClientProvider>
    </AnalyticsProvider>
  );
}

export default App;
