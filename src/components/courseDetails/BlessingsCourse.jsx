/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { Link, Element, animateScroll as scroll } from "react-scroll";
import { CourseBottomCard } from "./CourseBottomCard";
import { RegisterPanel } from "./RegisterPanel";
import { HideOn } from "@components";

export const BlessingsCourse = ({ data }) => {
  const { title, mode, aosCountRequisite, preRequisite } = data || {};

  const aosCount =
    aosCountRequisite != null && aosCountRequisite > 1 ? aosCountRequisite : "";

  const preRequisiteCondition = preRequisite
    .join(", ")
    .replace(/,(?=[^,]+$)/, " and")
    .replace("Silent Retreat", `${aosCount} Silent Retreat`);

  return (
    <>
      <main>
        <section className="about-course blessings-course">
          <div className="about-program__image about-course__image about-course__image_desktop">
            <img
              src="/img/blessings-course-top-column.jpg"
              alt="Blessings course"
            />
          </div>

          <div className="about-program__image about-course__image about-course__image_mobile">
            <img
              src="/img/blessings-course-top-column-mobile.jpg"
              alt="Blessings course"
            />
          </div>
          <div className="container">
            <div className="row">
              <div className="col-lg-7">
                <div className="about-course__main">
                  <h1 className="about-course__main-name">{title}</h1>
                  <ul className="about-course__main-list about-course__main-list_small">
                    <li>
                      Unlock your innate power to share healing energy and bless
                      others
                    </li>
                    <li>
                      Invite the flow of abundance and gratitude into your life
                    </li>
                    <li>Become a channel for positive, healing energy</li>
                  </ul>
                  <Link
                    activeClassName="active"
                    className="btn_box_secondary about-course-button"
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
            </div>
          </div>
        </section>
        <section className="share-section blessings-course">
          <div className="container">
            <div className="row justify-content-between">
              <div className="col-lg-10 col-xl-6">
                <div className="share-section__background">
                  <h5 className="share-section__title">
                    Want to Share Your Blessings With The World?
                  </h5>
                  <img src="/img/share-section-background.png" alt="" />
                </div>
              </div>
              <div className="col-lg-10 col-xl-6">
                <div className="share-section__description">
                  This course will teach you how to channel truly impactful
                  healing energy into blessings for those around you. You will
                  be guided through processes to let go of negative concepts,
                  resistance, and fear so that you can effectively bless and
                  heal others.
                </div>
              </div>
            </div>
            <div className="participants">
              <h5 className="participants__title">
                What Participants Experience
              </h5>
              <div className="row justify-content-between">
                <div className="col-12 col-lg-4 text-center mt-5 mt-lg-0">
                  <div className="participants__container">
                    <div className="participants__image">
                      <img
                        src="/img/participants-first.jpg"
                        alt="participants"
                      />
                    </div>
                    <h6 className="participants__name">Tasha Sophia G</h6>
                    <h6 className="participants__job">
                      Ayurvedic Healthcare Consultant
                    </h6>
                    <div className="participants__ratings">
                      <div className="participants__stars">
                        <img src="/img/participants-star.png" alt="" />
                        <img src="/img/participants-star.png" alt="" />
                        <img src="/img/participants-star.png" alt="" />
                        <img src="/img/participants-star.png" alt="" />
                        <img src="/img/participants-star.png" alt="" />
                      </div>
                    </div>
                    <p className="participants__comment">
                      The Blessings Course was a{" "}
                      <span>deeply profound experience</span>deeply profound
                      experience in my life. It gave me a new type of fullness,
                      one that I hadn’t ever fully experienced before—that I am
                      actually taken care of, perpetually swimming in an ocean
                      of blessings. This is not to say it was the end of tough
                      times in my life, but rather that I’ve since been able to
                      sail through those times with a much more impactful and
                      sturdy sense of confidence. As the name says, The Blessing
                      Course is indeed a blessing! A big one!
                    </p>
                  </div>
                </div>
                <div className="col-12 col-lg-4 text-center mt-5 mt-lg-0">
                  <div className="participants__container">
                    <div className="participants__image">
                      <img
                        src="/img/participants-second.jpg"
                        alt="participants"
                      />
                    </div>
                    <h6 className="participants__name">Gayathri U.</h6>
                    <h6 className="participants__job">Resource Manager</h6>
                    <div className="participants__ratings">
                      <div className="participants__stars">
                        <img src="/img/participants-star.png" alt="" />
                        <img src="/img/participants-star.png" alt="" />
                        <img src="/img/participants-star.png" alt="" />
                        <img src="/img/participants-star.png" alt="" />
                        <img src="/img/participants-star.png" alt="" />
                      </div>
                    </div>
                    <p className="participants__comment">
                      This was one of <span>the most beautiful gifts</span> I
                      have received in my life. The deep meditation and process
                      taught on the course brought me a complete new level of
                      experiencing consciousness, peace, and abundance. Time and
                      again, I keep witnessing deep healing happening to people
                      that receive blessings through a simple yet powerful and
                      profound process taught in this course.
                    </p>
                  </div>
                </div>
                <div className="col-12 col-lg-4 text-center mt-5 mt-lg-0">
                  <div className="participants__container">
                    <div className="participants__image">
                      <img
                        src="/img/participants-third.jpg"
                        alt="participants"
                      />
                    </div>
                    <h6 className="participants__name">Fernando</h6>
                    <h6 className="participants__job">Mathematics Professor</h6>
                    <div className="participants__ratings">
                      <div className="participants__stars">
                        <img src="/img/participants-star.png" alt="" />
                        <img src="/img/participants-star.png" alt="" />
                        <img src="/img/participants-star.png" alt="" />
                        <img src="/img/participants-star.png" alt="" />
                        <img src="/img/participants-star.png" alt="" />
                      </div>
                    </div>
                    <p className="participants__comment">
                      One of my favorite Art of Living courses. I went into the
                      course seeking tools to deepen my connection with myself
                      and others. I was amazed by the tools I received; I had
                      never felt so connected. After the course,{" "}
                      <span>I felt filled with clarity and purpose.</span> The
                      Blessings Course takes hollow and empty to the next level;
                      it's a hidden gem.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="instrument-section blessings-course">
          <div className="container">
            <div className="row justify-content-between align-items-center">
              <div className="col-lg-10 col-xl-6">
                <div className="instrument-section__background">
                  <h5 className="share-section__title">
                    Tap into Abundance and Become an Instrument of Healing{" "}
                  </h5>
                  <img src="/img/share-section-background.png" alt="" />
                </div>
              </div>
              <div className="col-lg-10 col-xl-6">
                <div className="instrument-section__description">
                  <p className="description__item">
                    The Blessings Course will guide you into deep experiences of
                    abundance, contentment, and fulfillment through unique
                    meditation processes.
                  </p>
                  <p className="description__item">
                    Once you’ve experienced these heightened states of
                    awareness, you will be taught how to channel the positive
                    energy you experience into blessings for those around you.
                  </p>
                  <p className="description__item">
                    Being able to bless is a complete expression of compassion
                    that can transform the lives of both the blesser and the
                    blessed. You will become a lighthouse to those in need, and
                    be able to share powerful healing energy with anybody who
                    asks your help.
                  </p>
                  <p className="description__item">
                    Many past participants report the effects of their blessings
                    have been nothing short of miraculous.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="elements-section blessings-course">
          <div className="elements-section__image"></div>
          <div className="container">
            <h5 className="elements-section__title">
              Blessings Course Elements
            </h5>
            <div className="row justify-content-between align-items-center">
              <div className="col-lg-6 col-xl-6">
                <div className="elements-section__background">
                  <img src="/img/elements-section-background.jpg" alt="" />
                </div>
              </div>
              <div className="col-lg-6 col-xl-6">
                <div className="elements-section__items">
                  <div className="elements-section__item">
                    <div className="elements-section__icon">
                      <img src="/img/elements-section-icon-first.png" alt="" />
                    </div>
                    <div className="elements-section__description">
                      <div className="elements-section__name">
                        Group Processes and Discussions
                      </div>
                      <div className="elements-section__text">
                        You will be guided through a series of group processes
                        and discussions by an expert instructor. The sensitive
                        and understanding environment created through this group
                        work will allow you to take a deeper look at yourself,
                        and give you tools to overcome your fears and
                        inhibitions.
                      </div>
                    </div>
                  </div>
                  <div className="elements-section__item">
                    <div className="elements-section__icon">
                      <img src="/img/elements-section-icon-second.png" alt="" />
                    </div>
                    <div className="elements-section__description">
                      <div className="elements-section__name">
                        Knowledge Sessions
                      </div>
                      <div className="elements-section__text">
                        Delving deep into ancient wisdom, these sessions will
                        open up new areas of understanding in your life, and
                        guide you toward better living.
                      </div>
                    </div>
                  </div>
                  <div className="elements-section__item">
                    <div className="elements-section__icon">
                      <img src="/img/elements-section-icon-third.png" alt="" />
                    </div>
                    <div className="elements-section__description">
                      <div className="elements-section__name">
                        Unique Meditations
                      </div>
                      <div className="elements-section__text">
                        Experience unique meditations designed to take you into
                        deep states of gratitude and fullness. After these
                        meditations, you will feel tremendous grace flowing
                        through you and around you.
                      </div>
                      <div className="elements-section__text">
                        Eligibility: Completion of the {preRequisiteCondition}{" "}
                        are required to enroll in The Blessings Course.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="upcoming-section blessings-course">
          <div className="upcoming-section__image">
            <img
              src="/img/upcoming-background.jpg"
              alt="Upcoming Blessings course"
            />
          </div>
          <div className="container">
            <div className="upcoming-section__wrapper">
              <h5 className="upcoming-section__title">
                Upcoming Blessings Courses
              </h5>
              <h6 className="upcoming-section__text">
                Register for The Blessings Course, and unlock your innate
                abilities to bless and heal{" "}
              </h6>
            </div>
            <Element name="registerNowBlock">
              <RegisterPanel workshop={data} />
            </Element>
          </div>
        </section>

        <section className="art-section blessings-course">
          <div className="container">
            <h5 className="art-section__title">About the Art of Living</h5>
            <div className="row justify-content-around">
              <div className="col-12 col-lg-2 col-md-6 col-sm-12 text-center mt-5 mt-lg-0">
                <div className="art-section__container">
                  <div className="art-section__icon">
                    <img src="/img/art-section-first.png" alt="participants" />
                  </div>
                  <div className="art-section__name">42 years</div>
                  <div className="art-section__text">of service to society</div>
                </div>
              </div>
              <div className="col-12 col-lg-2 col-md-6 col-sm-12 text-center mt-5 mt-lg-0">
                <div className="art-section__container">
                  <div className="art-section__icon">
                    <img src="/img/art-section-second.png" alt="participants" />
                  </div>
                  <div className="art-section__name">10,000+ centers</div>
                  <div className="art-section__text">worldwide </div>
                </div>
              </div>
              <div className="col-12 col-lg-2 col-md-6 col-sm-12 text-center mt-5 mt-lg-0">
                <div className="art-section__container">
                  <div className="art-section__icon">
                    <img src="/img/art-section-third.png" alt="participants" />
                  </div>
                  <div className="art-section__name">500M+ lives</div>
                  <div className="art-section__text">
                    touched through our courses & events
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-2 col-md-6 col-sm-12 text-center mt-5 mt-lg-0">
                <div className="art-section__container">
                  <div className="art-section__icon">
                    <img src="/img/art-section-fourth.png" alt="participants" />
                  </div>
                  <div className="art-section__name">180 countries</div>
                  <div className="art-section__text">
                    where our programs made a difference
                  </div>
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
