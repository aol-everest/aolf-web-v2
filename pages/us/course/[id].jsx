import { useRouter } from "next/router";
import { api } from "@utils";
import {
  SKYBreathMeditation,
  SahajSamadhi,
  SilentRetreat,
  SriSriYoga,
} from "@components/courseDetails";
import { withSSRContext } from "aws-amplify";
import { COURSE_TYPES } from "@constants";
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import { NextSeo } from "next-seo";
import "swiper/swiper.min.css";
import "swiper/components/navigation/navigation.min.css";
import "swiper/components/pagination/pagination.min.css";
import "swiper/components/a11y/a11y.min.css";
import "swiper/components/scrollbar/scrollbar.min.css";

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
  SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

  let swiperOption = {
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

  const props = {
    data,
    swiperOption,
  };

  return (
    <>
      <NextSeo title={data.title} />
      {isSKYType && <SKYBreathMeditation {...props} />}
      {isSilentRetreatType && <SriSriYoga {...props} />}
      {isSahajSamadhiMeditationType && <SahajSamadhi {...props} />}
    </>
  );
}
