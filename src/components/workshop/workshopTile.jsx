import React from "react";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useGlobalModalContext, useGlobalAlertContext } from "@contexts";
import { MODAL_TYPES, ALERT_TYPES, ABBRS } from "@constants";

export const WorkshopTile = ({ data, authenticated }) => {
  const router = useRouter();
  const { showModal } = useGlobalModalContext();
  const { showAlert } = useGlobalAlertContext();
  const {
    title,
    coverImage,
    accessible,
    city,
    state,
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

  const enrollAction = (workshopId) => () => {
    if (authenticated) {
      router.push(`/checkout/${workshopId}`);
    } else {
      showModal(MODAL_TYPES.LOGIN_MODAL, {
        navigateTo: `/checkout/${workshopId}`,
      });
    }

    // showAlert(ALERT_TYPES.SUCCESS_ALERT, { title: "Success" });
  };

  return (
    <div className="col-6 col-lg-3 col-md-4">
      <div
        className="upcoming_course_card meetup_course_card"
        data-full={isEventFull}
        data-complete={isPurchased}
      >
        {`${process.env.NEXT_PUBLIC_SILENT_RETREAT_CTYPE}`.indexOf(
          productTypeId,
        ) >= 0 && <Image src="/img/course-card-4.png" alt="bg" layout="fill" />}
        {`${process.env.NEXT_PUBLIC_SKY_BREATH_MEDITATION_CTYPE}`.indexOf(
          productTypeId,
        ) >= 0 && <Image src="/img/course-card-2.png" alt="bg" layout="fill" />}
        {`${process.env.NEXT_PUBLIC_SAHAJ_SAMADHI_CTYPE}`.indexOf(
          productTypeId,
        ) >= 0 && <Image src="/img/course-card-5.png" alt="bg" layout="fill" />}
        {`${process.env.NEXT_PUBLIC_SILENT_RETREAT_CTYPE}`.indexOf(
          productTypeId,
        ) < 0 &&
          `${process.env.NEXT_PUBLIC_SKY_BREATH_MEDITATION_CTYPE}`.indexOf(
            productTypeId,
          ) < 0 &&
          `${process.env.NEXT_PUBLIC_SAHAJ_SAMADHI_CTYPE}`.indexOf(
            productTypeId,
          ) < 0 && (
            <Image src="/img/course-card-1.png" alt="bg" layout="fill" />
          )}
        <div className="parentData">
          {moment
            .utc(eventStartDate)
            .isSame(moment.utc(eventEndDate), "month") && (
            <div className="course_data">
              {`${moment.utc(eventStartDate).format("MMMM DD")}-${moment
                .utc(eventEndDate)
                .format("DD, YYYY")}`}
            </div>
          )}
          {!moment
            .utc(eventStartDate)
            .isSame(moment.utc(eventEndDate), "month") && (
            <div className="course_data">
              {`${moment.utc(eventStartDate).format("MMMM DD")}-${moment
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
        <div className="course_detail_box d-none d-lg-block">
          <div className="course_detail_btn_box">
            <a
              className="btn btn_box_primary text-center"
              onClick={enrollAction(sfid)}
            >
              Enroll
            </a>
            <Link href={`/workshop/${sfid}`}>
              <a className="btn btn-box-light text-center">Details</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
