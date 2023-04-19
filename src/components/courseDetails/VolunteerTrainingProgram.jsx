/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Link, Element, animateScroll as scroll } from "react-scroll";
import { useRouter } from "next/router";
import classNames from "classnames";
import { ResearchFindingSource } from "./ResearchFindingSource";
import { CourseBottomCard } from "./CourseBottomCard";
import { useGlobalAlertContext } from "@contexts";
import { ABBRS, COURSE_TYPES, ALERT_TYPES } from "@constants";
import { HideOn } from "@components";
import { priceCalculation, tConvert } from "@utils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { RegisterPanel } from "./RegisterPanel";
import Style from "./CourseDetails.module.scss";
import { pushRouteWithUTMQuery } from "@service";

dayjs.extend(utc);

const faqContent = [
  {
    label: "What will I learn in the Volunteer Training Program?",
    content:
      "You’ll expand your horizons with life-enhancing wisdom, self-development, and transformative practices to access deep inner strength and become a dynamic leader professionally, personally, and spiritually. You’ll also learn how to facilitate a one-hour meditation session, complete with social connection exercises, breathing techniques, mindful awareness, and guided meditations—plus, learn how to lead introductory talks. With these new skills, you’ll empower your life and community.",
  },
  {
    label:
      "Will I be able to teach SKY Breath Meditation after attending this program?",
    content:
      "The Volunteer Training Program (VTP) is the prerequisite to attending the Art of Living Teacher Training Program (TTP). Once you have completed both the VTP and TTP, you will be able to teach SKY Breath Meditation.",
  },
  {
    label: "Will I be ready to lead meditations after this course?",
    content:
      "Yes! You’ll emerge as a confident meditation facilitator ready to lead the guided meditation taught in the Volunteer Training Program, complete with social connection exercises, breathing techniques, and mindful awareness.",
  },
  {
    label: "Do I have to attend all sessions?",
    content:
      "Yes, it is mandatory to attend all program sessions to complete the training.",
  },
  {
    label: "Do I need to be meditating every day to join the training?",
    content:
      "To maximize your experience of the program (and life!), we recommend a daily meditation practice, but it is not a requirement for the Volunteer Training Program.",
  },
  {
    label:
      "Are there any requirements I need to fulfill post-training or in years to come?",
    content:
      "Following the training, it is recommended that you organize or volunteer to lead at least three introductory sessions and three meditations using the skills and support you gained from the Volunteer Training Program. It allows you to fully integrate your newly acquired skill set and continue to develop your newfound confidence.",
  },
  {
    label: "How will the program help with leadership skills?",
    content:
      "One of the key skills of a leader is to inspire and connect with people while organizing and leading various projects—you will gain all these skills and be empowered with a wealth of experience and confidence too. The Volunteer Training Program is a course designed to enhance organizational skills while connecting with people at a deeper level. In addition, volunteering is a powerful demonstration of selfless action, which is an inspiring quality to have in any leader.",
  },
];

