import React from "react";
import { Collapse, Navbar, NavbarToggler, Nav, NavItem } from "reactstrap";
import { FiPhone } from "react-icons/fi";
import classNames from "classnames";
import { Logo, ActiveLink } from "@components";
import { IcLogo, IcSearchBlack, IcTimerWhite } from "@components/icons";
import { useAuth, useGlobalModalContext } from "@contexts";
import Style from "./Header.module.scss";
import { FaUserCircle } from "react-icons/fa";
import { MODAL_TYPES } from "@constants";

export const Header = () => {
  const collapsed = true;
  const { authenticated = false, profile } = useAuth();
  const { showModal } = useGlobalModalContext();
  const { userProfilePic: profilePic, first_name, last_name } = profile || {};
  const isLoggedIn = authenticated;
  let initials = `${first_name || ""} ${last_name || ""}`.match(/\b\w/g) || [];
  initials = ((initials.shift() || "") + (initials.pop() || "")).toUpperCase();

  const loginAction = () => {
    showModal(MODAL_TYPES.LOGIN_MODAL, { navigateTo: "/profile" });
  };

  return (
    <>
      <header className="aol_header" id="site-header">
        {/* <aside id="registerSoonAlert">
          <IcTimerWhite />{" "}
          <span>Register soon. Course fee will go up by $100 on MM/DD</span>
        </aside> */}
        <Navbar id="navbar" expand="md" className="navbar aol_navbar ">
          <figure className="container mrgb">
            <a
              href="https://www.artofliving.org/"
              className="navbar-brand aol_brandLogo"
            >
              <img src="/img/ic-logo.svg" alt="logo" />
            </a>
            <NavbarToggler className={classNames({ collapsed: !collapsed })}>
              <span className="icon-bar top-bar" />
              <span className="icon-bar middle-bar" />
              <span className="icon-bar bottom-bar" />
              <span className="sr-only">Toggle navigation</span>
            </NavbarToggler>
            <Collapse isOpen={collapsed} navbar>
              <Nav className="ml-auto" navbar>
                <ActiveLink activeClassName="active" href="/">
                  <NavItem className="nav-item">
                    <a className="nav-link">
                      <img src="/img/sun-icon.png" /> Meditate
                    </a>
                  </NavItem>
                </ActiveLink>
                <ActiveLink activeClassName="active" href="/meetup">
                  <NavItem className="nav-item">
                    <a className="nav-link">
                      <img src="/img/map-pin.png" /> Meetups
                    </a>
                  </NavItem>
                </ActiveLink>
                <ActiveLink activeClassName="active" href="/workshop">
                  <NavItem className="nav-item">
                    <a className="nav-link">
                      <img src="/img/books-icon.png" /> Courses
                    </a>
                  </NavItem>
                </ActiveLink>
                <ActiveLink activeClassName="active" href="/learn">
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
                    <ActiveLink activeClassName="active" href="/profile">
                      <a className="nav-link">
                        <>
                          {first_name || last_name}
                          {profilePic && (
                            <img
                              src={profilePic}
                              className={classNames(
                                "rounded-circle",
                                Style.userProfilePic,
                              )}
                            />
                          )}
                          {!profilePic && (
                            <span
                              className={classNames(
                                "top-nav-bar",
                                Style.userProfilePic,
                                Style.profileHeadeImage,
                              )}
                            >
                              {" "}
                              <span>{initials}</span>
                            </span>
                          )}
                        </>
                      </a>
                    </ActiveLink>
                  </NavItem>
                )}
              </Nav>
            </Collapse>
          </figure>
        </Navbar>
      </header>
    </>
  );
};
