/* eslint-disable react/no-unescaped-entities */
import Link from "@components/linkWithUTM";
import { orgConfig } from "@org";

export function Footer() {
  if (orgConfig.name === "HB") {
    return (
      <footer className="footer footer_courses">
        <nav className="footer-navbar">
          <p className="copyright order-2 order-md-1"></p>
          <ul className="footer-navbar--list order-1 order-md-2 mb-2 mb-md-0">
            <li className="footer-navbar--item">
              <Link href="https://healingbreaths.org/sms-policy/">
                SMS Policy
              </Link>
            </li>

            <li className="footer-navbar--item">
              <Link
                prefetch={false}
                href="https://healingbreaths.org/privacy-policy/"
                legacyBehavior
              >
                <Link target="_blank">Privacy Policy</Link>
              </Link>
            </li>
            <li className="footer-navbar--item">
              <Link href="https://healingbreaths.org/cookie-policy/">
                Cookie Policy
              </Link>
            </li>
            <li className="footer-navbar--item">
              <Link
                prefetch={false}
                href="https://healingbreaths.org/terms-of-use/"
                legacyBehavior
              >
                <a target="_blank">Terms of Use</a>
              </Link>
            </li>
          </ul>
        </nav>
      </footer>
    );
  }
  return (
    <>
      <main>
        <section className="details new-footer-container">
          <div className="container">
            <div className="row justify-content-center">
              <div className="footer-top">
                <img
                  src="/img/ic-logo-2.svg"
                  className="logo footer-logo"
                  alt="logo"
                />

                <div className="find-solution text-center">
                  <p className="heading">
                    FIND <span className="font-bold">SOLUTIONS</span>
                  </p>
                  <p>
                    Check out more resources to help you lower your stress and
                    find lasting calm
                  </p>
                </div>
              </div>
            </div>
            <div className="row footer-nav">
              <div className="col-12 col-sm-12 col-md-6 order-lg-1 order-2 col-lg-4">
                <div className="nav-item-box">
                  <img
                    className="nav-item--image"
                    src="/img/footer/footer-meditation-icon.png"
                  />
                  <label for="MEDITATION" className="nav-item--title">
                    MEDITATION
                  </label>
                  <input
                    className="nav-item--check"
                    type="checkbox"
                    id="MEDITATION"
                  />
                  <ul className="nav-details">
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/meditation">
                        Meditation Overview
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/meditation/benefits/benefits-of-meditation">
                        Benefits Of Meditation
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/meditation/beginners-guide/meditation-for-beginners">
                        Meditation For Beginners
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/meditation/how-to/how-to-meditate-properly">
                        How To Meditate
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/meditation/chakras/chakras-guide">
                        Chakras
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/meditation/beginners-guide/online-guided-meditation">
                        Guided Meditation
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/meditation/beginners-guide/what-is-meditation">
                        What Is Meditation?
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/yoga/health-and-wellness/yoga-nidra-experience">
                        Yoga Nidra Meditation
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/meditation/how-to/body-scan-meditation">
                        Body Scan Meditation
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-12 col-sm-12 col-md-6 order-lg-2 order-2 col-lg-4">
                <div className="nav-item-box">
                  <img
                    className="nav-item--image"
                    src="/img/footer/footer-breathing-icon.png"
                  />
                  <label for="BREATHING" className="nav-item--title">
                    BREATHING
                  </label>
                  <input
                    className="nav-item--check"
                    type="checkbox"
                    id="BREATHING"
                  />
                  <ul className="nav-details">
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/breathwork/breathing-exercises-101/breathing-techniques">
                        Pranayama Breathwork
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/breathwork/breathing-exercises-101/deep-breathing-exercises">
                        Deep Breathing Exercises
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/breathwork/breathing-exercises-101/breathing-techniques">
                        Breathing Techniques
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/breathwork/breathing-exercises-101/how-to-increase-lung-capacity">
                        How To Increase Lung Capacity
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/breathwork/breathing-exercises-101/breathing-exercises-for-anxiety">
                        Breathing Exercises For Anxiety / Anxiety Breathing
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/breathwork/breathing-exercises-101/breathing-patterns">
                        Breathing Patterns
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/breathwork/pranayama/bhramari-pranayama">
                        Bhramari Breath
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/breathwork/pranayama/alternate-nostril-breathing">
                        Alternate Nostril Breathing
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-12 col-sm-12 col-md-6 order-lg-3 order-3 col-lg-4">
                <div className="nav-item-box">
                  <img
                    className="nav-item--image"
                    src="/img/footer/footer-yoga-icon.png"
                  />
                  <label for="YOGA" className="nav-item--title">
                    YOGA
                  </label>
                  <input
                    className="nav-item--check"
                    type="checkbox"
                    id="YOGA"
                  />
                  <ul className="nav-details">
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/yoga/poses/sun-salutation">
                        Sun Salutations
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/yoga/benefits/mudra-for-anxiety">
                        Mudras
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/yoga/poses/yoga-poses">
                        Yoga Poses
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/yoga/benefits/yoga-benefits">
                        Benefits Of Yoga
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/yoga/beginners/yoga-for-beginners">
                        Yoga For Beginners
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/yoga/poses/pigeon-pose">
                        Pigeon Pose
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/yoga/poses/lotus-positition">
                        Lotus Position
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/yoga/poses/shavasana">
                        Shavasana
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-12 col-sm-12 col-md-6 order-lg-3 order-3 col-lg-4">
                <div className="nav-item-box">
                  <img
                    className="nav-item--image"
                    src="/img/footer/footer-sleep-icon.png"
                  />
                  <label for="SLEEP" className="nav-item--title">
                    SLEEP
                  </label>
                  <input
                    className="nav-item--check"
                    type="checkbox"
                    id="SLEEP"
                  />
                  <ul className="nav-details">
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/meditation-for-sleep-relaxation-techniques-for-body-and-mind">
                        Meditation For Sleep
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/meditation/sleep/sleep-hygiene">
                        Sleep Hygiene
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/meditation/sleep/guided-sleep-meditation">
                        Guided Sleep Meditation
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/meditation/sleep/how-to-fall-back-asleep">
                        How To Fall Back Asleep
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/meditation/sleep/meditation-for-better-sleep">
                        Meditation For Better Sleep
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/meditation/sleep/sleep-tips">
                        Sleep Tips
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/yoga/health-and-wellness/yoga-nidra-experience">
                        Yoga Nidra
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/meditation/sleep/meditation-replace-sleep">
                        Meditation Replace Sleep
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-12 col-sm-12 col-md-6 order-lg-3 order-3 col-lg-4">
                <div className="nav-item-box">
                  <img
                    className="nav-item--image"
                    src="/img/footer/footer-stress-icon.png"
                  />
                  <label for="STRESS" className="nav-item--title">
                    STRESS
                  </label>
                  <input
                    className="nav-item--check"
                    type="checkbox"
                    id="STRESS"
                  />
                  <ul className="nav-details">
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/stress/strategies-to-reduce-stress">
                        How To Relieve Stress
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/blog/how-to-calm-anxiety">
                        How To Calm Anxiety?
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/stress/relief/how-to-deal-with-loneliness">
                        I'm So Lonely
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/stress/relief/meditation-for-anxiety">
                        Meditation For Anxiety
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/stress/relief/how-to-calm-down">
                        How To Calm Down?
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/stress/relief/how-to-stop-overthinking">
                        How To Stop Overthinking?
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/stress/relief/meditation-for-stress">
                        Meditation For Stress
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/stress/relief/how-to-stop-worrying">
                        How To Stop Worrying?
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-12 col-sm-12 col-md-6 order-lg-3 order-3 col-lg-4">
                <div className="nav-item-box last-item-box">
                  <img
                    className="nav-item--image"
                    src="/img/footer/footer-mr-icon.png"
                  />
                  <label for="MEDITATION RESEARCH" className="nav-item--title">
                    MEDITATION RESEARCH
                  </label>
                  <input
                    className="nav-item--check"
                    type="checkbox"
                    id="MEDITATION RESEARCH"
                  />
                  <ul className="nav-details">
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/meditation/benefits/research-sudarshan-kriya">
                        SKY Research
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/blog/is-meditation-making-your-life-better-or-not-find-the-facts-now">
                        Meditation Research
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/blog">
                        Meditation For Heart Health
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/blog/how-meditation-changes-your-brain">
                        Meditation For A Healthy Brain
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/meditation/benefits/meditation-immunity">
                        Meditation For Immunity
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/meditation/benefits/sudarshan-kriya-benefits">
                        Sudarshan Kriya Benefits
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://event.us.artofliving.org/us-en/research/">
                        Yale Study
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="fluid-container">
            <div className="row footer-nav second-footer-nav">
              <div className="col-12 col-sm-12 col-md-3 order-lg-1 order-2 col-lg-3">
                <div className="nav-item-box">
                  <label for="Gurudev" className="nav-item--title">
                    Gurudev
                  </label>
                  <input
                    className="nav-item--check"
                    type="checkbox"
                    id="Gurudev"
                  />
                  <ul className="nav-details">
                    <li className="nav-item">
                      <a href="/gurudev">About Gurudev</a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/awards-and-honours">
                        Accolades
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/sri-sri-blog">
                        Blog
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-12 col-sm-12 col-md-3 order-lg-1 order-2 col-lg-3">
                <div className="nav-item-box">
                  <label for="Courses" className="nav-item--title">
                    Courses
                  </label>
                  <input
                    className="nav-item--check"
                    type="checkbox"
                    id="Courses"
                  />
                  <ul className="nav-details">
                    <li className="nav-item">
                      <Link href="/us-en/lp/online-course-2">
                        Art of Living Part I
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/sahaj-samadhi-meditation">
                        Sahaj Samadhi Meditation
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://event.us.artofliving.org/us-en/artoflivingpart2">
                        Art of Living Part II
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/us-en/lp/online-foundation-program">
                        Sri Sri Yoga Foundation Program
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/us-en/course">All Courses</Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/us-en/lp/advanced-courses">
                        Advanced Courses
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://healingbreaths.org/">
                        Healthcare Providers
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.skycampushappiness.org/">
                        College Courses
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://artoflivingretreatcenter.org/category/meditation/meditation-mindfulness/">
                        Destination Retreats
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-12 col-sm-12 col-md-3 order-lg-1 order-2 col-lg-3">
                <div className="nav-item-box">
                  <label for="About Us" className="nav-item--title">
                    About Us
                  </label>
                  <input
                    className="nav-item--check"
                    type="checkbox"
                    id="About Us"
                  />
                  <ul className="nav-details">
                    <li className="nav-item">
                      <Link href="/about">Art of Living</Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/meditation/benefits/research-sudarshan-kriya">
                        Research
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/service-projects-overview">
                        Service Projects
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/press">
                        Press & Media
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/us-en/lp/donations">Donate</Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://endowment.us.artofliving.org/">
                        Endowment
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artoflivingstore.us/">
                        Bookstore
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://event.us.artofliving.org/gift-cards/">
                        Gift Card
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.shareasale.com/shareasale.cfm?merchantID=103115">
                        Affiliates
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/contact-us">
                        Contact Us
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-12 col-sm-12 col-md-3 order-lg-1 order-2 col-lg-3">
                <div className="nav-item-box last-item-box">
                  <label for="Blog" className="nav-item--title">
                    Blog
                  </label>
                  <input
                    className="nav-item--check"
                    type="checkbox"
                    id="Blog"
                  />
                  <ul className="nav-details">
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/yoga">
                        Yoga
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/meditation">
                        Meditation
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/breathing-exercises">
                        Breathing exercises
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/wisdom">
                        Wisdom
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/spirituality">
                        Spirituality
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="https://www.artofliving.org/us-en/lifestyle">
                        Lifestyle
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <ul className="footer-navbar--list footer-social-links order-2 order-md-2 mb-2 mb-md-0 mobileView">
                <li className="footer-navbar--item">
                  <Link href="https://www.facebook.com/ArtofLivingUSA">
                    <img src="/img/footer/Fb.svg" />
                  </Link>
                </li>
                <li className="footer-navbar--item">
                  <Link href="https://twitter.com/artoflivingusa">
                    <img src="/img/footer/Twitter.svg" />
                  </Link>
                </li>
                <li className="footer-navbar--item">
                  <Link href="https://www.instagram.com/artoflivingusa/">
                    <img src="/img/footer/Insta.svg" />
                  </Link>
                </li>
                <li className="footer-navbar--item">
                  <Link href="https://www.youtube.com/@artofliving">
                    <img src="/img/footer/Youtube.svg" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer sub-footer">
        <nav className="footer-navbar">
          <ul className="footer-navbar--list privacy_menu order-1 order-md-2 mb-2 mb-md-0">
            <li className="footer-navbar--item copyright">
              © 2023 Art of Living
            </li>
            <div className="privacy-links">
              <li className="footer-navbar--item">
                <Link href="https://www.artofliving.org/us-en/sms-policy">
                  SMS Policy
                </Link>
              </li>
              <li className="footer-navbar--item">
                <Link
                  prefetch={false}
                  href="https://www.artofliving.org/us-en/privacy-policy"
                  legacyBehavior
                >
                  <Link target="_blank">Privacy Policy</Link>
                </Link>
              </li>
              <li className="footer-navbar--item">
                <Link href="https://www.artofliving.org/us-en/cookie-policy">
                  Cookie Policy
                </Link>
              </li>
              <li className="footer-navbar--item">
                <Link
                  prefetch={false}
                  href="https://www.artofliving.org/us-en/terms-of-use"
                  legacyBehavior
                >
                  <a target="_blank">Terms of Use</a>
                </Link>
              </li>
            </div>
          </ul>
          <ul className="footer-navbar--list footer-social-links order-2 order-md-2 mb-2 mb-md-0 desktopView">
            <li className="footer-navbar--item">
              <Link href="https://www.facebook.com/ArtofLivingUSA">
                <img src="/img/footer/Fb.svg" />
              </Link>
            </li>
            <li className="footer-navbar--item">
              <Link href="https://twitter.com/artoflivingusa">
                <img src="/img/footer/Twitter.svg" />
              </Link>
            </li>
            <li className="footer-navbar--item">
              <Link href="https://www.instagram.com/artoflivingusa/">
                <img src="/img/footer/Insta.svg" />
              </Link>
            </li>
            <li className="footer-navbar--item">
              <Link href="https://www.youtube.com/@artofliving">
                <img src="/img/footer/Youtube.svg" />
              </Link>
            </li>
          </ul>
        </nav>
      </footer>
    </>
  );
}
