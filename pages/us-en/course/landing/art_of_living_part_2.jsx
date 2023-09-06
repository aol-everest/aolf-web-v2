import { useRouter } from "next/router";
import { SilentRetreat } from "@components/courseDetails";
import { NextSeo } from "next-seo";

export default function ArtOfLivingPart2() {
  const router = useRouter();

  return (
    <>
      <NextSeo title="Art of Living Part II Course" />
      <SilentRetreat data={{ title: "Art of Living Part II Course" }} />
    </>
  );
}
