/* eslint-disable react/no-unescaped-entities */
import dynamic from 'next/dynamic';
import { COURSE_TYPES } from '@constants';

const CouponStack = dynamic(() =>
  import('@components/profile').then((mod) => mod.CouponStack),
);

export default function TalkableRefer() {
  return (
    <main className="aol_mainbody">
      <section className="workshops_wraper">
        <article className="container">
          <h6 className="course-details-card__subtitle">How To Earn Rewards</h6>
          <ol>
            <li>
              Invite your friends to take the{' '}
              {COURSE_TYPES.SKY_BREATH_MEDITATION.name} course
            </li>
            <li>
              For every friend that completes the course, you’ll be entered into
              a Sweepstakes where you can win an{' '}
              {COURSE_TYPES.SILENT_RETREAT.name} Course (Silence Program) online
              or in-person up to a value of $700.
            </li>
            <li>
              The winner will be announced at the end of every quarter. See T&Cs
              for details.
            </li>
          </ol>{' '}
          <h6 className="course-details-card__subtitle">
            How To Claim The Rewards
          </h6>
          <ol>
            <li>
              The winner of the Sweepstakes will receive an email with a coupon
              code for the Art of Living - Part 2 Course.
            </li>
            <li>
              Enter the coupon code when registering for the course and enjoy a
              few days of deep calm & peace.
            </li>
          </ol>
          <div className="tw-mb-2 tw-mt-4">
            <CouponStack></CouponStack>
          </div>
          <div id="talkable-offer"></div>
        </article>
      </section>
    </main>
  );
}
