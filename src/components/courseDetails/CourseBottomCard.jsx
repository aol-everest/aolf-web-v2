import React, { useState } from "react";
import classNames from "classnames";

export const CourseBottomCard = ({ workshop }) => {
  return (
    <div className={classNames("course-bottom-card show")}>
      <div className="container">
        <div className="course-bottom-card__container">
          <div className="course-bottom-card__info-block">
            <div className="course-bottom-card__img d-none d-lg-block">
              <img src="/img/rectangle.png" alt="img" />
            </div>
            <div className="course-bottom-card__info">
              <p>May 5-7, 2020</p>
              <div>
                <h6 className="course-bottom-card__info-course-name">
                  SKY Breath Meditation
                </h6>
                <ul>
                  <li>
                    <b>limited offer $190</b>{" "}
                    <span className="discount">$395</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <button id="register-button-2" className="btn-secondary">
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
};
