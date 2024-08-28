/* eslint-disable no-inline-styles/no-inline-styles */
import React, { useRef, useState } from 'react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { useAuth } from '@contexts';
import { useEffect } from 'react';
import {
  api,
  concatenateStrings,
  findSlugByProductTypeId,
  tConvert,
} from '@utils';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { fetchContentfulBannerDetails } from '@components/contentful';
import { ABBRS, COURSE_MODES } from '@constants';

dayjs.extend(utc);

const ProfileLanding = () => {
  const upcomingCourseRef = useRef(null);
  const recommendedCourseRef = useRef(null);
  const activitiesRef = useRef(null);
  const bannerRef = useRef(null);

  const { profile } = useAuth();

  const [banners, setBanners] = useState([]);

  const { first_name } = profile || {};

  const swiperOption = {
    modules: [Navigation, Scrollbar, A11y, Pagination],
    slidesPerView: 3,
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

  const bannerSwiperOption = {
    modules: [Navigation, Scrollbar, A11y, Pagination],
    slidesPerView: 1.2,
    allowTouchMove: true,
    spaceBetween: 10,
    loop: true,
    loopedSlides: 1,
    pagination: { clickable: true, el: false },
    breakpoints: {
      640: {
        slidesPerView: 1.2,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 1.2,
        spaceBetween: 30,
      },
      1024: {
        slidesPerView: 1.2,
        spaceBetween: 30,
      },
    },
  };

  useEffect(() => {
    const getBannersData = async () => {
      const banners = await fetchContentfulBannerDetails();
      setBanners(banners);
    };
    getBannersData();
  }, []);

  const { data = [], isLoading } = useQuery({
    queryKey: 'getUserUpcomingCourses',
    queryFn: async () => {
      const response = await api.get({
        path: 'getUserUpcomingCourses',
      });
      return response.data;
    },
  });

  const upcomingEvents = [...(data?.workshops || []), ...(data?.meetups || [])];

  const handlePrev = () => {
    if (upcomingCourseRef.current && upcomingCourseRef.current.swiper) {
      upcomingCourseRef.current.swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (upcomingCourseRef.current && upcomingCourseRef.current.swiper) {
      upcomingCourseRef.current.swiper.slideNext();
    }
  };

  const handleRecommendedPrev = () => {
    if (recommendedCourseRef.current && recommendedCourseRef.current.swiper) {
      recommendedCourseRef.current.swiper.slidePrev();
    }
  };

  const handleRecommendedNext = () => {
    if (recommendedCourseRef.current && recommendedCourseRef.current.swiper) {
      recommendedCourseRef.current.swiper.slideNext();
    }
  };

  const handleActivitiesPrev = () => {
    if (activitiesRef.current && activitiesRef.current.swiper) {
      activitiesRef.current.swiper.slidePrev();
    }
  };

  const handleActivitiesNext = () => {
    if (activitiesRef.current && activitiesRef.current.swiper) {
      activitiesRef.current.swiper.slideNext();
    }
  };

  const handleBannerPrev = () => {
    if (bannerRef.current && bannerRef.current.swiper) {
      bannerRef.current.swiper.slidePrev();
    }
  };

  const handleBannerNext = () => {
    if (bannerRef.current && bannerRef.current.swiper) {
      bannerRef.current.swiper.slideNext();
    }
  };

  const getMeetupDuration = (item, updateMeetupDuration) => {
    const { meetupStartDate, meetupTimeZone, meetupStartTime } = item;
    return (
      <>
        {`${dayjs.utc(meetupStartDate).format('MM/DD dddd')}, `}
        {`${tConvert(meetupStartTime)} ${ABBRS[meetupTimeZone]}, `}
        {`${updateMeetupDuration} Mins`}
      </>
    );
  };

  const handleBannerButtonClick = () => {};

  return (
    <main className="profile-home">
      <section className="welcome-section">
        <div className="container">
          <h1 className="welcome-text">Hi {first_name}</h1>
        </div>
      </section>
      <section className="banner-section">
        <div className="container">
          <div className="banner-slider swiper">
            <Swiper
              {...bannerSwiperOption}
              className="swiper-wrapper"
              navigation={{
                prevEl: '.slide-button-banner-prev',
                nextEl: '.slide-button-banner-next',
              }}
              onInit={(swiper) => {
                swiper.params.navigation.prevEl = '.slide-button-banner-prev';
                swiper.params.navigation.nextEl = '.slide-button-banner-next';
                swiper.navigation.update();
              }}
            >
              {banners.map((banner, index) => {
                return (
                  <SwiperSlide key={index}>
                    <div className="swiper-slide">
                      <div
                        className="banner-slide-content banner-slide-2"
                        style={{
                          backgroundImage: `url(${banner.media?.fields?.file.url})`,
                        }}
                      >
                        <div className="slide-2-content">
                          <h2>{banner.name}</h2>
                          <p>
                            Discover exciting urban transformation with the
                            Cities 4 Peace peace building initiative
                          </p>
                          <div className="banner-btn">
                            <button
                              className="primary-btn"
                              onClick={() =>
                                window.open(banner.deeplinkUrl, '_blank')
                              }
                            >
                              {banner.buttonText}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            <div
              className="slide-button-prev slide-button-banner-prev"
              onClick={handleBannerPrev}
            >
              <span className="icon-aol iconaol-arrow-left"></span>
            </div>
            <div
              className="slide-button-next slide-button-banner-next"
              onClick={handleBannerNext}
            >
              <span className="icon-aol iconaol-arrow-right"></span>
            </div>
          </div>
        </div>
      </section>

      <section className="upcoming-courses">
        <div className="container">
          <div className="top-picks-container">
            <div className="top-picks-content upcoming-slider swiper">
              <div className="top-picks-header">
                <div className="top-picks-title">
                  Your upcoming courses, meetups and events
                </div>
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
                className="swiper-wrapper"
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
                {upcomingEvents.map((item) => {
                  const {
                    sfid,
                    title,
                    meetupTitle,
                    mode,
                    primaryTeacherName,
                    eventType,
                    meetupDuration,
                    locationPostalCode,
                    isOnlineMeetup,
                    locationCity,
                    locationProvince,
                    locationStreet,
                    centerName,
                    coTeacher1Name,
                    timings,
                    productTypeId,
                  } = item || {};
                  const isWorkshop = eventType === 'Workshop';
                  const isMeetup = eventType === 'Meetup';
                  const isOnline = mode === COURSE_MODES.ONLINE;
                  const updateMeetupDuration = meetupDuration?.replace(
                    /Minutes/g,
                    'Min',
                  );
                  const slug = findSlugByProductTypeId(productTypeId);

                  return (
                    <SwiperSlide key={sfid}>
                      <div className="swiper-slide">
                        <div className="flip-card">
                          <div className="flip-card-inner">
                            <div className="flip-card-front">
                              <div className="ds-course-item">
                                <div className="ds-image-wrap">
                                  <img
                                    src={
                                      isMeetup
                                        ? `/img/silent-retreat-bg@2x.png`
                                        : `/img/courses/${slug}.webp`
                                    }
                                    alt="course"
                                  />
                                </div>
                                <div className="ds-course-header">
                                  <div className="play-time">
                                    {isWorkshop
                                      ? 'Course'
                                      : isMeetup
                                        ? 'Meetup'
                                        : 'Event'}
                                  </div>
                                </div>
                                <div className="ds-course-info">
                                  <div className="ds-course-title">
                                    {isMeetup ? meetupTitle : title}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flip-card-back">
                              <div className="course-item">
                                <div className="course-item-header">
                                  <div className="course-title-duration">
                                    <div className="course-title">
                                      {isMeetup ? meetupTitle : title}
                                    </div>
                                    <div
                                      className={`course-type ${isOnline ? 'online' : 'in-person'}`}
                                    >
                                      {mode}
                                    </div>
                                  </div>
                                </div>
                                {isMeetup ? (
                                  <div className="course-location">
                                    {isOnlineMeetup ? (
                                      'Live Streaming from' + ' ' + centerName
                                    ) : (
                                      <>
                                        {locationCity
                                          ? concatenateStrings([
                                              locationCity,
                                              locationProvince,
                                              locationPostalCode,
                                            ])
                                          : centerName}
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    {mode !== 'Online' && locationCity && (
                                      <div className="course-location">
                                        {concatenateStrings([
                                          locationStreet,
                                          locationCity,
                                          locationProvince,
                                          locationPostalCode,
                                        ])}
                                      </div>
                                    )}
                                  </>
                                )}

                                <div className="course-instructors">
                                  {concatenateStrings([
                                    primaryTeacherName,
                                    coTeacher1Name,
                                  ])}
                                </div>
                                {timings?.length > 0 ? (
                                  <div className="course-timings">
                                    {timings.map((time, i) => {
                                      return (
                                        <div className="course-timing" key={i}>
                                          <span>
                                            {dayjs
                                              .utc(time.startDate)
                                              .format('MM/DD dddd')}
                                          </span>
                                          {`, ${tConvert(time.startTime)} - ${tConvert(time.endTime)} ${
                                            ABBRS[time.timeZone]
                                          }`}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="course-timings">
                                    <div className="course-timing">
                                      {getMeetupDuration(
                                        item,
                                        updateMeetupDuration,
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          </div>
        </div>
      </section>
      <section className="recommended-courses">
        <div className="container">
          <div className="top-picks-container">
            <div className="top-picks-content recommended-slider swiper">
              <div className="top-picks-header">
                <div className="top-picks-title">Recommended Courses</div>
                <div className="top-picks-actions">
                  <div
                    className="slide-button-recom-prev slide-button"
                    onClick={handleRecommendedPrev}
                  >
                    <span className="icon-aol iconaol-arrow-long-left"></span>
                  </div>
                  <div
                    className="slide-button-recom-next slide-button"
                    onClick={handleRecommendedNext}
                  >
                    <span className="icon-aol iconaol-arrow-long-right"></span>
                  </div>
                </div>
              </div>
              <Swiper
                {...swiperOption}
                className="swiper-wrapper"
                navigation={{
                  prevEl: '.slide-button-recom-prev',
                  nextEl: '.slide-button-recom-next',
                }}
                onInit={(swiper) => {
                  swiper.params.navigation.prevEl = '.slide-button-recom-prev';
                  swiper.params.navigation.nextEl = '.slide-button-recom-next';
                  swiper.navigation.update();
                }}
              >
                <SwiperSlide>
                  <div className="swiper-slide">
                    <div className="course-item">
                      <div className="course-item-header">
                        <div className="course-title-duration">
                          <div className="course-title">Blessings Course</div>
                          <div className="course-type in-person">In Person</div>
                          <div className="course-type online">Online</div>
                        </div>
                        <div className="course-price">
                          <span>$100</span>
                        </div>
                      </div>
                      <div className="course-location">
                        1901 Thornridge Cir. Shiloh, Hawaii 81063
                      </div>
                      <div className="course-instructors">
                        Cameron Williamson, Cameron Williamson
                      </div>
                      <div className="course-timings">
                        <div className="course-timing">
                          1/18, Monday, 12pm - 2:30 pm ET
                        </div>
                        <div className="course-timing">
                          1/19, Tuesdauy, 12pm - 2:30 pm ET
                        </div>
                        <div className="course-timing">
                          1/20, Wednesday, 12pm - 2:30pm ET
                        </div>
                      </div>
                      <div className="course-actions">
                        <button className="btn-secondary">Details</button>
                        <button className="btn-primary">Register</button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="swiper-slide">
                    <div className="course-item">
                      <div className="course-item-header">
                        <div className="course-title-duration">
                          <div className="course-title">DSN Course</div>
                          <div className="course-type online">Online</div>
                        </div>
                        <div className="course-price">
                          <span>$100</span>
                        </div>
                      </div>
                      <div className="course-location">
                        1901 Thornridge Cir. Shiloh, Hawaii 81063
                      </div>
                      <div className="course-instructors">
                        Cameron Williamson, Cameron Williamson
                      </div>
                      <div className="course-timings">
                        <div className="course-timing">
                          1/18, Monday, 12pm - 2:30 pm ET
                        </div>
                        <div className="course-timing">
                          1/19, Tuesdauy, 12pm - 2:30 pm ET
                        </div>
                        <div className="course-timing">
                          1/20, Wednesday, 12pm - 2:30pm ET
                        </div>
                      </div>
                      <div className="course-actions">
                        <button className="btn-secondary">Details</button>
                        <button className="btn-primary">Register</button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="swiper-slide">
                    <div className="course-item">
                      <div className="course-item-header">
                        <div className="course-title-duration">
                          <div className="course-title">Chakra Kriya</div>
                          <div className="course-type in-person">In Person</div>
                          <div className="course-type online">Online</div>
                        </div>
                        <div className="course-price">
                          <span>$100</span>
                        </div>
                      </div>
                      <div className="course-location">
                        1901 Thornridge Cir. Shiloh, Hawaii 81063
                      </div>
                      <div className="course-instructors">
                        Cameron Williamson, Cameron Williamson
                      </div>
                      <div className="course-timings">
                        <div className="course-timing">
                          1/18, Monday, 12pm - 2:30 pm ET
                        </div>
                        <div className="course-timing">
                          1/19, Tuesdauy, 12pm - 2:30 pm ET
                        </div>
                        <div className="course-timing">
                          1/20, Wednesday, 12pm - 2:30pm ET
                        </div>
                      </div>
                      <div className="course-actions">
                        <button className="btn-secondary">Details</button>
                        <button className="btn-primary">Register</button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="swiper-slide">
                    <div className="course-item">
                      <div className="course-item-header">
                        <div className="course-title-duration">
                          <div className="course-title">Chakra Kriya</div>
                          <div className="course-type in-person">In Person</div>
                          <div className="course-type online">Online</div>
                        </div>
                        <div className="course-price">
                          <span>$100</span>
                        </div>
                      </div>
                      <div className="course-location">
                        1901 Thornridge Cir. Shiloh, Hawaii 81063
                      </div>
                      <div className="course-instructors">
                        Cameron Williamson, Cameron Williamson
                      </div>
                      <div className="course-timings">
                        <div className="course-timing">
                          1/18, Monday, 12pm - 2:30 pm ET
                        </div>
                        <div className="course-timing">
                          1/19, Tuesdauy, 12pm - 2:30 pm ET
                        </div>
                        <div className="course-timing">
                          1/20, Wednesday, 12pm - 2:30pm ET
                        </div>
                      </div>
                      <div className="course-actions">
                        <button className="btn-secondary">Details</button>
                        <button className="btn-primary">Register</button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="swiper-slide">
                    <div className="course-item">
                      <div className="course-item-header">
                        <div className="course-title-duration">
                          <div className="course-title">Blessings Course</div>
                          <div className="course-type in-person">In Person</div>
                        </div>
                        <div className="course-price">
                          <span>$100</span>
                        </div>
                      </div>
                      <div className="course-location">
                        1901 Thornridge Cir. Shiloh, Hawaii 81063
                      </div>
                      <div className="course-instructors">
                        Cameron Williamson, Cameron Williamson
                      </div>
                      <div className="course-timings">
                        <div className="course-timing">
                          1/18, Monday, 12pm - 2:30 pm ET
                        </div>
                        <div className="course-timing">
                          1/19, Tuesdauy, 12pm - 2:30 pm ET
                        </div>
                        <div className="course-timing">
                          1/20, Wednesday, 12pm - 2:30pm ET
                        </div>
                      </div>
                      <div className="course-actions">
                        <button className="btn-secondary">Details</button>
                        <button className="btn-primary">Register</button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="swiper-slide">
                    <div className="course-item">
                      <div className="course-item-header">
                        <div className="course-title-duration">
                          <div className="course-title">Chakra Kriya</div>
                          <div className="course-type in-person">In Person</div>
                          <div className="course-type online">Online</div>
                        </div>
                        <div className="course-price">
                          <span>$100</span>
                        </div>
                      </div>
                      <div className="course-location">
                        1901 Thornridge Cir. Shiloh, Hawaii 81063
                      </div>
                      <div className="course-instructors">
                        Cameron Williamson, Cameron Williamson
                      </div>
                      <div className="course-timings">
                        <div className="course-timing">
                          1/18, Monday, 12pm - 2:30 pm ET
                        </div>
                        <div className="course-timing">
                          1/19, Tuesdauy, 12pm - 2:30 pm ET
                        </div>
                        <div className="course-timing">
                          1/20, Wednesday, 12pm - 2:30pm ET
                        </div>
                      </div>
                      <div className="course-actions">
                        <button className="btn-secondary">Details</button>
                        <button className="btn-primary">Register</button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
        </div>
      </section>
      <section className="activities-courses">
        <div className="container">
          <div className="top-picks-container">
            <div className="top-picks-content activities-slider swiper">
              <div className="top-picks-header">
                <div className="top-picks-title">
                  Activities happening at your preferred center
                </div>
                <div className="top-picks-actions">
                  <div
                    className="slide-button-activities-prev slide-button"
                    onClick={handleActivitiesPrev}
                  >
                    <span className="icon-aol iconaol-arrow-long-left"></span>
                  </div>
                  <div
                    className="slide-button-activities-next slide-button"
                    onClick={handleActivitiesNext}
                  >
                    <span className="icon-aol iconaol-arrow-long-right"></span>
                  </div>
                </div>
              </div>

              <Swiper
                {...swiperOption}
                className="swiper-wrapper"
                navigation={{
                  prevEl: '.slide-button-activities-prev',
                  nextEl: '.slide-button-activities-next',
                }}
                onInit={(swiper) => {
                  swiper.params.navigation.prevEl =
                    '.slide-button-activities-prev';
                  swiper.params.navigation.nextEl =
                    '.slide-button-activities-next';
                  swiper.navigation.update();
                }}
              >
                <SwiperSlide>
                  <div className="swiper-slide">
                    <div className="course-item">
                      <div className="course-item-header">
                        <div className="course-title-duration">
                          <div className="course-title">
                            Community Meditation
                          </div>
                          <div className="course-type in-person">In Person</div>
                          <div className="course-type duration">
                            Feb 07, 6:30 PM ET, 75 Min
                          </div>
                        </div>
                      </div>
                      <div className="course-location">
                        1901 Thornridge Cir. Shiloh, Hawaii 81063
                      </div>
                      <div className="course-date">
                        Mon, May 13, 2024 - Mon, May 13, 2024
                      </div>
                      <div className="course-time">
                        Mon, May 13, 2024 - Mon, May 13, 2024
                      </div>
                      <div className="course-actions">
                        <button className="btn-primary">Enroll</button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="swiper-slide">
                    <div className="course-item">
                      <div className="course-item-header">
                        <div className="course-title-duration">
                          <div className="course-title">
                            Community Meditation
                          </div>
                          <div className="course-type in-person">In Person</div>
                          <div className="course-type duration">
                            Feb 07, 6:30 PM ET, 75 Min
                          </div>
                        </div>
                      </div>
                      <div className="course-location">
                        1901 Thornridge Cir. Shiloh, Hawaii 81063
                      </div>
                      <div className="course-date">
                        Mon, May 13, 2024 - Mon, May 13, 2024
                      </div>
                      <div className="course-time">
                        Mon, May 13, 2024 - Mon, May 13, 2024
                      </div>
                      <div className="course-actions">
                        <button className="btn-primary">Enroll</button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="swiper-slide">
                    <div className="course-item">
                      <div className="course-item-header">
                        <div className="course-title-duration">
                          <div className="course-title">
                            Community Meditation
                          </div>
                          <div className="course-type in-person">In Person</div>
                          <div className="course-type duration">
                            Feb 07, 6:30 PM ET, 75 Min
                          </div>
                        </div>
                      </div>
                      <div className="course-location">
                        1901 Thornridge Cir. Shiloh, Hawaii 81063
                      </div>
                      <div className="course-date">
                        Mon, May 13, 2024 - Mon, May 13, 2024
                      </div>
                      <div className="course-time">
                        Mon, May 13, 2024 - Mon, May 13, 2024
                      </div>
                      <div className="course-actions">
                        <button className="btn-primary">Enroll</button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="swiper-slide">
                    <div className="course-item">
                      <div className="course-item-header">
                        <div className="course-title-duration">
                          <div className="course-title">
                            Community Meditation
                          </div>
                          <div className="course-type in-person">In Person</div>
                          <div className="course-type duration">
                            Feb 07, 6:30 PM ET, 75 Min
                          </div>
                        </div>
                      </div>
                      <div className="course-location">
                        1901 Thornridge Cir. Shiloh, Hawaii 81063
                      </div>
                      <div className="course-date">
                        Mon, May 13, 2024 - Mon, May 13, 2024
                      </div>
                      <div className="course-time">
                        Mon, May 13, 2024 - Mon, May 13, 2024
                      </div>
                      <div className="event-categories">
                        <div className="cat-item">Silver</div>
                        <div className="cat-item">General</div>
                        <div className="cat-item">General</div>
                      </div>
                      <div className="course-actions">
                        <button className="btn-primary">Enroll</button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="swiper-slide">
                    <div className="course-item">
                      <div className="course-item-header">
                        <div className="course-title-duration">
                          <div className="course-title">
                            Community Meditation
                          </div>
                          <div className="course-type in-person">In Person</div>
                          <div className="course-type duration">
                            Feb 07, 6:30 PM ET, 75 Min
                          </div>
                        </div>
                      </div>
                      <div className="course-location">
                        1901 Thornridge Cir. Shiloh, Hawaii 81063
                      </div>
                      <div className="course-date">
                        Mon, May 13, 2024 - Mon, May 13, 2024
                      </div>
                      <div className="course-time">
                        Mon, May 13, 2024 - Mon, May 13, 2024
                      </div>
                      <div className="event-categories">
                        <div className="cat-item">Silver</div>
                        <div className="cat-item">General</div>
                        <div className="cat-item">General</div>
                      </div>
                      <div className="course-actions">
                        <button className="btn-primary">Enroll</button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="swiper-slide">
                    <div className="course-item">
                      <div className="course-item-header">
                        <div className="course-title-duration">
                          <div className="course-title">
                            Community Meditation
                          </div>
                          <div className="course-type in-person">In Person</div>
                          <div className="course-type duration">
                            Feb 07, 6:30 PM ET, 75 Min
                          </div>
                        </div>
                      </div>
                      <div className="course-location">
                        1901 Thornridge Cir. Shiloh, Hawaii 81063
                      </div>
                      <div className="course-date">
                        Mon, May 13, 2024 - Mon, May 13, 2024
                      </div>
                      <div className="course-time">
                        Mon, May 13, 2024 - Mon, May 13, 2024
                      </div>
                      <div className="event-categories">
                        <div className="cat-item">Silver</div>
                        <div className="cat-item">General</div>
                        <div className="cat-item">General</div>
                      </div>
                      <div className="course-actions">
                        <button className="btn-primary">Enroll</button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProfileLanding;
