/* eslint-disable react/display-name */
import React, { useState } from "react";
import { Collapse, Navbar, NavbarToggler, Nav, NavItem } from "reactstrap";
import { useRouter } from "next/router";
import Dropdown from "react-bootstrap/Dropdown";
import { FiPhone } from "react-icons/fi";
import classNames from "classnames";
import { ActiveLink } from "@components";
import Link from "next/link";
import { useAuth, useGlobalModalContext } from "@contexts";
import Style from "./Header.module.scss";
import { FaUserCircle } from "react-icons/fa";
import { MODAL_TYPES, CONTENT_FOLDER_IDS } from "@constants";

const MENU = [
  {
    name: "Courses",
    submenu: [
      {
        name: "Join A Free Intro",
        link: "https://event.us.artofliving.org/us-en/introtalks/",
      },
      {
        name: "Overview",
        link: "https://www.artofliving.org/us-en/courses",
      },
      {
        name: "SKY Breath Meditation",
        link: `/us?courseType=SKY_BREATH_MEDITATION`,
      },
      {
        name: "Meditation Course",
        link: `/us?courseType=SAHAJ_SAMADHI_MEDITATION`,
      },
      {
        name: "Silent Retreat",
        link: `/us?courseType=SILENT_RETREAT`,
      },
      {
        name: "Healthcare Providers",
        link: "https://www.healingbreaths.org/",
      },
      {
        name: "Yoga Foundations",
        link: "https://event.us.artofliving.org/us-en/online-foundation-program/",
      },
      {
        name: "College Courses",
        link: "https://www.skycampushappiness.org/",
      },
      {
        name: "Youth Courses",
        link: "https://www.skyforkids.org/",
      },
      {
        name: "Destination Retreats",
        link: "https://artoflivingretreatcenter.org/category/meditation/meditation-mindfulness/",
      },
    ],
  },
  {
    name: "Meditate",
    submenu: [
      {
        name: "Guided meditations",
        link: `/us/library/${CONTENT_FOLDER_IDS.MEDITATE_FOLDER_ID}`,
      },
      {
        name: "Live meetups",
        link: "/us/meetup",
      },
      {
        name: "Guided breathwork",
        link: "#",
      },
      {
        name: "Guided Yoga",
        link: "#",
      },
    ],
  },
  {
    name: "Resources",
    submenu: [
      {
        name: "App",
        link: "https://event.us.artofliving.org/us-en/journey-app/",
      },
      {
        name: "Articles",
        link: "https://www.artofliving.org/us-en/blog",
      },
      {
        name: "Wisdom Snippets",
        link: `/us/library/${CONTENT_FOLDER_IDS.WISDOM_FOLDER_ID}`,
      },
      {
        name: "Meditation",
        link: "https://www.artofliving.org/us-en/meditation",
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
        name: "Guided Meditation",
        link: "https://www.artofliving.org/us-en/online-guided-meditation",
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
        link: "https://www.artofliving.org/us-en/srisri",
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
        link: "https://artoflivingretreatcenter.org/",
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
];

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <a
    className="dropdown-toggle"
    href="#"
    role="button"
    id="meditate-dropdown"
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
    console.log(asPath);

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
  const { authenticated = false, profile } = useAuth();
  const { showModal } = useGlobalModalContext();
  const { userProfilePic: profilePic, first_name, last_name } = profile || {};
  let initials = `${first_name || ""} ${last_name || ""}`.match(/\b\w/g) || [];
  initials = ((initials.shift() || "") + (initials.pop() || "")).toUpperCase();

  const [collapsed, setCollapsed] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const toggle = () => setCollapsed(!collapsed);
  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const loginAction = () => {
    setCollapsed(false);
    showModal(MODAL_TYPES.LOGIN_MODAL, { navigateTo: "/us/profile" });
  };

  const onMenuSelection = (submenu) => () => {
    console.log(submenu);
    router.push(submenu.link);
  };

  return (
    <>
      <div
        className={classNames("sidebar", { sidebar_active: showSidebar })}
        id="sidebar"
      >
        <div className="sidebar__header">
          <button
            className="sidebar-button"
            type="button"
            onClick={toggleSidebar}
          >
            <img
              src="/img/Times.svg"
              alt="Close Sidebar"
              className="sidebar-button__icon"
            />
          </button>
        </div>
        <div className="sidebar__body">
          <nav className="menu">
            {MENU.map((menu) => {
              return (
                <Dropdown key={menu.name}>
                  <Dropdown.Toggle as={CustomToggle}>
                    {menu.name}
                  </Dropdown.Toggle>

                  <Dropdown.Menu as={CustomMenu}>
                    {menu.submenu.map((submenu) => {
                      return (
                        <Dropdown.Item
                          key={submenu.name}
                          link={submenu.link}
                          onSelect={onMenuSelection(submenu)}
                        >
                          {submenu.name}
                        </Dropdown.Item>
                      );
                    })}
                  </Dropdown.Menu>
                </Dropdown>
              );
            })}
          </nav>
        </div>
      </div>
      <header className="header">
        <div className="header__container">
          <button
            className="sidebar-button header__sidebar-button"
            type="button"
            onClick={toggleSidebar}
          >
            <img
              src="/img/Hamburger.svg"
              alt="Open Sidebar"
              className="sidebar-button__icon"
            />
          </button>
          <a href="https://www.artofliving.org/" className="logo">
            <img src="/img/ic-logo.svg" alt="logo" className="logo__image" />
          </a>
          <nav className="menu">
            <div className="menu__items">
              {MENU.map((menu) => {
                return (
                  <Dropdown key={menu.name}>
                    <Dropdown.Toggle as={CustomToggle}>
                      {menu.name}
                    </Dropdown.Toggle>

                    <Dropdown.Menu as={CustomMenu}>
                      {menu.submenu.map((submenu) => {
                        return (
                          <Dropdown.Item
                            key={submenu.name}
                            link={submenu.link}
                            onSelect={onMenuSelection(submenu)}
                          >
                            {submenu.name}
                          </Dropdown.Item>
                        );
                      })}
                    </Dropdown.Menu>
                  </Dropdown>
                );
              })}
            </div>
            {!authenticated && (
              <button
                className="btn btn-outline menu__button"
                type="button"
                onClick={loginAction}
              >
                Log In
              </button>
            )}
            {authenticated && (
              <Link href="/us/profile">
                <a className="user-profile-link">
                  <span className="d-none d-md-inline-block">
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
                        onError={(i) => (i.target.src = "")}
                      />
                    )}
                  </div>
                </a>
              </Link>
            )}
          </nav>
        </div>
      </header>
      {/* <header className="aol_header" id="site-header">
        <Navbar expand="md" className="navbar aol_navbar ">
          <figure className="container mrgb">
            <a
              href="https://www.artofliving.org/"
              className="navbar-brand aol_brandLogo"
            >
              <img src="/img/ic-logo.svg" alt="logo" />
            </a>
            <NavbarToggler
              onClick={toggle}
              className={classNames({ collapsed: !collapsed })}
            >
              <span className="icon-bar top-bar" />
              <span className="icon-bar middle-bar" />
              <span className="icon-bar bottom-bar" />
              <span className="sr-only">Toggle navigation</span>
            </NavbarToggler>
            <Collapse isOpen={collapsed} navbar>
              <Nav className="ml-auto" navbar>
                <ActiveLink
                  activeClassName="active"
                  href={`/us/library/${CONTENT_FOLDER_IDS.MEDITATE_FOLDER_ID}`}
                  setCollapsed={setCollapsed}
                >
                  <NavItem className="nav-item">
                    <a className="nav-link">
                      <img src="/img/sun-icon.png" /> Meditate
                    </a>
                  </NavItem>
                </ActiveLink>
                <ActiveLink
                  activeClassName="active"
                  href="/us/meetup"
                  setCollapsed={setCollapsed}
                >
                  <NavItem className="nav-item">
                    <a className="nav-link">
                      <img src="/img/map-pin.png" /> Meetups
                    </a>
                  </NavItem>
                </ActiveLink>
                <ActiveLink
                  activeClassName="active"
                  href="/us"
                  setCollapsed={setCollapsed}
                >
                  <NavItem className="nav-item">
                    <a className="nav-link">
                      <img src="/img/books-icon.png" /> Courses
                    </a>
                  </NavItem>
                </ActiveLink>
                <ActiveLink
                  activeClassName="active"
                  href={`/us/library/${CONTENT_FOLDER_IDS.WISDOM_FOLDER_ID}`}
                  setCollapsed={setCollapsed}
                >
                  <NavItem className="nav-item">
                    <a className="nav-link">
                      <img src="/img/book-open.png" /> Learn
                    </a>
                  </NavItem>
                </ActiveLink>
                <NavItem className="nav-item">
                  <a href="tel:8552024400" className="nav-link">
                    <FiPhone size="2em" /> (855) 202-4400
                  </a>
                </NavItem>
                {!isLoggedIn && (
                  <NavItem className="nav-item">
                    <a href="#" className="nav-link" onClick={loginAction}>
                      <FaUserCircle
                        style={{ color: "#313651", fontSize: "28px" }}
                      />{" "}
                      <span className="d-md-none">Login</span>
                    </a>
                  </NavItem>
                )}
                {isLoggedIn && (
                  <NavItem
                    className={classNames("nav-item", Style.userNavitem)}
                  >
                    <ActiveLink
                      activeClassName="active"
                      href="/us/profile"
                      setCollapsed={setCollapsed}
                    >
                      <a className="nav-link">
                        {first_name || last_name}
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
                              onError={(i) => (i.target.src = "")}
                            />
                          )}
                        </div>
                      </a>
                    </ActiveLink>
                  </NavItem>
                )}
              </Nav>
            </Collapse>
          </figure>
        </Navbar>
      </header> */}
    </>
  );
};