export const VolunteerTrainingProgram = ({ data, swiperOption }) => {
  const { showAlert } = useGlobalAlertContext();
  const router = useRouter();
  const [selectedFAQ, setSelectedFAQ] = useState(-1);

  const showResearchModal = (e) => {
    if (e) e.preventDefault();
    showAlert(ALERT_TYPES.CUSTOM_ALERT, {
      title: "Success",
      children: <ResearchFindingSource />,
      className: "research-detail-modal",
      hideConfirm: true,
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/course/checkout/${data.sfid}`,
      query: {
        ctype: data.productTypeId,
        page: "c-o",
      },
    });
  };

  const handleFAQselection = (index) => {
    if (selectedFAQ === index) {
      setSelectedFAQ(-1);
    } else {
      setSelectedFAQ(index);
    }
  };

  const autoSwiperOption = {
    slidesPerView: 1,
    spaceBetween: 30,
    centeredSlides: true,
    autoplay: {
      delay: 2000,
    },
    pagination: {
      el: ".research__list-pagination",
      clickable: true,
    },
  };

  const {
    title,
    workshopTotalHours,
    mode,
    eventStartDate,
    eventEndDate,
    email,
    phone1,
    phone2,
    timings,
    primaryTeacherName,
    coTeacher1Name,
    coTeacher2Name,
    notes,
    streetAddress1,
    streetAddress2,
    state,
    city,
    country,
    productTypeId,
    corporateName,
  } = data || {};
  const { fee, delfee, offering } = priceCalculation({ workshop: data });

  return (
    <>
      <main>
        <section className="about-program volunteer-program">
          <div className="about-program__image">
            <img
              src="/img/volunteer-top-column.png"
              alt="Sri Sri Yoga Foundation Program"
            />
          </div>
          <div className="container">
            <div className="row">
              <div className="col-lg-7">
                <div className="about-program__main">
                  <p className="about-program__main-type">{mode}</p>

                  <h1 className="about-program__main-name about-program__main-name_thin">
                    {title}
                  </h1>
                  <ul className="about-program__main-list about-program__main-list_small">
                    <li>Grow personally, professionally, and spiritually</li>
                    <li>
                      Overcome personal barriers; expand to your full potential
                    </li>
                    <li>Feel inspired, confident, connected</li>
                  </ul>
                  <Link
                    activeClassName="active"
                    className="btn-primary register-button"
                    to="registerNowBlock"
                    spy={true}
                    smooth={true}
                    duration={500}
                    offset={-100}
                  >
                    Register Now
                  </Link>
                </div>
              </div>

              <div className="col-sm-8 offset-sm-2 col-md-6 offset-md-3 col-lg-5 offset-lg-0 offset-xl-1 col-xl-4 d-flex flex-column justify-content-end">
                <div className="about-program__details about-program__details_small">
                  <h5 className="about-program__details-title about-program__details-title_small">
                    {mode} course details
                  </h5>
                  <div className="details-info">
                    <div className="details-info__item">
                      <div className="details-info__text details-info__text_bold">
                        Date:
                      </div>
                      {dayjs
                        .utc(eventStartDate)
                        .isSame(dayjs.utc(eventEndDate), "month") && (
                        <div className="details-info__text">{`${dayjs
                          .utc(eventStartDate)
                          .format("MMMM DD")}-${dayjs
                          .utc(eventEndDate)
                          .format("DD, YYYY")}`}</div>
                      )}
                      {!dayjs
                        .utc(eventStartDate)
                        .isSame(dayjs.utc(eventEndDate), "month") && (
                        <div className="details-info__text">{`${dayjs
                          .utc(eventStartDate)
                          .format("MMMM DD")}-${dayjs
                          .utc(eventEndDate)
                          .format("MMMM DD, YYYY")}`}</div>
                      )}
                    </div>
                    <div className="details-info__item">
                      <div className="details-info__text details-info__text_bold">
                        Timings:
                      </div>
                      <div className="details-info__text">
                        {timings &&
                          timings.map((time) => {
                            return (
                              <>
                                {`${dayjs
                                  .utc(time.startDate)
                                  .format("dd")}: ${tConvert(
                                  time.startTime,
                                )}-${tConvert(time.endTime)} ${
                                  ABBRS[time.timeZone]
                                }`}
                                <br />
                              </>
                            );
                          })}
                      </div>
                    </div>
                    <div className="details-info__item">
                      <div className="details-info__text details-info__text_bold">
                        Instructor(s):
                      </div>
                      <div className="details-info__text">
                        {primaryTeacherName && (
                          <>
                            {primaryTeacherName}
                            <br />
                          </>
                        )}
                        {coTeacher1Name && (
                          <>
                            {coTeacher1Name}
                            <br />
                          </>
                        )}
                        {coTeacher2Name && (
                          <>
                            {coTeacher2Name}
                            <br />
                          </>
                        )}
                      </div>
                    </div>
                    <div className="details-info__item">
                      <div className="details-info__text details-info__text_bold">
                        Contacts:
                      </div>
                      <div className="details-info__text">
                        {phone1 && (
                          <>
                            <a href={`tel:${phone1}`}>{phone1}</a>
                            <br />
                          </>
                        )}
                        {phone2 && (
                          <>
                            <a href={`tel:${phone2}`}>{phone2}</a>
                            <br />
                          </>
                        )}
                        {email && (
                          <>
                            <a href={`mailto:${email}`}>{email}</a>
                            <br />
                          </>
                        )}
                      </div>
                    </div>

                    <div className="details-info__item">
                      <div className="details-info__text details-info__text_bold">
                        Location:
                      </div>
                      <div className="details-info__text">
                        {!data.isLocationEmpty && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${
                              data?.locationStreet || ""
                            }, ${data?.locationCity} ${
                              data?.locationProvince
                            } ${data?.locationPostalCode} ${
                              data?.locationCountry
                            }`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {data?.locationStreet || ""}
                            {data?.locationStreet && <br />}
                            {data?.locationCity || ""}
                            {", "}
                            {data?.locationProvince || ""}{" "}
                            {data?.locationPostalCode || ""}
                          </a>
                        )}
                        {data.isLocationEmpty && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${
                              data?.streetAddress1 || ""
                            },${data?.streetAddress2 || ""} ${data?.city} ${
                              data?.state
                            } ${data?.zip} ${data?.country}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {data?.streetAddress1 || ""}
                            {data?.streetAddress2 || ""}
                            <br />
                            {data?.city || ""}
                            {", "}
                            {data?.state || ""} {data?.zip || ""}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="progress-section volunteer-program">
          <div className="container">
            <div className="row">
              <div className="col-lg-10 col-xl-7">
                <h5 className="progress-section__title">
                  Empower your life and community with new leadership, teamwork,
                  and communication skills.
                </h5>
              </div>
            </div>
            <div className="achivment">
              <div className="row">
                <div className="col-12 col-lg-3 text-center text-lg-left mt-5 mt-lg-0">
                  <div className="logo-achivment">
                    <div className="achivment__logo">
                      <img
                        src="/img/transformational-education.svg"
                        alt="years"
                      />
                    </div>
                    <h6 className="achivment__title">
                      Transformational education
                    </h6>
                    <p className="achivment__text">
                      Learn with the experts—an organization dedicated for over
                      42 years to transforming lives across the globe
                    </p>
                  </div>
                </div>
                <div className="col-12 col-lg-3 text-center text-lg-left mt-5 mt-lg-0">
                  <div className="logo-achivment">
                    <div className="achivment__logo">
                      <img src="/img/suitable-for-all.svg" alt="day" />
                    </div>
                    <h6 className="achivment__title">Suitable for all</h6>
                    <p className="achivment__text">
                      Gain the skills, experience, and confidence to lead,
                      deliver, and take inspired action
                    </p>
                  </div>
                </div>
                <div className="col-12 col-lg-3 text-center text-lg-left mt-5 mt-lg-0">
                  <div className="logo-achivment">
                    <div className="achivment__logo">
                      <img src="/img/live-online-program.svg" alt="years" />
                    </div>
                    <h6 className="achivment__title">LIVE {mode} program</h6>
                    <p className="achivment__text">
                      Guided by highly-trained instructors and mentors over two
                      weekends, plus a week of service-learning
                    </p>
                  </div>
                </div>
                <div className="col-12 col-lg-3 text-center text-lg-left mt-5 mt-lg-0">
                  <div className="logo-achivment">
                    <div className="achivment__logo">
                      <img src="/img/support-&-guidance.svg" alt="years" />
                    </div>
                    <h6 className="achivment__title">Support & guidance</h6>
                    <p className="achivment__text">
                      Practice your skills and get real-time feedback within a
                      supportive, positive setting
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="program-meet program-meet_inspiration">
          <div className="program-meet__image">
            <img
              src="/img/program-meet-bg.png"
              alt="Meet the confident, inspired YOU"
            />
          </div>
          <div className="container program-meet__container">
            <div className="row">
              <div className="col-xl-9">
                <h2 className="h2 program-meet__title">
                  Meet the confident, inspired YOU
                </h2>
                <p className="p1 program-meet__text">
                  We all have a{" "}
                  <b>
                    <i>why</i>
                  </b>{" "}
                  — a reason, a motivation, a hope. Yet sometimes fear,
                  confidence, or skill level stand in the way. And that’s why
                  we’re here!
                </p>
                <p className="p1 program-meet__text">
                  The Volunteer Training Program equips you with the skills and
                  experience to move ahead empowered, beyond obstacles, on a
                  journey to fulfill your why. And all with the support of
                  mentors and leaders throughout the country. Let’s begin.
                </p>
                <p className="p1 program-meet__text">
                  <b>Choose to thrive, and help others thrive too.</b>
                </p>
              </div>
            </div>
            <h3 className="h3 program-meet__subtitle">
              Practical tools, real experience
            </h3>
            <div className="row">
              <div className="col-lg-6 mb-4">
                <div className="program-meet-card">
                  <img
                    src="/img/unlock-your-potential.svg"
                    alt="Unlock your potential"
                    className="program-meet-card__icon"
                  />
                  <h6 className="program-meet-card__title">
                    Unlock your potential
                  </h6>
                  <p className="program-meet-card__text">
                    Expand your horizons with life-enhancing wisdom,
                    self-development, and transformative practices to access
                    deep inner strength.
                  </p>
                </div>
              </div>
              <div className="col-lg-6 mb-4">
                <div className="program-meet-card">
                  <img
                    src="/img/develop-skills.svg"
                    alt="Develop skills"
                    className="program-meet-card__icon"
                  />
                  <h6 className="program-meet-card__title">Develop skills</h6>
                  <p className="program-meet-card__text">
                    Gain the knowledge and confidence (whatever your current
                    fear level!) to become a dynamic speaker and the leader you
                    were always meant to be!{" "}
                  </p>
                </div>
              </div>
              <div className="col-lg-6 mb-4">
                <div className="program-meet-card">
                  <img
                    src="/img/be-real-world-ready.svg"
                    alt="Be real-world ready"
                    className="program-meet-card__icon"
                  />
                  <h6 className="program-meet-card__title">
                    Be real-world ready
                  </h6>
                  <p className="program-meet-card__text">
                    Emerge as a meditation facilitator ready to organize,
                    structure, and lead Art of Living introductory meditation
                    sessions.
                  </p>
                </div>
              </div>
              <div className="col-lg-6 mb-4">
                <div className="program-meet-card">
                  <img
                    src="/img/gain-practical-experience.svg"
                    alt="Gain practical experience"
                    className="program-meet-card__icon"
                  />
                  <h6 className="program-meet-card__title">
                    Gain practical experience
                  </h6>
                  <p className="program-meet-card__text">
                    Practice and integrate your new transferable skills and
                    knowledge, with real-time feedback, in an inclusive,
                    uplifting environment—with great community spirit!
                  </p>
                </div>
              </div>
              <div className="col-lg-6 mb-4">
                <div className="program-meet-card">
                  <img
                    src="/img/be-inspired.svg"
                    alt="Be inspired"
                    className="program-meet-card__icon"
                  />
                  <h6 className="program-meet-card__title">Be inspired</h6>
                  <p className="program-meet-card__text">
                    Discover the importance of service leadership and community
                    engagement, and feel more connected to those around you.
                  </p>
                </div>
              </div>
              <div className="col-lg-6 mb-4">
                <div className="program-meet-card">
                  <img
                    src="/img/connect-to-community.svg"
                    alt="Connect to community"
                    className="program-meet-card__icon"
                  />
                  <h6 className="program-meet-card__title">
                    Connect to community
                  </h6>
                  <p className="program-meet-card__text">
                    Become part of an ever-growing and supportive nationwide
                    community of volunteers, mentors, and instructors to grow
                    and volunteer with.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="program-transformations">
          <div className="container">
            <h2 className="h2 program-transformations__title">
              How lives are transformed
            </h2>
            <Swiper
              className="swiper-container program-transformations__slider"
              {...swiperOption}
            >
              <SwiperSlide className="swiper-slide transformation">
                <div className="author">
                  <div className="author__image">
                    <img src="/img/hayley-photo.png" alt="Hayley Gigi P." />
                  </div>
                  <h6 className="author__name">Hayley Gigi P.</h6>
                </div>
                <p className="transformation__text">
                  “My experience was extremely profound”
                </p>
                <button type="button" className="link transformation__link">
                  Read more
                </button>
              </SwiperSlide>
              <SwiperSlide className="swiper-slide transformation">
                <div className="author">
                  <div className="author__image">
                    <img src="/img/kaitlin-photo.png" alt="Kaitlin S." />
                  </div>
                  <h6 className="author__name">Kaitlin S.</h6>
                </div>
                <p className="transformation__text">
                  “I've been set free of my fears”
                </p>
                <button type="button" className="link transformation__link">
                  Read more
                </button>
              </SwiperSlide>
              <SwiperSlide className="swiper-slide transformation">
                <div className="author">
                  <div className="author__image">
                    <img src="/img/sam-photo.png" alt="Sam N." />
                  </div>
                  <h6 className="author__name">Sam N.</h6>
                </div>
                <p className="transformation__text">
                  “Inspired to tackle any problem in the world!”
                </p>
                <button type="button" className="link transformation__link">
                  Read more
                </button>
              </SwiperSlide>
            </Swiper>
          </div>
        </section>
        <section className="program-experts">
          <div className="container">
            <div className="row">
              <div className="col-lg-6 d-flex flex-column justify-content-center">
                <h2 className="h2 program-experts__title">Meet the experts</h2>
                <p className="p1 program-experts__text">
                  The Art of Living is one of the largest volunteer-run
                  non-profits in the world that’s transformed the lives of
                  millions—and continues to develop inspired, skilled, and
                  confident volunteers that make a difference.
                </p>
                <p className="p3 program-experts__text program-experts__text_small">
                  With an ever-expanding global network of over one million
                  volunteers, you join a community making an impact, dedicated
                  to uplifting individuals and building empowered communities.
                </p>
                <p className="p3 program-experts__text program-experts__text_small">
                  Welcome!
                </p>
              </div>
              <div className="col-lg-6 d-flex flex-column justify-content-center">
                <img
                  src="/img/experts-collage.png"
                  alt="Meet the experts"
                  className="program-experts__image"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="program-founder">
          <div className="program-founder__image">
            <img
              src="/img/sri-sri-ravi-shankar.jpg"
              alt="Founder of the Art of Living"
            />
          </div>
          <div className="container program-founder__container">
            <div className="row">
              <div className="col-xl-10 offset-xl-1">
                <h6 className="program-founder__author">
                  Gurudev Sri Sri Ravi Shankar
                </h6>
                <h6 className="program-founder__author program-founder__author_title">
                  Founder of the Art of Living
                </h6>
                <h3 className="program-founder__text max-[770px]:tw-w-[200px]">
                  The ultimate purpose of life is to be of service.
                </h3>
              </div>
            </div>
          </div>
        </section>
        <section name="registerNowBlock" className="powerful volunteer-program">
          <div className="container">
            <div className="row">
              <div className="col-xl-10 offset-xl-1">
                <h2 className="h2 powerful__title">
                  Your impact in the world matters. <br />
                  You matter.
                </h2>
                <Element name="registerNowBlock">
                  <RegisterPanel workshop={data} />
                </Element>
              </div>
            </div>
          </div>
        </section>
        <section className="program-review">
          <div className="container">
            <h4 className="program-review__text">
              I feel like I've been set free of my fears. <br />
              One of the most impactful things I've ever done in my entire life!
            </h4>
            <div className="author">
              <div className="author__image">
                <img src="/img/kaitlin-photo.png" alt="Kaitlin S." />
              </div>
              <h6 className="author__name">Kaitlin S.</h6>
            </div>
          </div>
        </section>
        <section className="program-meet program-meet_toolkit">
          <div className="program-meet__image">
            <img
              src="/img/program-meet-anna.png"
              alt="Your toolkit for inspired action"
            />
          </div>
          <div className="container program-meet__container">
            <div className="row">
              <div className="col-lg-10 col-xl-8">
                <h2 className="h2 program-meet__title">
                  Your toolkit for inspired action
                </h2>
                <p className="p1 program-meet__text">
                  {mode} program: two weekends + one week in service
                </p>
                <div className="p1 p1_sb program-meet__quote">
                  You’ll walk away with the skills, experience, and courage to
                  engage and empower your community.
                </div>
                <h3 className="h3 program-meet__subtitle">
                  Practical tools, real experience
                </h3>
              </div>
              <div className="col-lg-8 col-xl-6">
                <div className="program-meet-card mb-4">
                  <img
                    src="/img/lead.svg"
                    alt="Lead"
                    className="program-meet-card__icon"
                  />
                  <h6 className="program-meet-card__title program-meet-card__title_strong">
                    Lead
                  </h6>
                  <p className="program-meet-card__text">
                    Learn how to facilitate a 1-hour meditation session,
                    complete with social connection exercises, breathing
                    techniques, mindful awareness, and guided meditations.
                  </p>
                </div>
                <div className="program-meet-card mb-4">
                  <img
                    src="/img/organize.svg"
                    alt="Organize"
                    className="program-meet-card__icon"
                  />
                  <h6 className="program-meet-card__title program-meet-card__title_strong">
                    Organize
                  </h6>
                  <p className="program-meet-card__text">
                    Gain tools on how to organize Art of Living introductory
                    1-hour meditation sessions, as well as the 3-day SKY Breath
                    Meditation courses.
                  </p>
                </div>
                <div className="program-meet-card mb-4">
                  <img
                    src="/img/master.svg"
                    alt="Master"
                    className="program-meet-card__icon"
                  />
                  <h6 className="program-meet-card__title program-meet-card__title_strong">
                    Master
                  </h6>
                  <p className="program-meet-card__text">
                    Master the techniques, tips, and tricks for clear and
                    concise communication, public speaking, service leadership,
                    and community engagement.
                  </p>
                </div>
                <div className="program-meet-card mb-4">
                  <img
                    src="/img/experience.svg"
                    alt="Experience"
                    className="program-meet-card__icon"
                  />
                  <h6 className="program-meet-card__title program-meet-card__title_strong">
                    Experience
                  </h6>
                  <p className="program-meet-card__text">
                    Integrate and gain practical experience of the new tools and
                    techniques so they’re fully embedded, enriching you with the
                    confidence and assurance—I can do this! Plus, you’ll gain
                    real-world experience via engagement with a service project.
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn-secondary program-meet__button"
              onClick={handleRegister}
            >
              Let's Get Started
            </button>
          </div>
        </section>
        <section className="program-faqs">
          <div className="container">
            <div className="row">
              <div className="col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
                <div className="program-faqs__card">
                  <h3 className="program-faqs__card-title">FAQs</h3>
                  {faqContent.map((content, index) => {
                    const showContent = selectedFAQ === index;
                    return (
                      <div key={index} className="card">
                        <div className="card-header">
                          <h2 className="mb-0 tw-pr-7">
                            <button
                              className="btn btn-block text-left tw-px-0 tw-accordion-button tw-flex"
                              type="button"
                              data-toggle="collapse"
                              data-target="#collapseOne"
                              aria-expanded={showContent}
                              aria-controls="collapseOne"
                              onClick={() => handleFAQselection(index)}
                            >
                              {content.label}
                              <span
                                class={classNames(Style.accordianIcon, {
                                  "tw-transform tw-rotate-45": showContent,
                                })}
                              />
                            </button>
                          </h2>
                        </div>
                        <div
                          className={classNames("collapse", {
                            show: showContent,
                          })}
                          aria-labelledby="headingOne"
                          data-parent="#accordionExample"
                        >
                          <div className="card-body">{content.content}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <HideOn divID="third" showOnPageInit={false}>
        <CourseBottomCard workshop={data} />
      </HideOn>
    </>
  );
};
