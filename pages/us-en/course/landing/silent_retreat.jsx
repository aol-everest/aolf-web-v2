import { SKYSilentRetreat } from "@components/courseDetails";
import { NextSeo } from "next-seo";

export default function SilentRetreat() {
  return (
    <>
      <NextSeo title="Silent retreat" />
      <SKYSilentRetreat data={{ title: "Silent Retreat" }} />
    </>
  );
}
