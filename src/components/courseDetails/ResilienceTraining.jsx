/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unescaped-entities */
import { ABBRS, WORKSHOP_MODE, COURSE_MODES } from '@constants';
import { isEmpty, priceCalculation, tConvert } from '@utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { FaArrowRightLong } from 'react-icons/fa6';

dayjs.extend(utc);

export const ResilienceTraining = ({
  data: workshop,
  mode: courseViewMode,
  handleRegister,
}) => {
  const { fee, delfee } = priceCalculation({ workshop });

  const {
    title,
    mode,
    eventStartDate,
    eventEndDate,
    email,
    phone1,
    timings,
    primaryTeacherName,
    coTeacher1Name,
    coTeacher2Name,
    notes,
    description,
    aosCountRequisite,
    businessRules = [],
    earlyBirdFeeIncreasing,
    usableCredit,
  } = workshop || {};

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

  const teachers = [primaryTeacherName, coTeacher1Name, coTeacher2Name]
    .filter((name) => name && name.trim() !== '')
    .join(', ');

  const aosCount =
    aosCountRequisite != null && aosCountRequisite > 1 ? aosCountRequisite : '';

  const eligibilityCriteriaMessages = businessRules
    .filter((item) => item.eligibilityCriteriaMessage)
    .map((item) => item.eligibilityCriteriaMessage);

  const preRequisiteCondition = eligibilityCriteriaMessages
    .join(', ')
    .replace(/,(?=[^,]+$)/, ' and')
    .replace('Silent Retreat', `${aosCount} Silent Retreat`);

  return (
    <main class="sky-resilience">
      <section class="banner-section">
        <div class="container">
          <div class="course-type-pill">{mode}</div>
          <div class="banner-title">{title}</div>
          <ul class="banner-course-features">
            <li>
              <span class="icon-aol iconaol-flower-1"></span>Relieve stress,
              anxiety, and tension
            </li>
            <li>
              <span class="icon-aol iconaol-flower-2"></span>Enhance mental
              clarity and optimize performance
            </li>
            <li>
              <span class="icon-aol iconaol-flower-3"></span>Improve sleep
              quality
            </li>
            <li>
              <span class="icon-aol iconaol-flower-4"></span>Reduce symptoms of
              chronic and traumatic stress
            </li>
          </ul>
        </div>
      </section>
      <section class="section-registration-widget">
        <div class="container">
          <div class="registration-widget">
            <div class=" row register-content">
              <div class="col dates icon-money">
                <span class="title">Course Fee</span>
                <br />

                <span class="content">
                  {isUsableCreditAvailable && (
                    <span className="content">
                      ${UpdatedFeeAfterCredits}&nbsp;
                      {delfee && (
                        <span className="actual-price">
                          <strike>${delfee}</strike>
                        </span>
                      )}
                    </span>
                  )}
                  {!isUsableCreditAvailable && (
                    <span className="content">
                      ${fee}&nbsp;
                      {delfee && (
                        <span className="actual-price">
                          <strike>${delfee}</strike>
                        </span>
                      )}
                    </span>
                  )}
                </span>
              </div>
              <div class="col dates icon-calendar">
                <span class="title">Dates</span>
                <br />
                <span class="content">
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
              <div class="col location icon-location">
                <span class="title">Location</span>
                <br />
                <span class="content">
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
            <div class=" row register-content">
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
            <div class=" row register-content">
              <div class="col dates instructor">
                <i class="icon-aol iconaol-profile"></i>
                <div class="instructor-content">
                  <span class="title">Instructor</span>
                  <br />
                  <span class="content">{teachers}</span>
                </div>
              </div>
              <div class="col location contact">
                <i class="icon-aol iconaol-call-calling"></i>
                <div class="contact-content">
                  <span class="title">Contact</span>
                  <br />
                  <span class="content">
                    {email} | {phone1}
                  </span>
                </div>
              </div>
            </div>
            {(description || notes) && (
              <div class="row register-content">
                <div class="col dates notes-content">
                  <i class="icon-aol iconaol-message-text"></i>
                  <div class="notes-content">
                    <span class="title">Notes</span>
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
            <div class=" row register-content no_border">
              <div class="col-md-12">
                {courseViewMode !== WORKSHOP_MODE.VIEW && (
                  <button
                    className="register-button"
                    onClick={handleRegister()}
                  >
                    Register Now <FaArrowRightLong />
                  </button>
                )}
              </div>
            </div>
            {(earlyBirdFeeIncreasing ||
              (preRequisiteCondition && preRequisiteCondition.length > 0)) && (
              <div class="additional-info-box">
                {earlyBirdFeeIncreasing && (
                  <div class="info-row">
                    <i class="icon-aol iconaol-coin"></i>
                    <span>
                      {earlyBirdFeeIncreasing.increasingFee} starting{' '}
                      {dayjs
                        .utc(earlyBirdFeeIncreasing.increasingByDate)
                        .format('MMM D, YYYY')}
                    </span>
                  </div>
                )}

                {preRequisiteCondition && preRequisiteCondition.length > 0 && (
                  <div class="info-row">
                    <i class="icon-aol iconaol-shield-tick"></i>
                    <span>
                      <strong>Eligibility:</strong> {preRequisiteCondition}1
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      <section class="section-benefits-resilience">
        <div class="container">
          <h2 class="section-title">Discover the Benefits</h2>
          <div class="section-desc">
            That thousand of veterans, military service members and their
            dependents are experiencing
          </div>
          <div class="benefits-row">
            <div class="benefits-col">
              <div class="benefit-item">
                <div class="benefit-item-icon">
                  <span class="icon-aol iconaol-flower-1"></span>
                </div>
                <div class="benefit-item-title">20 years of programs</div>
                <div class="benefit-item-text">
                  Learn from the pioneers of breath-based meditation practice
                </div>
              </div>
              <div class="benefit-item">
                <div class="benefit-item-icon">
                  <span class="icon-aol iconaol-flower-2"></span>
                </div>
                <div class="benefit-item-title">
                  Backed by independent studies
                </div>
                <div class="benefit-item-text">
                  Reduce PTSD Symptoms Relieve Depression Improve Sleep
                </div>
              </div>
            </div>
            <div class="benefits-col col-img">
              <img
                src="/img/resilience-benefit.jpeg"
                class="img-resilience-benefit"
                width="670"
              />
            </div>
            <div class="benefits-col">
              <div class="benefit-item">
                <div class="benefit-item-icon">
                  <span class="icon-aol iconaol-flower-3"></span>
                </div>
                <div class="benefit-item-title">5-Session Courses</div>
                <div class="benefit-item-text">
                  2.5 - 3 hours a day live interactive sessions with certified
                  instructors
                </div>
              </div>
              <div class="benefit-item">
                <div class="benefit-item-icon">
                  <span class="icon-aol iconaol-flower-4"></span>
                </div>
                <div class="benefit-item-title">Eligibility Requirements</div>
                <div class="benefit-item-text">
                  The SKY Resilience Training is free of cost to veterans,
                  military service members, and dependents over age 18. First
                  responders (Police, Fire, EMS) are also welcome to attend
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="featured-in">
        <div class="container">
          <div class="section-tag">Press</div>
          <h2 class="section-title">They're speaking about us</h2>
          <div class="featured-listing">
            <div class="featured-item">
              <div class="featured-item-logo">
                <img
                  src="/img/press-logo-chicago-tribune.jpg"
                  alt="Chicago Tribune"
                />
              </div>
            </div>
            <div class="featured-item">
              <div class="featured-item-logo">
                <img src="/img/press-logo-us-news.jpg" alt="U.S. News" />
              </div>
            </div>
            <div class="featured-item">
              <div class="featured-item-logo">
                <img src="/img/press-logo-newsweek.jpg" alt="Newsweek" />
              </div>
            </div>
            <div class="featured-item">
              <div class="featured-item-logo">
                <img
                  src="/img/press-logo-psychology-today.jpg"
                  alt="Psychology Today"
                />
              </div>
            </div>
            <div class="featured-item">
              <div class="featured-item-logo">
                <img
                  src="/img/press-logo-huffington-post.jpg"
                  alt="The Huffington Post"
                />
              </div>
            </div>
            <div class="featured-item">
              <div class="featured-item-logo">
                <img
                  src="/img/press-logo-time-magazine.jpg"
                  alt="Time Magazine"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="section-why">
        <div class="container">
          <div class="why-content-box">
            <div class="cb-image-container">
              <img
                src="/img/why-resilience-placeholder.webp"
                alt="Why Resilience"
                width="680"
              />
            </div>
            <div class="cb-info-container">
              <h2 class="section-title">Why this training is so powerful</h2>
              <p>
                The SKY Resilience Training is a mind-body resilience program
                for veterans and military. It teaches science-backed
                breath-based tools that decrease the stress, depression, anxiety
                and sleep problems that many of those who served experience. It
                addresses the whole being, body, mind and spirit.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section class="how-work">
        <div class="container">
          <h2 class="section-title">How it works</h2>
          <div class="how-work-features">
            <div class="hw-item">
              <div class="hw-icon">
                <span class="icon-aol iconaol-meditation"></span>
              </div>
              <div class="hw-title">
                Clear chronic and traumatic stress from the body
              </div>
              <div class="hw-text">
                SKY Breath Meditation, the most powerful breathing technique of
                our time, uses specific natural rhythms of the breath to clear
                toxins and accumulated stress on a cellular level. SKY gets to
                the root of chronic stress and trauma, leaving you restored and
                clear with improved sleep, energy, and emotional regulation.
              </div>
            </div>
            <div class="hw-item">
              <div class="hw-icon">
                <span class="icon-aol iconaol-human-brain"></span>
              </div>
              <div class="hw-title">
                Unlock your resilience and self-awareness
              </div>
              <div class="hw-text">
                Through interactive discussions, we build a framework for
                resilience and empowerment through self-awareness, connection
                and community and a positive outlook.
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="changing-lives">
        <div class="container">
          <div class="section-title">How This Training Is Changing Lives</div>
          <div class="video-changing-lives">
            <iframe
              width="1026"
              height="515"
              src="https://www.youtube.com/embed/4AuuBP_9W30?si=OClWAOcxAqbSIXrT"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </section>
      <section class="section-testimonials">
        <div class="container">
          <div class="section-tag">TESTIMONIALS</div>
          <h2 class="section-title">What people are sharing</h2>
          <div class="testimonials-listing">
            <div class="testimonial-item">
              <div class="testimony-title">
                Until this study, I could not find right help for me.
              </div>
              <div class="testimony-text">
                A few weeks ago shooting, cars exploding, screaming, death, that
                was your world. Now back home, no one knows what it is like over
                there so no one knows how to...<a href="#">READ MORE</a>
              </div>
              <div class="author-info">
                <div class="author-picutre">
                  <img
                    src="/img/Testimony-Nathan-Hruska.webp"
                    alt="Nathan"
                    height="60"
                    width="60"
                  />
                </div>
                <div class="author-details">
                  <div class="author-name">Nathan Hruska, Afghanistan</div>
                  <div class="author-position">
                    US Marine Corps, Operation Enduring Freedom
                  </div>
                </div>
              </div>
            </div>
            <div class="testimonial-item">
              <div class="testimony-title">
                Thank you for giving me a life worth living
              </div>
              <div class="testimony-text">
                This workshop has done more than I ever could have imagined. Not
                knowing there were any underlying issues made it hard to even
                acknowledge or accept them...<a href="#">READ MORE</a>
              </div>
              <div class="author-info">
                <div class="author-picutre">
                  <img
                    src="/img/Testimony-Travis-Leanna.webp"
                    alt="Travis"
                    height="60"
                    width="60"
                  />
                </div>
                <div class="author-details">
                  <div class="author-name">Travis Leanna, Iraq</div>
                  <div class="author-position">
                    US Marine Corps, Operation Iraqi Freedom
                  </div>
                </div>
              </div>
            </div>
            <div class="testimonial-item">
              <div class="testimony-title">
                I have found an inner contentment and peace
              </div>
              <div class="testimony-text">
                I stumbled upon The Power Breath workshop a couple year ago now,
                at the time I didn’t realize the impact it would have on me. The
                experiences I had, the people...<a href="#">READ MORE</a>
              </div>
              <div class="author-info">
                <div class="author-picutre">
                  <img
                    src="/img/Testimony-Jennifer-Kannel.webp"
                    alt="Jennifer"
                    height="60"
                    width="60"
                  />
                </div>
                <div class="author-details">
                  <div class="author-name">Jennifer Kannel Ambord</div>
                  <div class="author-position">
                    WI Army National Guard, Operation Iraqi Freedom
                  </div>
                </div>
              </div>
            </div>
            <div class="testimonial-item">
              <div class="testimony-title">I’d recommend it to everybody</div>
              <div class="testimony-text">
                I feel as if can finally move on with my life. I’ve just
                completed a 6 day warrior breathing program and I’d recommend it
                to everybody. It really helps you to release issues...
                <a href="#">READ MORE</a>
              </div>
              <div class="author-info">
                <div class="author-picutre">
                  <img
                    src="/img/Testimony-Mike-Masse.webp"
                    alt="Mike"
                    height="60"
                    width="60"
                  />
                </div>
                <div class="author-details">
                  <div class="author-name">Mike Masse, Iraq</div>
                  <div class="author-position">
                    Wisconsin National Guard, Operation Iraqi Freedom
                  </div>
                </div>
              </div>
            </div>
            <div class="testimonial-item">
              <div class="testimony-title">
                Tool for individuals who suffer emotional trauma.
              </div>
              <div class="testimony-text">
                The course really puts you in touch with your breathing and how
                it affects your stress levels. You become calm and relaxed with
                less stress. It is an extremely useful tool...
                <a href="#">READ MORE</a>
              </div>
              <div class="author-info">
                <div class="author-picutre">
                  <img
                    src="/img/Testimony-Shad-Meshad.webp"
                    alt="Shad"
                    height="60"
                    width="60"
                  />
                </div>
                <div class="author-details">
                  <div class="author-name">Shad Meshad, Vietnam</div>
                  <div class="author-position">
                    Vietnam Veteran, Founder & Director, National Veteran’s
                    Foundation
                  </div>
                </div>
              </div>
            </div>
            <div class="testimonial-item">
              <div class="testimony-title">
                I wish I could have learned this breathing 40 years ago.
              </div>
              <div class="testimony-text">
                The course was very beneficial for me uncovering things about
                myself that I never realized had been bothering me. It helped me
                be at peace with myself from...<a href="#">READ MORE</a>
              </div>
              <div class="author-info">
                <div class="author-picutre">
                  <img
                    src="/img/Testimony-Noel.webp"
                    alt="Noel"
                    height="60"
                    width="60"
                  />
                </div>
                <div class="author-details">
                  <div class="author-name">Noel, Vietnam</div>
                  <div class="author-position">Vietnam Combat Veteran</div>
                </div>
              </div>
            </div>
            <div class="testimonial-item">
              <div class="testimony-title">
                Finally beginning to feel like myself again
              </div>
              <div class="testimony-text">
                After almost 20 years of chronic pain due to military and
                civilian traumas, I am finally beginning to feel like myself
                again. I got to meet some kind people who...
                <a href="#">READ MORE</a>
              </div>
              <div class="author-info">
                <div class="author-picutre">
                  <img
                    src="/img/Testimony-Pamela-Black.webp"
                    alt="Pamela"
                    height="60"
                    width="60"
                  />
                </div>
                <div class="author-details">
                  <div class="author-name">Pamela Black, U.S</div>
                  <div class="author-position">Veteran, U.S. Air Force</div>
                </div>
              </div>
            </div>
            <div class="testimonial-item">
              <div class="testimony-title">No longer wanting to die</div>
              <div class="testimony-text">
                The benefits or changes I have noticed are increased patience
                and joy. I have become much less irritated, greatly decreased my
                outbursts of anger, and not ha...<a href="#">READ MORE</a>
              </div>
              <div class="author-info">
                <div class="author-picutre">
                  <img
                    src="/img/Testimony-Lance-Santiago.webp"
                    alt="Lance"
                    height="60"
                    width="60"
                  />
                </div>
                <div class="author-details">
                  <div class="author-name">Lance Santiago, U.S</div>
                  <div class="author-position">U.S. Marine Corps, OEF</div>
                </div>
              </div>
            </div>
            <div class="testimonial-item">
              <div class="testimony-title">
                I felt completely different after just a few sessions
              </div>
              <div class="testimony-text">
                What PWHT and its approach did was to help wake me back up. I
                felt completely different after just a few sessions in my
                initial exposure to their approach. I felt far less...
                <a href="#">READ MORE</a>
              </div>
              <div class="author-info">
                <div class="author-picutre">
                  <img
                    src="/img/Testimony-Anthony-Anderson.webp"
                    alt="Anthony"
                    height="60"
                    width="60"
                  />
                </div>
                <div class="author-details">
                  <div class="author-name">Anthony Anderson, USA</div>
                  <div class="author-position">US Army, OIF</div>
                </div>
              </div>
            </div>
          </div>
          <div class="page-registration-action">
            <button className="register-button" onClick={handleRegister()}>
              Register Now
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
