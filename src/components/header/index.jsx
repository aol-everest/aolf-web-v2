/* eslint-disable react/display-name */
import Link from "@components/linkWithUTM";
import { useAuth, useGlobalModalContext } from "@contexts";
import { orgConfig } from "@org";
import { pushRouteWithUTMQuery } from "@service";
import classNames from "classnames";
import { useRouter } from "next/router";
import queryString from "query-string";
import React, { useState } from "react";
import Style from "./Header.module.scss";
// import { FaUserCircle } from "react-icons/fa";
import { CONTENT_FOLDER_IDS, MODAL_TYPES } from "@constants";

const HB_MENU = [
  {
    name: "Courses",
    link: "/us-en/course",
  },
  {
    name: "Services",
    submenu: [
      {
        name: "Institutions",
        link: "https://healingbreaths.org/institutions/",
      },
      {
        name: "Professionals",
        link: "https://healingbreaths.org/healthcare-professionals/",
      },
    ],
  },
  {
    name: "The Science",
    link: `https://healingbreaths.org/the-science/`,
  },
  {
    name: "Experiences",
    link: `https://healingbreaths.org/experiences/`,
  },
  {
    name: "Insights",
    submenu: [
      {
        name: "Stories",
        link: "https://healingbreaths.org/stories/",
      },
      {
        name: "Infographics and E-books",
        link: "https://healingbreaths.org/infographics-and-e-books/",
      },
    ],
  },
  {
    name: "Who We Are",
    submenu: [
      {
        name: "About Us",
        link: "https://healingbreaths.org/about-us/",
      },
    ],
  },
  {
    name: "News",
    link: "https://healingbreaths.org/news/",
  },
];

const AOL_MENU = [
  {
    name: "Courses",
    submenu: [
      {
        name: "Join A Free Intro",
        link: "/us-en/lp/introtalks-hq?id=a388X000000ZHkzQAG&utm_source=organic&utm_medium=website&utm_campaign=menu",
      },
      {
        name: "Overview",
        link: "https://www.artofliving.org/us-en/courses",
      },
      {
        name: "Art Of Living Part I",
        link: "https://event.us.artofliving.org/us-en/online-course-2",
        // link: `/us-en?courseType=SKY_BREATH_MEDITATION`,
      },
      {
        name: "Sahaj Meditation",
        link: `https://event.us.artofliving.org/us-en/sahajsamadhi`,
        // link: `/us-en/course?courseType=SAHAJ_SAMADHI_MEDITATION`,
      },
      {
        name: "Art Of Living Part II",
        link: "https://event.us.artofliving.org/us-en/artoflivingpart2",
        // link: `/us-en?courseType=SILENT_RETREAT`,
      },
      {
        name: "Advanced Courses",
        link: "/us-en/lp/advanced-courses",
      },
      {
        name: "Healthcare Providers",
        link: "https://www.healingbreaths.org/",
      },
      {
        name: "Yoga Course",
        link: "/us-en/lp/online-foundation-program/",
      },
      {
        name: "College Courses",
        link: "https://www.skycampushappiness.org/",
      },
      // {
      //   name: "Youth Courses",
      //   link: "https://www.skyforkids.org/",
      // },
      {
        name: "Destination Retreats",
        link: "https://artoflivingretreatcenter.org/category/meditation/meditation-mindfulness/",
      },
      {
        name: "All Courses",
        link: "/us-en/course",
      },
    ],
  },
  {
    name: "Meditate",
    submenu: [
      {
        name: "Guided meditations",
        link: `/us-en/library/guided-meditations`,
      },
      {
        name: "Live meetups",
        link: "/us-en/meetup",
      },
      // {
      //   name: "Guided breathwork",
      //   link: "#",
      // },
      // {
      //   name: "Guided Yoga",
      //   link: "#",
      // },
    ],
  },
  {
    name: "Resources",
    submenu: [
      {
        name: "Journey App",
        link: "/us-en/lp/journey-app",
      },
      {
        name: "Blog",
        link: "https://www.artofliving.org/us-en/blog",
      },
      {
        name: "Wisdom Snippets",
        link: `/us-en/library/wisdom-snippets`,
      },
      // {
      //   name: "Meditation",
      //   link: "https://www.artofliving.org/us-en/meditation",
      // },
      {
        name: "Better Sleep",
        link: "https://www.artofliving.org/us-en/blog/start-sleeping-restfully-all-night-using-this-meditation-sleep-guide",
      },
      {
        name: "Breathwork",
        link: "https://www.artofliving.org/us-en/yoga/breathing-techniques/yoga-and-pranayama",
      },
      {
        name: "Yoga",
        link: "https://www.artofliving.org/us-en/yoga",
      },
      // {
      //   name: "Guided Meditation",
      //   link: "https://www.artofliving.org/us-en/online-guided-meditation",
      // },
      {
        name: "Meditation for Beginners",
        link: "https://www.artofliving.org/us-en/8-tips-get-started-meditation",
      },
    ],
  },
  {
    name: "About",
    submenu: [
      {
        name: "Art of Living",
        link: "https://www.artofliving.org/us-en/about-us",
      },
      {
        name: "Founder",
        link: "/us-en/lp/gurudev",
      },
      {
        name: "Humanitarian Work",
        link: "https://www.artofliving.org/us-en/service-projects-overview",
      },
      {
        name: "Experiences & Reviews",
        link: "https://www.artofliving.org/us-en/testimonials/search",
      },
      {
        name: "Research",
        link: "https://www.artofliving.org/us-en/research-sudarshan-kriya",
      },
      {
        name: "Press & Media",
        link: "https://www.artofliving.org/us-en/media-coverage",
      },
      {
        name: "Retreat Center",
        link: "/us-en/lp/theartoflivingretreatcenter",
      },
    ],
  },
  {
    name: "Contact",
    submenu: [
      {
        name: "Contact & Support",
        link: "https://www.artofliving.org/us-en/contact-us",
      },
      {
        name: "Donate",
        link: "https://aolf.kindful.com/",
      },
    ],
  },
  {
    name: "EVENTS",
    submenu: [
      {
        name: "World Culture Festival",
        link: "https://wcf.artofliving.org/",
      },
      {
        name: "Summer Tour 2023",
        link: "/us-en/lp/sixthsensetour",
      },
      {
        name: "Wisdom Series with Gurudev",
        link: "https://www.artofliving.org/us-en/program/196004",
      },
    ],
  },
  {
    name: "DONATE",
    link: "/us-en/lp/donations",
  },
];

