import dayjs from 'dayjs';
import { tConvert } from './tConvert';
import { ABBRS } from '@constants';

export const getCourseDateDisplay = (workshop) => {
  if (
    dayjs
      .utc(workshop.eventStartDate)
      .isSame(dayjs.utc(workshop.eventEndDate), 'month')
  ) {
    return `${dayjs.utc(workshop.eventStartDate).format('M/D/YYYY')} - ${dayjs
      .utc(workshop.eventEndDate)
      .format('M/D/YYYY')}`;
  }
  return `${dayjs.utc(workshop.eventStartDate).format('M/DD/YYYY')} - ${dayjs
    .utc(workshop.eventEndDate)
    .format('M/DD/YYYY')}`;
};

export const getCourseTimeDisplay = (workshop) => {
  let allTimings = [];
  if (workshop.timings) {
    allTimings = workshop.timings.map((time) => {
      return `${dayjs.utc(time.startDate).format('dd')}: ${tConvert(time.startTime)} - ${tConvert(time.endTime)} ${ABBRS[time.timeZone]}`;
    });
  }
  return allTimings.join('<br/> ');
};

export const getInstructorDisplay = (workshop) => {
  const teachers = [];
  if (workshop.primaryTeacherName) {
    teachers.push(workshop.primaryTeacherName);
  }
  if (workshop.coTeacher1Name) {
    teachers.push(workshop.coTeacher1Name);
  }
  if (workshop.coTeacher2Name) {
    teachers.push(workshop.coTeacher2Name);
  }
  return teachers.length > 0 ? teachers.join(', ') : '';
};

export const getCourseLocationDisplay = (workshop) => {
  if (workshop.isLocationEmpty) {
    return `<a
          href="https://www.google.com/maps/search/?api=1&query=${
            workshop.streetAddress1 ? workshop.streetAddress1 + ',' : ''
          },${workshop.streetAddress2 ? workshop.streetAddress2 + ',' : ''} ${workshop.city ? workshop.city + ',' : ''} ${
            workshop.state ? workshop.state + ', ' : ''
          } ${workshop.zip ? workshop.zip + ', ' : ''} ${workshop.country}"
          target="_blank"
          rel="noreferrer"
        >
          ${workshop.streetAddress1 ? workshop.streetAddress1 + ',' : ''}
          ${workshop.streetAddress2 ? workshop.streetAddress2 + ',' : ''}
          ${workshop.city ? workshop.city + ',' : ''}
          ${workshop.state ? workshop.state + ', ' : ''}
          ${workshop.zip ? workshop.zip : ''}
        </a>`;
  } else {
    return `<a
          href="https://www.google.com/maps/search/?api=1&query=${
            workshop.locationStreet ? workshop.locationStreet + ',' : ''
          }, ${workshop.locationCity ? workshop.locationCity + ',' : ''} ${
            workshop.locationProvince ? workshop.locationProvince + ',' : ''
          } ${workshop.locationPostalCode ? workshop.locationPostalCode + ', ' : ''} ${workshop.locationCountry ? workshop.locationCountry : ''}"
          target="_blank"
          rel="noreferrer"
        >
          ${workshop.locationStreet ? workshop.locationStreet + ',' : ''}
          ${workshop.locationCity ? workshop.locationCity + ',' : ''}
          ${workshop.locationProvince ? workshop.locationProvince + ',' : ''}
          ${workshop.locationPostalCode ? workshop.locationPostalCode + ', ' : ''}
        </a>`;
  }
};

export const getContactDisplay = (workshop) => {
  const allContactInfo = [];
  if (workshop.contactName) {
    allContactInfo.push(workshop.contactName);
  }
  if (workshop.phone1) {
    allContactInfo.push(
      `<a href="tel:${workshop.phone1}">${workshop.phone1}</a>`,
    );
  }
  if (workshop.phone2) {
    allContactInfo.push(
      `<a href="tel:${workshop.phone2}">${workshop.phone2}</a>`,
    );
  }
  if (workshop.contactEmail) {
    allContactInfo.push(
      `<a href="mailto:${workshop.contactEmail}">${workshop.contactEmail}</a>`,
    );
  }

  return allContactInfo.length > 0 ? allContactInfo.join('<br/> ') : null;
};
