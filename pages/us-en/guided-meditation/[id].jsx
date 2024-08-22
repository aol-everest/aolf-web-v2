/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-inline-styles/no-inline-styles */
import React, { useEffect, useRef } from 'react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, navigateToLogin, timeConvert } from '@utils';
import { useQueryString } from '@hooks';
import AudioPlayerSmall from '@components/audioPlayer/audioPlayerSmall';
import { Loader } from '@components/loader';
import {
  useAuth,
  useGlobalAlertContext,
  useGlobalAudioPlayerContext,
  useGlobalVideoPlayerContext,
} from '@contexts';
import { meditatePlayEvent, pushRouteWithUTMQuery } from '@service';
import HubSpotForm from '@components/hubSpotForm';
import { useRouter } from 'next/router';
import {
  fetchContentfulBannerDetails,
  fetchContentfulDataDetails,
} from '@components/contentful';
import AudioPlayerOnScreen from '@components/audioPlayer/AudioPlayerOnScreen';

const swiperOption = {
  modules: [Navigation, Scrollbar, A11y, Pagination],
  slidesPerView: 1,
  spaceBetween: 10,
  pagination: { clickable: true, el: false },
  breakpoints: {
    640: {
      slidesPerView: 1,
      spaceBetween: 20,
    },
    768: {
      slidesPerView: 2,
      spaceBetween: 30,
    },
    1024: {
      slidesPerView: 3,
      spaceBetween: 30,
    },
  },
};

export const getServerSideProps = async (context) => {
  const response = await api.get({
    path: 'randomMeditation',
  });

  return {
    props: { randomMeditateData: response.data },
  };
};

