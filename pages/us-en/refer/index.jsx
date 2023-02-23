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
          <h6 className="course-details-card__subtitle">How to Earn Rewards</h6>
          <ol>
            <li>Invite your friends to do the SKY Breath Meditation course</li>
            <li>
              Your friends get 20% off their first SKY Breath Meditation course
            </li>
            <li>
              You get $20 for every friend that completes their course and upto
              $200 per year
            </li>
            <li>
              You can use the credit towards Sahaj, Silence or even repeating
              SKY Breath Meditation
            </li>
          </ol>{" "}
          <h6 className="course-details-card__subtitle">
            How to Claim the Reward
          </h6>
          <ol>
            <li>
              You will receive a $20 credit coupon code via email for every
              friend that completes their course
            </li>
            <li>
              Enter the coupon code at check out when you register for Sahaj
              Samadhi Meditation course or Silent Retreat.
            </li>
            <li>
              If you have multiple coupon codes and would like to use them
              towards a single course registration, please send a request to
              support@us.artofliving.org and include all coupon codes in the
              email.
            </li>
          </ol>
          <p>
            If you are not part of the Referral program as yet, you can sign up{" "}
            <Link href="/us-en/referral-offer" prefetch={false} legacyBehavior>
              <a href="#" className="link_orange">
                here
              </a>
            </Link>
          </p>
          {/* <div className="tw-mb-2">
            <CouponStack></CouponStack>
          </div> */}
          <div id="talkable-offer"></div>
        </article>
      </section>
    </main>
  );
}
