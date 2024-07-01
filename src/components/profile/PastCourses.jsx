/* eslint-disable react/no-unescaped-entities */
import { api } from '@utils';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export const PastCourses = ({ pastCourses = {} }) => {
  const {
    totalCourseCount,
    totalHours,
    totalPlaces,
    pastWorkshops = [],
  } = pastCourses;
  const [currentActiveCourse, setCurrentActiveCourse] = useState(0);

  return (
    <div className="profile-form-box">
      <div className="past-courses-stats">
        <div className="stats-info">
          <div className="number">{totalCourseCount}</div>
          <div className="text">courses you've taken</div>
        </div>
        <div className="stats-info">
          <div className="number">{totalHours}</div>
          <div className="text">hours you spent in meditation</div>
        </div>
        <div className="stats-info">
          <div className="number">{totalPlaces}</div>
          <div className="text">places you've meditated in</div>
        </div>
      </div>
      <div className="courses-history">
        <h2 className="title">History of courses</h2>
        <div className="accordion" id="accordionExample">
          {pastWorkshops.map((workshop, index) => {
            return (
              <div className="history-accordion-item" key={workshop.id}>
                <div className="history-accordion-header">
                  <h2 className="mb-0">
                    <span className="icon-aol iconaol-Tick"></span>
                    <button
                      className={`btn btn-link btn-block text-left ${currentActiveCourse !== index ? 'collapsed' : ''}`}
                      type="button"
                      aria-expanded={currentActiveCourse === index}
                      aria-controls="collapseOne"
                      onClick={setCurrentActiveCourse(index)}
                    >
                      {workshop.title}
                      <span className="icon-aol iconaol-arrow-down"></span>
                    </button>
                  </h2>
                </div>

                <div
                  className={`collapse ${currentActiveCourse === index ? 'show' : ''}`}
                  data-parent="#accordionExample"
                >
                  <div className="history-accordion-body">
                    <div className="course-history-info">
                      <div className="ch-info-pill">
                        <span className="icon-aol iconaol-profile"></span>{' '}
                        Theresa Webb
                      </div>
                      <div className="ch-info-pill">
                        <span className="icon-aol iconaol-sms"></span>{' '}
                        felicia.reid@example.com
                      </div>
                      <div className="ch-info-pill">
                        <span className="icon-aol iconaol-calendar"></span>{' '}
                        04.10.2023 - 07.10.2023
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
