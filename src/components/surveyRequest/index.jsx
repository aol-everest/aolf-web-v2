/* eslint-disable react/no-unescaped-entities */
import { useGlobalBannerContext } from "@contexts";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const SurveyRequest = ({ surveyInvite }) => {
  const router = useRouter();
  const { showBanner } = useGlobalBannerContext();

  const { shortLink } = surveyInvite;

  useEffect(() => {
    if (!router.isReady) return;
    showBanner({
      children: (
        <>
          Share Your Feedback about the Journey App{" "}
          <a
            target="_blank"
            href={shortLink}
            className="tw-font-bold tw-text-white"
            rel="noopener noreferrer"
          >
            Click here
          </a>
          .
        </>
      ),
    });
  }, [router.isReady]);

  return null;
};
