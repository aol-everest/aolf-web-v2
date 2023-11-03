import { COURSE_TYPES, WORKSHOP_MODE } from '@constants';
import classNames from 'classnames';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Link } from 'react-scroll';

dayjs.extend(utc);

export const CourseBottomCard = ({
  workshop,
  onRegister = null,
  courseViewMode,
}) => {
  const { title, eventStartDate, eventEndDate, productTypeId } = workshop || {};

  const isSKYType =
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(productTypeId) >= 0;
  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(productTypeId) >= 0;
  const isSahajSamadhiMeditationType =
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(productTypeId) >= 0;
  return (
    <div className={classNames('course-bottom-card show')}>
      <div className="container">
        <div className="course-bottom-card__container">
          <div className="course-bottom-card__info-block">
            <div className="course-bottom-card__img d-none d-lg-block tw-relative tw-h-[60px] tw-max-w-[60px]">
              {isSilentRetreatType && (
                <img
                  src="/img/course-card-4.png"
                  alt="course-photo"
                  layout="fill"
                />
              )}
              {isSKYType && (
                <img
                  src="/img/course-card-2.png"
                  alt="course-photo"
                  layout="fill"
                />
              )}
              {isSahajSamadhiMeditationType && (
                <img
                  src="/img/course-card-5.png"
                  alt="course-photo"
                  layout="fill"
                />
              )}
              {!isSilentRetreatType &&
                !isSKYType &&
                !isSahajSamadhiMeditationType && (
                  <img
                    src="/img/course-card-1.png"
                    alt="course-photo"
                    layout="fill"
                  />
                )}
              <img src="/img/rectangle.png" alt="img" />
            </div>
            <div className="course-bottom-card__info">
              <p>{`${dayjs.utc(eventStartDate).format('MMMM DD')}-${dayjs
                .utc(eventEndDate)
                .format('DD, YYYY')}`}</p>
              <div>
                <h6 className="course-bottom-card__info-course-name">
                  {title}
                </h6>
              </div>
            </div>
          </div>
          {courseViewMode !== WORKSHOP_MODE.VIEW && (
            <Link
              activeClassName="active"
              className="btn-secondary"
              to="registerNowBlock"
              onClick={onRegister}
              spy={true}
              smooth={true}
              duration={500}
              offset={0}
            >
              Register Today
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
