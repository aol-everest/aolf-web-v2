/* eslint-disable react/no-unescaped-entities */
import { COURSE_TYPES, MODAL_TYPES } from '@constants';
import { useAuth, useGlobalModalContext } from '@contexts';
import { pushRouteWithUTMQuery } from '@service';
import { useRouter } from 'next/router';
import React from 'react';
import { PriceCard } from './PriceCard';
import queryString from 'query-string';

export const MarmaTraining = ({ data, mode: courseViewMode }) => {
  const {
    sfid,
    title,
    isGuestCheckoutEnabled,
    productTypeId,
    mode,
    aosCountRequisite,
    businessRules = [],
  } = data || {};
  const router = useRouter();
  const { authenticated = false } = useAuth();
  const { showModal } = useGlobalModalContext();

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
          courseType: COURSE_TYPES.MARMA_TRAINING.code,
        },
      });
    }
  };

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
    <main className="marma-practitioner-training">
      <section className="marma-top-section">
        <div className="banner">
          <div className="container">
            <p>{mode || 'In-Person'}</p>
            <div className="banner-title">{title}</div>
            <div className="banner-features">
              <ul>
                <li>Expand your skill set with a healing modality for life</li>
                <li>Rebalance your built-in energy network</li>
                <li>Feel deeply relaxed, energized, and inspired</li>
              </ul>
            </div>
            <div className="registration-wrap">
              <button className="register-button mt-4" onClick={handleRegister}>
                Register Now
              </button>
            </div>
            {preRequisiteCondition && (
              <div className="training-eligibility-text">
                Eligibility: {preRequisiteCondition}
              </div>
            )}
          </div>
        </div>

        <div className="container marma-training-section pt-5">
          {sfid && (
            <PriceCard workshop={data} courseViewMode={courseViewMode} />
          )}
        </div>
        <div className="container marma-training-section pb-lg-5">
          <div className="row">
            <div className="col-lg-7">
              <div className="marma-heal-box">
                Learn how to heal yourself and others through Marma, the most
                restorative Ayurvedic treatment.
              </div>
            </div>
            <div className="col-lg-5">
              <div className="marma-heal-content">
                <p>
                  When the energy flow in the body is sluggish, dull, or
                  blocked, we feel it—and contemporary life increasingly
                  generates this quality within us. To maintain a vibrant and
                  relaxed system, we need to know how to work with our inner
                  energy network. Working with energetic points, known as Marma,
                  helps us do just that—it empowers us to identify imbalances
                  and restore a mind-body equilibrium.
                </p>
                <p>
                  Through Sri Sri Marma Practitioner Training you'll learn how
                  to perform the simple, highly effective, and deeply
                  rejuvenating healing modality of Marma Therapy as both a
                  self-healing tool and to treat others. All complemented with
                  the practical mind-body wisdom and healthcare system of
                  Ayurveda. You'll emerge as a confident and empowered
                  practitioner.
                </p>
                <p className="mt-5">
                  <em>
                    Marma Therapy is known to be beneficial for a range of
                    conditions from insomnia, chronic stress, and anxiety to
                    general body aches and pains.
                  </em>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="container marma-training-section pt-lg-5  pb-lg-5">
          <div className=" row">
            <div className="col-md-7">
              <div className="marma-therapy-content">
                <p>Learn more</p>
                <h2 className="section-title">What is Marma Therapy?</h2>
                <p>
                  Marma Therapy is an Ayurvedic treatment known to be one of the
                  most direct and deeply relaxing ways of harmonizing an
                  individual's built-in energetic network to restore health and
                  vitality—the science of Marma (Marma Vidya) is the grandfather
                  of acupressure and acupuncture.
                </p>
                <p>
                  <strong>
                    Marma Therapy works with vital energetic points (Marma)
                    within the body
                  </strong>{' '}
                  located at the junction of muscles, ligaments, bones, joints,
                  tendons, and nerves. These Marma points link to the subtle
                  channels called nadis (similar to meridians in Chinese
                  medicine). And just as passageways within the physical body
                  become blocked by toxins, so does the energetic body—even the
                  tiniest of mental stresses clouds and obstructs the subtle
                  Marma points, reducing the flow of energy. In fact,{' '}
                  <strong>
                    any sore point on the surface of the body is a blocked Marma
                  </strong>
                  .
                </p>
                <p>
                  Through the gentle pressure or stimulation of these vital
                  points through Marma Therapy, blocks are released which allows
                  energy, or prana, to flow to the connecting organs or tissues,
                  giving them a new lease of life. Marma Therapy is beneficial
                  on many levels and brings deep relaxation and rejuvenation.
                </p>
              </div>
            </div>
            <div className="col-md-5">
              <div className="marma-therapy-image">
                <img src="/img/marma-therapy-main-img.jpeg" alt="marma" />
              </div>
            </div>
          </div>
        </div>
        <div className="marma-benefit-section pt-lg-5  pb-lg-5">
          <div className="container marma-training-section pb-lg-5">
            <h2 className="section-title">Benefits of Marma Therapy</h2>
            <p>
              The practice of Marma benefits the body, mind, and spirit. On the
              bodily level, it brings about hydration, nourishment, hormonal
              balance, provides pain relief, balances the Ayurvedic body types
              (doshas), revitalizes organs, balances digestion and elimination,
              relaxes muscles, and is generally cleansing.
            </p>
            <p>
              On the mind level, Marma strengthens and balances your inner
              nature, helps the mind be more in the present moment, restores
              clarity, improves perception, understanding, and communication.
              Marma clears emotions, releases stress, and cultivates a deep
              state of relaxation.
            </p>
          </div>
        </div>
        <div className="participant-experience-section">
          <div className="container marma-training-section">
            <h2 className="section-title">Participant Experiences</h2>
            <div className="participant-list">
              <div className="participant-item">
                <div className="participant-picture">
                  <img src="/img/marma-particpant1.png" alt="Jennifer" />
                </div>
                <div className="participant-name">Jennifer S.</div>
                <div className="participant-position">
                  Director, Washington DC
                </div>
                <div className="participant-rating">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="participant-message">
                  The Marma training is such a beautiful course. You get to
                  learn and soak in the subtleties of prana, of life. While
                  giving and receiving the Marma treatments, so much healing and
                  deep rest happens.
                </div>
              </div>
              <div className="participant-item">
                <div className="participant-picture">
                  <img src="/img/marma-particpant1.png" alt="Jennifer" />
                </div>
                <div className="participant-name">Asha V.</div>
                <div className="participant-position">MD, Clarksville</div>
                <div className="participant-rating">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="participant-message">
                  One of the most comprehensive, in-depth courses I have ever
                  attended. Outstanding teachers that make you feel welcome and
                  comfortable.
                </div>
              </div>
              <div className="participant-item">
                <div className="participant-picture">
                  <img src="/img/marma-particpant1.png" alt="Jennifer" />
                </div>
                <div className="participant-name">Vanitha T.</div>
                <div className="participant-position">Scientist, San Jose</div>
                <div className="participant-rating">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="participant-message">
                  Giving Marma is a very rewarding experience. My children love
                  it. This weekend my son complained of a headache. After the
                  Marma treatment, his headache was gone.
                </div>
              </div>
              <div className="participant-item">
                <div className="participant-picture">
                  <img src="/img/marma-particpant1.png" alt="Jennifer" />
                </div>
                <div className="participant-name">Sushma M.</div>
                <div className="participant-position">Physician, Cary</div>
                <div className="participant-rating">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="participant-message">
                  Playing the role of an internal medicine trained physician and
                  having been in the role of a patient myself, I have been in
                  pursuit of holistic healing methods that would help me to take
                  care of myself.
                </div>
              </div>
              <div className="participant-item">
                <div className="participant-picture">
                  <img src="/img/marma-particpant1.png" alt="Jennifer" />
                </div>
                <div className="participant-name">Pramoda B.</div>
                <div className="participant-position">Coach, Washington DC</div>
                <div className="participant-rating">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="participant-message">
                  Learning and applying Marma made me feel alive and in tune
                  with nature and people. I felt happy and energetic after each
                  learning session in the course.
                </div>
              </div>
              <div className="participant-item">
                <div className="participant-picture">
                  <img src="/img/marma-particpant1.png" alt="Jennifer" />
                </div>
                <div className="participant-name">Kamala H.</div>
                <div className="participant-position">
                  Engineer, Santa Clara
                </div>
                <div className="participant-rating">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="participant-message">
                  The course is packed with deep knowledge and progresses very
                  methodically and scientifically.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="what-expect-section pt-lg-5  pb-lg-5">
          <div className="container marma-training-section pb-lg-5">
            <h2 className="section-title">What to expect</h2>
            <div className="row">
              <div className="col-md-4">
                <div className="marma-expect-item">
                  <div className="marma-expect-icon">
                    <img src="/img/marma-expect-icon1.png" alt="marma" />
                  </div>
                  <div className="marma-expect-text">
                    4.5-day in-person course guided by a certified trainer
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="marma-expect-item">
                  <div className="marma-expect-icon">
                    <img src="/img/marma-expect-icon2.png" alt="marma" />
                  </div>
                  <div className="marma-expect-text">
                    Learn how to identify imbalances & restore vitality through
                    Marma
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="marma-expect-item">
                  <div className="marma-expect-icon">
                    <img src="/img/marma-expect-icon3.png" alt="marma" />
                  </div>
                  <div className="marma-expect-text">
                    Benefit from a fully integrated practical & holistic
                    training
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="marma-energy-treatment pt-lg-5">
        <div className="container marma-training-section pb-lg-5 pt-lg-5">
          <div className="row">
            <div className="col-md-6">
              <div className="energy-treatment-image">
                <img
                  src="/img/marma-replenshing-energy-treatement.jpeg"
                  alt="energy treatment"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="energy-treatment-text pt-lg-5">
                <h2 className="section-title">
                  Gain practical, holistic skills for life
                </h2>
                <p>
                  With a solid understanding of the science of Marma and the
                  practical application of Ayurvedic principles and daily
                  practices, you’ll have a newfound appreciation of the mind and
                  body—and the wisdom, knowledge, and experience to facilitate
                  healing in yourself and others.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="marma-syllabus pt-lg-5">
        <div className="container marma-training-section pb-lg-5 pt-lg-5">
          <h2 className="section-title">Syllabus</h2>
          <div className="row">
            <div className="col-md-6">
              <div className="syllabus-item">
                <strong>• Training in 28 Major Marma Points</strong>
                <br />
                Emerge as a confident practitioner with a thorough understanding
                of Marma points, locations, &amp; technique.
              </div>
            </div>
            <div className="col-md-6">
              <div className="syllabus-item">
                <strong>
                  • Theory of Marma Therapy
                  <br />
                </strong>
                Gain a solid understanding of Marma theory & application,
                including practical demos for a complete learning experience.
              </div>
            </div>
            <div className="col-md-6">
              <div className="syllabus-item">
                <strong>• Training in Marma Polarity</strong>
                <br />
                Discover how to balance energy flows in the body through the
                five elements approach to mind-body healing.
              </div>
            </div>
            <div className="col-md-6">
              <div className="syllabus-item">
                <strong>• Practice Sessions</strong>
                <br />
                To integrate the training, you’ll have opportunities to practice
                the full Marma Therapy routine & perfect your technique.
              </div>
            </div>
            <div className="col-md-6">
              <div className="syllabus-item">
                <strong>• Basic Principles of Ayurved</strong>
                <br />
                Learn the foundations of the healthcare system of Ayurveda,
                including diet & nutrition, lifestyle, & self-care.
              </div>
            </div>
            <div className="col-md-6">
              <div className="syllabus-item">
                <strong>
                  • Daily Yoga, Meditation, Breathwork &amp; Community Satsang
                </strong>
                <br />
                You’ll be fully supported with mind-body practices & wisdom
                throughout the training.
              </div>
            </div>
          </div>
          <div className="note">
            Participants often describe Sri Sri Marma Practitioner Training as
            deeply meditative and restorative. It is a training that reflects
            the essence of Marma—and the experience of both a recipient and
            practitioner of Marma Therapy.
          </div>
          {preRequisiteCondition && (
            <div className="eligibility-info">
              <strong>Eligibility:</strong> {preRequisiteCondition}
            </div>
          )}
        </div>
      </section>
      {/* <section className="marma-practitioner-section pt-lg-5 pb-lg-5">
        <div className="container marma-training-section pt-lg-5 pb-lg-5">
          <div className="learn-how-text">Learn how to perform Marma Therapy</div>
          <h2 className="section-title">Sri Sri Marma Practitioner Training</h2>
          <p>
            Course Fees Including meals:
            <br />
            <strong>$1,170</strong> (First-time participant),
            <br />
            <strong>$595</strong> (Repeater)
            <br />+ Accommodation fees
          </p>
          <button className="view-upcoming-button mt-4">View Upcoming Dates</button>
        </div>
      </section> */}
      <div className="about-art-of-living--section pt-lg-5  pb-lg-5">
        <div className="container marma-training-section pb-lg-2">
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
      </div>
    </main>
  );
};
