/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unescaped-entities */

import { MODAL_TYPES, COURSE_TYPES } from '@constants';
import { useAuth, useGlobalModalContext } from '@contexts';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import queryString from 'query-string';
import { pushRouteWithUTMQuery } from '@service';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { PriceCard } from './PriceCard';

export const SriSriYogaDeepDive = ({ data, mode: courseViewMode }) => {
  const { sfid, title, isGuestCheckoutEnabled, productTypeId } = data || {};
  const router = useRouter();
  const { authenticated = false } = useAuth();
  const { showModal } = useGlobalModalContext();
  const [activeInstructor, setActiveInstructor] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    if (sfid) {
      if (authenticated || isGuestCheckoutEnabled) {
        pushRouteWithUTMQuery(router, {
          pathname: `/us-en/course/checkout/${sfid}`,
          query: {
            ctype: productTypeId,
            page: 'c-o',
          },
        });
      } else {
        showModal(MODAL_TYPES.LOGIN_MODAL, {
          navigateTo: `/us-en/course/checkout/${sfid}?ctype=${productTypeId}&page=c-o&${queryString.stringify(
            router.query,
          )}`,
          defaultView: 'SIGNUP_MODE',
        });
      }
    } else {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course/scheduling`,
        query: {
          courseType: COURSE_TYPES.SRI_SRI_YOGA_DEEP_DIVE.code,
        },
      });
    }
  };

  const handleSetActiveInstructor = (instructor = '') => {
    setActiveInstructor(instructor);
  };

  const instructorsName = {
    jennifer: 'Jennifer',
    jonas: 'Jonas',
    neelam: 'Neelam',
    neha: 'Neha',
    sejal: 'Sejal',
  };

  const updatedTitle = title.split('-');

  return (
    <>
      <main className="deep-dive-retreat">
        <section className="deep-dive-top-section">
          <div className="banner">
            <div className="container">
              <div className="banner-logo">
                <img
                  src="/img/ic-logo.svg"
                  alt="logo"
                  className="logo__image"
                />
              </div>
              <div className="banner-title">
                <span>{updatedTitle?.[0] || 'Sri Sri Yoga'}</span>
                <br />
                {updatedTitle?.[1] || 'Deep Dive Retreat'}
              </div>
              <div className="banner-text">
                Go deeper into the realm of yoga and what it means to live like
                a yogi
              </div>
              <div className="registration-wrap">
                <button
                  className="register-button mt-4"
                  onClick={handleRegister}
                >
                  Register for a Retreat
                </button>
              </div>
            </div>
          </div>
        </section>
        {sfid && <PriceCard workshop={data} courseViewMode={courseViewMode} />}
        <section className="deep-dive-first-section">
          <div className="container pb-lg-5 pt-5">
            <div className="row">
              <div className="col-lg-6">
                <h2 className="section-title">
                  Are you looking for a perfect solo vacation?
                </h2>
                <h4 className="pr-lg-5">
                  A chance to pamper and love your body? Some time to forget all
                  your worries and completely relax?
                </h4>
                <p>
                  Find all this and more at the Sri Sri Yoga Deep Dive
                  Retreat—four days of absolute relaxation that invites you to
                  detox and de-stress your body and mind.
                </p>
              </div>
              <div className="col-lg-6">
                <div className="deep-dive-video">
                  <iframe
                    src="https://player.vimeo.com/video/585892104?h=1bdc74bf1a&color=111d33&title=0&byline=0&portrait=0"
                    width="100%"
                    height="360"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="deep-dive-featuers">
          <div className="container pt-5 pb-5">
            <div className="row">
              <div className="col-md-4">
                <div className="dd-feature-item">
                  <div className="dd-feature-icon">
                    <img src="/img/dd-icon-yoga.png" alt="yoga" />
                  </div>
                  <div className="dd-feature-title">
                    <h5>4-DAY RETREAT</h5>
                  </div>
                  <div className="dd-feature-text">
                    Retreat your way! Choose between a live-stream online
                    experience or an in-person retreat.
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="dd-feature-item">
                  <div className="dd-feature-icon">
                    <img src="/img/dd-icon-flower.png" alt="flower" />
                  </div>
                  <div className="dd-feature-title">
                    <h5>THE BEST OF YOGA</h5>
                  </div>
                  <div className="dd-feature-text">
                    Explore the profound depths of yoga; asana, pranayama,
                    meditation, kriya, and philosophy.
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="dd-feature-item">
                  <div className="dd-feature-icon">
                    <img src="/img/dd-icon-smile.png" alt="smile" />
                  </div>
                  <div className="dd-feature-title">
                    <h5>GUIDED BY EXPERTS</h5>
                  </div>
                  <div className="dd-feature-text">
                    Be guided deeper with experienced certified instructors who
                    live their yoga on and off the mat.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="deep-dive-benefits">
          <div className="container pt-5 pb-5">
            <h2 className="section-title">
              Dive deep into yoga in a gentle yet profound, celebratory, and
              joyful way
            </h2>
            <div className="row">
              <div className="col-lg-8">
                <div className="benefit-you-get">
                  <h5>During this retreat you will:</h5>
                  <ul>
                    <li>
                      <strong>Go deeper</strong> into the realm of yoga—the
                      foundational principles and wisdom—to discover what it
                      means to live like a yogi, rooted in deep stillness and
                      space within.
                    </li>
                    <li>
                      <strong>Detox</strong> holistically and release blockages
                      through yogic kriyas like Shankh Prakshalana (a thorough
                      digestive cleanse) and Jala Neti (nasal cleanse).
                    </li>
                    <li>
                      <strong>Strengthen</strong> your body and heal chronic
                      pains through a special process of subtle strengthening
                      and healing contractions (SSHC).
                    </li>
                    <li>
                      <strong>Rejuvenate</strong> with a comprehensive asana
                      practice, energizing and cleansing pranayamas, and
                      profound meditations.
                    </li>
                    <li>
                      <strong>Experience</strong> (and take home!) a genuine
                      sense of internal tranquility, vitality, mental clarity,
                      and peace.
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="benefit-pictures">
                  <img src="/img/dd-benefit-you-get1.png" alt="benefit" />
                  <img src="/img/dd-benefit-you-get2.png" alt="benefit" />
                </div>
              </div>
            </div>

            <div className="dd-register-text">
              You'll learn how to bring the principles of yoga into every moment
              of your life to guide you to total health and freedom.
            </div>
            <div className="dd-register-button">
              <button className="register-button mt-4" onClick={handleRegister}>
                Register for a Retreat
              </button>
            </div>
          </div>
        </section>
        <section className="dd-testimonial">
          <div className="container py-5">
            <div className="rating">
              <img src="/img/dd-rating-stars.png" alt="rating" />
            </div>
            <div className="testimonial-text">
              “The Sri Sri Yoga Deep Dive is a cleanse of mind, body and soul
              and now, four days into it you can really feel the benefits. There
              is a lot of clarity and I feel at ease, the stress has washed
              away”
            </div>
            <div className="testimonial-author">— Alex Abelin</div>
          </div>
        </section>
        <section className="dd-yt-video-section py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-4">
                <h2 className="section-title">
                  Invigorate and heal your body, relax your mind, and nourish
                  your soul.
                </h2>
                <div className="section-description">
                  Have a look and get a brief glimpse
                </div>
              </div>
              <div className="col-lg-8">
                <div className="yt-wrapper">
                  <iframe
                    width="100%"
                    height="370"
                    src="https://www.youtube.com/embed/sCEr04PugGg"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section-upcoming-dates py-5">
          <div className="container py-5 text-center">
            <h2 className="section-title">Upcoming Dates</h2>
            <h5>Sri Sri Yoga Deep Dive Retreat</h5>
            <div className="session-info">
              4-Day Program
              <br />
              In-person and live online retreat options available
            </div>
            <div className="dd-register-button">
              <button className="register-button mt-4" onClick={handleRegister}>
                Register for a Retreat
              </button>
            </div>
            <div className="note">
              Prerequisite:{' '}
              <a href="https://yoga.us.artofliving.org/srisriyoga-deepdiveretreat/clkn/https/event.us.artofliving.org/us-en/online-course-2/">
                Breath Meditation course
              </a>{' '}
              (previously known as the Happiness Program) or Yes! Plus course
            </div>
          </div>
        </section>
        <section className="section-certified-instructor py-5">
          <div className="container text-center">
            <h2 className="section-title">Our certified instructors</h2>
            <div className="instructor-list">
              <div className="instructor">
                <div className="instructor-photo">
                  <img src="/img/dd-jennstevenson.jpeg" alt="instructor" />
                </div>
                <div className="instructor-name">
                  {instructorsName.jennifer}
                  <br />
                  Stevenson
                </div>
                <div className="instructor-more">
                  <a
                    data-toggle="modal"
                    onClick={() => handleSetActiveInstructor('Jennifer')}
                    data-target="#dd-jennifer"
                  >
                    Read More
                  </a>
                </div>
              </div>
              <div className="instructor">
                <div className="instructor-photo">
                  <img src="/img/dd-jonaskarosas.png" alt="instructor" />
                </div>
                <div className="instructor-name">
                  {instructorsName.jonas}
                  <br />
                  Karosas
                </div>
                <div className="instructor-more">
                  <a
                    onClick={() => handleSetActiveInstructor('Jonas')}
                    data-toggle="modal"
                    data-target="#dd-jonas"
                  >
                    Read More
                  </a>
                </div>
              </div>
              <div className="instructor">
                <div className="instructor-photo">
                  <img src="/img/dd-neelammadaik.png" alt="instructor" />
                </div>
                <div className="instructor-name">
                  {instructorsName.neelam}
                  <br />
                  Madaik
                </div>
                <div className="instructor-more">
                  <a
                    onClick={() => handleSetActiveInstructor('Neelam')}
                    data-toggle="modal"
                    data-target="#dd-neelam"
                  >
                    Read More
                  </a>
                </div>
              </div>
              <div className="instructor">
                <div className="instructor-photo">
                  <img src="/img/dd-nehapatel.png" alt="instructor" />
                </div>
                <div className="instructor-name">
                  {instructorsName.neha}
                  <br />
                  Patel
                </div>
                <div className="instructor-more">
                  <a
                    onClick={() => handleSetActiveInstructor('Neha')}
                    data-toggle="modal"
                    data-target="#dd-neha"
                  >
                    Read More
                  </a>
                </div>
              </div>
              <div className="instructor">
                <div className="instructor-photo">
                  <img src="/img/dd-sejalshah.png" alt="instructor" />
                </div>
                <div className="instructor-name">
                  {instructorsName.sejal}
                  <br />
                  Shah
                </div>
                <div className="instructor-more">
                  <a
                    onClick={() =>
                      handleSetActiveInstructor(instructorsName.sejal)
                    }
                    data-toggle="modal"
                    data-target="#dd-sejal"
                  >
                    Read More
                  </a>
                </div>
              </div>
            </div>
            <div
              className={`modal fade ${
                activeInstructor === instructorsName.jennifer ? 'show' : ''
              }`}
              id="dd-jennifer"
              tabIndex="-1"
              role="dialog"
              aria-labelledby="dd-jenniferLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <button
                      type="button"
                      className="close"
                      data-dismiss="modal"
                      aria-label="Close"
                      onClick={handleSetActiveInstructor}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body text-left">
                    <h5>Jennifer Stevenson</h5>
                    <p>
                      Jennifer happened upon yoga more almost twenty-years ago
                      while living in Tokyo, Japan. She has been studying and
                      practicing the many dimensions of it ever since. Jennifer
                      brings more than 13 years of experience teaching yoga,
                      meditation, self-development, and leadership training
                      programs internationally and currently serves as the
                      Vice-Chairperson on the Board of Directors for the Sri Sri
                      School of Yoga in North America and has been a Faculty for
                      the School’s 200H Teacher Training Program since 2015.
                      Jennifer’s classes are both invigorating and meditative
                      infused with a supportive and soothing presence. Inspired
                      through service, she has delivered yoga sessions at yoga
                      conferences, workshops in studios and a retreat at the
                      Kripalu Center of Yoga and Health. She has also taught
                      extensively through the Art of Living Foundation as a full
                      time instructor for more than a decade and delivers the
                      Sri Sri Yoga Deep Dive Retreat in addition to classes.
                      Jennifer is accredited with Yoga Alliance as an E-RYT 500H
                      for Sri Sri Yoga and a RYT 200H for Vinyasa Yoga with the
                      Asheville Yoga Center. In addition to the School, Jennifer
                      serves as the head of Corporate Training for the TLEX
                      Institute delivering yoga related content in companies and
                      institutions internationally. She has taught at Shell Oil
                      Co, GE, Coca-Cola, eBay, Microsoft, The World Bank and
                      American Express among many and for-credit courses at the
                      MIT Sloan School of Management and Johns Hopkins
                      University. Previously, Jennifer worked at Bloomberg, L.P.
                      both in Tokyo and San Francisco, as a sales consultant for
                      investment management systems, working with some of the
                      world’s leading financial institutions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`modal fade ${
                activeInstructor === instructorsName.jonas ? 'show' : ''
              }`}
              id="dd-jonas"
              tabIndex="-1"
              role="dialog"
              aria-labelledby="dd-jonasLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <button
                      type="button"
                      className="close"
                      data-dismiss="modal"
                      aria-label="Close"
                      onClick={handleSetActiveInstructor}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body text-left">
                    <h5>Jonas Karosas</h5>
                    <p>
                      A potential of yoga to expand one’s consciousness was the
                      reason Jonas started practicing it. As a volunteer for the
                      Art of Living Foundation he was inspired to undertake
                      numerous trainings in Sri Sri Yoga. These days his style
                      of teaching focuses on relaxation, stamina building and
                      quieting the mind. Intrigued by the promise of yoga to
                      eliminate misery before it arises in one’s life, and have
                      experienced the stillness of the body and mind personally,
                      Jonas is enthusiastic about sharing his knowledge through
                      teaching SSY Foundation and Deep Dive workshops as a
                      service to the community.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`modal fade ${
                activeInstructor === instructorsName.neelam ? 'show' : ''
              }`}
              id="dd-neelam"
              tabIndex="-1"
              role="dialog"
              aria-labelledby="dd-neelamLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <button
                      type="button"
                      className="close"
                      data-dismiss="modal"
                      aria-label="Close"
                      onClick={handleSetActiveInstructor}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body text-left">
                    <h5>Neelam Madaik</h5>
                    <p>
                      Neelam currently serves on the Board of Directors and as a
                      faculty with the Sri Sri School of Yoga, North America.
                      She is accredited with Yoga Alliance as an E-RYT 500H for
                      Sri Sri Yoga. She also teaches advanced yoga retreats.
                      <br />
                      She has seen her life blossom through the practice of
                      yoga. She fell in love with yoga in 2003 when she did her
                      Yoga teacher training in India. She experienced the union
                      of body, breath and mind and wanted to share that
                      experience with her students. Her classes are a blend of
                      pranayamas, asanas, yogic rest and wisdom.
                      <br />
                      When not facilitating yoga or meditation workshops, Neelam
                      likes to travel to new places and experiment with
                      different cuisines.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`modal fade ${
                activeInstructor === instructorsName.neha ? 'show' : ''
              }`}
              id="dd-neha"
              tabIndex="-1"
              role="dialog"
              aria-labelledby="dd-nehaLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <button
                      type="button"
                      className="close"
                      data-dismiss="modal"
                      aria-label="Close"
                      onClick={handleSetActiveInstructor}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body text-left">
                    <h5>Neha Patel</h5>
                    <p>
                      Neha Patel was inspired to study yoga during her
                      volunteering with the Art of Living Foundation where she
                      witnessed amazing stories of healing and transformation.
                      She has been teaching since 1999 and is an RYT-500
                      certified instructor with yoga alliance. With a degree in
                      Accounting, she is a small business owner and attributes
                      her success to her practices. A mom of two young adults
                      based in Sacramento, CA, she teaches a variety of programs
                      including studio classes, workshops and retreats with a
                      holistic blend of postures, breathwork, meditation and
                      yoga philosophy. She believes yoga is a personal journey
                      and is known for her simple, adaptable style that is
                      suitable for beginners as well as seasoned practitioners.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`modal fade ${
                activeInstructor === instructorsName.sejal ? 'show' : ''
              }`}
              id="dd-sejal"
              tabIndex="-1"
              role="dialog"
              aria-labelledby="dd-sejalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <button
                      type="button"
                      className="close"
                      data-dismiss="modal"
                      aria-label="Close"
                      onClick={handleSetActiveInstructor}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body text-left">
                    <h5>Sejal Shah</h5>
                    <p>
                      Sejal has been on the path of yoga and meditation for
                      about 20 years. Having a strong foundation for
                      understanding health, in terms of mind-body-soul state
                      with her training in Homeopathy, Yoga, and Ayurveda, she
                      teaches people of all walks of life about healthy living,
                      how to effectively manage their mind and emotions,
                      eliminate stress, live in harmony amid diversity, and
                      bring greater peace and joy into their lives. She has
                      facilitated more than 15,000 hours of programs in
                      mind-body wellness. She is the Founder &amp; Director of
                      Wellness and Life Style Excellence Center and a member of
                      Yoga Academic Council at{' '}
                      <a href="clkn/http/srisriuniversity.edu.in/courses-aid/faculty-yoga/">
                        Sri Sri University
                      </a>
                      , India. She writes regularly on yoga and healthy living
                      in various print and digital media like{' '}
                      <a href="clkn/http/www.huffingtonpost.com/sejal-shah/">
                        Huffington Post
                      </a>
                      ,{' '}
                      <a href="clkn/http/www.yoganonymous.com/">YOGANONYMOUS</a>
                      , etc. &nbsp;She facilitates Art of Living-Part 1, Art of
                      Living Yoga Retreats, Art of Living Yoga Teachers Training
                      Program, Mind &amp; Meditation Seminars, and also offers
                      the Living Light Weight Loss program, and Yoga and Marma
                      Sessions at the Shankara Ayurveda Spa. Her gentle, loving,
                      and authentic approach brings profoundness in her
                      teaching.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section-contact-info py-5">
          <div className="container text-center">
            <h2 className="section-title">Contact us</h2>
            <div className="contact-info">
              1 (828) 278-8700 •{' '}
              <a href="mailto:info@srisrischoolofyoga.org">
                info@srisrischoolofyoga.org
              </a>
            </div>
          </div>
        </section>
        <section className="about-art-of-living--section pt-lg-5  pb-lg-5">
          <div className="container pb-lg-2">
            <h2 className="section-title">About the Art of Living</h2>
            <div className="row">
              <div className="col-md-3">
                <div className="marma-about-aol-item">
                  <div className="marma-about-aol-icon">
                    <img src="/img/marma-about-aol-icon1.png" alt="about aol" />
                  </div>
                  <div className="marma-about-aol-title">42 years</div>
                  <div className="marma-about-aol-text">
                    of service to society
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="marma-about-aol-item">
                  <div className="marma-about-aol-icon">
                    <img src="/img/marma-about-aol-icon2.png" alt="about aol" />
                  </div>
                  <div className="marma-about-aol-title">3,000+ centers</div>
                  <div className="marma-about-aol-text">worldwide</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="marma-about-aol-item">
                  <div className="marma-about-aol-icon">
                    <img src="/img/marma-about-aol-icon3.png" alt="about aol" />
                  </div>
                  <div className="marma-about-aol-title">800M+ lives</div>
                  <div className="marma-about-aol-text">
                    touched through our courses & events
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="marma-about-aol-item">
                  <div className="marma-about-aol-icon">
                    <img src="/img/marma-about-aol-icon4.png" alt="about aol" />
                  </div>
                  <div className="marma-about-aol-title">180 countries</div>
                  <div className="marma-about-aol-text">
                    where our programs made a difference
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};
