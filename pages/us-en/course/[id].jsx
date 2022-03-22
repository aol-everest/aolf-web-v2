import React, { useEffect } from "react";
import { api, Clevertap, Segment } from "@utils";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
// import {
//   SKYBreathMeditation,
//   SahajSamadhi,
//   SilentRetreat,
//   SriSriYoga,
//   VolunteerTrainingProgram,
// } from "@components/courseDetails";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import { withSSRContext } from "aws-amplify";
import { COURSE_TYPES } from "@constants";
import { NextSeo } from "next-seo";
import { useAuth } from "@contexts";
import { useGTMDispatch } from "@elgorditosalsero/react-gtm-hook";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/a11y";
import "swiper/css/scrollbar";

import "bootstrap-daterangepicker/daterangepicker.css";

const SKYBreathMeditation = dynamic(() =>
  import("@components/courseDetails").then((mod) => mod.SKYBreathMeditation),
);
const SahajSamadhi = dynamic(() =>
  import("@components/courseDetails").then((mod) => mod.SahajSamadhi),
);
const SilentRetreat = dynamic(() =>
  import("@components/courseDetails").then((mod) => mod.SilentRetreat),
);
const SriSriYoga = dynamic(() =>
  import("@components/courseDetails").then((mod) => mod.SriSriYoga),
);
const VolunteerTrainingProgram = dynamic(() =>
  import("@components/courseDetails").then(
    (mod) => mod.VolunteerTrainingProgram,
  ),
);

export const getServerSideProps = async (context) => {
  const { id } = context.query;
  let props = {};
  let token = "";
  try {
    const { Auth } = await withSSRContext(context);
    const user = await Auth.currentAuthenticatedUser();
    token = user.signInUserSession.idToken.jwtToken;
    props = {
      authenticated: true,
      username: user.username,
    };
  } catch (err) {
    props = {
      authenticated: false,
    };
  }

  const workshopDetail = await api.get({
    path: "workshopDetail",
    token,
    param: {
      id,
    },
  });
  props = {
    ...props,
    data: workshopDetail.data,
  };
  // Pass data to the page via props
  return { props };
};

export default function CourseDetail({ data }) {
  const sendDataToGTM = useGTMDispatch();
  const { profile } = useAuth();
  useEffect(() => {
    if (!profile) return;

    const { title, productTypeId, unitPrice, id: courseId } = data;

    sendDataToGTM({
      event: "workshopview",
      viewType: "workshop",
      requestType: "Detail",
      amount: unitPrice,
      title,
      ctype: productTypeId,
      user: profile,
    });
    Clevertap.event("Product Viewed", {
      "Request Type": "Detail",
      "Product Name": title,
      Category: "Workshop",
      "Product Type": productTypeId,
      "Product Id": courseId,
      Price: unitPrice,
    });
    Segment.event("Product Viewed", {
      "Request Type": "Detail",
      "Product Name": title,
      Category: "Workshop",
      "Product Type": productTypeId,
      "Product Id": courseId,
      Price: unitPrice,
    });
  }, [profile]);

  let swiperOption = {
    modules: [Navigation, Pagination, Scrollbar, A11y],
    allowTouchMove: false,
    slidesPerView: 4,
    spaceBetween: 30,
    slidesOffsetBefore: 300,
    preventInteractionOnTransition: true,
    navigation: true,
  };
  if (typeof window !== "undefined") {
    if (window.matchMedia("(max-width: 768px)").matches) {
      swiperOption = {
        slidesPerView: 1,
        spaceBetween: 30,
        centeredSlides: true,
        navigation: false,
      };
    } else if (window.matchMedia("(max-width: 1024px)").matches) {
      swiperOption = {
        allowTouchMove: false,
        slidesPerView: 2,
        spaceBetween: 30,
        centeredSlides: true,
        preventInteractionOnTransition: true,
        navigation: true,
      };
    } else if (window.matchMedia("(max-width: 1440px)").matches) {
      swiperOption = {
        allowTouchMove: false,
        slidesPerView: 3,
        spaceBetween: 30,
        slidesOffsetBefore: 150,
        preventInteractionOnTransition: true,
        navigation: true,
      };
    } else {
      swiperOption = {
        allowTouchMove: false,
        slidesPerView: 4,
        spaceBetween: 30,
        slidesOffsetBefore: 300,
        preventInteractionOnTransition: true,
        navigation: true,
      };
    }
  }

  const isSKYType =
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(data.productTypeId) >= 0;
  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(data.productTypeId) >= 0;
  const isSahajSamadhiMeditationType =
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(data.productTypeId) >=
    0;
  const isSriSriYogaMeditationType =
    COURSE_TYPES.SRI_SRI_YOGA_MEDITATION.value.indexOf(data.productTypeId) >= 0;
  const isVolunteerTrainingProgram =
    COURSE_TYPES.VOLUNTEER_TRAINING_PROGRAM.value.indexOf(data.productTypeId) >=
    0;
  const isHealingBreathType =
    COURSE_TYPES.HEALING_BREATH.value.indexOf(data.productTypeId) >= 0;

  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    if (
      !isSKYType &&
      !isSilentRetreatType &&
      !isSahajSamadhiMeditationType &&
      !isSriSriYogaMeditationType &&
      !isVolunteerTrainingProgram &&
      !isHealingBreathType
    ) {
      router.push({
        pathname: `/us-en/course/checkout/${data.id}`,
        query: {
          ctype: data.productTypeId,
          page: "c-o",
        },
      });
    }
  }, [router.isReady]);

  const props = {
    data,
    swiperOption,
  };

  return (
    <>
      <NextSeo title={data.title} />
      {isVolunteerTrainingProgram && <VolunteerTrainingProgram {...props} />}
      {isSriSriYogaMeditationType && <SriSriYoga {...props} />}
      {(isSKYType || isHealingBreathType) && <SKYBreathMeditation {...props} />}
      {isSilentRetreatType && <SilentRetreat {...props} />}
      {isSahajSamadhiMeditationType && <SahajSamadhi {...props} />}
    </>
  );
}
