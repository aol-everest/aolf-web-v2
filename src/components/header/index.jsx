/* eslint-disable react/display-name */
import Link from '@components/linkWithUTM';
import { useAuth, useGlobalModalContext } from '@contexts';
import { orgConfig } from '@org';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
// import { FaUserCircle } from "react-icons/fa";
import { CONTENT_FOLDER_IDS } from '@constants';
import { navigateToLogin } from '@utils';

const HB_MENU = [
  {
    name: 'Courses',
    link: '/us-en/courses',
  },
  {
    name: 'Services',
    submenu: [
      {
        name: 'Institutions',
        link: 'https://healingbreaths.org/institutions/',
      },
      {
        name: 'Professionals',
        link: 'https://healingbreaths.org/healthcare-professionals/',
      },
    ],
  },
  {
    name: 'The Science',
    link: `https://healingbreaths.org/the-science/`,
  },
  {
    name: 'Experiences',
    link: `https://healingbreaths.org/experiences/`,
  },
  {
    name: 'Insights',
    submenu: [
      {
        name: 'Stories',
        link: 'https://healingbreaths.org/stories/',
      },
      {
        name: 'Infographics and E-books',
        link: 'https://healingbreaths.org/infographics-and-e-books/',
      },
    ],
  },
  {
    name: 'Who We Are',
    submenu: [
      {
        name: 'About Us',
        link: 'https://healingbreaths.org/about-us/',
      },
    ],
  },
  {
    name: 'News',
    link: 'https://healingbreaths.org/news/',
  },
];

const AOL_MENU = [
  {
    name: 'Gurudev',
    link: 'https://www.artofliving.org/us-en/gurudev',
  },
  {
    name: 'Explore',
    submenu: [
      {
        name: 'Breathwork',
        link: 'https://event.us.artofliving.org/us-en/breathwork2/lp1/',
      },
      {
        name: 'Meditation',
        link: 'https://event.us.artofliving.org/us-en/secrets-of-meditation2/lp1/',
      },
    ],
  },
  {
    name: 'Meditation',
    submenu: [
      {
        name: 'Daily SKY',
        link: '/us-en/daily-sky',
      },
      {
        name: 'Guided Meditation',
        link: `/us-en/guided-meditation/${CONTENT_FOLDER_IDS.MEDITATE_FOLDER_ID}`,
      },
      {
        name: 'Meetups',
        link: '/us-en/meetup',
      },
    ],
  },
  {
    name: 'Wisdom',
    submenu: [
      {
        name: 'Podcasts',
        link: '/us-en/wisdom/podcast',
      },
    ],
  },
  {
    name: 'Courses',
    subHeading: [
      {
        name: "Beginner's Courses",
        items: [
          {
            name: 'Art Of Living Part 1',
            link: 'https://event.us.artofliving.org/us-en/artoflivingpart1',
          },
          {
            name: 'Sahaj Samadhi Meditation',
            link: `https://event.us.artofliving.org/us-en/sahajsamadhi`,
          },
          {
            name: 'Art Of Living Premium',
            link: 'https://event.us.artofliving.org/us-en/premiumcourse/',
          },
          {
            name: 'Sri Sri Yoga Foundation',
            link: '/us-en/lp/online-foundation-program?utm_source=organic&utm_medium=home&utm_content=menu&course_id=1004431',
          },
        ],
      },
      {
        name: 'Advanced Courses',
        items: [
          {
            name: 'Art Of Living Part 2',
            link: 'https://event.us.artofliving.org/us-en/artoflivingpart2',
          },
          {
            name: 'Blessings',
            link: '/us-en/lp/blessings-course',
          },
          {
            name: 'Chakra Kriya',
            link: '/us-en/lp/chakra-kriya',
          },
          {
            name: 'DSN',
            link: '/us-en/courses/dsn-course',
          },
          {
            name: 'Sanyam',
            link: '/us-en/lp/sanyam',
          },
          {
            name: 'Shakti Kriya',
            link: '/us-en/lp/shakti-kriya',
          },
          {
            name: 'Sri Sri Yoga Deep Dive',
            link: '/us-en/lp/srisriyoga-deepdiveretreat',
          },
        ],
      },
      {
        name: 'Training Courses',
        items: [
          {
            name: 'Volunteer Training',
            link: '/us-en/lp/vtp',
          },
          {
            name: 'Teacher Training',
            link: '/us-en/lp/teacher-training-course',
          },
          {
            name: 'Sri Sri Yoga Teacher Training',
            link: 'https://artoflivingretreatcenter.org/event/sri-sri-school-of-yoga-ttc',
          },
          {
            name: 'Sri Sri Marma Practitioner',
            link: 'https://event.us.artofliving.org/us-en/marma-training',
          },
          {
            name: 'All Courses',
            link: '/us-en/courses',
          },
          {
            name: 'Help me choose',
            link: '/us-en/course-finder/welcome',
          },
        ],
      },
    ],
  },
  {
    name: 'Centers',
    submenu: [
      {
        name: 'Art of Living Boone Retreat',
        link: '/us-en/lp/theartoflivingretreatcenter',
        props: { target: '_blank' },
      },
      {
        name: 'Connect Locally',
        link: '/us-en/centers',
      },
      {
        name: 'Los Angeles',
        link: 'https://artoflivingla.org',
        props: { target: '_blank' },
      },
      {
        name: 'Washington DC',
        link: 'https://dc.artofliving.org',
        props: { target: '_blank' },
      },
    ],
  },
  {
    name: 'Resources',
    submenu: [
      {
        name: 'Meditations',
        link: `/us-en/library/${CONTENT_FOLDER_IDS.MEDITATE_FOLDER_ID}`,
      },
      {
        name: 'Wisdom',
        link: `/us-en/library/${CONTENT_FOLDER_IDS.WISDOM_FOLDER_ID}`,
      },
      {
        name: 'App',
        link: '/us-en/lp/journey-app',
      },
    ],
  },
  {
    name: 'About',
    submenu: [
      {
        name: 'Art of Living',
        link: 'https://www.artofliving.org/us-en/about-us',
      },
      {
        name: 'Service Projects',
        link: 'https://www.artofliving.org/us-en/service-projects-overview',
      },
      {
        name: 'Science',
        link: 'https://www.artofliving.org/us-en/meditation/benefits/research-sudarshan-kriya',
      },
      {
        name: 'Blog',
        link: 'https://www.artofliving.org/us-en/blog',
      },
      {
        name: 'Press & Media',
        link: 'https://www.artofliving.org/us-en/media-coverage?search=',
      },
      {
        name: 'Testimonials',
        link: 'https://www.artofliving.org/us-en/testimonials/search',
      },
      {
        name: 'Contact Us',
        link: 'https://www.artofliving.org/us-en/contact-us',
      },
    ],
  },
];

