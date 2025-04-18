/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-inline-styles/no-inline-styles */
import React, { useEffect, useRef } from 'react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { SmartInput, SmartDropDown, Popup } from '@components';
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
import { fetchContentfulDataDetails } from '@service';
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

const LENGTHS = {
  ALL_LENGTHS: {
    label: 'All lengths',
    value: 'all',
  },
  SHORT: {
    label: 'Short',
    value: 'short',
  },
  MEDIUM: {
    label: 'Medium',
    value: 'medium',
  },
  LONG: {
    label: 'Long',
    value: 'long',
  },
};

const LEVELS = {
  ALL_LEVELS: {
    label: 'All levels',
    value: 'all',
  },
  BEGINNERS: {
    label: 'Beginners',
    value: 'beginners',
  },
  INTERMEDIATE: {
    label: 'Intermediate',
    value: 'intermediate',
  },
  EXPERT: {
    label: 'Expert',
    value: 'expert',
  },
};

const CONTENT_TYPE = {
  POPULAR: {
    label: 'Popular',
    value: 'popular',
  },
  RECENT: {
    label: 'Recent',
    value: 'recent',
  },
};

const GuidedMeditation = (props) => {
  const [lengthFilter, setLengthFilter] = useState(LENGTHS.ALL_LENGTHS);
  const [levelFilter, setLevelFilter] = useState(LEVELS.ALL_LEVELS);
  const [contentTypeFilter, setContentTypeFilter] = useState(
    CONTENT_TYPE.POPULAR,
  );
  const [categoryId, setCategoryId] = useQueryString('categoryId');
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
    };

    getContentfulData();
  }, []);

  // For geting the first load Data with root folder id
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

  // For geting the Category Data
  const { isLoading: loading, data } = useQuery({
    queryKey: ['library', categoryId],
    queryFn: async () => {
      const response = await api.get({
        path: 'library',
        param: {
          folderId: categoryId,
          accessible: true,
        },
      });
      const [contentFolder] = response.data.folder;
      return contentFolder;
    },
    enabled: !!categoryId,
  });

  // const onFilterChange = (value) => {
  //   setCategoryId(value);
  // };

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
        hideAlert,
        showPlayer,
        hidePlayer,
        showVideoPlayer,
        subsciptionCategories,
        purchaseMembershipAction,
        router,
      });
    }
  };

  const handleGoToHubSpotForm = () => {
    if (scrollToRef.current) {
      scrollToRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const onFilterChange = (field) => async (value) => {
    switch (field) {
      case 'lengthFilter':
        setLengthFilter(value);
        break;
      case 'levelFilter':
        setLevelFilter(value);
        break;
      case 'contentTypeFilter':
        setContentTypeFilter(value);
        break;
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

  const nonListingFolders = contentFolders?.filter(
    (folder) => !folder.isListingFolder,
  );

  const categoryContent = categoryId
    ? data
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
    <main class="free-guided-meditations">
      {loading && <Loader />}
      <section class="title-header">
        <div class="container">
          <h1 class="page-title">Free guided meditations by Gurudev</h1>
        </div>
      </section>
      <section>
        <div class="container">
          <div class="filter-wrapper">
            <div class="filters">
              <Popup
                value={lengthFilter}
                buttonText={lengthFilter?.label}
                closeEvent={onFilterChange('lengthFilter')}
                label=""
                parentClassName="dde"
              >
                {({ closeHandler }) => (
                  <ul class="courses-filter__list">
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(LENGTHS.ALL_LENGTHS)}
                    >
                      {LENGTHS.ALL_LENGTHS.label}
                    </li>
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(LENGTHS.SHORT)}
                    >
                      {LENGTHS.SHORT.label}
                    </li>
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(LENGTHS.MEDIUM)}
                    >
                      {LENGTHS.MEDIUM.label}
                    </li>
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(LENGTHS.LONG)}
                    >
                      {LENGTHS.LONG.label}
                    </li>
                  </ul>
                )}
              </Popup>
              <Popup
                value={levelFilter}
                buttonText={levelFilter?.label}
                closeEvent={onFilterChange('levelFilter')}
                label=""
                parentClassName="dde"
              >
                {({ closeHandler }) => (
                  <ul class="courses-filter__list">
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(LEVELS.ALL_LEVELS)}
                    >
                      {LEVELS.ALL_LEVELS.label}
                    </li>
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(LEVELS.BEGINNERS)}
                    >
                      {LEVELS.BEGINNERS.label}
                    </li>
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(LEVELS.INTERMEDIATE)}
                    >
                      {LEVELS.INTERMEDIATE.label}
                    </li>
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(LEVELS.EXPERT)}
                    >
                      {LEVELS.EXPERT.label}
                    </li>
                  </ul>
                )}
              </Popup>
              <Popup
                value={contentTypeFilter}
                buttonText={contentTypeFilter?.label}
                closeEvent={onFilterChange('contentTypeFilter')}
                label=""
                parentClassName="dde"
              >
                {({ closeHandler }) => (
                  <ul class="courses-filter__list">
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(CONTENT_TYPE.POPULAR)}
                    >
                      {CONTENT_TYPE.POPULAR.label}
                    </li>
                    <li
                      className="courses-filter__list-item"
                      onClick={closeHandler(CONTENT_TYPE.RECENT)}
                    >
                      {CONTENT_TYPE.RECENT.label}
                    </li>
                  </ul>
                )}
              </Popup>
            </div>
            <div class="total-count">Displaying 199,243 free meditations</div>
          </div>
        </div>
      </section>
      <section class="section-courses">
        <div class="container">
          <div class="fgm-courses-listing">
            <div
              class="fgm-course-item"
              data-toggle="modal"
              data-target="#meditationModal"
            >
              <div class="play-time">27 min</div>
              <div class="fgm-image-wrap">
                <img src="/img/ds-course-preview-1.webp" alt="course" />
              </div>
              <div class="fgm-course-title">
                Sri Sri Yoga Foundation Program
              </div>
            </div>
            <div
              class="fgm-course-item"
              data-toggle="modal"
              data-target="#meditationModal"
            >
              <div class="play-time">27 min</div>
              <div class="fgm-image-wrap">
                <img src="/img/ds-course-preview-2.webp" alt="course" />
              </div>
              <div class="fgm-course-title">
                Sri Sri Yoga Foundation Program
              </div>
            </div>
            <div
              class="fgm-course-item"
              data-toggle="modal"
              data-target="#meditationModal"
            >
              <div class="play-time">27 min</div>
              <div class="fgm-image-wrap">
                <img src="/img/ds-course-preview-3.webp" alt="course" />
              </div>
              <div class="fgm-course-title">
                Sri Sri Yoga Foundation Program
              </div>
            </div>
            <div
              class="fgm-course-item"
              data-toggle="modal"
              data-target="#meditationModal"
            >
              <div class="play-time">27 min</div>
              <div class="fgm-image-wrap">
                <img src="/img/ds-course-preview-4.webp" alt="course" />
              </div>
              <div class="fgm-course-title">
                Sri Sri Yoga Foundation Program
              </div>
            </div>
            <div
              class="fgm-course-item"
              data-toggle="modal"
              data-target="#meditationModal"
            >
              <div class="play-time">27 min</div>
              <div class="fgm-image-wrap">
                <img src="/img/ds-course-preview-5.webp" alt="course" />
              </div>
              <div class="fgm-course-title">
                Sri Sri Yoga Foundation Program
              </div>
            </div>
            <div
              class="fgm-course-item"
              data-toggle="modal"
              data-target="#meditationModal"
            >
              <div class="play-time">27 min</div>
              <div class="fgm-image-wrap">
                <img src="/img/ds-course-preview-6.webp" alt="course" />
              </div>
              <div class="fgm-course-title">
                Sri Sri Yoga Foundation Program
              </div>
            </div>
            <div
              class="fgm-course-item"
              data-toggle="modal"
              data-target="#meditationModal"
            >
              <div class="play-time">27 min</div>
              <div class="fgm-image-wrap">
                <img src="/img/ds-course-preview-7.webp" alt="course" />
              </div>
              <div class="fgm-course-title">
                Sri Sri Yoga Foundation Program
              </div>
            </div>
            <div
              class="fgm-course-item"
              data-toggle="modal"
              data-target="#meditationModal"
            >
              <div class="play-time">27 min</div>
              <div class="fgm-image-wrap">
                <img src="/img/ds-course-preview-1.webp" alt="course" />
              </div>
              <div class="fgm-course-title">
                Sri Sri Yoga Foundation Program
              </div>
            </div>
            <div
              class="fgm-course-item"
              data-toggle="modal"
              data-target="#meditationModal"
            >
              <div class="play-time">27 min</div>
              <div class="fgm-image-wrap">
                <img src="/img/ds-course-preview-2.webp" alt="course" />
              </div>
              <div class="fgm-course-title">
                Sri Sri Yoga Foundation Program
              </div>
            </div>
            <div
              class="fgm-course-item"
              data-toggle="modal"
              data-target="#meditationModal"
            >
              <div class="play-time">27 min</div>
              <div class="fgm-image-wrap">
                <img src="/img/ds-course-preview-3.webp" alt="course" />
              </div>
              <div class="fgm-course-title">
                Sri Sri Yoga Foundation Program
              </div>
            </div>
            <div
              class="fgm-course-item"
              data-toggle="modal"
              data-target="#meditationModal"
            >
              <div class="play-time">27 min</div>
              <div class="fgm-image-wrap">
                <img src="/img/ds-course-preview-4.webp" alt="course" />
              </div>
              <div class="fgm-course-title">
                Sri Sri Yoga Foundation Program
              </div>
            </div>
            <div
              class="fgm-course-item"
              data-toggle="modal"
              data-target="#meditationModal"
            >
              <div class="play-time">27 min</div>
              <div class="fgm-image-wrap">
                <img src="/img/ds-course-preview-5.webp" alt="course" />
              </div>
              <div class="fgm-course-title">
                Sri Sri Yoga Foundation Program
              </div>
            </div>
          </div>
        </div>
      </section>
      <div class="QR-wrapper">
        <img src="/img/QR-Code-Guided-Meditation-app.png" alt="QR Code" />
      </div>
      <div class="app-download">
        <img src="/img/mobile-app-store-ios.webp" alt="iOS" />
        <img src="/img/mobile-app-store-android.webp" alt="Android" />
      </div>
      <div
        class="meditation-video-modal modal fade bd-example-modal-lg"
        id="meditationModal"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div
          class="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div class="modal-content">
            <div class="modal-header">
              <button
                type="button"
                class="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div
                class="modal-video-wrap"
                style={{ padding: '56.25% 0 0 0', position: 'relative' }}
              >
                <iframe
                  src="https://player.vimeo.com/video/61702925?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                  frameborder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                  }}
                  title="A Film on Art of living International center"
                ></iframe>
              </div>
              <script src="https://player.vimeo.com/api/player.js"></script>
              <div class="video-title">Sri Sri Yoga Foundation Program</div>
              <div class="video-desc">
                In this video, meet happiness expert and celebrated author
                Rajshree Patel and discover a new approach to sleep. Through
                this course, you will find a set of effective and simple
                techniques to enhance the quality of your rest. Welcome and
                enjoy!
              </div>
              <div class="video-other-info">
                <div class="other-info-item">
                  <label>Activity</label>
                  <div class="text">Meditation</div>
                </div>
                <div class="other-info-item">
                  <label>Type</label>
                  <div class="text">Guided</div>
                </div>
                <div class="other-info-item">
                  <label>Plays</label>
                  <div class="text">20 min</div>
                </div>
                <div class="other-info-item">
                  <label>Rated</label>
                  <div class="text">4.7</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

GuidedMeditation.hideFooter = true;

export default GuidedMeditation;
