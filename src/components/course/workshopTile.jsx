import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useGlobalModalContext } from "@contexts";
import { MODAL_TYPES, ABBRS, COURSE_TYPES } from "@constants";
import classNames from "classnames";

dayjs.extend(utc);

export const WorkshopTile = ({ data, authenticated }) => {
  const router = useRouter();
  const { showModal } = useGlobalModalContext();
  const {
    title,
    mode,
    isPurchased,
    isEventFull,
    primaryTeacherName,
    productTypeId,
    eventStartDate,
    eventEndDate,
    eventTimeZone,
    sfid,
  } = data || {};

  const enrollAction = (workshopId, productTypeId) => () => {
    if (authenticated) {
      router.push({
        pathname: `/us/course/checkout/${workshopId}`,
        query: {
          ctype: productTypeId,
        },
      });
    } else {
      showModal(MODAL_TYPES.LOGIN_MODAL, {
        navigateTo: `/us/course/checkout/${workshopId}?ctype=${productTypeId}`,
      });
    }

    // showAlert(ALERT_TYPES.SUCCESS_ALERT, { title: "Success" });
  };

  const isNonGenericWorkshop =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(productTypeId) >= 0 ||
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(productTypeId) >= 0 ||
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(productTypeId) >= 0 ||
    COURSE_TYPES.SRI_SRI_YOGA_MEDITATION.value.indexOf(productTypeId) >= 0 ||
    COURSE_TYPES.VOLUNTEER_TRAINING_PROGRAM.value.indexOf(productTypeId) >= 0;

  const detailAction = (workshopId, productTypeId) => () => {
    if (isNonGenericWorkshop) {
      router.push({
        pathname: `/us/course/${workshopId}`,
      });
    } else if (authenticated) {
      router.push({
        pathname: `/us/course/generic-checkout/${workshopId}`,
        query: {
          ctype: productTypeId,
        },
      });
    } else {
      showModal(MODAL_TYPES.LOGIN_MODAL, {
        navigateTo: `/us/course/generic-checkout/${workshopId}?ctype=${productTypeId}`,
      });
    }
  };

  const isSKYType =
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(data.productTypeId) >= 0;
  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(data.productTypeId) >= 0;
  const isSahajSamadhiMeditationType =
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(data.productTypeId) >=
    0;

  return (
    <div className="col-6 col-lg-3 col-md-4">
      <div
        className="upcoming_course_card meetup_course_card"
        data-full={isEventFull}
        data-complete={isPurchased}
      >
        {isSilentRetreatType && (
          <Image src="/img/course-card-4.png" alt="bg" layout="fill" />
        )}
        {isSKYType && (
          <Image src="/img/course-card-2.png" alt="bg" layout="fill" />
        )}
        {isSahajSamadhiMeditationType && (
          <Image src="/img/course-card-5.png" alt="bg" layout="fill" />
        )}
        {!isSilentRetreatType &&
          !isSKYType &&
          !isSahajSamadhiMeditationType && (
            <Image src="/img/course-card-1.png" alt="bg" layout="fill" />
          )}
        <div className="parentData">
          {dayjs
            .utc(eventStartDate)
            .isSame(dayjs.utc(eventEndDate), "month") && (
            <div className="course_data">
              {`${dayjs.utc(eventStartDate).format("MMMM DD")}-${dayjs
                .utc(eventEndDate)
                .format("DD, YYYY")}`}
            </div>
          )}
          {!dayjs
            .utc(eventStartDate)
            .isSame(dayjs.utc(eventEndDate), "month") && (
            <div className="course_data">
              {`${dayjs.utc(eventStartDate).format("MMMM DD")}-${dayjs
                .utc(eventEndDate)
                .format("MMMM DD, YYYY")}`}
            </div>
          )}
          <div className="course_timezone">{ABBRS[eventTimeZone]}</div>
        </div>
        <div className="course_info">
          <div className="course_status">{mode}</div>
          <div className="course_name">{title}</div>
          <div className="course_place">{primaryTeacherName}</div>
        </div>
        <div className="course_complete">Course full</div>
        <div className="course_complete_registration">already registered</div>
        <div
          className={classNames("course_detail_box", {
            "d-none": isPurchased || isEventFull,
          })}
        >
          <div className="course_detail_btn_box">
            <button
              className="btn btn_box_primary text-center"
              onClick={enrollAction(sfid, productTypeId)}
            >
              Enroll
            </button>
            <button
              className="btn btn-box-light text-center"
              onClick={detailAction(sfid, productTypeId)}
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
