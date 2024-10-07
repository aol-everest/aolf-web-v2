import classNames from 'classnames';
import dayjs from 'dayjs';

import { ABBRS, COURSE_MODES } from '@constants';
import { orgConfig } from '@org';
import { tConvert } from '@utils';
import Style from './CoursethankYouDetails.module.scss';

export const SKYBreathMeditationCombo = ({
  handleSecondCourseRedirection,
  addToCalendarAction,
  workshop,
  selectedGenericSlot,
  getSelectedTimeSlotDetails,
  showSecondCourseButton,
  isSKYType,
}) => {
  const {
    timings,
    mode,
    title,
    formattedStartDateOnly,
    formattedEndDateOnly,
    isGenericWorkshop,
  } = workshop;

  return (
    <div className="breath-meditation">
      <section className="welcome">
        <div className="container_md welcome__container">
          <div className="welcome__content">
            <p className="welcome__heading">
              <img src="/img/ic-success.svg" alt="success-icon" /> You’re going!
            </p>

            <h1 className="welcome__title">{title}</h1>

            <p className="welcome__description">
              You’re registered for your first course, {title}
              {','}
              {!isGenericWorkshop && (
                <>
                  {' '}
                  from {formattedStartDateOnly} - {formattedEndDateOnly}
                </>
              )}
            </p>

            <div className="welcome__navigation">
              <button
                className="welcome__btn-course btn-secondary"
                onClick={handleSecondCourseRedirection}
              >
                Second Course
              </button>
              <p
                className="welcome__btn-calendar"
                role="button"
                onClick={addToCalendarAction}
              >
                Add to Calendar
              </p>
            </div>
          </div>
          {isSKYType ? (
            <div className="col-lg-6 col-md-12 offset-lg-1 p-0">
              <div className="get-started__video">
                <iframe
                  src="https://player.vimeo.com/video/411549679"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          ) : (
            <div className="welcome__player player-welcome">
              <img
                className="player-welcome__cover"
                // src="/img/welcome-player-bg.png"
                src="/img/image@3x.png"
                alt="welcome-bg"
              />
              {/* <p
              className="player-welcome__btn-play"
              role="button"
              aria-label="Play video"
            >
              <img src="/img/ic-play-white.svg" alt="play-icon" />
            </p>

            <div className="player-welcome__content">
              <p className="player-welcome__title">The Art of Meditation</p>
              <p className="player-welcome__description">
                SKY Breath Meditation
              </p>
            </div> */}
            </div>
          )}
        </div>
      </section>

      <section className="schedule">
        <div className="schedule__container container_md">
          <div className="schedule__content">
            <p className="schedule__title">Next steps:</p>

            <div className="schedule__steps">
              <div className="schedule__step">
                <img
                  className="schedule__icon"
                  src="/img/ic-learn.svg"
                  alt="schedule-icon"
                />
                <p className="schedule__heading">Select your second course</p>
                <p className="schedule__text">
                  To complete your registration, select Sahaj course dates.
                </p>

                {showSecondCourseButton && (
                  <div className="schedule__navigation">
                    <button
                      className="schedule__btn-select btn-secondary"
                      onClick={handleSecondCourseRedirection}
                    >
                      Select your second course
                    </button>
                  </div>
                )}
              </div>

              {orgConfig.name !== 'HB' && (
                <div className="schedule__step">
                  <img
                    className="schedule__icon"
                    src="/img/ic-sun.svg"
                    alt="schedule-icon"
                  />
                  <p className="schedule__heading">Download the app</p>
                  <p className="schedule__text">
                    After that, you can download the app and relax with a
                    meditation
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="schedule__sidebar sidebar-schedule">
            <p className="sidebar-schedule__title">Program details</p>

            {selectedGenericSlot.startDate &&
              getSelectedTimeSlotDetails(selectedGenericSlot)}
            {!selectedGenericSlot.startDate && (
              <div className="sidebar-schedule__list">
                {timings &&
                  timings.map((time, i) => {
                    // console.log(time);
                    return (
                      <div className="sidebar-schedule__item" key={i}>
                        <img
                          className="sidebar-schedule__icon"
                          src="/img/ic-calendar-fade.svg"
                          alt="calendar-icon"
                        />

                        <div className="sidebar-schedule__content">
                          <p className="sidebar-schedule__date">
                            {dayjs.utc(time.startDate).format('LL')}
                          </p>
                          {time.startTime && time.endTime && (
                            <p className="sidebar-schedule__time">
                              <span>{tConvert(time.startTime)}</span> -{' '}
                              <span>{tConvert(time.endTime)}</span>{' '}
                              {ABBRS[time.timeZone]}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {(mode === COURSE_MODES.IN_PERSON.value ||
              mode === COURSE_MODES.DESTINATION_RETREATS.value) && (
              <>
                {!workshop.isLocationEmpty && (
                  <ul className="program-details__list-schedule tw-mt-2">
                    <span className="program-details__schedule-date">
                      Location
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${
                        workshop.locationStreet || ''
                      }, ${workshop.locationCity} ${
                        workshop.locationProvince
                      } ${workshop.locationPostalCode} ${
                        workshop.locationCountry
                      }`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {workshop.locationStreet && (
                        <li className="tw-truncate tw-text-sm tw-tracking-tighter !tw-text-[#3d8be8]">
                          {`${workshop.locationStreet}, `}
                        </li>
                      )}
                      <li className="tw-truncate tw-text-sm tw-tracking-tighter !tw-text-[#3d8be8]">
                        {workshop.locationCity || ''}
                        {', '}
                        {workshop.locationProvince || ''}{' '}
                        {workshop.locationPostalCode || ''}
                      </li>
                    </a>
                  </ul>
                )}
                {workshop.isLocationEmpty && (
                  <ul className="course-details__list">
                    <div className="course-details__list__title">
                      <h6>Location:</h6>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${
                        workshop.streetAddress1 || ''
                      },${workshop.streetAddress2 || ''} ${workshop.city} ${
                        workshop.state
                      } ${workshop.zip} ${workshop.country}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {workshop.streetAddress1 && (
                        <li className="tw-truncate tw-text-sm tw-tracking-tighter !tw-text-[#3d8be8]">
                          {workshop.streetAddress1}
                        </li>
                      )}
                      {workshop.streetAddress2 && (
                        <li className="tw-truncate tw-text-sm tw-tracking-tighter !tw-text-[#3d8be8]">
                          {workshop.streetAddress2}
                        </li>
                      )}
                      <li className="tw-truncate tw-text-sm tw-tracking-tighter !tw-text-[#3d8be8]">
                        {workshop.city || ''}
                        {', '}
                        {workshop.state || ''} {workshop.zip || ''}
                      </li>
                    </a>
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <section className={classNames('journey', Style.journeySection)}>
        <div className="journey__container container_md">
          <h3 className="journey__title">Your Journey Starts Here</h3>

          <div className="journey__benefits">
            <div className="journey__benefit benefit-journey">
              <div className="benefit-journey__status">
                <img
                  className="benefit-journey__icon"
                  src="/img/ic-clock-fade.svg"
                  alt="benefit-icon"
                />
                <span className="benefit-journey__number">1</span>
              </div>

              <p className="benefit-journey__heading">This is you-time</p>
              <p className="benefit-journey__description">
                Block your calendar to attend all the sessions via Zoom. Before
                the session begins, you will receive your Zoom meeting ID and
                password in your welcome email.
              </p>
            </div>

            <img
              className="journey__divider"
              src="/img/ic-arrow-wave.svg"
              alt="journey-divider"
            />

            <div className="journey__benefit benefit-journey">
              <div className="benefit-journey__status">
                <img
                  className="benefit-journey__icon"
                  src="/img/ic-videocam.svg"
                  alt="benefit-icon"
                />
                <span className="benefit-journey__number">2</span>
              </div>

              <p className="benefit-journey__heading">
                Getting your tech ready in advance
              </p>
              <p className="benefit-journey__description">
                We’ll be meeting on zoom. If you do not already have it, you can
                download zoom{' '}
                <a
                  className="text-link text-link_orange"
                  href="https://zoom.us/download"
                  target="_blank"
                  rel="noreferrer"
                >
                  here
                </a>
                .
              </p>
            </div>

            <img
              className="journey__divider"
              src="/img/ic-arrow-wave.svg"
              alt="journey-divider"
            />

            <div className="journey__benefit benefit-journey">
              <div className="benefit-journey__status">
                <img
                  className="benefit-journey__icon"
                  src="/img/ic-location.svg"
                  alt="benefit-icon"
                />
                <span className="benefit-journey__number">3</span>
              </div>

              <p className="benefit-journey__heading">
                Set up your space and get comfy
              </p>
              <p className="benefit-journey__description">
                Find a quiet, comfortable space where you can enjoy your course
                with some privacy.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