const IAHV_MENU = [
  {
    name: "Courses",
    submenu: [
      {
        name: "Join A Free Intro",
        link: "/us-en/lp/introtalks-hq?id=a388X000000ZHkzQAG&utm_source=organic&utm_medium=website&utm_campaign=menu",
      },
      {
        name: "Overview",
        link: "https://www.artofliving.org/us-en/courses",
      },
      {
        name: "Sahaj Meditation",
        link: `https://www.artofliving.org/us-en/sahaj-samadhi-meditation`,
        // link: `/us-en/course?courseType=SAHAJ_SAMADHI_MEDITATION`,
      },
      {
        name: "Silent Retreat",
        link: "https://www.artofliving.org/us-en/silence-retreat",
        // link: `/us-en?courseType=SILENT_RETREAT`,
      },
      {
        name: "Advanced Courses",
        link: "/us-en/lp/advanced-courses",
      },
      {
        name: "Healthcare Providers",
        link: "https://www.healingbreaths.org/",
      },
      {
        name: "Yoga Course",
        link: "/us-en/lp/online-foundation-program/",
      },
      {
        name: "College Courses",
        link: "https://www.skycampushappiness.org/",
      },
      {
        name: "Destination Retreats",
        link: "https://artoflivingretreatcenter.org/category/meditation/meditation-mindfulness/",
      },
      {
        name: "All Courses",
        link: "/us-en/course",
      },
    ],
  },
  {
    name: "Meditate",
    submenu: [
      {
        name: "Guided meditations",
        link: `/us-en/library/${CONTENT_FOLDER_IDS.MEDITATE_FOLDER_ID}`,
      },
      {
        name: "Live meetups",
        link: "/us-en/meetup",
      },
    ],
  },
  {
    name: "Resources",
    submenu: [
      {
        name: "Journey App",
        link: "/us-en/lp/journey-app",
      },
      {
        name: "Blog",
        link: "https://www.artofliving.org/us-en/blog",
      },
      {
        name: "Wisdom Snippets",
        link: `/us-en/library/${CONTENT_FOLDER_IDS.WISDOM_FOLDER_ID}`,
      },
      {
        name: "Better Sleep",
        link: "https://www.artofliving.org/us-en/blog/start-sleeping-restfully-all-night-using-this-meditation-sleep-guide",
      },
      {
        name: "Breathwork",
        link: "https://www.artofliving.org/us-en/yoga/breathing-techniques/yoga-and-pranayama",
      },
      {
        name: "Yoga",
        link: "https://www.artofliving.org/us-en/yoga",
      },
      {
        name: "Meditation for Beginners",
        link: "https://www.artofliving.org/us-en/8-tips-get-started-meditation",
      },
    ],
  },
  {
    name: "About",
    submenu: [
      {
        name: "Art of Living",
        link: "https://www.artofliving.org/us-en/about-us",
      },
      {
        name: "Founder",
        link: "/us-en/lp/gurudev",
      },
      {
        name: "Humanitarian Work",
        link: "https://www.artofliving.org/us-en/service-projects-overview",
      },
      {
        name: "Experiences & Reviews",
        link: "https://www.artofliving.org/us-en/testimonials/search",
      },
      {
        name: "Research",
        link: "https://www.artofliving.org/us-en/research-sudarshan-kriya",
      },
      {
        name: "Press & Media",
        link: "https://www.artofliving.org/us-en/media-coverage",
      },
      {
        name: "Retreat Center",
        link: "/us-en/lp/theartoflivingretreatcenter",
      },
    ],
  },
  {
    name: "Contact",
    submenu: [
      {
        name: "Contact & Support",
        link: "https://www.artofliving.org/us-en/contact-us",
      },
      {
        name: "Donate",
        link: "https://aolf.kindful.com/",
      },
    ],
  },
  {
    name: "EVENTS",
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
  },
  {
    name: "DONATE",
    link: "/us-en/lp/donations",
  },
];

