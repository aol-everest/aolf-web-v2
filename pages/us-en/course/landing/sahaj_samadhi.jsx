import { SahajSamadhi } from '@components/courseDetails';
import { NextSeo } from 'next-seo';

export default function SahajSamadhiMeditation() {
  return (
    <>
      <NextSeo title="Sahaj Samadhi Meditation" />
      <SahajSamadhi data={{ title: 'Sahaj Samadhi Meditation' }} />
    </>
  );
}
