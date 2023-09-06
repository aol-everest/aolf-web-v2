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
              <a href="https://healingbreaths.org/sms-policy/">SMS Policy</a>
            </li>

            <li className="footer-navbar--item">
              <Link
                prefetch={false}
                href="https://healingbreaths.org/privacy-policy/"
                legacyBehavior
              >
                <a target="_blank">Privacy Policy</a>
              </Link>
            </li>
            <li className="footer-navbar--item">
              <a href="https://healingbreaths.org/cookie-policy/">
                Cookie Policy
              </a>
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
      <main className="course-filter">
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
                      <a href="https://www.artofliving.org/us-en/meditation">
                        Meditation Overview
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/meditation/benefits/benefits-of-meditation">
                        Benefits Of Meditation
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/meditation/beginners-guide/meditation-for-beginners">
                        Meditation For Beginners
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/meditation/how-to/how-to-meditate-properly">
                        How To Meditate
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/meditation/chakras/chakras-guide">
                        Chakras
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/meditation/beginners-guide/online-guided-meditation">
                        Guided Meditation
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/meditation/beginners-guide/what-is-meditation">
                        What Is Meditation?
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/yoga/health-and-wellness/yoga-nidra-experience">
                        Yoga Nidra Meditation
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/meditation/how-to/body-scan-meditation">
                        Body Scan Meditation
                      </a>
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
                      <a href="https://www.artofliving.org/us-en/breathwork/breathing-exercises-101/breathing-techniques">
                        Pranayama Breathwork
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/breathwork/breathing-exercises-101/deep-breathing-exercises">
                        Deep Breathing Exercises
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/breathwork/breathing-exercises-101/breathing-techniques">
                        Breathing Techniques
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/breathwork/breathing-exercises-101/how-to-increase-lung-capacity">
                        How To Increase Lung Capacity
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/breathwork/breathing-exercises-101/breathing-exercises-for-anxiety">
                        Breathing Exercises For Anxiety / Anxiety Breathing
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/breathwork/breathing-exercises-101/breathing-patterns">
                        Breathing Patterns
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/breathwork/pranayama/bhramari-pranayama">
                        Bhramari Breath
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/breathwork/pranayama/alternate-nostril-breathing">
                        Alternate Nostril Breathing
                      </a>
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
                      <a href="https://www.artofliving.org/us-en/yoga/poses/sun-salutation">
                        Sun Salutations
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/yoga/benefits/mudra-for-anxiety">
                        Mudras
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/yoga/poses/yoga-poses">
                        Yoga Poses
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/yoga/benefits/yoga-benefits">
                        Benefits Of Yoga
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/yoga/beginners/yoga-for-beginners">
                        Yoga For Beginners
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/yoga/poses/pigeon-pose">
                        Pigeon Pose
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/yoga/poses/lotus-positition">
                        Lotus Position
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/yoga/poses/shavasana">
                        Shavasana
                      </a>
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
                      <a href="https://www.artofliving.org/us-en/meditation-for-sleep-relaxation-techniques-for-body-and-mind">
                        Meditation For Sleep
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/meditation/sleep/sleep-hygiene">
                        Sleep Hygiene
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/meditation/sleep/guided-sleep-meditation">
                        Guided Sleep Meditation
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/meditation/sleep/how-to-fall-back-asleep">
                        How To Fall Back Asleep
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/meditation/sleep/meditation-for-better-sleep">
                        Meditation For Better Sleep
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/meditation/sleep/sleep-tips">
                        Sleep Tips
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/yoga/health-and-wellness/yoga-nidra-experience">
                        Yoga Nidra
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/meditation/sleep/meditation-replace-sleep">
                        Meditation Replace Sleep
                      </a>
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
                      <a href="https://www.artofliving.org/us-en/stress/strategies-to-reduce-stress">
                        How To Relieve Stress
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/blog/how-to-calm-anxiety">
                        How To Calm Anxiety?
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/stress/relief/how-to-deal-with-loneliness">
                        I'm So Lonely
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/stress/relief/meditation-for-anxiety">
                        Meditation For Anxiety
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/stress/relief/how-to-calm-down">
                        How To Calm Down?
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/stress/relief/how-to-stop-overthinking">
                        How To Stop Overthinking?
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/stress/relief/meditation-for-stress">
                        Meditation For Stress
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/stress/relief/how-to-stop-worrying">
                        How To Stop Worrying?
                      </a>
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
                      <a href="https://www.artofliving.org/us-en/meditation/benefits/research-sudarshan-kriya">
                        SKY Research
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/blog/is-meditation-making-your-life-better-or-not-find-the-facts-now">
                        Meditation Research
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/blog">
                        Meditation For Heart Health
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/blog/how-meditation-changes-your-brain">
                        Meditation For A Healthy Brain
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/meditation/benefits/meditation-immunity">
                        Meditation For Immunity
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/meditation/benefits/sudarshan-kriya-benefits">
                        Sudarshan Kriya Benefits
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://event.us.artofliving.org/us-en/research/">
                        Yale Study
                      </a>
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
                      <a href="https://members.us.artofliving.org/us-en/lp/online-course-2?_gl=1*1g8d920*_ga*MTk0NjUzNTA2MC4xNjkzNTcxNzMy*_ga_53SWQFSBV0*MTY5MzcxNzMxOC4zLjAuMTY5MzcxNzMxOS41OS4wLjA.">
                        Art of Living Part I
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/sahaj-samadhi-meditation">
                        Sahaj Samadhi Meditation
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="#">Art of Living Part II</a>
                    </li>
                    <li className="nav-item">
                      <a href="https://members.us.artofliving.org/us-en/lp/online-foundation-program?_gl=1*1q9xag8*_ga*MTk0NjUzNTA2MC4xNjkzNTcxNzMy*_ga_53SWQFSBV0*MTY5MzcxNzMxOC4zLjEuMTY5MzcxNzQwMC4zOC4wLjA.">
                        Sri Sri Yoga Foundation Program
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://members.us.artofliving.org/us-en/course">
                        All Courses
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://members.us.artofliving.org/us-en/lp/advanced-courses">
                        Advanced Courses
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://healingbreaths.org/">
                        Healthcare Providers
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.skycampushappiness.org/">
                        College Courses
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://artoflivingretreatcenter.org/category/meditation/meditation-mindfulness/">
                        Destination Retreats
                      </a>
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
                      <a href="/about">Art of Living</a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/meditation/benefits/research-sudarshan-kriya">
                        Research
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/service-projects-overview">
                        Service Projects
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/press">
                        Press & Media
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://members.us.artofliving.org/us-en/lp/donations">
                        Donate
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://endowment.us.artofliving.org/">
                        Endowment
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artoflivingstore.us/">Bookstore</a>
                    </li>
                    <li className="nav-item">
                      <a href="https://event.us.artofliving.org/gift-cards/">
                        Gift Card
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.shareasale.com/shareasale.cfm?merchantID=103115">
                        Affiliates
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/contact-us">
                        Contact Us
                      </a>
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
                      <a href="https://www.artofliving.org/us-en/yoga">Yoga</a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/meditation">
                        Meditation
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/breathing-exercises">
                        Breathing exercises
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/wisdom">
                        Wisdom
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/spirituality">
                        Spirituality
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="https://www.artofliving.org/us-en/lifestyle">
                        Lifestyle
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <ul className="footer-navbar--list footer-social-links order-2 order-md-2 mb-2 mb-md-0 mobileView">
                <li className="footer-navbar--item">
                  <a href="#">
                    <img src="/img/footer/Fb.svg" />
                  </a>
                </li>
                <li className="footer-navbar--item">
                  <a href="#">
                    <img src="/img/footer/Twitter.svg" />
                  </a>
                </li>
                <li className="footer-navbar--item">
                  <a href="#">
                    <img src="/img/footer/Insta.svg" />
                  </a>
                </li>
                <li className="footer-navbar--item">
                  <a href="#">
                    <img src="/img/footer/Youtube.svg" />
                  </a>
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
                <a href="#">SMS Policy</a>
              </li>
              <li className="footer-navbar--item">
                <Link prefetch={false} href="/policy/privacy" legacyBehavior>
                  <a target="_blank">Privacy Policy</a>
                </Link>
              </li>
              <li className="footer-navbar--item">
                <a href="#">Cookie Policy</a>
              </li>
              <li className="footer-navbar--item">
                <Link prefetch={false} href="/policy/ppa-course" legacyBehavior>
                  <a target="_blank">Terms of Use</a>
                </Link>
              </li>
            </div>
          </ul>
          <ul className="footer-navbar--list footer-social-links order-2 order-md-2 mb-2 mb-md-0 desktopView">
            <li className="footer-navbar--item">
              <a href="#">
                <img src="/img/footer/Fb.svg" />
              </a>
            </li>
            <li className="footer-navbar--item">
              <a href="#">
                <img src="/img/footer/Twitter.svg" />
              </a>
            </li>
            <li className="footer-navbar--item">
              <a href="#">
                <img src="/img/footer/Insta.svg" />
              </a>
            </li>
            <li className="footer-navbar--item">
              <a href="#">
                <img src="/img/footer/Youtube.svg" />
              </a>
            </li>
          </ul>
        </nav>
      </footer>
    </>
  );
}
