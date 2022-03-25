import React, { useState } from "react";
import classNames from "classnames";
import { priceCalculation } from "@utils";
import { useRouter } from "next/router";
import { isEmpty } from "@utils";
import { useAuth } from "@contexts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { MEMBERSHIP_TYPES, COURSE_TYPES } from "@constants";

dayjs.extend(utc);

export const RegisterPanel = ({ workshop }) => {
  const [{ authenticated = false, profile }] = useAuth();
  const router = useRouter();
  const { fee, delfee, offering } = priceCalculation({ workshop });
  const {
    title,
    sfid,
    premiumRate,
    mode,
    earlyBirdFeeIncreasing,
    roomAndBoardRange,
    usableCredit,
    productTypeId,
  } = workshop || {};

  const isSKYType =
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(workshop.productTypeId) >=
    0;
  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(workshop.productTypeId) >= 0;
  const isSahajSamadhiMeditationType =
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(
      workshop.productTypeId,
    ) >= 0;

  const handleRegister = (e) => {
    e.preventDefault();
    router.push({
      pathname: `/us-en/course/checkout/${sfid}`,
      query: {
        ctype: productTypeId,
        page: "c-o",
      },
    });
  };

  const purchaseMembershipAction = (id) => (e) => {
    if (e) e.preventDefault();
    router.push({
      pathname: `/us-en/membership/${id}`,
      query: { cid: sfid, page: "detail" },
    });
  };

  const { subscriptions = [] } = profile || {};
  const userSubscriptions = subscriptions.reduce(
    (accumulator, currentValue) => {
      return {
        ...accumulator,
        [currentValue.subscriptionMasterSfid]: currentValue,
      };
    },
    {},
  );

  const isUsableCreditAvailable = usableCredit && !isEmpty(usableCredit);

  let UpdatedFeeAfterCredits;
  if (
    isUsableCreditAvailable &&
    usableCredit.creditMeasureUnit === "Quantity" &&
    usableCredit.availableCredit === 1
  ) {
    UpdatedFeeAfterCredits = 0;
  } else if (
    isUsableCreditAvailable &&
    usableCredit.creditMeasureUnit === "Amount"
  ) {
    if (usableCredit.availableCredit > fee) {
      UpdatedFeeAfterCredits = 0;
    } else {
      UpdatedFeeAfterCredits = fee - usableCredit.availableCredit;
    }
  }

  const isJourneyPremium =
    userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PREMIUM.value];
  const isJourneyPlus = userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PLUS.value];

  if (isSahajSamadhiMeditationType) {
    return (
      <div className="powerful__block powerful__block_bottom">
        <div>
          <h6 className="powerful__block-caption_2">
            Learn a meditation practice for life
          </h6>
          <div>
            {delfee && <h3>Limited Time Offer</h3>}
            <h2>
              {title}: ${fee}
            </h2>
            {delfee && (
              <p>
                Regular course fee:{" "}
                <span className="discount"> ${delfee} </span>
              </p>
            )}
          </div>
        </div>
        <div className="bottom-box justify-content-md-center">
          <button className="btn-secondary v2" onClick={handleRegister}>
            Register Today
          </button>
        </div>
      </div>
    );
  }
  if (isSKYType) {
    return (
      <div className="powerful__block powerful__block_bottom">
        <div>
          <h3>Limited Time Offer</h3>
          <h2>
            {title}: ${fee}
          </h2>
          <p>
            Regular course fee: <span className="discount"> ${delfee} </span>
          </p>
        </div>
        <div className="bottom-box justify-content-md-center">
          <button className="btn-secondary v2" onClick={handleRegister}>
            Register Today
          </button>
        </div>
      </div>
    );
  }
  if (authenticated && (isJourneyPremium || isJourneyPlus)) {
    return (
      <div className="powerful__block powerful__block_bottom">
        <div>
          <h6 className="powerful__block-caption_2">Limited Time Offer</h6>
          <h5 className="powerful__block-title_5 mb-1">
            Premium/Journey+ rate:{" "}
            {premiumRate &&
              premiumRate.listPrice &&
              premiumRate.listPrice !== premiumRate.unitPrice && (
                <span className="discount">
                  ${delfee || premiumRate.listPrice}
                </span>
              )}{" "}
            ${premiumRate && premiumRate.unitPrice}
          </h5>
          {roomAndBoardRange && (
            <h5 className="powerful__italic-title_6">
              plus room &amp; board: {roomAndBoardRange}
            </h5>
          )}
          {isUsableCreditAvailable && (
            <div className="credit-text mb-2">
              {usableCredit.message} ${UpdatedFeeAfterCredits}.
            </div>
          )}
        </div>
        <div
          className={classNames("bottom-box", {
            "justify-content-md-center": !earlyBirdFeeIncreasing,
          })}
        >
          {earlyBirdFeeIncreasing && (
            <>
              <img src="/img/ic-timer-orange.svg" alt="timer" />
              <p>
                Register soon. Course fee will go up by $
                {earlyBirdFeeIncreasing.increasingFee} on{" "}
                {dayjs
                  .utc(earlyBirdFeeIncreasing.increasingByDate)
                  .format("MMM D, YYYY")}
              </p>
            </>
          )}
          <button className="btn-secondary" onClick={handleRegister}>
            Register Today
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="powerful__block powerful__block_bottom">
      <div>
        <h6 className="powerful__block-caption_2">Limited Time Offer</h6>
        <h5 className="powerful__block-title_5">
          Regular rate: {delfee && <span className="discount">${delfee}</span>}{" "}
          ${fee}
        </h5>
        {!isUsableCreditAvailable && (
          <h5 className="powerful__block-title_5 mb-1">
            Premium/Journey+ rate:{" "}
            {premiumRate &&
              premiumRate.listPrice &&
              premiumRate.listPrice !== premiumRate.unitPrice && (
                <span className="discount">
                  ${delfee || premiumRate.listPrice}
                </span>
              )}{" "}
            ${premiumRate && premiumRate.unitPrice}
          </h5>
        )}
        {roomAndBoardRange && (
          <h5 className="powerful__italic-title_6">
            plus room &amp; board: {roomAndBoardRange}
          </h5>
        )}
        {isUsableCreditAvailable && (
          <div className="credit-text mb-2">
            {usableCredit.message} ${UpdatedFeeAfterCredits}.
          </div>
        )}
      </div>
      <div className="bottom-box">
        {earlyBirdFeeIncreasing && (
          <>
            <img src="/img/ic-timer-orange.svg" alt="timer" />
            <p className="!tw-text-xs">
              Register soon. Course fee will go up by $
              {earlyBirdFeeIncreasing.increasingFee} on{" "}
              {dayjs
                .utc(earlyBirdFeeIncreasing.increasingByDate)
                .format("MMM D, YYYY")}
            </p>
          </>
        )}
        <div className="btn-wrapper">
          <button className="btn-outline" onClick={handleRegister}>
            Join at the full rate
          </button>
          {!isUsableCreditAvailable && (
            <button
              className={`btn-secondary tw-mr-[25px] ${
                earlyBirdFeeIncreasing ? "tw-mt-2" : ""
              }`}
              onClick={purchaseMembershipAction(
                MEMBERSHIP_TYPES.JOURNEY_PLUS.value,
              )}
            >
              Join Journey+
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
