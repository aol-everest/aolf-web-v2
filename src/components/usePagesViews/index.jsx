import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
export const missingGtagMsg =
  "Gtag is missing. Add the `GoogleAnalytics` component to the `Head` component inside `_document.js`.";

function pageView({ title, location, path, sendPageView }) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GTM_ID;

  if (!gaMeasurementId) {
    return;
  }

  if (!window.gtag) {
    console.warn(missingGtagMsg);
    return;
  }

  const pageViewOptions = {};

  if (title !== undefined) {
    pageViewOptions.page_title = title;
  }

  if (location !== undefined) {
    pageViewOptions.page_location = location;
  }

  if (path !== undefined) {
    pageViewOptions.page_path = path;
  }

  if (sendPageView !== undefined) {
    pageViewOptions.send_page_view = sendPageView;
  }

  window.gtag("config", gaMeasurementId, pageViewOptions);
}

export const UsePagesViews = () => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      if (!process.env.NEXT_PUBLIC_GTM_ID) {
        return;
      }

      pageView({ path: url.toString() });
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);
  return null;
};
