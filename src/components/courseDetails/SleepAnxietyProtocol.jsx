/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unescaped-entities */
import { useContext } from 'react';
import { ABBRS, WORKSHOP_MODE, COURSE_MODES } from '@constants';
import { isEmpty, priceCalculation, tConvert } from '@utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useState } from 'react';
import { FaArrowRightLong } from 'react-icons/fa6';
import LinesEllipsis from 'react-lines-ellipsis';
import { Accordion, Card, AccordionContext } from 'react-bootstrap';
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';
import classNames from 'classnames';
import Vimeo from '@u-wave/react-vimeo';

dayjs.extend(utc);

export const SleepAnxietyProtocol = ({
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
    <main className="sleep-anxiety-protocol">
      <section class="banner-section">
        <div class="container">
          <div class="banner-content-box">
            <div class="banner-tagline">Freedom from insomnia starts here</div>
            <div class="banner-title">{title}</div>
            <div class="banner-desc">In just 3 days you can:</div>
            <ul class="banner-features">
              <li>
                <span class="icon-aol iconaol-Tick"></span>Learn effective
                biohacks to improve your sleep
              </li>
              <li>
                <span class="icon-aol iconaol-Tick"></span>Wake up naturally,
                refreshed, & energized
              </li>
              <li>
                <span class="icon-aol iconaol-Tick"></span>Tap into your
                breath’s full potential
              </li>
            </ul>
            <div class="banner-actions">
              <button class="banner-button btn-primary">Get Started</button>
              <button class="banner-button btn-secondary">
                Course Overview
              </button>
            </div>
            <div class="banner-note">Available online!</div>
          </div>
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
      <section class="section-progress">
        <div class="container">
          <div class="row">
            <div class="col">
              <div class="progress_box">
                <div class="progress_logo">
                  <img
                    src="/img/transforming-lives.svg"
                    alt="transforming lives"
                  />
                </div>
                <div class="progress_content">
                  <span class="title">43 Years</span>
                  <br />
                  <span class="content">of transforming lives</span>
                </div>
              </div>
            </div>
            <div class="col">
              <div class="progress_box">
                <div class="progress_logo">
                  <img src="/img/worldwide.svg" alt="transforming lives" />
                </div>
                <div class="progress_content">
                  <span class="title">10,000+ Centers</span>
                  <br />
                  <span class="content">established worldwide</span>
                </div>
              </div>
            </div>
            <div class="col">
              <div class="progress_box">
                <div class="progress_logo">
                  <img src="/img/countries.svg" alt="transforming lives" />
                </div>
                <div class="progress_content">
                  <span class="title">182 Countries</span>
                  <br />
                  <span class="content">
                    where our programs made a difference
                  </span>
                </div>
              </div>
            </div>
            <div class="col">
              <div class="progress_box">
                <div class="progress_logo">
                  <img src="/img/people.svg" alt="transforming lives" />
                </div>
                <div class="progress_content">
                  <span class="title">500M+ Lives</span>
                  <br />
                  <span class="content">
                    touched through our courses & events
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="section-waking">
        <div class="container">
          <div class="section-title mobile">Stop waking up @ 3 AM…</div>
          <div class="waking-col col-img">
            <img src="/img/waking.webp" class="img-waking" width="485" />
          </div>
          <div class="waking-content">
            <div class="section-title">Stop waking up @ 3 AM…</div>
            <p>
              Meet Jennifer, a startup founder who’s{' '}
              <strong>
                burned through every solution promising better sleep
              </strong>
              . She’s tried melatonin, blue light glasses, meditation apps,
              white noise machines—yet nothing sticks. Her mind keeps racing at
              night, and even when she does sleep, she wakes up groggy
            </p>
            <p>
              One night, while doomscrolling through another sleepless stretch,
              she stumbles across something unusual: Breathwork for deep sleep.
              Skeptical but intrigued, she decides to try the Sleep & Anxiety
              Protocol. Within days, something shifts—she’s not just falling
              asleep faster,{' '}
              <strong>
                she’s waking up energized, focused, and surprisingly, less
                anxious
              </strong>
              .
            </p>
          </div>
        </div>
      </section>
      <section class="section-neuro-balance">
        <div class="container">
          <div class="neuro-balance-content">
            <div class="section-title">
              Deep sleep isn’t just about relaxation—it’s about neurological
              balance.
            </div>
            <div class="neuro-desc">
              Unlike traditional sleep aids that simply sedate the brain,{' '}
              <strong>
                the Sleep & Anxiety Protocol will help retrain your nervous
                system.
              </strong>
            </div>
            <ul class="neuro-balance-features">
              <li>
                <span class="icon-aol iconaol-Tick"></span>
                <span>
                  <strong>Activate the vagus nerve,</strong> lowering anxiety
                  and reducing nighttime worry.
                </span>
              </li>
              <li>
                <span class="icon-aol iconaol-Tick"></span>
                <span>
                  <strong>Reset the circadian rhythm,</strong> to help you fall
                  asleep faster & stay asleep longer
                </span>
              </li>
              <li>
                <span class="icon-aol iconaol-Tick"></span>
                <span>
                  <strong>Enhance cognitive function,</strong> improving memory,
                  focus, and attention
                </span>
              </li>
              <li>
                <span class="icon-aol iconaol-Tick"></span>
                <span>
                  <strong>Get live guidance</strong> and support from expert
                  instructors with daily Q&A
                </span>
              </li>
            </ul>
            <div class="additional-info">
              Traditional sleep solutions, like sleep tracking apps or
              supplements, can’t fix what’s fundamentally a nervous system
              imbalance. <strong>Breathwork does.</strong>
            </div>
            <div class="neuro-action">
              <button class="neuro-button" onClick={handleRegister()}>
                Get Your Sleep Back
              </button>
            </div>
          </div>
        </div>
      </section>
      <section class="section-feedback">
        <div class="container">
          <div class="section-title">Meet Daniel</div>
          <div class="section-desc">
            He was going through a hard time and found relief through the power
            of his breath.
          </div>
          <div class="feedback-container">
            <div class="feedback-image">
              <img src="/img/daniel-feedback.webp" width="485" alt="daniel" />
            </div>
            <div class="feedback-content">
              <div class="feedback-rating">
                <img src="/img/rating-5star.png" alt="rating" />
              </div>
              <div class="feedback-text">
                “
                <strong>
                  I tried everything to get better sleep from changing my diet,
                  to seeing a sleep specialist, to taking sleeping pills.
                  Nothing seemed to work.
                </strong>{' '}
                Then, I tried this Sleep & Anxiety Protocol and within days, I
                was getting noticeably better sleep. I still can’t believe the
                answer was so simple. My breath gave me my sleep back.”{' '}
              </div>
              <div class="feedback-author">— Daniel K.</div>
            </div>
          </div>
        </div>
      </section>
      <section class="featured-in">
        <div class="container">
          <h2 class="section-title">
            From the Art of Living
            <span class="text-sm">with techniques featured in</span>
          </h2>
          <div class="featured-listing">
            <div class="featured-item">
              <div class="featured-item-logo">
                <img src="/img/CNN.png" width="152" alt="CNN" />
              </div>
            </div>
            <div class="featured-item">
              <div class="featured-item-logo">
                <img
                  src="/img/yoga-journal.png"
                  width="171"
                  alt="Yoga Journal"
                />
              </div>
            </div>
            <div class="featured-item">
              <div class="featured-item-logo">
                <img src="/img/Harvard.png" width="197" alt="Harvard" />
              </div>
            </div>
            <div class="featured-item">
              <div class="featured-item-logo">
                <img src="/img/WP.png" width="144" alt="Washington Post" />
              </div>
            </div>
            <div class="featured-item">
              <div class="featured-item-logo">
                <img
                  src="/img/press-logo-time-magazine.jpg"
                  width="187"
                  alt="Time Magazine"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="what-you-get">
        <div class="container">
          <div class="section-title">What you’ll get</div>
          <div class="section-desc">
            Step into a world of deep sleep and anxiety relief with the online
            Sleep & Anxiety Protocol. In just 3 days, over 2.5 hours per day,
            you’ll discover effective biohacks to improve the quality of your
            sleep—<em>without any unwanted side effects</em>.
          </div>
          <ul class="get-features">
            <li>
              <span class="icon-aol iconaol-Tick"></span>
              <span>
                Stimulate the parasympathetic system to reduce anxiety & improve
                sleep
              </span>
            </li>
            <li>
              <span class="icon-aol iconaol-Tick"></span>
              <span>
                Yoga stretches for restorative sleep, NSDR / Yoga Nidra to relax
                the body
              </span>
            </li>
            <li>
              <span class="icon-aol iconaol-Tick"></span>
              <span>
                Guided breathwork and meditation practices to calm the mind &
                body
              </span>
            </li>
            <li>
              <span class="icon-aol iconaol-Tick"></span>
              <span>
                Reestablish a connection with your natural circadian rhythm
              </span>
            </li>
            <li>
              <span class="icon-aol iconaol-Tick"></span>
              <span>
                Discover sleep hygiene practices to optimize the quality &
                quantity of sleep
              </span>
            </li>
            <li>
              <span class="icon-aol iconaol-Tick"></span>
              <span>
                Explore the gut-mind connection, and how to balance gut
                microbiome
              </span>
            </li>
            <li>
              <span class="icon-aol iconaol-Tick"></span>
              <span>Restore balance to your entire mind-body system</span>
            </li>
            <li>
              <span class="icon-aol iconaol-Tick"></span>
              <span>
                Activate the vagus nerve, enhancing vagal tone to bust anxiety
              </span>
            </li>
          </ul>
          <div class="feature-tagline">
            Get your Z’s—<em>naturally.</em>
          </div>
          <div class="feature-action">
            <button class="feature-button">Start Now</button>
          </div>
        </div>
      </section>
      <section class="the-science">
        <div class="container">
          <div class="section-title">The Science of Sound Sleep</div>
          <div class="section-desc">
            A glimpse into a sleep-transforming practice
          </div>
          <div class="video-science">
            <Vimeo
              video="51cba0dcaa"
              autoplay
              width="690"
              height="387"
              title="Benefits of Yoga Nidra"
            />
          </div>
          <div class="science-features">
            <div class="feature-box">
              <div class="feature-icon">
                <img src="/img/icon-brain-flower.png" alt="brain" />
              </div>
              <div class="feature-content">
                <div class="feature-title">Activates the Vagus Nerve</div>
                <div class="feature-desc">
                  Instantly shifts the body into deep rest mode
                </div>
              </div>
            </div>
            <div class="feature-box">
              <div class="feature-icon">
                <img src="/img/icon-owl.png" alt="brain" />
              </div>
              <div class="feature-content">
                <div class="feature-title">
                  Eliminates Nighttime Overthinking
                </div>
                <div class="feature-desc">
                  Retrains the brain to release stress before bed
                </div>
              </div>
            </div>
            <div class="feature-box">
              <div class="feature-icon">
                <img src="/img/icon-no-meds.png" alt="brain" />
              </div>
              <div class="feature-content">
                <div class="feature-title">No Side Effects, No Dependency</div>
                <div class="feature-desc">
                  Unlike melatonin or prescription sleep aids
                </div>
              </div>
            </div>
            <div class="feature-box">
              <div class="feature-icon">
                <img src="/img/icon-brain-skill.png" alt="brain" />
              </div>
              <div class="feature-content">
                <div class="feature-title">Teaches Lifelong Skills</div>
                <div class="feature-desc">
                  Rather than providing a temporary fix
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="section-testimonials">
        <div class="container">
          <div class="quote-icon">
            <sub>“</sub>
          </div>
          <h2 class="section-title">What people are sharing</h2>
          <div class="testimonials-listing">
            <div class="testimonial-item">
              <div class="author-info">
                <div class="author-picutre">
                  <img
                    src="/img/angelica-review.webp"
                    alt="Nathan"
                    height="60"
                    width="60"
                  />
                </div>
                <div class="author-details">
                  <div class="author-name">Angelica</div>
                  <div class="author-position">Course Participant</div>
                </div>
              </div>
              <div class="testimony-title">
                “Wish I had learned this sooner!”
              </div>
              <div class="testimony-text">
                “I can’t believe how easy it is to quiet my racing thoughts."{' '}
              </div>
            </div>
            <div class="testimonial-item">
              <div class="author-info">
                <div class="author-picutre">
                  <img
                    src="/img/2-silent-comments.png"
                    alt="Nathan"
                    height="60"
                    width="60"
                  />
                </div>
                <div class="author-details">
                  <div class="author-name">Joanna</div>
                  <div class="author-position">Course Participant</div>
                </div>
              </div>
              <div class="testimony-title">
                “I got out of my funk that was getting me unmotivated”
              </div>
              <div class="testimony-text">
                “It was awesome! I feel so much lighter and happier."
              </div>
            </div>
            <div class="testimonial-item">
              <div class="author-info">
                <div class="author-picutre">
                  <img
                    src="/img/siggy-review.jpeg"
                    alt="Nathan"
                    height="60"
                    width="60"
                  />
                </div>
                <div class="author-details">
                  <div class="author-name">Siggy</div>
                  <div class="author-position">Course Participant</div>
                </div>
              </div>
              <div class="testimony-title">
                “sleep better and feel more rested.”
              </div>
              <div class="testimony-text">
                "I was surprised how simple and effective this was. I learned
                simple tools that{' '}
                <strong>help me sleep better and feel more rested.</strong>"
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="sa-protocol">
        <div class="container">
          <div class="protocol-box">
            <div class="tagline">
              Make your sleep effortless with the online
            </div>
            <div class="box-title">Sleep & Anxiety Protocol</div>
            {isUsableCreditAvailable && (
              <div class="course-price">
                <p>Now only ${UpdatedFeeAfterCredits}</p>
                {delfee && (
                  <p>
                    Regular price: <s>${delfee}</s>
                  </p>
                )}
              </div>
            )}
            {!isUsableCreditAvailable && (
              <div class="course-price">
                <p>Now only ${fee}</p>
                {delfee && (
                  <p>
                    Regular price: <s>${delfee}</s>
                  </p>
                )}
              </div>
            )}

            <div class="box-action">
              <button class="box-button">Sleep More. Stress Less</button>
            </div>
          </div>
        </div>
      </section>
      <section class="meet-gurudev">
        <div class="container">
          <div class="content-box">
            <div class="section-title">
              Meet{' '}
              <span>
                Gurudev
                <br />
                Sri Sri Ravi Shankar
              </span>
            </div>
            <div class="section-desc">
              Gurudev, the founder of the Art of Living Foundation, has
              dedicated his life to spreading the benefits of SKY Breath
              Meditation. His teachings have helped millions find peace and
              resilience, igniting a global movement for a stress-free,
              violence-free society across 182 countries.
            </div>
          </div>
        </div>
      </section>
      <section class="section-faq">
        <div class="container">
          <div class="section-title">Frequently Asked Questions</div>
          <Accordion defaultActiveKey="0" className="accordion">
            <Card>
              <Card.Header>
                <ContextAwareToggle eventKey="0">
                  What is the duration of the {title}?
                </ContextAwareToggle>
              </Card.Header>
              <Accordion.Collapse eventKey="0">
                <Card.Body>
                  → The course is taught in 3 days with 2.5 hour live online
                  sessions each day, guided by a certified instructor.
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Card.Header>
                <ContextAwareToggle eventKey="1">
                  Can I reschedule my Sleep & Anxiety Protocol after my initial
                  registration?
                </ContextAwareToggle>
              </Card.Header>
              <Accordion.Collapse eventKey="1">
                <Card.Body>
                  → Yes, you can reschedule to a different Sleep & Anxiety
                  Protocol session if you are unable to attend the original
                  dates selected.
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Card.Header>
                <ContextAwareToggle eventKey="2">
                  How is this different from meditation or sleep apps?
                </ContextAwareToggle>
              </Card.Header>
              <Accordion.Collapse eventKey="2">
                <Card.Body>
                  → Most meditation apps help with relaxation, but they don’t
                  retrain your nervous system for long-term sleep and anxiety
                  improvements. Plus, this course is offered in real time with a
                  certified LIVE instructor, where you’ll have the opportunity
                  to ask questions for extra support.
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Card.Header>
                <ContextAwareToggle eventKey="3">
                  What if I’ve tried everything?
                </ContextAwareToggle>
              </Card.Header>
              <Accordion.Collapse eventKey="3">
                <Card.Body>
                  → You may have tried white noise, sleep apps, melatonin, and
                  even medication to help with sleeplessness. The tools you’ll
                  receive with the Sleep & Anxiety Protocol are lifelong tools
                  to help reset your nervous system, targeting the root cause,
                  rather than treating the symptom.
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Card.Header>
                <ContextAwareToggle eventKey="4">
                  How soon will I see results?
                </ContextAwareToggle>
              </Card.Header>
              <Accordion.Collapse eventKey="4">
                <Card.Body>
                  → Many people experience better sleep from the very first
                  session. In fact, some participants have even fallen asleep
                  during the actual course 😄! Like with anything, the effects
                  are cumulative. The longer you practice, the stronger the
                  benefits and results.
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          </Accordion>
        </div>
      </section>
      <section class="reset-system">
        <div class="container">
          <div class="reset-system-box">
            <div class="reset-system-box-inner">
              <div class="section-title">
                Reset your nervous system with the 3-day online Sleep & Anxiety
                Protocol
              </div>
              <div class="reset-system-action">
                <button class="reset-system-button">Start Now</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

function ContextAwareToggle({ children, eventKey, callback }) {
  const currentEventKey = useContext(AccordionContext);

  const decoratedOnClick = useAccordionToggle(
    eventKey,
    () => callback && callback(eventKey),
  );

  const isCurrentEventKey = currentEventKey === eventKey;

  return (
    <h5 className="mb-0">
      <button
        className={classNames('btn btn-link', {
          collapsed: !isCurrentEventKey,
        })}
        onClick={decoratedOnClick}
      >
        {children}
      </button>
    </h5>
  );
}
