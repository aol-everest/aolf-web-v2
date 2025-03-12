import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import Style from './LandingPage.module.scss';

const PAGES = {
  'online-course-2': {
    name: 'Art of Living Part 1 Course: Breath Meditation for Energy & Ease',
    description:
      'The Art of Living-Part 1 course teaches SKY—a powerful rhythmic breathing technique that harmonizes the body-mind complex. Participants notice reduced stress and anxiety, better sleep, a stronger immune system, and increased energy levels.',
    url: 'https://event.us.artofliving.org/us-en/online-course-2/',
  },
  'journey-app': {
    name: 'Journey App',
    description:
      'Unlock lasting transformation with the Journey App, featuring guided SKY Breath Meditations. Dive into a growing library of guided meditations and insights, improve your rest with sleep support sessions, and connect through live meetups with your instructors. Start your path to deeper wellness today.',
    url: 'https://event.us.artofliving.org/us-en/journey-app/',
  },
  'journeyapp-np': {
    name: 'Join the Art of Living Membership with the Journey App.',
    url: 'https://event.us.artofliving.org/us-en/journeyapp-np/',
  },
  'silent-retreat-intro': {
    name: 'Transform with Silence - An Introduction to the Silent Retreat',
    description:
      'Join this free LIVE online session with Senior Art of Living Faculty',
    url: 'https://event.us.artofliving.org/us-en/silent-retreat-intro/',
  },
  'silent-retreat': {
    name: 'Discover the Art of Living Part 2 Course',
    description:
      'The Part 2 Course builds on your Part 1 experience with a unique blend of advanced breathwork, signature guided meditations, daily yoga, and profound insights into the mind.',
    url: 'https://event.us.artofliving.org/us-en/silent-retreat/',
  },
  'srisriyoga-deepdiveretreat': {
    name: 'Deep Dive Retreat | Art of Living',
    description:
      'Go deeper into the realm of yoga and what it means to live like a yogi',
    url: 'https://yoga.us.artofliving.org/srisriyoga-deepdiveretreat/',
  },
  'online-foundation-program': {
    name: 'Sri Sri Yoga Foundation Program - Online',
    description:
      'Discover yoga from the comfort of your own home. At-home beginner/ intermediate workshop',
    url: 'https://event.us.artofliving.org/us-en/online-foundation-program/',
  },
  introtalks: {
    name: 'Breathwork Challenge',
    description:
      'Infuse your every day with more energy and vitality, and emerge feeling calm, centered, and rejuvenated with this 6-day breathing challenge on the Art of Living Journey App.',
    url: 'https://event.us.artofliving.org/us-en/introtalks/',
  },
  'about-us': {
    name: 'About us',
    description:
      'We help busy people who struggle with stress to clear their minds with a breath meditation that works from day one.',
    url: 'https://event.us.artofliving.org/about-us/',
  },
  'blessings-course': {
    name: 'The Blessings Course',
    description:
      'Learn to channel healing energy into blessings for those around you. Let go of negative concepts, resistance, and fear to effectively bless and heal others.',
    url: 'https://event.us.artofliving.org/us-en/blessings-course/',
  },
  'chakra-kriya': {
    name: 'Chakra Kriya',
    description:
      'Incorporate the energy of the chakras to release blocks and cleanse your energetic body, leaving you with a clear pathway to a deeper, more restful meditation experience—and vibrant life. ',
    url: 'https://event.us.artofliving.org/us-en/chakra-kriya/',
  },
  sanyam: {
    name: 'Sanyam',
    description:
      'Experience an integration of yoga and meditation firsthand. Dive deep and explore the eight limbs of yoga, with each day tailored to give you the most profound experience possible.',
    url: 'https://event.us.artofliving.org/us-en/sanyam/',
  },
  vtp: {
    name: 'Volunteer Training Program',
    description:
      'Empower your life and community with new leadership, teamwork, and communication skills.',
    url: 'https://event.us.artofliving.org/us-en/vtp/',
  },
  theartoflivingretreatcenter: {
    name: 'The Art of Living Retreat Center: Where health meets happiness.',
    description:
      'At the Art of Living Retreat Center, we strive to bring you the powerful practices of meditation and mindfulness, Ayurveda, yoga, so that you may have more happiness, health, and peace in your life.',
    url: 'https://event.us.artofliving.org/us-en/theartoflivingretreatcenter/',
  },
  donations: {
    name: 'Art of Living Donations',
    description:
      'Each life matters.. Your donation changes lives & communities. Together we can make a difference.',
    url: 'https://event.us.artofliving.org/us-en/donations/',
  },
  'teacher-training-course': {
    name: 'Teacher Training Course - Course Dates and Registration',
    description:
      'Experience the joy of transforming lives through service, Gain greater self-confidence & connectedness with others and Integrate deep yogic wisdom & practices through teaching.',
    url: 'https://event.us.artofliving.org/us-en/teacher-training-course/',
  },
};

export const getServerSideProps = async (context) => {
  if (context.query.pid === 'donations') {
    return {
      redirect: {
        permanent: false,
        destination: PAGES[context.query.pid].url,
      },
      props: {},
    };
  }
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
    let metaData = {
      defaultTitle: PAGES[pid].name,
    };
    if (PAGES[pid].description) {
      metaData = { ...metaData, description: PAGES[pid].description };
    }
    return (
      <>
        <NextSeo {...metaData} />
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
