import { useRouter } from "next/router";
import { api } from "@utils";
import {
  SKYBreathMeditation,
  SahajSamadhi,
  SilentRetreat,
} from "@components/courseDetails";
import { COURSE_TYPES } from "@constants";
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
  try {
    const res = await api.get({
      path: "workshopDetail",
      token,
      param: {
        id,
      },
    });
    props = {
      ...props,
      data: res.data,
    };
  } catch (err) {
    props = {
      ...props,
      data: {
        error: { message: err.message },
      },
    };
  }
  // Pass data to the page via props
  return { props };
};

export default function CourseDetail({ data }) {
  const isSKYType =
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(data.productTypeId) >= 0;
  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(data.productTypeId) >= 0;
  const isSahajSamadhiMeditationType =
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(data.productTypeId) >=
    0;

  return (
    <>
      {isSKYType && <SilentRetreat data={data} />}
      {isSilentRetreatType && <SilentRetreat data={data} />}
      {isSahajSamadhiMeditationType && <SahajSamadhi data={data} />}
    </>
  );
}
