import { api } from '@utils';
import dynamic from 'next/dynamic';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { PageLoading } from '@components';
import { COURSE_TYPES } from '@constants';
import { useAuth } from '@contexts';
import { pushRouteWithUTMQuery } from '@service';
import { NextSeo } from 'next-seo';
import { useQuery } from '@tanstack/react-query';
import { A11y, Navigation, Scrollbar } from 'swiper';
import { useAnalytics } from 'use-analytics';

import 'swiper/css';
import 'swiper/css/a11y';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';

import 'bootstrap-daterangepicker/daterangepicker.css';
import { orgConfig } from '@org';
import { navigateToLogin } from '@utils';
import queryString from 'query-string';

const SKYBreathMeditation = dynamic(() =>
  import('@components/courseDetails').then((mod) => mod.SKYBreathMeditation),
);
const SKYWithSahaj = dynamic(() =>
  import('@components/courseDetails').then((mod) => mod.SKYWithSahaj),
);
const SahajSamadhi = dynamic(() =>
  import('@components/courseDetails').then((mod) => mod.SahajSamadhi),
);
const SilentRetreat = dynamic(() =>
  import('@components/courseDetails').then((mod) => mod.SilentRetreat),
);
const SriSriYoga = dynamic(() =>
  import('@components/courseDetails').then((mod) => mod.SriSriYoga),
);
const VolunteerTrainingProgram = dynamic(() =>
  import('@components/courseDetails').then(
    (mod) => mod.VolunteerTrainingProgram,
  ),
);
const ResilienceTraining = dynamic(() =>
  import('@components/courseDetails').then((mod) => mod.ResilienceTraining),
);

