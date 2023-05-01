/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import dynamic from "next/dynamic";

const CouponStack = dynamic(() =>
  import("@components/profile").then((mod) => mod.CouponStack),
);

export default function TalkableRefer() {
  return (
    <main className="aol_mainbody">
      <section className="workshops_wraper">
        <article className="container">
          <h6 className="course-details-card__subtitle">How To Earn Rewards</h6>
          <ol>
            <li>
              Invite your friends to take the SKY Breath Meditation course
            </li>
            <li>
              Your friends will get 20% off their very first SKY Breath
              Meditation course
            </li>
            <li>
              You’ll get $20 for every friend that completes the course, earning
              up to $200 per year
            </li>
            <li>
              You can use the credit towards Sahaj Samadhi Meditation™, Silent
              Retreats, or to repeat your SKY course
            </li>
          </ol>{" "}
          <h6 className="course-details-card__subtitle">
            How To Claim The Rewards
          </h6>
          <ol>
            <li>
              You’ll receive a $20 coupon code for every friend that completes
              their course via ema
            </li>
            <li>
              Enter the coupon code and select your course of choice to redeem
              your reward. A new code will be provided, which can be applied at
              checkout upon registering for your course.
            </li>
            <li>
              If you have multiple coupon codes that you’d like to redeem for a
              single course, you can merge your coupons below. Your dashboard
              balance will update once your new coupon code has been
              enjoyed—have a great course :)
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
