/* eslint-disable no-inline-styles/no-inline-styles */
/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import Slider from 'react-slick';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@utils';
import { pushRouteWithUTMQuery } from '@service';
import { useAuth, useGlobalVideoPlayerContext } from '@contexts';
import ErrorPage from 'next/error';
import { PageLoading } from '@components';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const settings = {
  slidesToShow: 3,
  slidesToScroll: 1,
  centerMode: false,
  arrows: true,
  dots: false,
  speed: 300,
  centerPadding: '0px',
  infinite: false,
  autoplay: false,
  draggable: true,
  responsive: [
    {
      breakpoint: 1279,
      settings: {
        arrows: false,
        centerMode: true,
        centerPadding: '20px',
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 991,
      settings: {
        arrows: false,
        centerMode: true,
        centerPadding: '20px',
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 768,
      settings: {
        arrows: false,
        centerMode: true,
        centerPadding: '20px',
        slidesToShow: 1,
      },
    },
  ],
};

const VideoCard = ({ video, index, isAuthenticated }) => {
  const { title, media, isLoginRequired, thumbnail } = video;
  const router = useRouter();
  const { showVideoPlayer } = useGlobalVideoPlayerContext();
  const login = (e) => {
    if (e) e.preventDefault();
    pushRouteWithUTMQuery(
      router,
      `/us-en/signin?next=${encodeURIComponent(location.pathname + location.search)}`,
    );
  };

  const handleVideoClick = () => {
    if (isLoginRequired && !isAuthenticated) {
      pushRouteWithUTMQuery(
        router,
        `/us-en/signin?next=${encodeURIComponent(location.pathname + location.search)}`,
      );
    } else {
      showVideoPlayer({
        autoPlay: true,
        track: {
          title,
          image: thumbnail,
          artist: '',
          audioSrc: media,
          description: '',
        },
      });
    }
  };

  if (isLoginRequired && !isAuthenticated) {
    return (
      <div className="slide">
        <div class="intro-item-box">
          <div class="day">DAY {index + 1}</div>
          <div class="intro-video-title">{title}</div>
          <div class="intro-video-player">
            <img
              src={thumbnail || 'https://vumbnail.com/304592334.jpg'}
              alt={`DAY ${index + 1}`}
            />
            <div class="video-locked">
              <span class="icon-aol iconaol-lock"></span>
              <div class="text">
                To keep watching more videos for free,{' '}
                <a href="#" onClick={login}>
                  create an account
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="slide">
      <div class="intro-item-box">
        <div class="day">DAY {index + 1}</div>
        <div class="intro-video-title">{video.title}</div>
        <div class="intro-video-player">
          <div class="video-thumb">
            <img
              src={thumbnail || 'https://vumbnail.com/304592334.jpg'}
              alt={`DAY ${index + 1}`}
            />
            <svg
              onClick={handleVideoClick}
              class="play-icon"
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 0C9.84953 0 0 9.84953 0 22C0 34.1505 9.84953 44 22 44C34.1505 44 44 34.1505 44 22C43.9765 9.85953 34.1405 0.0235451 22 0ZM29.6999 23.4174L19.546 30.1867C19.2658 30.3597 18.9444 30.4551 18.6154 30.4615C18.3364 30.4615 18.0609 30.3962 17.8113 30.2714C17.2604 29.9736 16.9184 29.3955 16.9231 28.7692V15.2308C16.9184 14.6045 17.2604 14.0264 17.8113 13.7286C18.364 13.449 19.0233 13.4814 19.546 13.8134L29.6999 20.5826C30.179 20.8951 30.4674 21.4284 30.4674 22C30.4674 22.5716 30.179 23.1049 29.6999 23.4174Z"
                fill="white"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Session() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { slug } = router.query;
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['get-started-intro-series', slug],
    queryFn: async () => {
      const param = {
        slug,
      };

      const response = await api.get({
        path: 'get-started-intro-series',
        param,
      });
      return response.data;
    },
  });
  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !router.isReady) return <PageLoading />;
  return (
    <main class="course-finder-questionnaire-question">
      <section class="questionnaire-results new">
        <div class="container">
          <div class="question-box">
            <h1 class="section-title">
              Here's your personalized recommendation
            </h1>
            <div class="result-boxes">
              <div class="result-box">
                <div class="first-info">FREE INTRO SERIES</div>
                <div class="box-title">
                  Get started on your journey with a few quick tips & tricks for{' '}
                  {data?.title}
                </div>

                <Slider {...settings} className="intro-series-slider">
                  {data?.videos?.map((video, index) => (
                    <VideoCard
                      video={video}
                      key={index}
                      index={index}
                      isAuthenticated={isAuthenticated}
                    />
                  ))}
                </Slider>
              </div>
              <div class="result-box recommendation">
                <div class="first-info">RECOMMENDED COURSE FOR YOU</div>
                <div class="box-title">
                  For full experience register for the Art of Living Part I
                  course
                </div>
                <div class="box-desc">
                  Discover SKY Breath Meditation, an evidence-based technique
                  that quickly reduces stress, balances emotions, and restores
                  calm.
                </div>
              </div>
              <iframe
                src="https://members.us.artofliving.org/widget/nearby-courses/art-of-living-part-1"
                style={{ border: '0px #ffffff none' }}
                name="carouselIframe"
                scrolling="no"
                frameborder="0"
                marginheight="0px"
                marginwidth="0px"
                height="815px"
                width="100%"
                allowfullscreen=""
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
