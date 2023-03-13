import { Navigation, Scrollbar, A11y } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { api, isSSR } from "@utils";
import { PageLoading } from "@components";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import ErrorPage from "next/error";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/a11y";
import "swiper/css/scrollbar";

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
      token,
    };
  } catch (err) {
    props = {
      authenticated: false,
    };
  }
  const { data } = await api.get({
    path: "journeyBySfid",
    token,
    param: {
      challengeSfid: id,
    },
  });

  const [journey] = data.challenge;

  props = {
    ...props,
    data: journey,
  };
  // Pass data to the page via props
  return { props };
}; */

function Journey() {
  const router = useRouter();
  const { id: challengeSfid } = router.query;
  const { data, isLoading, isError, error } = useQuery(
    "journeyBySfid",
    async () => {
      const response = await api.get({
        path: "journeyBySfid",
        param: {
          challengeSfid,
        },
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    },
  );
  let slidesPerView = 5;
  if (!isSSR) {
    const screenWidth = window.innerWidth;
    if (screenWidth < 1600 && screenWidth > 1200) {
      slidesPerView = 4.3;
    } else if (screenWidth < 1200 && screenWidth > 981) {
      slidesPerView = 3.3;
    } else if (screenWidth < 981 && screenWidth > 767) {
      slidesPerView = 3;
    } else if (screenWidth < 767) {
      slidesPerView = 2.2;
    }
  }

  let swiperOption = {
    modules: [Navigation, Scrollbar, A11y],
    allowTouchMove: true,
    slidesPerView: slidesPerView,
    spaceBetween: 30,
    preventInteractionOnTransition: true,
    navigation: true,
    breakpoints: {
      320: {
        slidesPerView: 2.2,
      },
      767: {
        slidesPerView: 3,
      },
      981: {
        slidesPerView: 3.3,
      },
      1200: {
        slidesPerView: 4.3,
      },
      1600: {
        slidesPerView: 5,
      },
    },
  };
  if (typeof window !== "undefined") {
    if (window.matchMedia("(max-width: 768px)").matches) {
      swiperOption = {
        ...swiperOption,
        navigation: false,
      };
    }
  }

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading) return <PageLoading />;

  return (
    <main className="background-image meditation">
      <section className="top-column meditation-page browse-category insight-collection">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-md-6 text-left">
              <p className="type-course">{data.type}</p>
              <h1 className="course-name">{data.challengeName}</h1>
              <p className="type-guide">{data.teacherName}</p>
              <p className="course-description">{data.description}</p>
            </div>
            <div className="col-12 col-md-6">
              <article className="collection-video">
                <div className="video-player">
                  <div className="video-insighter-container">
                    <video id="video-insighter" src="" poster=""></video>
                    <div className="video-insighter-play video-details">
                      <img
                        src="/img/ic-play.svg"
                        alt=""
                        className="video-play"
                      />
                    </div>
                  </div>
                  <div className="video-insighter-bar">
                    <div className="video-insighter-progress">
                      <div className="loaded tw-w-full"></div>
                      <div className="played tw-w-0"></div>
                    </div>
                  </div>
                  <div className="collection-video-details">
                    <span className="video-duration"></span>
                    <p></p>
                  </div>
                </div>
              </article>
            </div>
          </div>
          <div className="row">
            <p className="title-slider">Course Modules</p>

            <div className="swiper-container">
              <Swiper {...swiperOption}>
                {data &&
                  data.sessions &&
                  data.sessions.map((session, index) => {
                    return (
                      <SwiperSlide
                        key={session.challengeDetailSfid}
                        className="category-slide-item"
                      >
                        <div className="card image-card image-card-1">
                          <h5 className="card-title">
                            {session.challengeDetailSessionName}
                          </h5>
                          <p className="card-text">Short description</p>
                        </div>
                      </SwiperSlide>
                    );
                  })}
              </Swiper>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Journey;
