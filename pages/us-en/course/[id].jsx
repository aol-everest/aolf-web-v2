import React, { useEffect } from "react";
import { api } from "@utils";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import ErrorPage from "next/error";
// import {
//   SKYBreathMeditation,
//   SahajSamadhi,
//   SilentRetreat,
//   SriSriYoga,
//   VolunteerTrainingProgram,
// } from "@components/courseDetails";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import { COURSE_TYPES } from "@constants";
import { NextSeo } from "next-seo";
import { useAuth } from "@contexts";
import { trackEvent } from "@phntms/react-gtm";
import { PageLoading } from "@components";
import { useQuery } from "react-query";

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
const HealingBreath = dynamic(() =>
  import("@components/courseDetails").then((mod) => mod.HealingBreath),
);
const SKYSilentRetreat = dynamic(() =>
  import("@components/courseDetails").then((mod) => mod.SKYSilentRetreat),
);
const BlessingsCourse = dynamic(() =>
  import("@components/courseDetails").then((mod) => mod.BlessingsCourse),
);
const SKYHappinessRetreat = dynamic(() =>
  import("@components/courseDetails").then((mod) => mod.SKYHappinessRetreat),
);
const SanyamCourse = dynamic(() =>
  import("@components/courseDetails").then((mod) => mod.SanyamCourse),
);

/* export const getServerSideProps = async (context) => {
  const { query, req, res } = context;
  const { id } = query;
  let props = {};
  let token = "";
  try {
    const { Auth } = await withSSRContext({ req });
    const user = await Auth.currentAuthenticatedUser();
    const currentSession = await Auth.currentSession();
    token = currentSession.idToken.jwtToken;
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
 */
function CourseDetail() {
  const { user, authenticated } = useAuth();
  const router = useRouter();
  const { id: workshopId } = router.query;
  const { data, isLoading, isError, error } = useQuery(
    "workshopDetail",
    async () => {
      const response = await api.get({
        path: "workshopDetail",
        param: {
          id: workshopId,
        },
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      enabled: router.isReady,
    },
  );
  useEffect(() => {
    if (!authenticated || !data) return;

    const { title, productTypeId, unitPrice, id: courseId } = data;

    trackEvent({
      event: "workshopview",
      data: {
        viewType: "workshop",
        requestType: "Detail",
        amount: unitPrice,
        title,
        ctype: productTypeId,
        user: user.profile,
      },
    });
  }, [authenticated, data]);

  useEffect(() => {
    if (!router.isReady || !data) return;
    if (
      !isSKYType &&
      !isSilentRetreatType &&
      !isSahajSamadhiMeditationType &&
      !isSriSriYogaMeditationType &&
      !isVolunteerTrainingProgram &&
      !isHealingBreathType &&
      !isSKYSilentRetreatType &&
      !isBlessingsCourse &&
      !isSKYCampusHappinessRetreat &&
      !isSanyamCourse
    ) {
      router.push({
        pathname: `/us-en/course/checkout/${data.id}`,
        query: {
          ctype: data.productTypeId,
          page: "c-o",
        },
      });
    }
  }, [router.isReady, data]);

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

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !router.isReady) return <PageLoading />;

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
  const isSKYSilentRetreatType =
    COURSE_TYPES.SKY_SILENT_RETREAT.value.indexOf(data.productTypeId) >= 0;
  const isBlessingsCourse =
    COURSE_TYPES.BLESSINGS_COURSE.value.indexOf(data.productTypeId) >= 0;
  const isSKYCampusHappinessRetreat =
    COURSE_TYPES.SKY_CAMPUS_HAPPINESS_RETREAT.value.indexOf(
      data.productTypeId,
    ) >= 0;
  const isSanyamCourse =
    COURSE_TYPES.SANYAM_COURSE.value.indexOf(data.productTypeId) >= 0;

  const props = {
    data,
    swiperOption,
  };

  const renderCourseDetail = () => {
    if (isVolunteerTrainingProgram) {
      return <VolunteerTrainingProgram {...props} />;
    }
    if (isSriSriYogaMeditationType) {
      return <SriSriYoga {...props} />;
    }
    if (isSKYType) {
      return <SKYBreathMeditation {...props} />;
    }
    if (isSilentRetreatType) {
      return <SilentRetreat {...props} />;
    }
    if (isSahajSamadhiMeditationType) {
      return <SahajSamadhi {...props} />;
    }
    if (isHealingBreathType) {
      return <HealingBreath {...props} />;
    }
    if (isSKYSilentRetreatType) {
      return <SKYSilentRetreat {...props} />;
    }
    if (isBlessingsCourse) {
      return <BlessingsCourse {...props} />;
    }
    if (isSKYCampusHappinessRetreat) {
      return <SKYHappinessRetreat {...props} />;
    }
    if (isSanyamCourse) {
      return <SanyamCourse {...props} />;
    }
    return <ErrorPage statusCode={404} />;
  };

  return (
    <>
      <NextSeo title={data.title} />
      {renderCourseDetail()}
    </>
  );
}

export default CourseDetail;
