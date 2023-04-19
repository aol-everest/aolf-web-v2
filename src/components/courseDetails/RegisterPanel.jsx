import React, { useState } from "react";
import classNames from "classnames";
import { priceCalculation } from "@utils";
import { useRouter } from "next/router";
import { isEmpty } from "@utils";
import { useAuth } from "@contexts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useGlobalModalContext } from "@contexts";
import { MEMBERSHIP_TYPES, COURSE_TYPES, MODAL_TYPES } from "@constants";
import { pushRouteWithUTMQuery } from "@service";

dayjs.extend(utc);

export const RegisterPanel = ({ workshop }) => {
  const { authenticated = false, user } = useAuth();
  const { showModal } = useGlobalModalContext();
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
    studentPriceBook,
    preRequisite,
    earlyBirdPriceBook,
    repeaterPriceBook,
    standardPriceBook,
    aosCountRequisite,
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
  const isVolunteerTrainingProgram =
    COURSE_TYPES.VOLUNTEER_TRAINING_PROGRAM.value.indexOf(
      workshop.productTypeId,
    ) >= 0;
  const isSKYCampusHappinessRetreat =
    COURSE_TYPES.SKY_CAMPUS_HAPPINESS_RETREAT.value.indexOf(
      workshop.productTypeId,
    ) >= 0;
  const isSanyamCourse =
    COURSE_TYPES.SANYAM_COURSE.value.indexOf(workshop.productTypeId) >= 0;
  const isBlessingsCourse =
    COURSE_TYPES.BLESSINGS_COURSE.value.indexOf(workshop.productTypeId) >= 0;

  const handleRegister = (e) => {
    e.preventDefault();
    if (authenticated) {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course/checkout/${sfid}`,
        query: {
          ctype: productTypeId,
          page: "c-o",
        },
      });
    } else {
      showModal(MODAL_TYPES.LOGIN_MODAL, {
        navigateTo: `/us-en/course/checkout/${sfid}?ctype=${productTypeId}&page=c-o`,
        defaultView: "SIGNUP_MODE",
      });
    }
  };

  const purchaseMembershipAction = (id) => (e) => {
    if (e) e.preventDefault();
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/membership/${id}`,
      query: { cid: sfid, page: "detail" },
    });
  };

  const { subscriptions = [], isStudentVerified } = user?.profile || {};
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

  const aosCount =
    aosCountRequisite != null && aosCountRequisite > 1 ? aosCountRequisite : "";

  const preRequisiteCondition = preRequisite
    .join(", ")
    .replace(/,(?=[^,]+$)/, " and")
    .replace("Silent Retreat", `${aosCount} Silent Retreat`);

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
        <div
          className={classNames("bottom-box justify-content-md-center", {
            "!tw-ml-0": !preRequisiteCondition,
          })}
        >
          <div class="tw-flex tw-flex-col tw-justify-start !tw-ml-0">
            {preRequisiteCondition && preRequisiteCondition.length > 0 && (
              <p class="!tw-ml-0 !tw-mt-1 !tw-text-sm">
                Eligibility: Completion of {preRequisiteCondition}
              </p>
            )}
          </div>
          <button
            className={classNames("btn-secondary v2", {
              "max-[770px]:tw-mt-[10px]": preRequisiteCondition,
            })}
            onClick={handleRegister}
          >
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
          {delfee && (
            <p>
              Regular course fee: <span className="discount"> ${delfee} </span>
            </p>
          )}
        </div>
        <div
          className={classNames("bottom-box justify-content-md-center", {
            "!tw-ml-0": !preRequisiteCondition,
          })}
        >
          <div class="tw-flex tw-flex-col tw-justify-start !tw-ml-0">
            {preRequisiteCondition && preRequisiteCondition.length > 0 && (
              <p class="!tw-ml-0 !tw-mt-1 !tw-text-sm">
                Eligibility: Completion of {preRequisiteCondition}
              </p>
            )}
          </div>
          <button
            className={classNames("btn-secondary v2", {
              "max-[770px]:tw-mt-[10px]": preRequisiteCondition,
            })}
            onClick={handleRegister}
          >
            Register Today
          </button>
        </div>
      </div>
    );
  }
  if (isSKYCampusHappinessRetreat) {
    return (
      <div className="powerful__block powerful__block_bottom">
        <div>
          <h3 className="tw-pt-[20px]">Limited Time Offer</h3>
          {!isStudentVerified ? (
            <h2>
              Student fee: $
              {studentPriceBook?.unitPrice != null
                ? studentPriceBook?.unitPrice
                : fee}
            </h2>
          ) : (
            <h2>
              {title}: ${fee}
            </h2>
          )}
          {!isStudentVerified &&
            repeaterPriceBook &&
            repeaterPriceBook.unitPrice != null && (
              <h2>Repeater fee: ${repeaterPriceBook.unitPrice}</h2>
            )}
          {!isStudentVerified &&
            earlyBirdPriceBook &&
            earlyBirdPriceBook.unitPrice != null && (
              <h2>Early Bird fee: ${earlyBirdPriceBook?.unitPrice}</h2>
            )}
          {(delfee ||
            (standardPriceBook && standardPriceBook.unitPrice != null)) && (
            <p>
              Regular course fee:{" "}
              <span>
                $
                {standardPriceBook && standardPriceBook.unitPrice != null
                  ? standardPriceBook.unitPrice
                  : delfee}
              </span>
            </p>
          )}
          {!isStudentVerified && (
            <h3 class="!tw-normal-case">
              *Verify your student status with your .edu email ID
            </h3>
          )}
        </div>
        <div
          className={classNames("bottom-box justify-content-md-center", {
            "!tw-ml-0": !preRequisiteCondition,
          })}
        >
          <div class="tw-flex tw-flex-col tw-justify-start !tw-ml-0">
            {preRequisiteCondition && preRequisiteCondition.length > 0 && (
              <p class="!tw-ml-0 !tw-mt-1 !tw-text-sm">
                Eligibility: Completion of {preRequisiteCondition}
              </p>
            )}
          </div>
          <button
            className={classNames("btn-secondary v2", {
              "max-[770px]:tw-mt-[10px]": preRequisiteCondition,
            })}
            onClick={handleRegister}
          >
            Register Today
          </button>
        </div>
      </div>
    );
  }
  if (isSanyamCourse) {
    return (
      <div class="offer__container container_md">
        <div class="offer__banner offer__banner--sanyam-bg banner-offer">
          <h5 class="banner-offer__title meditation-title_blue">
            <span class="meditation-title_blue--block">
              Eligibility: {preRequisiteCondition}{" "}
            </span>
            are prerequisites to enroll in the Sanyam Course.
          </h5>

          <div class="banner-offer__price block-title">
            Sanyam Course: ${fee}
          </div>

          <div class="banner-offer__discount">
            Regular course cost: <span>${delfee}</span>
          </div>

          <button
            class="banner-offer__register sky-button btn-secondary"
            onClick={handleRegister}
          >
            Register Now
          </button>
        </div>
      </div>
    );
  }

  if (isVolunteerTrainingProgram || isBlessingsCourse) {
    return (
      <div className="powerful__block powerful__block_bottom">
        {isVolunteerTrainingProgram && (
          <div class="powerful__block-titles !tw-py-[20px]">
            <h6 className="caption caption_sm powerful__block-caption">
              Make a difference
            </h6>
          </div>
        )}
        <div>
          <h3>Limited Time Offer</h3>
          <h2>
            {title}: ${fee}
          </h2>
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
            "!tw-ml-0": !earlyBirdFeeIncreasing && !preRequisiteCondition,
          })}
        >
          <div class="tw-flex tw-flex-col tw-justify-start !tw-ml-0">
            {earlyBirdFeeIncreasing ? (
              <div class="tw-flex !tw-ml-0">
                <img src="/img/ic-timer-orange.svg" alt="timer" />
                <p>
                  Register soon. Course fee will go up by $
                  {earlyBirdFeeIncreasing.increasingFee} on{" "}
                  {dayjs
                    .utc(earlyBirdFeeIncreasing.increasingByDate)
                    .format("MMM D, YYYY")}
                </p>
              </div>
            ) : (
              <div />
            )}
            {preRequisiteCondition && preRequisiteCondition.length > 0 && (
              <p class="!tw-ml-0 !tw-mt-1 !tw-text-sm">
                Eligibility: Completion of {preRequisiteCondition}
              </p>
            )}
          </div>
          <button
            className={classNames("btn-secondary", {
              "max-[770px]:tw-mt-[10px]": preRequisiteCondition,
            })}
            onClick={handleRegister}
          >
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
          {premiumRate && premiumRate.unitPrice != null && (
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
        <div
          className={classNames("bottom-box", {
            "justify-content-md-center": !earlyBirdFeeIncreasing,
            "!tw-ml-0": !earlyBirdFeeIncreasing && !preRequisiteCondition,
          })}
        >
          <div class="tw-flex tw-flex-col tw-justify-start !tw-ml-0">
            {earlyBirdFeeIncreasing ? (
              <div class="tw-flex !tw-ml-0">
                <img src="/img/ic-timer-orange.svg" alt="timer" />
                <p>
                  Register soon. Course fee will go up by $
                  {earlyBirdFeeIncreasing.increasingFee} on{" "}
                  {dayjs
                    .utc(earlyBirdFeeIncreasing.increasingByDate)
                    .format("MMM D, YYYY")}
                </p>
              </div>
            ) : (
              <div />
            )}
            {preRequisiteCondition && preRequisiteCondition.length > 0 && (
              <p class="!tw-ml-0 !tw-mt-1 !tw-text-sm">
                Eligibility: Completion of {preRequisiteCondition}
              </p>
            )}
          </div>
          <button
            className={classNames("btn-secondary", {
              "max-[770px]:tw-mt-[10px]":
                earlyBirdFeeIncreasing || preRequisiteCondition,
            })}
            onClick={handleRegister}
          >
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
        {!isUsableCreditAvailable &&
          premiumRate &&
          premiumRate.unitPrice != null && (
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
      <div
        className={classNames("bottom-box", {
          "justify-content-md-center": !earlyBirdFeeIncreasing,
          "!tw-ml-0": !earlyBirdFeeIncreasing && !preRequisiteCondition,
        })}
      >
        <div class="tw-flex tw-flex-col tw-justify-start !tw-ml-0">
          {earlyBirdFeeIncreasing ? (
            <div class="tw-flex !tw-ml-0">
              <img src="/img/ic-timer-orange.svg" alt="timer" />
              <p class="!tw-mt-1 !tw-text-sm">
                Register soon. Course fee will go up by $
                {earlyBirdFeeIncreasing.increasingFee} on{" "}
                {dayjs
                  .utc(earlyBirdFeeIncreasing.increasingByDate)
                  .format("MMM D, YYYY")}
              </p>
            </div>
          ) : (
            <div />
          )}
          {preRequisiteCondition && preRequisiteCondition.length > 0 && (
            <p class="!tw-ml-0 !tw-mt-1 !tw-text-sm">
              Eligibility: Completion of {preRequisiteCondition}
            </p>
          )}
        </div>
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
