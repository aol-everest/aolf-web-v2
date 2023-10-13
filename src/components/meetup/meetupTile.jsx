import { ABBRS } from '@constants';
import { tConvert } from '@utils';
import classNames from 'classnames';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const MeetupTile = ({ data, openEnrollAction }) => {
  const getMeetupImage = () => {
    switch (data.meetupType) {
      case 'Short SKY Meditation Meetup':
        return <img src="/img/filter-card-1@2x.png" alt="bg" />;
      case 'Guided Meditation Meetup':
        return <img src="/img/filter-card-2@2x.png" alt="bg" />;
      default:
        return <img src="/img/filter-card-1@2x.png" alt="bg" />;
    }
  };
  const {
    meetupTitle,
    centerName,
    isPurchased,
    isEventFull,
    primaryTeacherName,
    meetupStartDate,
    meetupStartTime,
    eventTimeZone,
    meetupDuration,
    isOnlineMeetup,
    locationProvince,
    locationCity,
  } = data || {};
  const updateMeetupDuration = `${meetupDuration.replace(/Minutes/g, '')} Min`;
  return (
    <div className="col-6 col-lg-3 col-md-4">
      <div
        className="upcoming_course_card"
        data-full={isEventFull}
        data-complete={isPurchased}
      >
        {getMeetupImage()}
        <div className="course_data">
          {`${dayjs.utc(meetupStartDate).format('MMM DD')}, `}
          {`${tConvert(meetupStartTime)} ${ABBRS[eventTimeZone]}, `}
          {`${updateMeetupDuration}`}
        </div>
        <div className="course_complete">Meetup Full</div>
        <div className="course_info">
          <div className="course_status">
            {isOnlineMeetup ? (
              'Live Streaming from' + ' ' + centerName
            ) : (
              <>
                {locationCity ? (
                  <span>
                    {' '}
                    {locationCity || ''}
                    {locationProvince && ', '}
                    {locationProvince || ''}
                  </span>
                ) : (
                  centerName
                )}
              </>
            )}
          </div>
          <div className="course_name">{meetupTitle}</div>
          <div className="course_place">{primaryTeacherName}</div>
        </div>
        <div className="course_complete_registration">already registered</div>
        <div
          className={classNames('course_detail_box', {
            'd-none': isPurchased || isEventFull,
          })}
        >
          <div className="course_detail_btn_box">
            <button
              className="btn btn_box_primary text-center"
              onClick={openEnrollAction}
            >
              Enroll
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
