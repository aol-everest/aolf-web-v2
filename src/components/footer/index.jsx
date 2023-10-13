/* eslint-disable react/no-unescaped-entities */
import Link from '@components/linkWithUTM';
import { orgConfig } from '@org';

export function Footer() {
  if (orgConfig.name === 'HB') {
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
      <section className="footer-details new-footer-container">
        <div className="container">
          <div className="row justify-content-center">
            <div className="footer-top">
              <img
                src="/img/ic-logo-2.svg"
                className="logo footer-logo"
                alt="logo"
              />
            </div>
          </div>
        </div>
        <div className="fluid-container">
          <div className="row footer-nav second-footer-nav">
            <div className="col-12 col-sm-12 col-md-3 order-lg-1 order-2 col-lg-3">
              <div className="nav-item-box">
                <label htmlFor="Gurudev" className="nav-item--title">
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
                <label htmlFor="Courses" className="nav-item--title">
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
                <label htmlFor="About Us" className="nav-item--title">
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
                <label htmlFor="Blog" className="nav-item--title">
                  Blog
                </label>
                <input className="nav-item--check" type="checkbox" id="Blog" />
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
