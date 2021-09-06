import React from "react";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";

const ABBRS = {
  null: "",
  EST: "ET",
  EDT: "ET",
  CST: "CT",
  CDT: "CT",
  MST: "MT",
  MDT: "MT",
  PST: "PT",
  PDT: "PT",
  HST: "HT",
  HDT: "HT",
};

export const MeetupTile = ({ data }) => {
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
  return (
    <div className="col-6 col-lg-3 col-md-4">
      <div
        className="upcoming_course_card"
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
            <Link href={`/meetup/${sfid}`}>
              <a
                className="btn btn_box_primary text-center"
                data-toggle="modal"
                data-target="#modal_v2"
              >
                Enroll
              </a>
            </Link>
            <a className="btn btn-box-light text-center d-none" href="#">
              Details
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