const IAHV_MENU = [
  {
    name: 'Courses',
    submenu: [
      {
        name: 'Join A Free Intro',
        link: '/us-en/lp/introtalks-hq?id=a388X000000ZHkzQAG&utm_source=organic&utm_medium=website&utm_campaign=menu',
      },
      {
        name: 'Overview',
        link: 'https://www.artofliving.org/us-en/courses',
      },
      {
        name: 'Sahaj Meditation',
        link: `https://www.artofliving.org/us-en/sahaj-samadhi-meditation`,
        // link: `/us-en/course?courseType=SAHAJ_SAMADHI_MEDITATION`,
      },
      {
        name: 'Silent Retreat',
        link: 'https://www.artofliving.org/us-en/silence-retreat',
        // link: `/us-en?courseType=SILENT_RETREAT`,
      },
      {
        name: 'Advanced Courses',
        link: '/us-en/lp/advanced-courses',
      },
      {
        name: 'Healthcare Providers',
        link: 'https://www.healingbreaths.org/',
      },
      {
        name: 'Yoga Course',
        link: '/us-en/lp/online-foundation-program/',
      },
      {
        name: 'College Courses',
        link: 'https://www.skycampushappiness.org/',
      },
      {
        name: 'Destination Retreats',
        link: 'https://artoflivingretreatcenter.org/category/meditation/meditation-mindfulness/',
      },
      {
        name: 'All Courses',
        link: '/us-en/courses',
      },
    ],
  },
  {
    name: 'Meditate',
    submenu: [
      {
        name: 'Guided meditations',
        link: `/us-en/library/${CONTENT_FOLDER_IDS.MEDITATE_FOLDER_ID}`,
      },
      {
        name: 'Live meetups',
        link: '/us-en/meetup',
      },
    ],
  },
  {
    name: 'Resources',
    submenu: [
      {
        name: 'Journey App',
        link: '/us-en/lp/journey-app',
      },
      {
        name: 'Blog',
        link: 'https://www.artofliving.org/us-en/blog',
      },
      {
        name: 'Wisdom Snippets',
        link: `/us-en/library/${CONTENT_FOLDER_IDS.WISDOM_FOLDER_ID}`,
      },
      {
        name: 'Better Sleep',
        link: 'https://www.artofliving.org/us-en/blog/start-sleeping-restfully-all-night-using-this-meditation-sleep-guide',
      },
      {
        name: 'Breathwork',
        link: 'https://www.artofliving.org/us-en/yoga/breathing-techniques/yoga-and-pranayama',
      },
      {
        name: 'Yoga',
        link: 'https://www.artofliving.org/us-en/yoga',
      },
      {
        name: 'Meditation for Beginners',
        link: 'https://www.artofliving.org/us-en/8-tips-get-started-meditation',
      },
    ],
  },
  {
    name: 'About',
    submenu: [
      {
        name: 'Art of Living',
        link: 'https://www.artofliving.org/us-en/about-us',
      },
      {
        name: 'Founder',
        link: '/us-en/lp/gurudev',
      },
      {
        name: 'Humanitarian Work',
        link: 'https://www.artofliving.org/us-en/service-projects-overview',
      },
      {
        name: 'Experiences & Reviews',
        link: 'https://www.artofliving.org/us-en/testimonials/search',
      },
      {
        name: 'Retreat Center',
        link: '/us-en/lp/theartoflivingretreatcenter',
      },
      {
        name: 'Research',
        link: 'https://www.artofliving.org/us-en/research-sudarshan-kriya',
      },
      {
        name: 'Press & Media',
        link: 'https://www.artofliving.org/us-en/media-coverage',
      },
    ],
  },
  {
    name: 'Contact',
    submenu: [
      {
        name: 'Contact & Support',
        link: 'https://www.artofliving.org/us-en/contact-us',
      },
      {
        name: 'Donate',
        link: 'https://aolf.kindful.com/',
      },
    ],
  },
  /* {
    name: "Events",
    submenu: [
      {
        name: "World Culture Festival",
        link: "https://wcf.artofliving.org/",
      },
      {
        name: "Summer Tour 2023",
        link: "/us-en/lp/sixthsensetour",
      },
    ],
  }, */
];