const HealingBreath = dynamic(() =>
  import('@components/courseDetails').then((mod) => mod.HealingBreath),
);
const HealingBreathSilent = dynamic(() =>
  import('@components/courseDetails').then((mod) => mod.HealingBreathSilent),
);
const SKYSilentRetreat = dynamic(() =>
  import('@components/courseDetails').then((mod) => mod.SKYSilentRetreat),
);
const BlessingsCourse = dynamic(() =>
  import('@components/courseDetails').then((mod) => mod.BlessingsCourse),
);
const SKYHappinessRetreat = dynamic(() =>
  import('@components/courseDetails').then((mod) => mod.SKYHappinessRetreat),
);
const SanyamCourse = dynamic(() =>
  import('@components/courseDetails').then((mod) => mod.SanyamCourse),
);
const SriSriYogaDeepDive = dynamic(() =>
  import('@components/courseDetails').then((mod) => mod.SriSriYogaDeepDive),
);
const MarmaTraining = dynamic(() =>
  import('@components/courseDetails').then((mod) => mod.MarmaTraining),
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
  const { profile, isAuthenticated } = useAuth();
  const router = useRouter();
  const { id: workshopId, mode = '', bundle } = router.query;

  const { track, page } = useAnalytics();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: 'workshopDetail',
    queryFn: async () => {
      let param = {
        id: workshopId,
      };
      if (bundle) {
        param = {
          ...param,
          bundleSfid: bundle,
          id: workshopId,
        };
      }
      const response = await api.get({
        path: bundle ? 'workshopDetailWithBundles' : 'workshopDetail',
        param,
      });
      return response.data;
    },
    enabled: router.isReady,
  });
  if (data?.bundleInfo) {
    data.listPrice = data?.bundleInfo.comboListPrice;
    data.unitPrice = data?.bundleInfo.comboUnitPrice;
  }
  let checkOutQueryParam = {
    ctype: data?.productTypeId,
    page: 'c-o',
  };
  if (bundle) {
    checkOutQueryParam = {
      ...checkOutQueryParam,
      bundle,
    };
  }
  useEffect(() => {
    if (!isAuthenticated || !data) return;

    const { title, productTypeId, unitPrice, id: courseId } = data;
    page({
      category: 'course_registration',
      name: 'course',
      amount: unitPrice,
      title,
      ctype: productTypeId,
      user: profile,
    });
    track('workshopview', {
      viewType: 'workshop',
      requestType: 'Detail',
      amount: unitPrice,
      title,
      ctype: productTypeId,
      user: profile,
    });
  }, [isAuthenticated, data]);

  useEffect(() => {
    if (!router.isReady || !data) return;

    track(
      'view_item',
      {
        ecommerce: {
          currency: 'USD',
          value: data?.unitPrice,
          course_format: data?.productTypeId,
          course_name: data?.title,
          items: [
            {
              item_id: data?.id,
              item_name: data?.title,
              affiliation: 'NA',
              coupon: '',
              discount: 0.0,
              index: 0,
              item_brand: data?.businessOrg,
              item_category: data?.title,
              item_category2: data?.mode,
              item_category3: 'paid',
              item_category4: 'NA',
              item_category5: 'NA',
              item_list_id: data?.productTypeId,
              item_list_name: data?.title,
              item_variant: data?.workshopTotalHours,
              location_id: data?.locationCity,
              price: data?.unitPrice,
              quantity: 1,
            },
          ],
        },
      },
      {
        plugins: {
          all: false,
          'gtm-ecommerce-plugin': true,
        },
      },
    );

    if (
      !isSKYType &&
      !isSilentRetreatType &&
      !isSahajSamadhiMeditationType &&
      !isSriSriYogaMeditationType &&
      !isVolunteerTrainingProgram &&
      !isSKYSilentRetreatType &&
      !isBlessingsCourse &&
      !isSanyamCourse &&
      !isSKYWithSahaj &&
      !isSriSriYogaDeepDiveType &&
      !isMarmaTraining
    ) {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course/checkout/${data.id}`,
        query: checkOutQueryParam,
      });
    }
  }, [router.isReady, data]);

  let swiperOption = {
    modules: [Navigation, Scrollbar, A11y],
    allowTouchMove: false,
    slidesPerView: 4,
    spaceBetween: 30,
    slidesOffsetBefore: 300,
    preventInteractionOnTransition: true,
    navigation: true,
    centeredSlides: false,
  };
  if (typeof window !== 'undefined') {
    if (window.matchMedia('(max-width: 768px)').matches) {
      swiperOption = {
        modules: [Navigation, Scrollbar, A11y],
        slidesPerView: 1.1,
        spaceBetween: 10,
        centeredSlides: false,
        navigation: false,
        allowTouchMove: true,
        preventInteractionOnTransition: false,
      };
    } else if (window.matchMedia('(max-width: 1024px)').matches) {
      swiperOption = {
        ...swiperOption,
        slidesPerView: 2,
        spaceBetween: 30,
        centeredSlides: true,
      };
    } else if (window.matchMedia('(max-width: 1440px)').matches) {
      swiperOption = {
        ...swiperOption,
        slidesPerView: 3,
        spaceBetween: 30,
        slidesOffsetBefore: 150,
      };
    } else {
      swiperOption = {
        ...swiperOption,
        slidesPerView: 4,
        spaceBetween: 30,
        slidesOffsetBefore: 300,
      };
    }
  }

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !router.isReady) return <PageLoading />;

  const isHealingBreath = orgConfig.name === 'HB';
  const isIAHV = orgConfig.name === 'IAHV';

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
  const isSKYSilentRetreatType =
    COURSE_TYPES.SKY_SILENT_RETREAT.value.indexOf(data.productTypeId) >= 0;
  const isBlessingsCourse =
    COURSE_TYPES.BLESSINGS_COURSE.value.indexOf(data.productTypeId) >= 0;

  const isSanyamCourse =
    COURSE_TYPES.SANYAM_COURSE.value.indexOf(data.productTypeId) >= 0;

  const isSKYWithSahaj =
    COURSE_TYPES.ART_OF_LIVING_PREMIUM_PROGRAM.value.indexOf(
      data.productTypeId,
    ) >= 0;
  const isSriSriYogaDeepDiveType =
    COURSE_TYPES.SRI_SRI_YOGA_DEEP_DIVE.value.indexOf(data.productTypeId) >= 0;
  const isMarmaTraining =
    COURSE_TYPES.MARMA_TRAINING.value.indexOf(data.productTypeId) >= 0;

  const handleRegister =
    (courseType = COURSE_TYPES.SKY_BREATH_MEDITATION.code) =>
    (e) => {
      e.preventDefault();
      const { sfid, isGuestCheckoutEnabled, productTypeId } = data || {};

      if (sfid) {
        if (isAuthenticated || isGuestCheckoutEnabled) {
          pushRouteWithUTMQuery(router, {
            pathname: `/us-en/course/checkout/${sfid}`,
            query: checkOutQueryParam,
          });
        } else {
          navigateToLogin(
            router,
            `/us-en/course/checkout/${sfid}?${queryString.stringify(
              checkOutQueryParam,
            )}&${queryString.stringify(router.query)}`,
          );
        }
      } else {
        pushRouteWithUTMQuery(router, {
          pathname: `/us-en/course/scheduling`,
          query: {
            courseType: courseType,
          },
        });
      }
    };
  const props = {
    data,
    swiperOption,
    mode,
    handleRegister,
  };

  const renderCourseDetail = () => {
    if (true) {
      return <ResilienceTraining {...props} />;
    }
    if (isVolunteerTrainingProgram) {
      return <VolunteerTrainingProgram {...props} />;
    }
    if (isSriSriYogaMeditationType) {
      return <SriSriYoga {...props} />;
    }
    if (isSriSriYogaDeepDiveType) {
      return <SriSriYogaDeepDive {...props} />;
    }
    if (isMarmaTraining) {
      return <MarmaTraining {...props} />;
    }
    if (isSKYType) {
      if (isHealingBreath) {
        return <HealingBreath {...props} />;
      }
      if (isIAHV) {
        return <SKYHappinessRetreat {...props} />;
      }
      return <SKYBreathMeditation {...props} />;
    }
    if (isSilentRetreatType) {
      if (isHealingBreath) {
        return <HealingBreathSilent {...props} />;
      }
      return <SilentRetreat {...props} />;
    }
    if (isSahajSamadhiMeditationType) {
      return <SahajSamadhi {...props} />;
    }

    if (isSKYSilentRetreatType) {
      return <SKYSilentRetreat {...props} />;
    }
    if (isBlessingsCourse) {
      return <BlessingsCourse {...props} />;
    }

    if (isSanyamCourse) {
      return <SanyamCourse {...props} />;
    }
    if (isSKYWithSahaj) {
      return <SKYWithSahaj {...props} />;
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