const MENU =
  orgConfig.name === "AOL"
    ? AOL_MENU
    : orgConfig.name === "IAHV"
    ? IAHV_MENU
    : HB_MENU;

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <a
    className="dropdown-toggle"
    href="#"
    role="button"
    data-toggle="dropdown"
    aria-haspopup="true"
    aria-expanded="false"
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
  >
    {children}
  </a>
));

// forwardRef again here!
// Dropdown needs access to the DOM of the Menu to measure it
const CustomMenu = React.forwardRef(
  ({ children, style, className, "aria-labelledby": labeledBy }, ref) => {
    const { asPath } = useRouter();

    return (
      <div
        ref={ref}
        style={style}
        className={className}
        aria-labelledby={labeledBy}
      >
        {React.Children.toArray(children).map((child) =>
          React.cloneElement(child, {
            active: asPath === child.props.link,
          }),
        )}
      </div>
    );
  },
);

export const Header = () => {
  const router = useRouter();
  const { authenticated = false, user } = useAuth();

  const { showModal } = useGlobalModalContext();
  const {
    userProfilePic: profilePic,
    first_name,
    last_name,
  } = user?.profile || {};
  let initials = `${first_name || ""} ${last_name || ""}`.match(/\b\w/g) || [];
  initials = ((initials.shift() || "") + (initials.pop() || "")).toUpperCase();

  const [showSidebar, setShowSidebar] = useState(false);
  const [currentActiveMenu, setCurrentActiveMenu] = useState("");
  const [currentDropdownItem, setCurrentDropdownItem] = useState("");

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const loginAction = () => {
    showModal(MODAL_TYPES.LOGIN_MODAL, {
      navigateTo: "/us-en/profile?" + queryString.stringify(router.query),
    });
  };

  const onMenuSelection = (submenu) => () => {
    setShowSidebar(false);
    pushRouteWithUTMQuery(router, submenu.link);
  };

  const onMenuMouseOver = (menuName) => () => {
    setCurrentActiveMenu(menuName);
  };
  const onMenuMouseLeave = () => {
    setCurrentActiveMenu("");
  };

  const handleMenuItemClick = (menu) => {
    setCurrentDropdownItem((prevState) => (prevState ? "" : menu));
  };

  return (
    <>
      <header className="header header-v2" onMouseLeave={onMenuMouseLeave}>
        <div className="header__container">
          <a href="https://www.artofliving.org/" class="logo">
            <img
              src={`/img/${orgConfig.logo}`}
              alt="logo"
              class="logo__image"
            />
          </a>
          <nav class="navbar navbar-expand-lg navbar-light">
            <button
              class="navbar-toggler-header"
              type="button"
              data-toggle="collapse"
              data-target="#navbarNavDropdown"
              aria-controls="navbarNavDropdown"
              aria-label="Toggle navigation"
              onClick={toggleSidebar}
            >
              <span class="sr-only">Toggle navigation</span>
              <span class="icon-bar top-bar"></span>
              <span class="icon-bar middle-bar"></span>
              <span class="icon-bar bottom-bar"></span>
            </button>

            <div
              className={classNames("collapse navbar-collapse", {
                show: showSidebar,
              })}
              id="navbarNavDropdown"
            >
              <ul className="navbar-nav" id="desktop-menu-content">
                {MENU.map((menu) => {
                  return (
                    <li
                      className={`nav-item${
                        currentActiveMenu === menu.name ? " active" : ""
                      }${menu.submenu ? " dropdown" : ""}
                      ${currentDropdownItem === menu.name ? " show" : ""} `}
                      key={menu.name}
                      onMouseOver={onMenuMouseOver(menu.name)}
                      onClick={() => handleMenuItemClick(menu.name)}
                    >
                      {menu.link && (
                        <Link prefetch={false} href={menu.link} legacyBehavior>
                          <a
                            className={`nav-link${
                              menu.submenu ? " dropdown-toggle" : ""
                            }`}
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded={currentActiveMenu === menu.name}
                          >
                            {menu.icon || ""}
                            {menu.name}
                          </a>
                        </Link>
                      )}
                      {!menu.link && (
                        <a
                          className={`nav-link${
                            menu.submenu ? " dropdown-toggle" : ""
                          }`}
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded={currentActiveMenu === menu.name}
                        >
                          {menu.name}
                        </a>
                      )}

                      {menu.submenu && (
                        <div
                          class={`dropdown-menu${
                            currentDropdownItem === menu.name ? " show" : ""
                          } `}
                          aria-labelledby="navbarCoursesDropdown"
                        >
                          {menu.submenu.map((submenu) => {
                            return (
                              <Link
                                prefetch={false}
                                onSelect={onMenuSelection(submenu)}
                                href={submenu.link}
                                legacyBehavior
                                key={submenu.name}
                              >
                                <a className="dropdown-item">{submenu.name}</a>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
          {!authenticated && (
            <button
              className="btn btn-outline header__button"
              type="button"
              onClick={loginAction}
            >
              Log In
            </button>
          )}
          {authenticated && (
            <Link prefetch={false} href="/us-en/profile" legacyBehavior>
              <a
                className={classNames(
                  Style.header__button,
                  "user-profile-link header__button",
                )}
              >
                <span
                  className={classNames(
                    Style.userName,
                    "d-none d-md-inline-block userName",
                  )}
                >
                  {first_name || last_name}
                </span>
                <div
                  className={classNames(
                    "top-nav-bar",
                    Style.userProfilePic,
                    Style.profileHeadeImage,
                  )}
                >
                  <p className={Style.initials}>{initials}</p>
                  {profilePic && (
                    <img
                      src={profilePic}
                      className={classNames(
                        "rounded-circle",
                        Style.userProfilePic,
                        Style.profilePic,
                      )}
                      alt=""
                      onError={(i) => (i.target.style.display = "none")}
                    />
                  )}
                </div>
              </a>
            </Link>
          )}
        </div>
      </header>
    </>
  );
};
