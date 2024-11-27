/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Accordion, Button } from 'react-bootstrap';
import { COURSE_TYPES } from '@constants';
import classNames from 'classnames';
dayjs.extend(utc);

function groupDataByCourseType(data, courseTypes) {
  // Transform the COURSE_TYPES object into an array in the same order
  const courseTypesArray = Object.entries(courseTypes).map(([key, value]) => ({
    key,
    ...value,
    events: [],
  }));

  // Iterate over the data and assign each event to the correct course type
  data.forEach((event) => {
    const matchedCourseType = courseTypesArray.find((course) =>
      course.value.split(';').includes(event.productTypeId),
    );

    if (matchedCourseType) {
      matchedCourseType.events.push(event);
    }
  });

  // Filter out course types with no events, sort events by eventStartDate, and map to desired structure
  return courseTypesArray
    .filter((course) => course.events.length > 0) // Remove empty courses
    .map((course) => ({
      slug: course.slug,
      name: course.name,
      description: course.description,
      events: course.events.sort(
        (a, b) => new Date(a.eventStartDate) - new Date(b.eventStartDate),
      ),
    }));
}

const EventTile = ({ event, index }) => {
  const getCourseDeration = () => {
    if (
      dayjs
        .utc(event.eventStartDate)
        .isSame(dayjs.utc(event.eventEndDate), 'day')
    ) {
      return (
        <>{`${dayjs.utc(event.eventStartDate).format('MMMM DD, YYYY')}`}</>
      );
    }
    if (
      dayjs
        .utc(event.eventStartDate)
        .isSame(dayjs.utc(event.eventEndDate), 'month')
    ) {
      return (
        <>
          {`${dayjs.utc(event.eventStartDate).format('MMMM DD')}-${dayjs
            .utc(event.eventEndDate)
            .format('DD, YYYY')}`}
        </>
      );
    }
    return (
      <>
        {`${dayjs.utc(event.eventStartDate).format('MMMM DD')}-${dayjs
          .utc(event.eventEndDate)
          .format('MMMM DD, YYYY')}`}
      </>
    );
  };
  return (
    <div class="course-list-item" key={event.sfid}>
      <div class="course-number">{index + 1}</div>
      <div class="course-info">
        <div class="course-date">{getCourseDeration()}</div>
        <div class="course-teachers">
          {[
            event.primaryTeacherName,
            event.coTeacher1Name,
            event.coTeacher2Name,
          ]
            .filter(Boolean)
            .join(', ')}
        </div>
      </div>
    </div>
  );
};

export const PastCourses = ({ pastCourses = {} }) => {
  const [activeKey, setActiveKey] = useState(null);
  const {
    totalCourseCount,
    totalHours,
    totalPlaces,
    pastWorkshops = [],
  } = pastCourses;

  const groupedCourses = groupDataByCourseType(pastWorkshops, COURSE_TYPES);

  const [firstGroup] = groupedCourses;
  const { slug = '' } = firstGroup || {};
  const handleToggle = (key) => {
    setActiveKey(activeKey === key ? null : key);
  };

  return (
    groupedCourses &&
    groupedCourses.length > 0 && (
      <Accordion
        className="accordion accordion--past-courses"
        defaultActiveKey={`${slug}`}
      >
        {groupedCourses.map((group) => {
          return (
            <div class="past-accordion-item" key={group.slug}>
              <div class="past-accordion-header">
                <h2 class="mb-0">
                  <Accordion.Toggle
                    as={Button}
                    className="btn-block text-left"
                    variant="link"
                    eventKey={group.slug}
                    aria-expanded={group.slug === activeKey}
                    onClick={() => handleToggle(group.slug)}
                  >
                    <div class="course-head">
                      <div class="course-heading">{group.name}</div>
                      <div class="course-count">
                        {group.events.length} courses
                      </div>
                    </div>
                    <span class="icon-aol iconaol-arrow-left"></span>
                  </Accordion.Toggle>
                </h2>
              </div>

              <Accordion.Collapse eventKey={group.slug}>
                <div class="course-listing">
                  {group.events.map((event, index) => {
                    return (
                      <EventTile event={event} index={index} key={event.sfid} />
                    );
                  })}
                </div>
              </Accordion.Collapse>
            </div>
          );
        })}
      </Accordion>
    )
  );
};
