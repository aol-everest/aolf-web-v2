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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis non
          magna vel turpis euismod ultricies id aliquet felis. Donec vel nisl
          accumsan ligula lobortis
          <a target="_blank" href={shortLink} rel="noopener noreferrer">
            Survey link
          </a>
          .
        </>
      ),
    });
  }, [router.isReady]);

  return null;
};
