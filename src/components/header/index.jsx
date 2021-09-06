import React from "react";
import { Collapse, Navbar, NavbarToggler, Nav, NavItem } from "reactstrap";
import { FiPhone } from "react-icons/fi";
import classNames from "classnames";
import { Logo, ActiveLink } from "@components";
import { IcLogo, IcSearchBlack, IcTimerWhite } from "@components/icons";

export const Header = () => {
  const isLoggedIn = false;
  const collapsed = true;
  return (
    <>
      <header className="aol_header" id="site-header">
        {/* <aside id="registerSoonAlert">
          <IcTimerWhite />{" "}
          <span>Register soon. Course fee will go up by $100 on MM/DD</span>
        </aside> */}
        {isLoggedIn && !isVerified && !closeAlert && false && (
          <div className="alert alert-warning nav-alert">
            <button
              type="button"
              yarn
              add
              classnames
              className="close"
              data-dismiss="alert"
              aria-label="Close"
              onClick={this.closeAlertAction}
            >
              <span aria-hidden="true" style={{ fontSize: "20px" }}>
                ×
              </span>
            </button>
            {!loading && <i className="fas fa-exclamation-triangle" />}
            {loading && <i className="fas fa-circle-notch fa-spin" />} This
            account is pending email confirmation.{" "}
            <a href="#" onClick={this.resendEmailVerificationAction}>
              resend confirmation
            </a>
          </div>
        )}
        <Navbar id="navbar" expand="md" className="navbar aol_navbar ">
          <figure className="container mrgb">
            <a
              href="https://www.artofliving.org/"
              className="navbar-brand aol_brandLogo"
            >
              <IcLogo width="4em" height="3em" />
            </a>
            <NavbarToggler className={classNames({ collapsed: !collapsed })}>
              <span className="icon-bar top-bar" />
              <span className="icon-bar middle-bar" />
              <span className="icon-bar bottom-bar" />
              <span className="sr-only">Toggle navigation</span>
            </NavbarToggler>
            <Collapse isOpen={collapsed} navbar>
              <Nav className="ml-auto" navbar>
                <ActiveLink activeClassName="active" href="/us/meditate">
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
                    <a href="#" className="nav-link">
                      <i
                        className="far fa-user-circle"
                        style={{ color: "#313651", fontSize: "28px" }}
                      />{" "}
                      <span className="d-md-none">Login</span>
                    </a>
                  </NavItem>
                )}
                {isLoggedIn && (
                  <NavItem className="nav-item user_navitem">
                    <ActiveLink activeClassName="active" href="/profile">
                      <>
                        {profile.first_name || profile.last_name}
                        {profilePic && (
                          <img
                            src={profilePic}
                            className="rounded-circle user-profile-pic"
                          />
                        )}
                        {!profilePic && (
                          <span className="user-profile-pic profile-header__image top-nav-bar">
                            {" "}
                            <span>{initials}</span>
                          </span>
                        )}
                      </>
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
