import React from "react";
import Amplify from "aws-amplify";
import dynamic from "next/dynamic";
import Head from "next/head";
import { withSSRContext } from "aws-amplify";
import { DefaultSeo } from "next-seo";
import { ReactQueryDevtools } from "react-query/devtools";
import { api } from "@utils";
import { QueryClient, QueryClientProvider } from "react-query";
import { Hydrate } from "react-query/hydration";
import Layout from "@components/layout";
import { GlobalModal } from "@components/globalModal";
import { GlobalAlert } from "@components/globalAlert";
import { AuthProvider } from "../src/contexts/auth";
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

function App({ Component, pageProps, userInfo }) {
  const queryClient = new QueryClient();
  return (
    <>
      {Component.requiresAuth && (
        <Head>
          <script
            // If no token is found, redirect inmediately
            dangerouslySetInnerHTML={{
              __html: `if(!document.cookie || document.cookie.indexOf('token') === -1)
            {location.replace(
              "/login?next=" +
                encodeURIComponent(location.pathname + location.search)
            )}
            else {document.documentElement.classList.add("render")}`,
            }}
          />
        </Head>
      )}
      <DefaultSeo {...SEO} />
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <AuthProvider userInfo={userInfo}>
            <GlobalModal>
              <GlobalAlert>
                <Layout hideHeader={Component.hideHeader}>
                  <TopProgressBar />
                  <Component {...pageProps} />
                  <ReactQueryDevtools initialIsOpen={false} />
                </Layout>
              </GlobalAlert>
            </GlobalModal>
          </AuthProvider>
        </Hydrate>
      </QueryClientProvider>
    </>
  );
}

App.getInitialProps = async ({ Component, ctx }) => {
  let pageProps = {};
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }
  try {
    const { Auth } = await withSSRContext(ctx);
    const user = await Auth.currentAuthenticatedUser();
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

    return { pageProps, userInfo };
  } catch (err) {
    console.log(err);
    return { pageProps, userInfo: {} };
  }
};

export default App;
