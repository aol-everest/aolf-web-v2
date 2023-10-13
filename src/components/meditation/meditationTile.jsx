import classNames from 'classnames';

const timeConvert = (data) => {
  const minutes = data % 60;
  const hours = (data - minutes) / 60;

  return String(hours).padStart(2, 0) + ':' + String(minutes).padStart(2, 0);
};

export const MeditationTile = ({
  data,
  authenticated,
  markFavorite,
  meditateClickHandle,
  additionalClass,
  favouriteContents = [],
}) => {
  const {
    sfid,
    title,
    description,
    coverImage,
    totalActivities,
    accessible,
    category,
    liveMeetingStartDateTime,
    liveMeetingDuration,
    duration,
    isFavorite,
    isFree,
    primaryTeacherName,
  } = data || {};

  const isFavoriteContent = !!favouriteContents.find((el) => el.sfid === sfid);

  return (
    <div className="col-6 col-lg-3 col-md-4">
      <div
        className={classNames(
          'upcoming_course_card newCard-new contentCard',
          additionalClass,
        )}
        data-full={false}
        data-complete={false}
        style={{
          background: `url(${
            coverImage ? coverImage.url : '/img/card-1a.png'
          }) no-repeat center/cover`,
        }}
      >
        <div className="course_dat">
          <span className="duration duration-time-txt">
            {timeConvert(duration)}
          </span>
          {!accessible && (
            <span className="lock collection-lock">
              {' '}
              <img src="/img/ic-lock.png" alt="" />{' '}
            </span>
          )}
        </div>
        {accessible && (
          <div
            onClick={markFavorite}
            className={classNames('course-like', {
              liked: isFavorite || isFavoriteContent,
            })}
          ></div>
        )}
        <div className="forClick" onClick={meditateClickHandle}></div>
        <div className="card-title-bxs">
          <div className="course_name">{title}</div>
          <div className="course_place">{primaryTeacherName}</div>
        </div>
      </div>
    </div>
  );
};
