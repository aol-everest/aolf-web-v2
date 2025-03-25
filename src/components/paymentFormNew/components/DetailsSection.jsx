import React from 'react';
import dayjs from 'dayjs';
import { tConvert } from '@utils';
import LocationDisplay from './LocationDisplay';
import { ABBRS } from '@constants';

const DetailsSection = React.memo(
  ({
    mode,
    workshop,
    eventStartDate,
    eventEndDate,
    timings,
    primaryTeacherName,
    coTeacher1Name,
    coTeacher2Name,
    contactName,
    contactEmail,
    phone1,
    phone2,
  }) => (
    <div className="section-box checkout-details">
      <h2 className="section__title">Details:</h2>
      <div className="section__body">
        <div className="detail-item row">
          <div className="label col-5">
            <svg className="detailsIcon icon-calendar" viewBox="0 0 34 32">
              <path
                fill="none"
                stroke="#9598a6"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeMiterlimit="4"
                strokeWidth="2.4"
                d="M29.556 16c0 7.36-5.973 13.333-13.333 13.333s-13.333-5.973-13.333-13.333c0-7.36 5.973-13.333 13.333-13.333s13.333 5.973 13.333 13.333z"
              ></path>
              <path
                fill="none"
                stroke="#9598a6"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeMiterlimit="4"
                strokeWidth="2.4"
                d="M21.168 20.24l-4.133-2.467c-0.72-0.427-1.307-1.453-1.307-2.293v-5.467"
              ></path>
            </svg>{' '}
            Date:
          </div>
          <div className="value col-7">
            {dayjs
              .utc(eventStartDate)
              .isSame(dayjs.utc(eventEndDate), 'month') &&
              `${dayjs.utc(eventStartDate).format('MMMM DD')}-${dayjs
                .utc(eventEndDate)
                .format('DD, YYYY')}`}

            {!dayjs
              .utc(eventStartDate)
              .isSame(dayjs.utc(eventEndDate), 'month') &&
              `${dayjs.utc(eventStartDate).format('MMM DD')}-${dayjs
                .utc(eventEndDate)
                .format('MMM DD, YYYY')}`}
          </div>
        </div>
        {timings && timings.length > 0 && (
          <div className="detail-item row">
            <div className="label col-5">
              <svg className="detailsIcon icon-calendar" viewBox="0 0 34 32">
                <path
                  fill="none"
                  stroke="#9598a6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeMiterlimit="10"
                  strokeWidth="2.4"
                  d="M10.889 2.667v4"
                ></path>
                <path
                  fill="none"
                  stroke="#9598a6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeMiterlimit="10"
                  strokeWidth="2.4"
                  d="M21.555 2.667v4"
                ></path>
                <path
                  fill="none"
                  stroke="#9598a6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeMiterlimit="10"
                  strokeWidth="2.4"
                  d="M4.889 12.12h22.667"
                ></path>
                <path
                  fill="none"
                  stroke="#9598a6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeMiterlimit="10"
                  strokeWidth="2.4"
                  d="M28.222 11.333v11.333c0 4-2 6.667-6.667 6.667h-10.667c-4.667 0-6.667-2.667-6.667-6.667v-11.333c0-4 2-6.667 6.667-6.667h10.667c4.667 0 6.667 2.667 6.667 6.667z"
                ></path>
                <path
                  fill="none"
                  stroke="#9598a6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeMiterlimit="4"
                  strokeWidth="3.2"
                  d="M21.148 18.267h0.012"
                ></path>
                <path
                  fill="none"
                  stroke="#9598a6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeMiterlimit="4"
                  strokeWidth="3.2"
                  d="M21.148 22.267h0.012"
                ></path>
                <path
                  fill="none"
                  stroke="#9598a6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeMiterlimit="4"
                  strokeWidth="3.2"
                  d="M16.216 18.267h0.012"
                ></path>
                <path
                  fill="none"
                  stroke="#9598a6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeMiterlimit="4"
                  strokeWidth="3.2"
                  d="M16.216 22.267h0.012"
                ></path>
                <path
                  fill="none"
                  stroke="#9598a6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeMiterlimit="4"
                  strokeWidth="3.2"
                  d="M11.281 18.267h0.012"
                ></path>
                <path
                  fill="none"
                  stroke="#9598a6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeMiterlimit="4"
                  strokeWidth="3.2"
                  d="M11.281 22.267h0.012"
                ></path>
              </svg>{' '}
              Timing:
            </div>
            <div className="value col-7">
              {timings &&
                timings.map((time) => {
                  return (
                    <div key={time.startDate}>
                      {dayjs.utc(time.startDate).format('dd')}:{' '}
                      {tConvert(time.startTime)}-{tConvert(time.endTime)}{' '}
                      {ABBRS[time.timeZone]}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
        <div className="detail-item row">
          <div className="label col-5">
            <svg className="detailsIcon icon-calendar" viewBox="0 0 34 32">
              <path
                fill="none"
                stroke="#9598a6"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeMiterlimit="4"
                strokeWidth="2.4"
                d="M16.435 14.493c-0.133-0.013-0.293-0.013-0.44 0-3.173-0.107-5.693-2.707-5.693-5.907 0-3.267 2.64-5.92 5.92-5.92 3.267 0 5.92 2.653 5.92 5.92-0.013 3.2-2.533 5.8-5.707 5.907z"
              ></path>
              <path
                fill="none"
                stroke="#9598a6"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeMiterlimit="4"
                strokeWidth="2.4"
                d="M9.768 19.413c-3.227 2.16-3.227 5.68 0 7.827 3.667 2.453 9.68 2.453 13.347 0 3.227-2.16 3.227-5.68 0-7.827-3.653-2.44-9.667-2.44-13.347 0z"
              ></path>
            </svg>{' '}
            Instructor(s):
          </div>
          <div className="value col-7">
            {primaryTeacherName}
            {coTeacher1Name && <div>{coTeacher1Name}</div>}
            {coTeacher2Name && <div>{coTeacher2Name}</div>}
          </div>
        </div>
        <div className="detail-item row">
          <div className="label col-5">
            <svg className="detailsIcon icon-calendar" viewBox="0 0 34 32">
              <path
                fill="none"
                stroke="#9598a6"
                strokeLinejoin="miter"
                strokeLinecap="butt"
                strokeMiterlimit="4"
                strokeWidth="2.4"
                d="M16.223 17.907c2.297 0 4.16-1.863 4.16-4.16s-1.863-4.16-4.16-4.16c-2.298 0-4.16 1.863-4.16 4.16s1.863 4.16 4.16 4.16z"
              ></path>
              <path
                fill="none"
                stroke="#9598a6"
                strokeLinejoin="miter"
                strokeLinecap="butt"
                strokeMiterlimit="4"
                strokeWidth="2.4"
                d="M5.049 11.32c2.627-11.547 19.733-11.533 22.347 0.013 1.533 6.773-2.68 12.507-6.373 16.053-2.68 2.587-6.92 2.587-9.613 0-3.68-3.547-7.893-9.293-6.36-16.067z"
              ></path>
            </svg>{' '}
            Location:
          </div>
          <div className="value col-7">
            <LocationDisplay mode={mode} workshop={workshop} />
          </div>
        </div>
        <div className="detail-item row">
          <div className="label col-5">
            <svg className="detailsIcon icon-calendar" viewBox="0 0 34 32">
              <path
                fill="none"
                stroke="#9598a6"
                strokeLinejoin="miter"
                strokeLinecap="butt"
                strokeMiterlimit="10"
                strokeWidth="2.4"
                d="M29.516 24.44c0 0.48-0.107 0.973-0.333 1.453s-0.52 0.933-0.907 1.36c-0.653 0.72-1.373 1.24-2.187 1.573-0.8 0.333-1.667 0.507-2.6 0.507-1.36 0-2.813-0.32-4.347-0.973s-3.067-1.533-4.587-2.64c-1.533-1.12-2.987-2.36-4.373-3.733-1.373-1.387-2.613-2.84-3.72-4.36-1.093-1.52-1.973-3.040-2.613-4.547-0.64-1.52-0.96-2.973-0.96-4.36 0-0.907 0.16-1.773 0.48-2.573 0.32-0.813 0.827-1.56 1.533-2.227 0.853-0.84 1.787-1.253 2.773-1.253 0.373 0 0.747 0.080 1.080 0.24 0.347 0.16 0.653 0.4 0.893 0.747l3.093 4.36c0.24 0.333 0.413 0.64 0.533 0.933 0.12 0.28 0.187 0.56 0.187 0.813 0 0.32-0.093 0.64-0.28 0.947-0.173 0.307-0.427 0.627-0.747 0.947l-1.013 1.053c-0.147 0.147-0.213 0.32-0.213 0.533 0 0.107 0.013 0.2 0.040 0.307 0.040 0.107 0.080 0.187 0.107 0.267 0.24 0.44 0.653 1.013 1.24 1.707 0.6 0.693 1.24 1.4 1.933 2.107 0.72 0.707 1.413 1.36 2.12 1.96 0.693 0.587 1.267 0.987 1.72 1.227 0.067 0.027 0.147 0.067 0.24 0.107 0.107 0.040 0.213 0.053 0.333 0.053 0.227 0 0.4-0.080 0.547-0.227l1.013-1c0.333-0.333 0.653-0.587 0.96-0.747 0.307-0.187 0.613-0.28 0.947-0.28 0.253 0 0.52 0.053 0.813 0.173s0.6 0.293 0.933 0.52l4.413 3.133c0.347 0.24 0.587 0.52 0.733 0.853 0.133 0.333 0.213 0.667 0.213 1.040z"
              ></path>
            </svg>{' '}
            Contact Details:
          </div>
          <div className="value col-7">
            {contactName && <div>{contactName}</div>}
            {contactEmail && (
              <div>
                <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
              </div>
            )}
            {phone1 && (
              <div>
                <a href={`tel:${phone1}`}>{phone1}</a>
              </div>
            )}
            {phone2 && (
              <div>
                <a href={`tel:${phone2}`}>{phone2}</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ),
);

DetailsSection.displayName = 'DetailsSection';

export default DetailsSection;