const MENU =
  orgConfig.name === 'AOL'
    ? AOL_MENU
    : orgConfig.name === 'IAHV'
      ? IAHV_MENU
      : HB_MENU;

export const Header = () => {
  const router = useRouter();
  const { isAuthenticated = false, profile } = useAuth();
  const [navExpanded, setNavExpanded] = useState(false);

  const { showModal } = useGlobalModalContext();
  const { userProfilePic: profilePic, first_name, last_name } = profile || {};
  let initials = `${first_name || ''} ${last_name || ''}`.match(/\b\w/g) || [];
  initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();

  document.addEventListener('click', function (event) {
    if (event?.target?.classList?.contains('back-link')) {
      // Find the immediate parent element and remove it
      var parent = event.target?.closest('.show');
      if (parent) {
        parent.style.transition = 'all 0.3s ease-in-out';
        // After a short delay, remove the parent class
        setTimeout(function () {
          parent.classList?.remove('show');
        }, 3);
      }
    }
  });

  const loginAction = () => {
    setNavExpanded(false);
    if (router.pathname !== '/us-en/signin') {
      navigateToLogin(router);
    } else {
      router.reload();
    }
  };

  const onToggleNav = () => {
    setNavExpanded(!navExpanded);
  };

  const renderMenu = (menu) => {
    if (!menu) {
      return null;
    }
    if (menu.submenu) {
      return (
        <>
          <button
            className="back-link dropdown-toggle"
            href="#"
            id="navbarCoursesDropdown"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <img
              src="/img/BackArrow.svg"
              className="past-courses__cards__arrow back-link"
            />
          </button>
          <div className="dropdown-menu-col">
            {menu.submenu.map((submenu) => {
              return (
                <NavDropdown.Item
                  href={submenu.link}
                  key={submenu.name}
                  as={Link}
                  {...submenu.props}
                >
                  {submenu.name}
                </NavDropdown.Item>
              );
            })}
          </div>
        </>
      );
    }
    if (menu.subHeading) {
      return (
        <>
          <button
            className="back-link dropdown-toggle"
            href="#"
            id="navbarCoursesDropdown"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <img
              src="/img/BackArrow.svg"
              className="past-courses__cards__arrow back-link"
            />
          </button>
          <div className="dropdown-menu-inner">
            {menu.subHeading?.map((subMenu) => {
              return (
                <React.Fragment key={subMenu.name}>
                  {subMenu?.items && (
                    <>
                      {subMenu.name && (
                        <div className="dropdown-menu-col">
                          <h6 className="dropdown-header">{subMenu.name}</h6>
                          {subMenu?.items.map((menuItem) => {
                            return (
                              <NavDropdown.Item
                                href={menuItem.link}
                                key={menuItem.name}
                                className={
                                  menuItem.link === '/us-en/courses'
                                    ? 'active'
                                    : menuItem.link ===
                                        '/us-en/course-finder/welcome'
                                      ? 'help'
                                      : ''
                                }
                                as={Link}
                              >
                                {menuItem.name}
                              </NavDropdown.Item>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                  {subMenu?.link && (
                    <NavDropdown.Item
                      href={subMenu.link}
                      key={subMenu.name}
                      as={Link}
                      className="pt25"
                    >
                      {subMenu.name}
                    </NavDropdown.Item>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <header className={`header header-v2 ${navExpanded && 'menu-opened'}`}>
      <div className="header__container container">
        <a href={orgConfig.logoLink} className="logo">
          <img
            src={`/img/${orgConfig.logo}`}
            alt="logo"
            className="logo__image"
          />
        </a>
        <Navbar
          expand="lg"
          onToggle={onToggleNav}
          expanded={navExpanded}
          collapseOnSelect
        >
          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            as="button"
            className="navbar-toggler-header"
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar top-bar"></span>
            <span className="icon-bar middle-bar"></span>
            <span className="icon-bar bottom-bar"></span>
          </Navbar.Toggle>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto" as="ul">
              {MENU.map((menu) => {
                if (menu.link) {
                  return (
                    <Nav.Item as="li" key={menu.name}>
                      <Nav.Link href={menu.link} as={Link}>
                        {menu.icon || ''}
                        {menu.name}
                      </Nav.Link>
                    </Nav.Item>
                  );
                }
                return (
                  <NavDropdown
                    title={menu.name}
                    key={menu.name}
                    as="li"
                    renderMenuOnMount
                  >
                    {renderMenu(menu)}
                  </NavDropdown>
                );
              })}
              <Nav.Item as="li" className="mobileView">
                <Nav.Link href="/us-en/lp/donations" as={Link}>
                  Donation
                </Nav.Link>
              </Nav.Item>
            </Nav>
            <div className="mobile-menu-buttons">
              {!isAuthenticated && (
                <button
                  className="btn btn-outline header__button login-btn"
                  type="button"
                  onClick={loginAction}
                >
                  Log In
                </button>
              )}
            </div>
          </Navbar.Collapse>
        </Navbar>
        <div
          className={
            isAuthenticated
              ? 'user-profile-link'
              : 'user-profile-link hide-link'
          }
        >
          <div className="UserprofileView">
            {!isAuthenticated && (
              <button
                className="btn btn-outline header__button"
                type="button"
                onClick={loginAction}
              >
                Log In
              </button>
            )}

            {isAuthenticated && (
              <>
                <Link href="/us-en/profile" legacyBehavior>
                  <a
                    href="#"
                    className="tw-no-underline tw-text-black hover:tw-text-black hover:tw-no-underline"
                  >
                    <span className="username">{first_name || last_name}</span>
                  </a>
                </Link>
                <Link prefetch={false} href="/us-en/profile" legacyBehavior>
                  <a
                    className="header_profileHeaderImage"
                    href="#"
                    onClick={() => setNavExpanded(false)}
                  >
                    <p className="initials">{initials}</p>
                    {profilePic && (
                      <img
                        src={profilePic}
                        alt="PC"
                        className="rounded-circle"
                      />
                    )}
                  </a>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
