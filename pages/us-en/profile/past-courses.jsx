/* eslint-disable react/no-unescaped-entities */
import React from 'react';
// import dynamic from 'next/dynamic';
import withUserInfo from '../../../src/hoc/withUserInfo';

// const PastCoursesComp = dynamic(() =>
//   import('@components/profile').then((mod) => mod.PastCourses),
// );

const PastCourses = () => {
  return (
    <div>
      {/* <PastCourses /> */}
      <div className="profile-form-box">
        <div className="past-courses-stats">
          <div className="stats-info">
            <div className="number">12</div>
            <div className="text">courses you've taken</div>
          </div>
          <div className="stats-info">
            <div className="number">234</div>
            <div className="text">hours you spent in meditation</div>
          </div>
          <div className="stats-info">
            <div className="number">11</div>
            <div className="text">places you've meditated in</div>
          </div>
        </div>
        <div className="courses-history">
          <h2 className="title">History of courses</h2>
          <div className="accordion" id="accordionExample">
            <div className="history-accordion-item">
              <div className="history-accordion-header" id="headingOne">
                <h2 className="mb-0">
                  <span className="icon-aol iconaol-Tick"></span>
                  <button
                    className="btn btn-link btn-block text-left"
                    type="button"
                    data-toggle="collapse"
                    data-target="#collapseOne"
                    aria-expanded="true"
                    aria-controls="collapseOne"
                  >
                    Art of Living Part 1
                    <span className="icon-aol iconaol-arrow-down"></span>
                  </button>
                </h2>
              </div>

              <div
                id="collapseOne"
                className="collapse show"
                aria-labelledby="headingOne"
                data-parent="#accordionExample"
              >
                <div className="history-accordion-body">
                  <div className="course-history-info">
                    <div className="ch-info-pill">
                      <span className="icon-aol iconaol-profile"></span> Theresa
                      Webb
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
            <div className="history-accordion-item">
              <div className="history-accordion-header" id="headingTwo">
                <h2 className="mb-0">
                  <span className="icon-aol iconaol-Tick"></span>
                  <button
                    className="btn btn-link btn-block text-left collapsed"
                    type="button"
                    data-toggle="collapse"
                    data-target="#collapseTwo"
                    aria-expanded="false"
                    aria-controls="collapseTwo"
                  >
                    Art of Living Part 1
                    <span className="icon-aol iconaol-arrow-down"></span>
                  </button>
                </h2>
              </div>
              <div
                id="collapseTwo"
                className="collapse"
                aria-labelledby="headingTwo"
                data-parent="#accordionExample"
              >
                <div className="history-accordion-body">
                  <div className="course-history-info">
                    <div className="ch-info-pill">
                      <span className="icon-aol iconaol-profile"></span> Theresa
                      Webb
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
            <div className="history-accordion-item">
              <div className="history-accordion-header" id="headingThree">
                <h2 className="mb-0">
                  <span className="icon-aol iconaol-Tick"></span>
                  <button
                    className="btn btn-link btn-block text-left collapsed"
                    type="button"
                    data-toggle="collapse"
                    data-target="#collapseThree"
                    aria-expanded="false"
                    aria-controls="collapseThree"
                  >
                    Art of Living Part 1
                    <span className="icon-aol iconaol-arrow-down"></span>
                  </button>
                </h2>
              </div>
              <div
                id="collapseThree"
                className="collapse"
                aria-labelledby="headingThree"
                data-parent="#accordionExample"
              >
                <div className="history-accordion-body">
                  <div className="course-history-info">
                    <div className="ch-info-pill">
                      <span className="icon-aol iconaol-profile"></span> Theresa
                      Webb
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
            <div className="history-accordion-item">
              <div className="history-accordion-header" id="headingFour">
                <h2 className="mb-0">
                  <span className="icon-aol iconaol-Tick"></span>
                  <button
                    className="btn btn-link btn-block text-left collapsed"
                    type="button"
                    data-toggle="collapse"
                    data-target="#collapseFour"
                    aria-expanded="false"
                    aria-controls="collapseFour"
                  >
                    Art of Living Part 1
                    <span className="icon-aol iconaol-arrow-down"></span>
                  </button>
                </h2>
              </div>
              <div
                id="collapseFour"
                className="collapse"
                aria-labelledby="headingFour"
                data-parent="#accordionExample"
              >
                <div className="history-accordion-body">
                  <div className="course-history-info">
                    <div className="ch-info-pill">
                      <span className="icon-aol iconaol-profile"></span> Theresa
                      Webb
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
            <div className="history-accordion-item active">
              <div className="history-accordion-header" id="headingFive">
                <h2 className="mb-0">
                  <span className="icon-aol iconaol-Tick"></span>
                  <button
                    className="btn btn-link btn-block text-left collapsed"
                    type="button"
                    data-toggle="collapse"
                    data-target="#collapseFive"
                    aria-expanded="false"
                    aria-controls="collapseFive"
                  >
                    Art of Living Part 1
                    <span className="icon-aol iconaol-arrow-down"></span>
                  </button>
                </h2>
              </div>
              <div
                id="collapseFive"
                className="collapse"
                aria-labelledby="headingFive"
                data-parent="#accordionExample"
              >
                <div className="history-accordion-body">
                  <div className="course-history-info">
                    <div className="ch-info-pill">
                      <span className="icon-aol iconaol-profile"></span> Theresa
                      Webb
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default withUserInfo(PastCourses);