const GuidedMeditation = (props) => {
  const [accordionIndex, setAccordionIndex] = useState(0);
  const [topic, setTopic] = useQueryString('topic');
  const router = useRouter();
  const scrollToRef = useRef(null);
  const { id: rootFolderID } = router.query;
  const swiperRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const { showPlayer, hidePlayer } = useGlobalAudioPlayerContext();
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const { showVideoPlayer } = useGlobalVideoPlayerContext();
  const { randomMeditateData = {} } = props;
  const [randomMeditate, setRandomMeditate] = useState({});

  useEffect(() => {
    const getContentfulData = async () => {
      const audioVideoDetails = await fetchContentfulDataDetails(
        randomMeditateData?.contentfulId || '',
      );
      setRandomMeditate({ ...randomMeditateData, ...audioVideoDetails });

      // const banners = await fetchContentfulBannerDetails();
      // console.log(banners);
    };

    getContentfulData();
  }, []);

  const { data: rootFolder = {} } = useQuery({
    queryKey: ['library'],
    queryFn: async () => {
      const response = await api.get({
        path: 'library',
        param: {
          folderId: rootFolderID,
          accessible: true,
        },
      });
      const [rootFolder] = response.data.folder;
      if (!rootFolder) {
        throw new Error('No library found. Invalid Folder Id.');
      }
      return rootFolder;
    },
  });

  const { data: meditationCategory = [] } = useQuery({
    queryKey: 'meditationCategory',
    queryFn: async () => {
      const response = await api.get({
        path: 'meditationCategory',
      });
      return response.data;
    },
  });

  const { isLoading: loading, data } = useQuery({
    queryKey: [
      'meditations',
      {
        topic,
      },
    ],
    queryFn: async ({ pageParam = 1 }) => {
      let param = {
        page: pageParam,
        size: 12,
        deviceType: 'Web',
        folderName: 'Meditations',
        accessible: true,
      };

      if (topic) {
        param = {
          ...param,
          category: topic,
        };
      }

      const res = await api.get({
        path: 'library/search',
        param,
      });
      return res;
    },
  });

  const onFilterChange = (value) => {
    setTopic(value);
  };

  const handlePrev = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const { data: subsciptionCategories = [] } = useQuery({
    queryKey: 'subsciption',
    queryFn: async () => {
      const response = await api.get({
        path: 'subsciption',
      });
      return response.data;
    },
  });
  const purchaseMembershipAction = (id) => (e) => {
    hideAlert();
    pushRouteWithUTMQuery(router, `/us-en/membership/${id}`);
  };

  const meditateClickHandle = async (e, meditate) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      navigateToLogin(router);
    } else {
      await meditatePlayEvent({
        meditate,
        showAlert,
        showPlayer,
        hidePlayer,
        showVideoPlayer,
        subsciptionCategories,
        purchaseMembershipAction,
      });
    }
  };

  const handleGoToHubSpotForm = () => {
    if (scrollToRef.current) {
      scrollToRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const contentFolders = rootFolder?.folder;

  let listingFolders = contentFolders?.filter(
    (folder) => folder.isListingFolder,
  );

  const popularFolder = listingFolders?.find(
    (folder) =>
      folder.title && folder.title.toLowerCase().indexOf('popular') > -1,
  );

  const content = topic
    ? data?.data
    : popularFolder?.content?.length > 0
      ? popularFolder?.content
      : [];

  const meditationHabbit = (
    <>
      Everyone can benefit from meditation, yet only those who cultivate a
      regular habit will experience the cumulative depth and breadth of those
      benefits—and see lasting positive change.
      <br />
      <br />
      Top tips to creating a habit:
      <br />
      <br />
      <strong>1. Set a time & place</strong>
      <br />
      Meditation will more easily integrate into your daily routine.
      <br />
      <br />
      <strong>2. Consistency is key</strong>
      <br />
      Even on days when the mind feels really busy, keep going!
      <br />
      <br />
      <strong>3. Choose a realistic duration</strong>
      <br />
      Regularity wins over duration.
      <br />
      <br />
      <strong>4. Be kind to yourself</strong>
      <br />
      If you miss a day, just begin again. Compare how you feel on days you
      meditate vs days you don’t. It’s a big motivator!
    </>
  );

  return (
    <main className="guided-meditation">
      {loading && <Loader />}
      <section className="banner-section">
        <div className="container">
          <div className="banner-title">{`Your Guide 
          to Meditation`}</div>
          <div className="banner-desc">
            Meditation is the delicate art of doing nothing and letting go of
            all effort to reconnect with the serenity that is your very nature,
            to feel revived, refreshed, and restored again
          </div>
          <div className="banner-audio">
            <AudioPlayerSmall
              audioSrc={randomMeditate.track?.fields?.file?.url}
            />
            <AudioPlayerOnScreen
              id="global-player"
              pageParam={{
                track: {
                  title: randomMeditate.title,
                  artist: randomMeditate.teacher?.name,
                  image: randomMeditate.coverImage?.url,
                  audioSrc: randomMeditate.track?.fields?.file?.url,
                },
              }}
            />
          </div>
        </div>
      </section>
      <section className="benefits-meditation">
        <div className="container">
          <h2 className="section-title">Benefits of meditation</h2>
          <div className="section-desc">
            Science shows that consistent meditation practice can
          </div>
          <div className="benefits-list">
            <div className="benefit-item">
              <div className="benefit-icon">
                <span className="icon-aol iconaol-focus"></span>
              </div>
              <div className="benefit-text">Increase focus</div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <span className="icon-aol iconaol-mindfulness"></span>
              </div>
              <div className="benefit-text">Calm the mind</div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <span className="icon-aol iconaol-sleep"></span>
              </div>
              <div className="benefit-text">Improve sleep</div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <span className="icon-aol iconaol-lighting"></span>
              </div>
              <div className="benefit-text">Boost energy</div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <span className="icon-aol iconaol-reduce-stress"></span>
              </div>
              <div className="benefit-text">Reduce stress</div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <span className="icon-aol iconaol-brain"></span>
              </div>
              <div className="benefit-text">Foster greater mindfulness</div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <span className="icon-aol iconaol-charity"></span>
              </div>
              <div className="benefit-text">Enhance mind-body health</div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <span className="icon-aol iconaol-emotion"></span>
              </div>
              <div className="benefit-text">Increase positive emotions</div>
            </div>
          </div>
        </div>
      </section>
      <section className="section-why-try">
        <div className="container">
          <div className="why-try-content-box">
            <div className="cb-info-container">
              <h2 className="section-title">
                Why try Art of Living meditations?
              </h2>
              <p>
                Gurudev is the founder of Art of Living and a world-renowned
                master of meditation. Our guided meditations and techniques are
                rooted in an ancient tradition yet modernized for contemporary
                life. They take you directly to the heart of meditation in a
                deep and effortless way.
              </p>
              <p>
                <strong>
                  They take you directly to the heart of meditation in the most
                  deep and effortless way.
                </strong>
              </p>
            </div>
            <div className="cb-image-container">
              <img src="/img/gurudev-talking.webp" alt="gurudev" width="100%" />
            </div>
          </div>
        </div>
      </section>
      <section className="section-quote">
        <div className="container">
          <div className="quote-top-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={106}
              height={52}
              fill="none"
            >
              <g clipPath="url(#a)">
                <mask
                  id="b"
                  width={106}
                  height={107}
                  x={0}
                  y={0}
                  maskUnits="userSpaceOnUse"
                  style={{
                    maskType: 'luminance',
                  }}
                >
                  <path fill="#fff" d="M106 0H0v106.122h106V0Z" />
                </mask>
                <g mask="url(#b)">
                  <path
                    fill="#31364E"
                    d="m62.209-.785-7.686 48.066L79.504 5.52 55.862 48.055l37.742-30.688L56.856 49.24l45.949-15.914-45.421 17.369 48.616.779-48.616.769L102.8 69.623 56.855 53.698l36.742 31.883L55.86 54.884l23.634 42.54-24.973-41.766 7.675 48.067L53 55.926l-9.208 47.797 7.686-48.066L26.495 97.42l23.643-42.535-37.742 30.688 36.748-31.875-45.95 15.915 45.421-17.37L0 51.465l48.615-.77L3.198 33.317 49.144 49.24 12.403 17.358l37.735 30.697-23.633-42.54L51.477 47.28 43.802-.787 53 47.013 62.21-.786Z"
                  />
                </g>
              </g>
              <defs>
                <clipPath id="a">
                  <path fill="#fff" d="M0 0h106v52H0z" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div className="quote-text">
            "You've been meditating even before your birth, when you were in
            your mother's womb, doing nothing-just being. That is meditation.
            There's a natural tendency in every human being to desire that state
            of absolute comfort."
          </div>
          <div className="quote-author">Gurudev Sri Sri Ravi Shankar</div>
        </div>
      </section>
      <section className="section-top-pics">
        <div className="container">
          <h2 className="section-title">Meditation is for everyone</h2>
          <div className="section-desc">Guided meditations for any mood.</div>
          <div className="categories-pills">
            {meditationCategory &&
              meditationCategory.map((category) => (
                <a
                  className={`cat-pill ${topic === category ? 'active' : ''}`}
                  key={category}
                  onClick={() =>
                    onFilterChange(topic === category ? '' : category)
                  }
                >
                  {category}
                </a>
              ))}
          </div>
          {content?.length > 0 && (
            <div className="top-picks-container">
              <div className="top-picks-content top-picks-slider swiper">
                <div className="top-picks-header">
                  <div className="top-picks-title">{topic || 'Top picks'}</div>
                  <div className="top-picks-actions">
                    <div
                      className="slide-button-prev slide-button"
                      onClick={handlePrev}
                    >
                      <span className="icon-aol iconaol-arrow-long-left"></span>
                    </div>
                    <div
                      className="slide-button-next slide-button"
                      onClick={handleNext}
                    >
                      <span className="icon-aol iconaol-arrow-long-right"></span>
                    </div>
                  </div>
                </div>
                <Swiper
                  {...swiperOption}
                  className="reviews-slider"
                  navigation={{
                    prevEl: '.slide-button-prev',
                    nextEl: '.slide-button-next',
                  }}
                  onInit={(swiper) => {
                    swiper.params.navigation.prevEl = '.slide-button-prev';
                    swiper.params.navigation.nextEl = '.slide-button-next';
                    swiper.navigation.update();
                  }}
                >
                  {content?.map((meditate, index) => {
                    return (
                      <SwiperSlide key={index}>
                        <div
                          className="swiper-slide"
                          onClick={(e) => meditateClickHandle(e, meditate)}
                        >
                          <div className="top-pick-preview-area">
                            <img
                              src={
                                meditate?.coverImage?.url ||
                                '/img/top-pick-preview1.webp'
                              }
                              className="top-pick-img"
                              alt="top pick"
                              width="100%"
                            />
                            <div className="preview-info">
                              <div className="play-time">
                                {timeConvert(meditate.duration)}
                              </div>
                              {!meditate.accessible && (
                                <div className="lock-info">
                                  <span className="icon-aol iconaol-lock"></span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="top-pick-content-info">
                            <div className="top-pick-title">
                              {meditate.title}
                            </div>
                            <div className="top-pick-author">
                              <span className="icon-aol iconaol-profile"></span>
                              {meditate.primaryTeacherName}
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </div>
            </div>
          )}
        </div>
      </section>
      <section className="experience-journey">
        <div className="container">
          <div className="experience-journey-content-wrap" ref={scrollToRef}>
            <div className="ej-content-info">
              <h2 className="section-title">
                Experience deep calm & inner stillness
              </h2>
              <div className="section-desc">
                <strong>Join the 7-day on-demand meditation journey</strong> to
                deeply relax and reconnect with inner peace, calm, and joy. Dive
                into a profound restorative experience, guided by world-renowned
                meditation master, Gurudev.
              </div>
              <div className="experience-features">
                <div className="ef-item">
                  <div className="ef-icon">
                    <span className="icon-aol iconaol-emotion"></span>
                  </div>
                  <div className="ef-text">
                    Receive a new meditation each day
                  </div>
                </div>
                <div className="ef-item">
                  <div className="ef-icon">
                    <span className="icon-aol iconaol-sleep"></span>
                  </div>
                  <div className="ef-text">
                    Release stress & reconnect with calm
                  </div>
                </div>
                <div className="ef-item">
                  <div className="ef-icon">
                    <span className="icon-aol iconaol-chat-flower"></span>
                  </div>
                  <div className="ef-text">Acquire new meditation tips</div>
                </div>
                <div className="ef-item">
                  <div className="ef-icon">
                    <span className="icon-aol iconaol-key"></span>
                  </div>
                  <div className="ef-text">
                    Gain access to valuable insights
                  </div>
                </div>
              </div>
            </div>
            <div className="journey-form-wrap">
              <HubSpotForm />
            </div>
          </div>
        </div>
      </section>
      <section className="featured-in">
        <div className="container">
          <h2 className="section-title">Featured In</h2>
          <div className="featured-listing">
            <div className="featured-item">
              <div className="featured-item-logo">
                <img src="/img/WP.webp" alt="washington post" />
              </div>
              <div className="featured-item-text">
                "Like fresh air to millions"
              </div>
            </div>
            <div className="featured-item">
              <div className="featured-item-logo">
                <img src="/img/Harvard.webp" alt="Harvard Health Publishing" />
              </div>
              <div className="featured-item-text">
                "Shows promise in providing relief for depression"
              </div>
            </div>
            <div className="featured-item">
              <div className="featured-item-logo">
                <img src="/img/Yoga.webp" alt="Yoga Journal" />
              </div>
              <div className="featured-item-text">
                "May be the fastest growing spiritual practice on the planet"
              </div>
            </div>
            <div className="featured-item">
              <div className="featured-item-logo">
                <img src="/img/CNN.webp" alt="CNN" />
              </div>
              <div className="featured-item-text">"Life Changing"</div>
            </div>
          </div>
        </div>
      </section>
      <section className="section-testimonials">
        <div className="container">
          <div className="top-text">TESTIMONIALS</div>
          <h2 className="section-title">What people are sharing</h2>
          <div className="testimonials-listing">
            <div className="testimonial-item">
              <div className="author-picutre">
                <img
                  src="/img/testimony-adinah.webp"
                  alt="Adinah"
                  height="70"
                  width="70"
                />
              </div>
              <div className="testimony-text">
                “Wow. It made a significant impression on me, was very very
                enjoyable, at times profound, and I plan to keep practicing.”
              </div>
              <div className="author-name">Adinah</div>
            </div>
            <div className="testimonial-item">
              <div className="author-picutre">
                <img
                  src="/img/testimony-joanna.webp"
                  alt="Joanna"
                  height="70"
                  width="70"
                />
              </div>
              <div className="testimony-text">
                “It was awesome! I regained my mental health. And I also feel so
                much lighter and happier. I got out of my funk that was getting
                me unmotivated.”
              </div>
              <div className="author-name">Joanna</div>
            </div>
            <div className="testimonial-item">
              <div className="author-picutre">
                <img
                  src="/img/testimony-vijitha.webp"
                  alt="Vijitha"
                  height="70"
                  width="70"
                />
              </div>
              <div className="testimony-text">
                “It was liberating. Any time my mind is wiggling between the
                past and the future, I notice it and have found a hack to bring
                myself back to the present.”
              </div>
              <div className="author-name">Vijitha</div>
            </div>
          </div>
        </div>
      </section>
      <section className="section-faq">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div id="accordion" className="accordion">
            <div
              className="card"
              onClick={() => setAccordionIndex(accordionIndex === 0 ? null : 0)}
            >
              <div className="card-header" id="headingOne">
                <h5 className="mb-0">
                  <button
                    className="btn btn-link"
                    data-toggle="collapse"
                    data-target="#collapseOne"
                    aria-expanded={accordionIndex === 0 ? true : false}
                    aria-controls="collapseOne"
                  >
                    Is meditation for me?
                  </button>
                </h5>
              </div>

              <div
                id="collapseOne"
                className={`collapse ${accordionIndex === 0 ? 'show' : ''}`}
                aria-labelledby="headingOne"
                data-parent="#accordion"
              >
                <div className="card-body">
                  {`Yes! Everyone benefits from meditation. It is accessible to everyone. 

                    There are so many reasons people start meditating—the benefits support all aspects of life, wherever you are. 

                    Experience is the best way to discover just how profound the practice is.`}
                </div>
              </div>
            </div>
            <div
              className="card"
              onClick={() => setAccordionIndex(accordionIndex === 1 ? null : 1)}
            >
              <div className="card-header" id="headingThree">
                <h5 className="mb-0">
                  <button
                    className="btn btn-link collapsed"
                    data-toggle="collapse"
                    data-target="#collapseThree"
                    aria-expanded={accordionIndex === 1 ? true : false}
                    aria-controls="collapseThree"
                  >
                    How do I make meditation a habit?
                  </button>
                </h5>
              </div>
              <div
                id="collapseThree"
                className={`collapse ${accordionIndex === 1 ? 'show' : ''}`}
                aria-labelledby="headingThree"
                data-parent="#accordion"
              >
                <div className="card-body">{meditationHabbit}</div>
              </div>
            </div>
            <div
              className="card"
              onClick={() => setAccordionIndex(accordionIndex === 2 ? null : 2)}
            >
              <div className="card-header" id="headingFour">
                <h5 className="mb-0">
                  <button
                    className="btn btn-link collapsed"
                    data-toggle="collapse"
                    data-target="#collapseFour"
                    aria-expanded={accordionIndex === 2 ? true : false}
                    aria-controls="collapseFour"
                  >
                    Do I have to sit cross-legged?
                  </button>
                </h5>
              </div>
              <div
                id="collapseFour"
                className={`collapse ${accordionIndex === 2 ? 'show' : ''}`}
                aria-labelledby="headingFour"
                data-parent="#accordion"
              >
                <div className="card-body">
                  {`No! Simply find a comfortable seated spot where you’ll be undisturbed and can relax.

                    Get comfortable with your coziest blanket, and feel free to sit back on a chair, sofa, or meditation cushion! Otherwise, it’ll be quite the challenge to relax your mind.`}
                </div>
              </div>
            </div>
            <div
              className="card"
              onClick={() => setAccordionIndex(accordionIndex === 3 ? null : 3)}
            >
              <div className="card-header" id="headingFive">
                <h5 className="mb-0">
                  <button
                    className="btn btn-link collapsed"
                    data-toggle="collapse"
                    data-target="#collapseFive"
                    aria-expanded={accordionIndex === 3 ? true : false}
                    aria-controls="collapseFive"
                  >
                    When is the best time to meditate?
                  </button>
                </h5>
              </div>
              <div
                id="collapseFive"
                className={`collapse ${accordionIndex === 3 ? 'show' : ''}`}
                aria-labelledby="headingFive"
                data-parent="#accordion"
              >
                <div className="card-body">
                  {`Morning meditations are often considered best (preferably before breakfast), but choose a time that works for you—building the habit is what matters most.

                    Establishing a daily meditation routine with a set time will really help you stay on track! The body and mind are habitual creatures and will start to expect the practice at that time, so you’ll naturally begin to settle, making it easier to sit and maintain this life-enhancing routine.
                  `}
                </div>
              </div>
            </div>
            <div
              className="card"
              onClick={() => setAccordionIndex(accordionIndex === 4 ? null : 4)}
            >
              <div className="card-header" id="headingSix">
                <h5 className="mb-0">
                  <button
                    className="btn btn-link collapsed"
                    data-toggle="collapse"
                    data-target="#collapseSix"
                    aria-expanded={accordionIndex === 4 ? true : false}
                    aria-controls="collapseSix"
                  >
                    How do I start meditating?
                  </button>
                </h5>
              </div>
              <div
                id="collapseSix"
                className={`collapse ${accordionIndex === 4 ? 'show' : ''}`}
                aria-labelledby="headingSix"
                data-parent="#accordion"
              >
                <div className="card-body">
                  We recommend starting with our{' '}
                  <a onClick={handleGoToHubSpotForm}>
                    free 7-Day Guided Meditation Journey.
                  </a>{' '}
                  You’ll be guided every step of the way with powerful daily
                  guided meditations and insight, led by world-renowned
                  meditation master, Gurudev.{' '}
                  <a onClick={handleGoToHubSpotForm}>
                    Save your FREE spot today
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section-key-highlights">
        <div className="container">
          <div className="key-highlights">
            <div className="key-item">
              <div className="key-item--title">42</div>
              <div className="key-item--desc">Years of transforming lives</div>
            </div>
            <div className="key-item">
              <div className="key-item--title">180</div>
              <div className="key-item--desc">
                Countries where our programs made a difference
              </div>
            </div>
            <div className="key-item">
              <div className="key-item--title">500M+</div>
              <div className="key-item--desc">
                Lives touched through our courses & events
              </div>
            </div>
            <div className="key-item">
              <div className="key-item--title">10,000+</div>
              <div className="key-item--desc">Centers worldwide</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default GuidedMeditation;
