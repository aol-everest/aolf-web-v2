import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@utils';
import { useAuth } from '@contexts';
import { navigateToLogin } from '@utils';
import { useRouter } from 'next/router';
import { pushRouteWithUTMQuery } from '@service';
import { Loader } from '@components';
import { useMeditationContext } from '@contexts';
const timeConvert = (data) => {
  const minutes = data % 60;
  const hours = (data - minutes) / 60;

  return String(hours).padStart(2, 0) + ':' + String(minutes).padStart(2, 0);
};

const RenderItem = ({ practice, meditateClickHandle }) => {
  const coverImageUrl = practice.coverImage
    ? practice.coverImage.url
    : '/img/ds-course-preview-1.webp';
  return (
    <div class="ds-course-item tw-cursor-pointer" onClick={meditateClickHandle}>
      <div class="ds-image-wrap">
        <img src={coverImageUrl} alt="course" />
      </div>
      <div class="ds-course-header">
        <div class="play-time">{timeConvert(practice.duration)}</div>
        {!practice.accessible && (
          <div class="lock-info">
            <span class="icon-aol iconaol-lock"></span>
          </div>
        )}
      </div>
      <div class="ds-course-info">
        <div class="ds-course-title">{practice.title}</div>
        <div class="ds-course-author">{practice.primaryTeacherName}</div>
      </div>
    </div>
  );
};

const DailySKY = () => {
  const { isAuthenticated } = useAuth();
  const { handleMeditationPlay, markFavorite } = useMeditationContext();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: dailyPractice = [] } = useQuery({
    queryKey: 'dailyPractice',
    queryFn: async () => {
      const response = await api.get({
        path: 'dailyPractice',
      });
      return response.data;
    },
  });
  const { data: subscriptionCategories = [] } = useQuery({
    queryKey: 'subscriptionCategories',
    queryFn: async () => {
      const response = await api.get({
        path: 'subsciption',
      });
      return response.data;
    },
  });

  const meditateClickHandle = (meditate) => async (e) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      navigateToLogin(router);
    } else if (meditate.accessible && meditate.type === 'Course') {
      pushRouteWithUTMQuery(router, `/us-en/learn/${meditate.sfid}`);
    } else {
      setLoading(true);
      await handleMeditationPlay(meditate, subscriptionCategories);
      setLoading(false);
    }
  };

  return (
    <main class="daily-sky">
      {loading && <Loader />}
      <section class="title-header">
        <h1 class="page-title">Daily Practices</h1>
      </section>
      <section class="section-daily-sky-courses">
        <div class="container">
          <div class="ds-course-listing">
            {dailyPractice.map((practice) => {
              return (
                <RenderItem
                  practice={practice}
                  key={practice.sfid}
                  meditateClickHandle={meditateClickHandle(practice)}
                />
              );
            })}
          </div>
        </div>
      </section>
      <section class="section-journey-app">
        <div class="container">
          <div class="mobile-app-placeholder">
            <img
              src="/img/journey-app-mobile-placeholder.webp"
              alt="journey mobile app"
            />
          </div>
          <div class="mobile-app-info">
            <div class="info-header">
              <div class="app-icon">
                <img src="/img/logo-icon-small.webp" alt="logo" />
              </div>
              <div class="app-title">
                <h2>Art of living</h2>
                <h3>Journey App</h3>
              </div>
            </div>
            <ul class="info-list-item">
              <li>Guided daily SKY Breath Meditation</li>
              <li>Deepen your experience with SKY Journey</li>
              <li>Growing online library of meditations & insights</li>
              <li>Get better rest with sleep support meditations</li>
              <li>Access live meetups with your instructors</li>
            </ul>
            <div class="app-donwload-details">
              <h4>Download the Journey App</h4>
              <div class="store-list">
                <a
                  target="_blank"
                  href="https://apps.apple.com/us/app/art-of-living-journey/id1469587414"
                >
                  <img src="/img/mobile-app-store-ios.webp" alt="app store" />
                </a>
                <a
                  target="_blank"
                  href="https://play.google.com/store/apps/details?id=com.aol.app&hl=en_US"
                >
                  <img
                    src="/img/mobile-app-store-android.webp"
                    alt="google play"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DailySKY;
