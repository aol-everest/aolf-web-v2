/* eslint-disable react/no-unescaped-entities */
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useGlobalBannerContext } from "@contexts";

export const SurveyRequest = (surveyInvite) => {
  const router = useRouter();
  const { showBanner } = useGlobalBannerContext();

  const { shortLink } = surveyInvite;

  useEffect(() => {
    if (!router.isReady) return;
    showBanner({
      children: (
        <>
          Share Your Feedback about the Journey App{" "}
          <a target="_blank" href={shortLink} rel="noopener noreferrer">
            Click here
          </a>
          .
        </>
      ),
    });
  }, [router.isReady]);

  return null;
};
