/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unescaped-entities */
import { ABBRS, WORKSHOP_MODE, COURSE_MODES } from '@constants';
import { isEmpty, priceCalculation, tConvert } from '@utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useState } from 'react';
import { FaArrowRightLong } from 'react-icons/fa6';
import LinesEllipsis from 'react-lines-ellipsis';

dayjs.extend(utc);

export const ResilienceTraining = ({
  data: workshop,
  mode: courseViewMode,
  handleRegister,
}) => {
  const [ellipsisTestimonialIds, setEllipsisTestimonialIds] = useState([]);

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

  const testimonials = [
    {
      id: 1,
      heading: 'Until this study, I could not find right help for me.',
      text: 'A few weeks ago shooting, cars exploding, screaming, death, that was your world. Now back home, no one knows what it is like over there so no one knows how to help you get back your normalcy. They label you a victim of the war. I AM NOT A VICTIM… but how do I get back my normalcy? For most of us it is booze and Ambien. It works for a brief period then it take over your life. Until this study, I could not find right help for me. BREATHING like a champ.',
      img: '/img/Testimony-Nathan-Hruska.webp',
      name: 'Nathan Hruska, Afghanistan',
      position: 'US Marine Corps, Operation Enduring Freedom',
    },
    {
      id: 2,
      heading: 'Thank you for giving me a life worth living',
      text: 'This workshop has done more than I ever could have imagined. Not knowing there were any underlying issues made it hard to even acknowledge or accept them. After doing the workshop and continuing my home practice, I have opened the door to my emotions. I am happy to say that I can feel happiness as well as sadness, and both are great. Just being able to feel has been an amazing experience for me, and has made me become connected with friends and family. I have been given a new life, and I feel empowered to share my new self with everyone. It has been a very interesting journey for me, coming from a cold person who judged and criticized everyone to an open and loving person who is dedicated to serving my community and helping others make the same transition that I went through. Thank you for giving me a life worth living.',
      img: '/img/Testimony-Travis-Leanna.webp',
      name: 'Travis Leanna, Iraq',
      position: 'US Marine Corps, Operation Iraqi Freedom',
    },
    {
      id: 3,
      heading: 'I have found an inner contentment and peace',
      text: 'I stumbled upon The SKY Resilience Program a couple years ago now, at the time I didn’t realize the impact it would have on me. The experiences I had, the people I met, and the things I learned truly changed my life! I’m not sure words can really describe the shift I have felt… I have found an inner contentment and peace that I had not experienced before the course. I learned to be more accepting of myself and others. I learned the POWER the breath has… and how it is the key to surviving any and every situation life throws at you. I have repeated the course a few times and have encouraged everyone I know to consider it. Make the time, see for yourself, it will be worth every breath!',
      img: '/img/Testimony-Jennifer-Kannel.webp',
      name: 'Jennifer Kannel Ambord',
      position: 'WI Army National Guard, Operation Iraqi Freedom',
    },
    {
      id: 4,
      heading: 'I’d recommend it to everybody',
      text: 'I feel as if I can finally move on with my life. I’ve just completed a 6 day The SKY Resilience Program and I’d recommend it to everybody. It really helps you to release issues you have, sometimes stuff you didn’t even know you had, so go ahead and do it!',
      img: '/img/Testimony-Mike-Masse.webp',
      name: 'Mike Masse, Iraq',
      position: 'Wisconsin National Guard, Operation Iraqi Freedom',
    },
    {
      id: 5,
      heading: 'Tool for individuals who suffer emotional trauma.',
      text: 'The course really puts you in touch with your breathing and how it affects your stress levels. You become calm and relaxed with less stress… It is an extremely useful tool for individuals who suffer emotional trauma.',
      img: '/img/Testimony-Shad-Meshad.webp',
      name: 'Shad Meshad, Vietnam',
      position:
        'Vietnam Veteran, Founder & Director, National Veteran’s Foundation',
    },
    {
      id: 6,
      heading: 'I wish I could have learned this breathing 40 years ago.',
      text: 'The course was very beneficial for me uncovering things about myself that I never realized had been bothering me. It helped me be at peace with myself from issues, feelings and the things that I participated in at war… Through that I have been able to come to peace with some of the things that I did and the way I felt about them. I wish I could have learned this breathing 40 years ago.',
      img: '/img/Testimony-Noel.webp',
      name: 'Noel, Vietnam',
      position: 'Vietnam Combat Veteran',
    },
    {
      id: 7,
      heading: 'Finally beginning to feel like myself again',
      text: 'After almost 20 years of chronic pain due to military and civilian traumas, I am finally beginning to feel like myself again. I got to meet some kind people who understand how it feels to navigate life before, during, and after the military.',
      img: '/img/Testimony-Pamela-Black.webp',
      name: 'Pamela Black, U.S',
      position: 'Veteran, U.S. Air Force',
    },
    {
      id: 8,
      heading: 'No longer wanting to die',
      text: 'The benefits or changes I have noticed are increased patience and joy. I have become much less irritated, greatly decreased my outbursts of anger, and not having suicidal thoughts. The single biggest change in my life since taking the workshop - No longer wanting to die.',
      img: '/img/Testimony-Lance-Santiago.webp',
      name: 'Lance Santiago, U.S',
      position: 'U.S. Marine Corps, OEF',
    },
    {
      id: 9,
      heading: 'I felt completely different after just a few sessions',
      text: 'What PWHT and its approach did was to help wake me back up. I felt completely different after just a few sessions in my initial exposure to their approach. I felt far less anxiety. I experienced fewer intrusive thoughts. My communication was more measured. My reactions to people were more appropriate. My relationships began to improve. I didn’t need to self-medicate. I was no longer an irreparable conscious casualty of war.',
      img: '/img/Testimony-Anthony-Anderson.webp',
      name: 'Anthony Anderson, USA',
      position: 'US Army, OIF',
    },
  ];

  const readMoreClickAction = (e, id) => {
    if (e) e.preventDefault();
    setEllipsisTestimonialIds((prevState) => [...prevState, id]);
  };

  const readLessClickAction = (e, id) => {
    if (e) e.preventDefault();
    const filteredId = ellipsisTestimonialIds.filter((item) => item !== id);
    console.log('filteredId', filteredId);
    setEllipsisTestimonialIds(filteredId);
  };

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
    <main className="sky-resilience">
      <section className="banner-section">
        <div className="container">
          <div className="course-type-pill">{mode}</div>
          <div className="banner-title">{title}</div>
          <ul className="banner-course-features">
            <li>
              <span className="icon-aol iconaol-flower-1"></span>Resiliency
            </li>
            <li>
              <span className="icon-aol iconaol-flower-2"></span>Enhanced
              Wellbeing
            </li>
            <li>
              <span className="icon-aol iconaol-flower-3"></span>Improved Sleep
              Quality
            </li>
            <li>
              <span className="icon-aol iconaol-flower-4"></span>Increased
              Mental Clarity and Focus
            </li>
          </ul>
        </div>
      </section>
      <section className="section-registration-widget">
        <div className="container">
          <div className="registration-widget">
            <div className=" row register-content">
              <div className="col dates icon-money">
                <span className="title">Course Fee</span>
                <br />

                <span className="content">
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
              <div className="col dates icon-calendar">
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
              <div className="col location icon-location">
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
                <i className="icon-aol iconaol-profile"></i>
                <div className="instructor-content">
                  <span className="title">Instructor</span>
                  <br />
                  <span className="content">{teachers}</span>
                </div>
              </div>
              <div className="col location contact">
                <i className="icon-aol iconaol-call-calling"></i>
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
              <div className="row register-content">
                <div className="col dates notes-content">
                  <i className="icon-aol iconaol-message-text"></i>
                  <div className="notes-content">
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
              <div className="col-md-12">
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
              <div className="additional-info-box">
                {earlyBirdFeeIncreasing && (
                  <div className="info-row">
                    <i className="icon-aol iconaol-coin"></i>
                    <span>
                      {earlyBirdFeeIncreasing.increasingFee} starting{' '}
                      {dayjs
                        .utc(earlyBirdFeeIncreasing.increasingByDate)
                        .format('MMM D, YYYY')}
                    </span>
                  </div>
                )}

                {preRequisiteCondition && preRequisiteCondition.length > 0 && (
                  <div className="info-row">
                    <i className="icon-aol iconaol-shield-tick"></i>
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
      <section className="section-benefits-resilience">
        <div className="container">
          <h2 className="section-title">Discover the Benefits</h2>
          <div className="section-desc">
            That thousand of veterans, military service members and their
            dependents are experiencing
          </div>
          <div className="benefits-row">
            <div className="benefits-col">
              <div className="benefit-item">
                <div className="benefit-item-icon">
                  <span className="icon-aol iconaol-flower-1"></span>
                </div>
                <div className="benefit-item-title">20 years of programs</div>
                <div className="benefit-item-text">
                  Learn from the pioneers of breath-based meditation practice
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-item-icon">
                  <span className="icon-aol iconaol-flower-2"></span>
                </div>
                <div className="benefit-item-title">
                  Backed by independent studies
                </div>
                <div className="benefit-item-text">
                  Reduce PTSD Symptoms Relieve Depression Improve Sleep
                </div>
              </div>
            </div>
            <div className="benefits-col col-img">
              <img
                src="/img/resilience-benefit1.webp"
                className="img-resilience-benefit"
                width="670"
              />
            </div>
            <div className="benefits-col">
              <div className="benefit-item">
                <div className="benefit-item-icon">
                  <span className="icon-aol iconaol-flower-3"></span>
                </div>
                <div className="benefit-item-title">5-Session Courses</div>
                <div className="benefit-item-text">
                  2.5 - 3 hours a day live interactive sessions with certified
                  instructors
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-item-icon">
                  <span className="icon-aol iconaol-flower-4"></span>
                </div>
                <div className="benefit-item-title">
                  Eligibility Requirements
                </div>
                <div className="benefit-item-text">
                  The SKY Resilience Training is free of cost to veterans,
                  military service members, and dependents over age 18. First
                  responders (Police, Fire, EMS) are also welcome to attend
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="featured-in">
        <div className="container">
          <div className="section-tag">Press</div>
          <h2 className="section-title">They're speaking about us</h2>
          <div className="featured-listing">
            <div className="featured-item">
              <div className="featured-item-logo">
                <img
                  src="/img/press-logo-chicago-tribune.jpg"
                  alt="Chicago Tribune"
                />
              </div>
            </div>
            <div className="featured-item">
              <div className="featured-item-logo">
                <img src="/img/press-logo-us-news.jpg" alt="U.S. News" />
              </div>
            </div>
            <div className="featured-item">
              <div className="featured-item-logo">
                <img src="/img/press-logo-newsweek.jpg" alt="Newsweek" />
              </div>
            </div>
            <div className="featured-item">
              <div className="featured-item-logo">
                <img
                  src="/img/press-logo-psychology-today.jpg"
                  alt="Psychology Today"
                />
              </div>
            </div>
            <div className="featured-item">
              <div className="featured-item-logo">
                <img
                  src="/img/press-logo-huffington-post.jpg"
                  alt="The Huffington Post"
                />
              </div>
            </div>
            <div className="featured-item">
              <div className="featured-item-logo">
                <img
                  src="/img/press-logo-time-magazine.jpg"
                  alt="Time Magazine"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section-why">
        <div className="container">
          <div className="why-content-box">
            <div className="cb-image-container">
              <img
                src="/img/why-resilience-placeholder1.webp"
                alt="Why Resilience"
                width="680"
              />
            </div>
            <div className="cb-info-container">
              <h2 className="section-title">
                Why this training is so powerful
              </h2>
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
      <section className="how-work">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <div className="how-work-features">
            <div className="hw-item">
              <div className="hw-icon">
                <span className="icon-aol iconaol-meditation"></span>
              </div>
              <div className="hw-title">
                Clear chronic and traumatic stress from the body
              </div>
              <div className="hw-text">
                SKY Breath Meditation, the most powerful breathing technique of
                our time, uses specific natural rhythms of the breath to clear
                toxins and accumulated stress on a cellular level. SKY gets to
                the root of chronic stress and trauma, leaving you restored and
                clear with improved sleep, energy, and emotional regulation.
              </div>
            </div>
            <div className="hw-item">
              <div className="hw-icon">
                <span className="icon-aol iconaol-human-brain"></span>
              </div>
              <div className="hw-title">
                Unlock your resilience and self-awareness
              </div>
              <div className="hw-text">
                Through interactive discussions, we build a framework for
                resilience and empowerment through self-awareness, connection
                and community and a positive outlook.
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="changing-lives">
        <div className="container">
          <div className="section-title">
            How This Training Is Changing Lives
          </div>
          <div className="video-changing-lives">
            <iframe
              width="1026"
              height="515"
              src="https://www.youtube.com/embed/4AuuBP_9W30?si=OClWAOcxAqbSIXrT"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>
      <section className="section-testimonials">
        <div className="container">
          <div className="section-tag">TESTIMONIALS</div>
          <h2 className="section-title">What people are sharing</h2>
          <div className="testimonials-listing">
            {testimonials?.map((testimonial) => (
              <div className="testimonial-item" key={testimonial.id}>
                <div className="testimony-title">{testimonial.heading}</div>
                {!ellipsisTestimonialIds.includes(testimonial.id) ? (
                  <>
                    <div className="testimony-text">
                      <LinesEllipsis
                        text={testimonial.text}
                        maxLine="3"
                        ellipsis="..."
                        trimRight
                        basedOn="letters"
                      />
                      <a
                        href="#"
                        className="morelink"
                        onClick={(e) => readMoreClickAction(e, testimonial.id)}
                      >
                        READ MORE...
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="testimony-text">
                      {testimonial.text}
                      <a
                        href="#"
                        className="morelink"
                        onClick={(e) => readLessClickAction(e, testimonial.id)}
                      >
                        READ LESS...
                      </a>
                    </div>
                  </>
                )}

                <div className="author-info">
                  <div className="author-picutre">
                    <img
                      src={testimonial.img}
                      alt="Nathan"
                      height="60"
                      width="60"
                    />
                  </div>
                  <div className="author-details">
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-position">
                      {testimonial.position}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="page-registration-action">
            <button className="register-button" onClick={handleRegister()}>
              Register Now
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
