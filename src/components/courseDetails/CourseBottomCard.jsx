import React, { useState } from "react";
import classNames from "classnames";
import moment from "moment";
import { Link } from "react-scroll";

export const CourseBottomCard = ({ workshop }) => {
  const { title, eventStartDate, eventEndDate } = workshop || {};
  return (
    <div className={classNames("course-bottom-card show")}>
      <div className="container">
        <div className="course-bottom-card__container">
          <div className="course-bottom-card__info-block">
            <div className="course-bottom-card__img d-none d-lg-block">
              <img src="/img/rectangle.png" alt="img" />
            </div>
            <div className="course-bottom-card__info">
              <p>{`${moment.utc(eventStartDate).format("MMMM DD")}-${moment
                .utc(eventEndDate)
                .format("DD, YYYY")}`}</p>
              <div>
                <h6 className="course-bottom-card__info-course-name">
                  {title}
                </h6>
              </div>
            </div>
          </div>
          <Link
            activeClassName="active"
            className="btn-secondary"
            to="registerNowBlock"
            spy={true}
            smooth={true}
            duration={500}
            offset={0}
          >
            Register Today
          </Link>
        </div>
      </div>
    </div>
  );
};
