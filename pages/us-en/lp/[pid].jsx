import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import Style from './LandingPage.module.scss';

const PAGES = {
  'online-course-2': {
    name: 'SKY Breath Meditation',
    url: 'https://event.us.artofliving.org/us-en/online-course-2/',
  },
  'journey-app': {
    name: 'Journey App',
    url: 'https://event.us.artofliving.org/us-en/journey-app/',
  },
  'journeyapp-np': {
    name: 'Journey App',
    url: 'https://event.us.artofliving.org/us-en/journeyapp-np/',
  },
  'silent-retreat-intro': {
    name: 'Silent Retreat Intro',
    url: 'https://event.us.artofliving.org/us-en/silent-retreat-intro/',
  },
  'silent-retreat': {
    name: 'Silent Retreat',
    url: 'https://event.us.artofliving.org/us-en/silent-retreat/',
  },
  'srisriyoga-deepdiveretreat': {
    name: 'Sri Sri Yoga',
    url: 'https://yoga.us.artofliving.org/srisriyoga-deepdiveretreat/',
  },
  'online-foundation-program': {
    name: 'Sri Sri Yoga',
    url: 'https://event.us.artofliving.org/us-en/online-foundation-program/',
  },
  introtalks: {
    name: 'Intro Talk',
    url: 'https://event.us.artofliving.org/us-en/introtalks/',
  },
  'about-us': {
    name: 'About us',
    url: 'https://event.us.artofliving.org/about-us/',
  },
};

function LandingPage() {
  const router = useRouter();
  const { pid, ...rest } = router.query;
  const queryString = Object.keys(rest || {})
    .map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(rest[key]);
    })
    .join('&');
  if (PAGES[pid]) {
    return (
      <>
        <NextSeo title={PAGES[pid].name} />
        <iframe
          src={`${PAGES[pid].url}?${queryString}`}
          title={PAGES[pid].name}
          width="100%"
          frameBorder="0"
          seamless="seamless"
          className={Style.iframe}
        ></iframe>
      </>
    );
  }
  return (
    <iframe
      src={`https://event.us.artofliving.org/us-en/${pid}?${queryString}`}
      width="100%"
      frameBorder="0"
      seamless="seamless"
      className={Style.iframe}
    ></iframe>
  );
}

LandingPage.hideFooter = false;

export default LandingPage;
