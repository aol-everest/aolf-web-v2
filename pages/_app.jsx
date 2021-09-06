import React from "react";
import Amplify from "aws-amplify";
import dynamic from "next/dynamic";
import Head from "next/head";
import { DefaultSeo } from "next-seo";
import { ReactQueryDevtools } from "react-query/devtools";

import { QueryClient, QueryClientProvider } from "react-query";
import { Hydrate } from "react-query/hydration";
import { Provider } from "react-redux";
import store from "@redux/store";
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

function MyApp({ Component, pageProps }) {
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
          <Provider store={store}>
            <AuthProvider>
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
          </Provider>
        </Hydrate>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
