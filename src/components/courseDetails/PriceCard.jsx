import { COURSE_MODES, ABBRS, WORKSHOP_MODE } from '@constants';
import { priceCalculation, tConvert } from '@utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { isEmpty } from '@utils';
import {
  FaArrowRightLong,
  FaUser,
  FaPhone,
  FaRegClock,
  FaRegIdCard,
  FaCommentDots,
} from 'react-icons/fa6';

dayjs.extend(utc);

export const PriceCard = ({
  workshop,
  courseViewMode,
  showCeuCreditsForHbSilent = false,
  handleRegister,
  showPriceHeading = true,
}) => {
  const { fee, delfee } = priceCalculation({ workshop });

  const {
    mode,
    earlyBirdFeeIncreasing,
    eventStartDate,
    eventEndDate,
    timings,
    primaryTeacherName,
    coTeacher1Name,
    coTeacher2Name,
    email,
    phone1,
    description,
    notes,
    aosCountRequisite,
    businessRules = [],
    roomAndBoardRange,
    usableCredit,
  } = workshop || {};

  const aosCount =
    aosCountRequisite != null && aosCountRequisite > 1 ? aosCountRequisite : '';

  const eligibilityCriteriaMessages = businessRules
    .filter((item) => item.eligibilityCriteriaMessage)
    .map((item) => item.eligibilityCriteriaMessage);

  const preRequisiteCondition = eligibilityCriteriaMessages
    .join(', ')
    .replace(/,(?=[^,]+$)/, ' and')
    .replace('Silent Retreat', `${aosCount} Silent Retreat`);

  const teachers = [primaryTeacherName, coTeacher1Name, coTeacher2Name]
    .filter((name) => name && name.trim() !== '')
    .join(', ');

  const isUsableCreditAvailable = usableCredit && !isEmpty(usableCredit);

  let UpdatedFeeAfterCredits;
  if (
    isUsableCreditAvailable &&
    usableCredit.creditMeasureUnit === 'Quantity' &&
    usableCredit.availableCredit === 1
  ) {
    UpdatedFeeAfterCredits = 0;
  } else if (
    isUsableCreditAvailable &&
    usableCredit.creditMeasureUnit === 'Amount'
  ) {
    if (usableCredit.availableCredit > fee) {
      UpdatedFeeAfterCredits = 0;
    } else {
      UpdatedFeeAfterCredits = fee - usableCredit.availableCredit;
    }
  }

  return (
    <div className="container">
      <div className="registration-widget">
        <div className=" row register-content">
          {showPriceHeading ? (
            <div className="col discount-price">
              <span className="title">Course Fee</span>
              <br />
              {isUsableCreditAvailable && (
                <span className="content">
                  ${UpdatedFeeAfterCredits}&nbsp;
                  {delfee && UpdatedFeeAfterCredits !== delfee && (
                    <span className="actual-price">
                      <strike>${delfee}</strike>
                    </span>
                  )}
                </span>
              )}
              {!isUsableCreditAvailable && (
                <span className="content">
                  ${fee}&nbsp;
                  {delfee && fee !== delfee && (
                    <span className="actual-price">
                      <strike>${delfee}</strike>
                    </span>
                  )}
                </span>
              )}
            </div>
          ) : (
            <div className="col discount-price">
              {isUsableCreditAvailable && (
                <>
                  ${UpdatedFeeAfterCredits}
                  {delfee && UpdatedFeeAfterCredits !== delfee && (
                    <span className="actual-price">
                      <strike>${delfee}</strike>
                    </span>
                  )}
                </>
              )}
              {!isUsableCreditAvailable && (
                <>
                  ${fee}
                  {delfee && fee !== delfee && (
                    <span className="actual-price">
                      <strike>${delfee}</strike>
                    </span>
                  )}
                </>
              )}
            </div>
          )}

          {roomAndBoardRange && (
            <div className="col dates">
              <span className="title">Expense Type fee</span>
              <br />
              <span className="content">{roomAndBoardRange}</span>
            </div>
          )}

          <div className="col dates">
            <span className="title">Dates</span>
            <br />
            <span className="content">
              {dayjs
                .utc(eventStartDate)
                .isSame(dayjs.utc(eventEndDate), 'month') &&
                `${dayjs.utc(eventStartDate).format('M/D/YYYY')} - ${dayjs
                  .utc(eventEndDate)
                  .format('M/D/YYYY')}`}
              {!dayjs
                .utc(eventStartDate)
                .isSame(dayjs.utc(eventEndDate), 'month') &&
                `${dayjs.utc(eventStartDate).format('M/DD/YYYY')} - ${dayjs
                  .utc(eventEndDate)
                  .format('M/DD/YYYY')}`}
            </span>
          </div>
          <div className="col location">
            <span className="title">Location</span>
            <br />
            <span className="content">
              {mode === COURSE_MODES.ONLINE.value ? (
                mode
              ) : (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${
                    workshop.locationStreet || ''
                  }, ${workshop.locationCity} ${workshop.locationProvince} ${
                    workshop.locationPostalCode
                  } ${workshop.locationCountry}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {`${workshop.locationStreet || ''} ${
                    workshop.locationCity || ''
                  }
                          ${workshop.locationProvince || ''} ${
                            workshop.locationCountry || ''
                          }`}
                </a>
              )}
            </span>
          </div>
        </div>
        <div className=" row register-content">
          {timings &&
            timings.map((time) => {
              return (
                <div className="col circle" key={time.startDate}>
                  <div className="dates">
                    <span className="title">
                      {dayjs.utc(time.startDate).format('ddd, MMM DD')}
                    </span>
                    <br />
                    <span className="content">
                      {tConvert(time.startTime)}-{tConvert(time.endTime)}
                      {` (${ABBRS[time.timeZone]})`}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
        <div className=" row register-content">
          <div className="col dates instructor">
            <FaUser className="fa-solid orange" />

            <div className="instructor-content">
              <span className="title">Instructor</span>
              <br />
              <span className="content">{teachers}</span>
            </div>
          </div>
          <div className="col location contact">
            <FaPhone className="fa-solid orange" />
            <div className="contact-content">
              <span className="title">Contact</span>
              <br />
              <span className="content">
                {email} | {phone1}
              </span>
            </div>
          </div>
        </div>
        {(description || notes) && (
          <div className=" row register-content">
            <div className="col dates notes">
              <i>
                <FaCommentDots className="fa-solid orange" />
              </i>
              <div className="instructor-content">
                <span className="title">Notes</span>
                <br />
                {description && (
                  <span
                    className="content"
                    dangerouslySetInnerHTML={{
                      __html: description,
                    }}
                  ></span>
                )}
                {notes && (
                  <span
                    className="content"
                    dangerouslySetInnerHTML={{
                      __html: notes,
                    }}
                  ></span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className=" row register-content no_border">
          <div className="col-md-4">
            {courseViewMode !== WORKSHOP_MODE.VIEW && (
              <button className="register-button" onClick={handleRegister}>
                Register Now <FaArrowRightLong />
              </button>
            )}
          </div>

          <div className="col-md-8"></div>
        </div>
        {(earlyBirdFeeIncreasing ||
          showCeuCreditsForHbSilent ||
          (preRequisiteCondition && preRequisiteCondition.length > 0)) && (
          <div className="early-bird-banner">
            {earlyBirdFeeIncreasing && (
              <p>
                <FaRegClock className="fa" /> Fee increases by $
                {earlyBirdFeeIncreasing.increasingFee} starting{' '}
                {dayjs
                  .utc(earlyBirdFeeIncreasing.increasingByDate)
                  .format('MMM D, YYYY')}
              </p>
            )}
            {preRequisiteCondition && preRequisiteCondition.length > 0 && (
              <p>
                <FaRegIdCard className="fa" /> <strong>Eligibility:</strong>{' '}
                {preRequisiteCondition}
              </p>
            )}
            {showCeuCreditsForHbSilent && (
              <p>
                <strong>CEU credits:</strong> Physicians, PAs, NPs, Nurses, and
                Dentists can receive 1 CME/CEU credit for every class hour.
                Other healthcare professionals can receive a letter of
                attendance.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
