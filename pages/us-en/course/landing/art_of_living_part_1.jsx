import { useRouter } from "next/router";
import { SKYBreathMeditation } from "@components/courseDetails";
import { NextSeo } from "next-seo";

export default function ArtOfLivingPart1() {
  const router = useRouter();

  return (
    <>
      <NextSeo title="Art Of Living Part 1" />
      <SKYBreathMeditation data={{ title: "Art Of Living Part 1" }} />
    </>
  );
}
