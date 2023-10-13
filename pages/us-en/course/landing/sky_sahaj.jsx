import { SKYWithSahaj } from '@components/courseDetails';
import { NextSeo } from 'next-seo';

export default function SkyWithSahaj() {
  return (
    <>
      <NextSeo title="Art of Living Premium Program" />
      <SKYWithSahaj data={{ title: 'Art of Living Premium Program' }} />
    </>
  );
}
