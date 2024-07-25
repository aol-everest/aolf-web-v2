/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unescaped-entities */
import { HideOn } from '@components';
import { MODAL_TYPES, COURSE_MODES_MAP } from '@constants';
import { useAuth, useGlobalModalContext } from '@contexts';
import { pushRouteWithUTMQuery } from '@service';
import { useRouter } from 'next/router';
import { Element } from 'react-scroll';
import { CourseBottomCard } from './CourseBottomCard';
import { RegisterPanel } from './RegisterPanel';
import queryString from 'query-string';
import { navigateToLogin } from '@utils';

export const SanyamCourse = ({ data, mode: courseViewMode }) => {
  const { showModal } = useGlobalModalContext();
  const { isAuthenticated = false } = useAuth();
  const router = useRouter();

  const { title, isGuestCheckoutEnabled, mode, productTypeId, sfid } =
    data || {};

  const handleUpcomingSanyamCourse = () => {
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/course`,
      query: {
        'other-ctype': 'true',
        courseType: 'SANYAM_COURSE',
      },
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (isAuthenticated || isGuestCheckoutEnabled) {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course/checkout/${sfid}`,
        query: {
          ctype: productTypeId,
          page: 'c-o',
        },
      });
    } else {
      navigateToLogin(
        router,
        `/us-en/course/checkout/${sfid}?ctype=${productTypeId}&page=c-o&${queryString.stringify(
          router.query,
        )}`,
      );
    }
  };

  return (
    <>
      <main className="sanyam">
        <section className="about-course about-course--sanyam sanyam__section !tw-pt-[0px]">
          <div className="about-program__image about-program__image--height-auto about-course__image about-course__image_desktop">
            <img src="/img/sanyam-top-column.jpg" alt="sanyam" />
          </div>

          <div className="about-program__image about-program__image--height-auto about-course__image about-course__image_mobile">
            <img src="/img/sanyam-top-column-mobile.jpg" alt="sanyam" />
          </div>
          <div className="container">
            <div className="row tw-pt-[50px]">
              <div className="col-lg-7">
                <div className="about-course__main">
                  <p className="about-program__main-type">
                    {COURSE_MODES_MAP[mode]}
                  </p>
                  <h1 className="about-course__main-name about-course__main-name--font-size">
                    {title}
                  </h1>

                  <p className="about-program__main-type about-program__main-type--small">
                    Sanyam
                  </p>
                  <ul className="about-course__main-list about-course__main-list_small">
                    <li>
                      Gain profound understanding and direct experience of
                      yoga’s timeless wisdom
                    </li>
                    <li>
                      Take home a powerful upgrade of your daily meditation
                      practice
                    </li>
                    <li>Unravel the mysteries of the self</li>
                    <li>
                      Understand how to rise above obstacles & misery on the
                      journey of self inquiry
                    </li>
                  </ul>
                  <div className="about-course-box-button--center">
                    <button
                      type="button"
                      className="btn_box_secondary about-course-button"
                      onClick={handleRegister}
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="magic-inside magic-inside--sanyam sanyam__section">
          <div className="magic-inside__container container">
            <div className="magic-inside__content">
              <h2 className="magic-inside__title">
                Unlock the Magic Inside You
              </h2>

              <p className="magic-inside__subtitle">
                Upgrade your life with new techniques that lead to:
              </p>
              <ul className="magic-inside__list">
                <li className="magic-inside__item">
                  <img
                    className="magic-inside__icon"
                    src="/img/ic-check-fade.svg"
                    alt="magic-inside-icon"
                  />
                  <div className="magic-inside__text">
                    Deepened Insight and Awareness
                  </div>
                </li>

                <li className="magic-inside__item">
                  <img
                    className="magic-inside__icon"
                    src="/img/ic-check-fade.svg"
                    alt="magic-inside-icon"
                  />
                  <div className="magic-inside__text">
                    Profound Experiences of Meditation
                  </div>
                </li>

                <li className="magic-inside__item">
                  <img
                    className="magic-inside__icon"
                    src="/img/ic-check-fade.svg"
                    alt="magic-inside-icon"
                  />
                  <div className="magic-inside__text">
                    RGreater Connection to Your Inner Voice and Intuition
                  </div>
                </li>

                <li className="magic-inside__item">
                  <img
                    className="magic-inside__icon"
                    src="/img/ic-check-fade.svg"
                    alt="magic-inside-icon"
                  />
                  <div className="magic-inside__text">
                    The Blossoming of Your Virtues and Hidden Talents
                  </div>
                </li>
              </ul>
            </div>
            <div className="magic-inside__img">
              <img
                src="/img/magic-inside-content.jpg"
                alt="magic-inside-content"
              />
            </div>
          </div>
        </section>

        <section className="revitalize revitalize--sanyam sanyam__section">
          <div className="revitalize__container container">
            <h2 className="revitalize__title">Revitalize with Sanyam</h2>
            <p className="revitalize__text">
              Sanyam is the coming together of attention, meditation, and pure
              joy
            </p>
            <ul className="revitalize__list-image">
              <li>
                <img
                  className="revitalize__item-image"
                  src="/img/revitalize-first.jpg"
                  alt="revitalize content first"
                />
              </li>
              <li>
                <img
                  className="revitalize__item-image revitalize__image--only-desktop"
                  src="/img/revitalize-second.jpg"
                  alt="revitalize content second"
                />
              </li>
            </ul>

            <h3 className="revitalize__subtitle">
              Sounds good, right? But what does it really mean?
            </h3>
            <ul className="revitalize__list">
              <li className="revitalize__item">
                You don’t have to wonder, because in this course, you’ll
                experience this integration of yoga and meditation firsthand.
              </li>
              <li className="revitalize__item">
                Some of our top teachers will guide you through deep exploration
                of the eight limbs of yoga, with an emphasis on experience and
                not just concepts. This isn’t just an opportunity to expand your
                mind, but a chance to fully experience the integration of yoga
                with your entire being.
              </li>
              <li className="revitalize__item">
                The course culminates with a new practice, called sanyam, which
                opens new doors in your meditation practice.
              </li>
            </ul>
          </div>
        </section>

        <section className="course-elements course-elements--sanyam sanyam__section">
          <div className="container">
            <h2 className="course-elements__title">Sanyam Course Elements</h2>

            <p className="course-elements__subtitle">
              <span className="course-elements__subtitle--block">
                You’ll dive deep and explore the eight limbs of yoga,
              </span>
              with each day tailored to give you the most profound experience
              possible
            </p>
            <ul className="course-elements__list">
              <li className="course-elements__item">
                <img
                  className="course-elements__icon"
                  src="/img/course-elements-icon-1.png"
                  alt="Yama icon"
                />
                <h3 className="course-elements__name">Yama</h3>
                <p className="course-elements__text">
                  Attitudes toward our environment
                </p>
              </li>
              <li className="course-elements__item">
                <img
                  className="course-elements__icon"
                  src="/img/course-elements-icon-2.png"
                  alt="Niyama icon"
                />
                <h3 className="course-elements__name">Niyama</h3>
                <p className="course-elements__text">
                  Attitudes toward ourselves
                </p>
              </li>
              <li className="course-elements__item">
                <img
                  className="course-elements__icon"
                  src="/img/course-elements-icon-3.png"
                  alt="Asana icon"
                />
                <h3 className="course-elements__name">Asana</h3>
                <p className="course-elements__text">Yoga postures</p>
              </li>
              <li className="course-elements__item">
                <img
                  className="course-elements__icon"
                  src="/img/course-elements-icon-4.png"
                  alt="Pranayama icon"
                />
                <h3 className="course-elements__name">Pranayama</h3>
                <p className="course-elements__text">Breathwork</p>
              </li>
              <li className="course-elements__item">
                <img
                  className="course-elements__icon"
                  src="/img/course-elements-icon-5.png"
                  alt="Pratyahara icon"
                />
                <h3 className="course-elements__name">Pratyahara</h3>
                <p className="course-elements__text">
                  Turning the senses inward
                </p>
              </li>
              <li className="course-elements__item">
                <img
                  className="course-elements__icon"
                  src="/img/course-elements-icon-6.png"
                  alt="Dharana icon"
                />
                <h3 className="course-elements__name">Dharana</h3>
                <p className="course-elements__text">Concentration</p>
              </li>
              <li className="course-elements__item">
                <img
                  className="course-elements__icon"
                  src="/img/course-elements-icon-7.png"
                  alt="Dhyana icon"
                />
                <h3 className="course-elements__name">Dhyana</h3>
                <p className="course-elements__text">Meditation</p>
              </li>
              <li className="course-elements__item">
                <img
                  className="course-elements__icon"
                  src="/img/course-elements-icon-8.png"
                  alt="Samadhi icon"
                />
                <h3 className="course-elements__name">Samadhi</h3>
                <p className="course-elements__text">Bliss</p>
              </li>
            </ul>
          </div>
        </section>

        <section className="share-section participants--sanyam sanyam__section">
          <div className="container">
            <div className="participants mt-0">
              <h5 className="participants__title">
                What Participants Experience
              </h5>
              <div className="row justify-content-between no-gutters">
                <div className="col-12 col-lg-3 text-center mt-5 mt-lg-0 pr-2 pl-2">
                  <div className="participants__container">
                    <div className="participants__image participants__image--margin-top">
                      <img
                        src="/img/sanyam-participants-1.jpg"
                        alt="participants"
                      />
                    </div>
                    <h6 className="participants__name mb-0">Andrew S.</h6>
                    <h6 className="participants__job">Sanyam participant</h6>
                    <h6 className="participants__subtitle">
                      &#8220;An essential course on&nbsp;the path&#8221;
                    </h6>
                    <p className="participants__comment">
                      My health, quality of mind, and emotional state have all
                      been at a sustained high even weeks after completing the
                      course. And better yet, I now have a sequenced set of
                      knowledge and steps on how to keep it that way. The energy
                      this has given me has also allowed me to repair damaged
                      relationships and wholeheartedly commit to helping others
                      around me.
                    </p>
                  </div>
                </div>
                <div className="col-12 col-lg-3 text-center mt-5 mt-lg-0 pr-2 pl-2">
                  <div className="participants__container">
                    <div className="participants__image participants__image--margin-top">
                      <img
                        src="/img/sanyam-participants-2.jpg"
                        alt="participants"
                      />
                    </div>
                    <h6 className="participants__name mb-0">Vanitha T.</h6>
                    <h6 className="participants__job">Sanyam participant</h6>
                    <h6 className="participants__subtitle">
                      &#8220;Simply mind-blowing&#8221;
                    </h6>
                    <p className="participants__comment">
                      The combination of yoga and meditation made my mind and
                      body feel more relaxed with sense of completion. The
                      knowledge given on yoga and how to deal with mind through
                      body was amazing to learn.
                    </p>
                  </div>
                </div>
                <div className="col-12 col-lg-3 text-center mt-5 mt-lg-0 pr-2 pl-2">
                  <div className="participants__container">
                    <div className="participants__image participants__image--margin-top">
                      <img
                        src="/img/sanyam-participants-3.jpg"
                        alt="participants"
                      />
                    </div>
                    <h6 className="participants__name mb-0">Ketki M.</h6>
                    <h6 className="participants__job">Sanyam participant</h6>
                    <h6 className="participants__subtitle">
                      &#8220;Truly transformative&#8221;
                    </h6>
                    <p className="participants__comment">
                      Sanyam is the most beautiful course I have ever
                      experienced. It brought me an immense amount of energy and
                      enthusiasm. In the beginning, I had so many questions and
                      complaints in life, but they all disappeared after the
                      course. It was truly transformative and has inspired me to
                      live a better life. I feel like I am born again.
                    </p>
                  </div>
                </div>
                <div className="col-12 col-lg-3 participants__item--only-desktop text-center mt-5 mt-lg-0 pr-2 pl-2">
                  <div className="participants__container">
                    <div className="participants__image participants__image--margin-top">
                      <img
                        src="/img/sanyam-participants-4.jpg"
                        alt="participants"
                      />
                    </div>
                    <h6 className="participants__name mb-0">Rajesh A.</h6>
                    <h6 className="participants__job">Sanyam participant</h6>
                    <h6 className="participants__subtitle">
                      &#8220;Things holding me back seemed to evaporate&#8221;
                    </h6>
                    <p className="participants__comment">
                      I am feeling reborn after the course! Many things that
                      were causing stress or holding me back seemed to evaporate
                      after the weekend. I am able to enjoy small moments, be
                      empathetic, and yet take on bigger challenges. I highly
                      recommend it!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="offer offer--sanyam sanyam__section">
          <Element name="registerNowBlock">
            <RegisterPanel workshop={data} />
          </Element>
        </section>

        <section className="upcoming upcoming--sanyam sanyam__section">
          <div className="upcoming-section">
            <div className="upcoming-section__image">
              <img
                src="/img/sanyam-upcoming-background.jpg"
                alt="Upcoming Sanyam course"
              />
            </div>
            <div className="container">
              <div className="upcoming-section__wrapper">
                <h5 className="upcoming-section__title">
                  Upcoming Sanyam Courses
                </h5>
                <h6 className="upcoming-section__text">
                  Sanyam is a masterclass in taking the benefits of yoga out of
                  your head, and bringing them into your life. Click below to
                  experience Sanyam for yourself.
                </h6>
                <div
                  onClick={handleUpcomingSanyamCourse}
                  className="upcoming-section__button btn_box_secondary"
                >
                  See upcoming course dates
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="art-section art-section--sanyam sanyam__section">
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
                  <div className="art-section__text">worldwide</div>
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
        <CourseBottomCard workshop={data} courseViewMode={courseViewMode} />
      </HideOn>
    </>
  );
};
