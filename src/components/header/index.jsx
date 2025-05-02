/* eslint-disable react/display-name */
import Link from '@components/linkWithUTM';
import { useAuth } from '@contexts';
import { useQuery } from '@tanstack/react-query';
import { orgConfig } from '@org';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
// import { FaUserCircle } from "react-icons/fa";
import { AOL_MENU, IAHV_MENU, PWHT_MENU, HB_MENU } from '@config/navigation';
import { navigateToLogin } from '@utils';
import { api } from '@utils';

const MENU =
  orgConfig.name === 'AOL'
    ? AOL_MENU
    : orgConfig.name === 'IAHV'
      ? IAHV_MENU
      : orgConfig.name === 'PWHT'
        ? PWHT_MENU
        : HB_MENU;

const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return '';

  const firstInitial = firstName?.[0] || '';
  const lastInitial = lastName?.[0] || '';

  return (firstInitial + lastInitial).toUpperCase();
};

export const Header = () => {
  const router = useRouter();
  const { isAuthenticated = false, profile } = useAuth();
  const [navExpanded, setNavExpanded] = useState(false);
  const [headerMenu, setHeaderMenu] = useState([...MENU]);

  const { userProfilePic: profilePic, first_name, last_name } = profile || {};
  const initials = getInitials(first_name, last_name);

  const { data: introData = [] } = useQuery({
    queryKey: ['get-started-intro-series'],
    queryFn: async () => {
      try {
        const response = await api.get({
          path: 'get-started-intro-series',
        });
        return response?.data;
      } catch (error) {
        // Handle authentication errors gracefully
        if (error.message?.includes('User needs to be authenticated')) {
          console.log('User not authenticated, skipping intro series fetch');
          return [];
        }
        throw error;
      }
    },
    // Only fetch this data if the user is authenticated
    enabled: isAuthenticated,
    // Prevent unnecessary refetches
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Handle authentication state changes
  useEffect(() => {
    if (!isAuthenticated) {
      // Reset to original menu when logged out
      const updatedMenu = [...MENU].filter((item) => item.name !== 'Account');
      setHeaderMenu(updatedMenu);
    }
  }, [isAuthenticated]);

  // Handle intro data changes separately
  useEffect(() => {
    if (!isAuthenticated || !introData?.length) {
      return;
    }

    // Get the original menu structure first
    const updatedMenu = JSON.parse(JSON.stringify([...MENU]));
    const exploreMenu = updatedMenu.find(
      (menuItem) => menuItem.name === 'Explore',
    );

    if (!exploreMenu) {
      return;
    }

    // Check if items already exist to prevent duplicates
    const existingTitles = new Set(
      exploreMenu.submenu ? exploreMenu.submenu.map((item) => item.name) : [],
    );
    const newItems = introData.filter(
      (item) => !existingTitles.has(item.title),
    );

    if (newItems.length === 0) {
      return;
    }

    exploreMenu.submenu = [
      ...newItems.map((item) => ({
        name: item.title,
        link: item.slug ? `/us-en/explore/${item.slug}` : '#',
      })),
    ];

    setHeaderMenu(updatedMenu);
  }, [introData, isAuthenticated]);

  useEffect(() => {
    const handleBackLinkClick = function (event) {
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
    };

    document.addEventListener('click', handleBackLinkClick);

    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener('click', handleBackLinkClick);
    };
  }, []);

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
          <div className="dropdown-menu-col" data-title={menu.name}>
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
          <div className="dropdown-menu-inner" data-title={menu.name}>
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
                                    : menuItem.link === '/us-en/course-finder'
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
            <div className="nav-logowrap">
              <img src="/img/ic-logo.svg" alt="logo" height="32" />
            </div>
            <Nav className="mr-auto" as="ul">
              {headerMenu.map((menu) => {
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
                <Nav.Link
                  href="https://event.us.artofliving.org/us-en/donations/"
                  as={Link}
                >
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
                {/* <Link href="/us-en/profile" legacyBehavior>
                  <a
                    href="#"
                    className="tw-no-underline tw-text-black hover:tw-text-black hover:tw-no-underline"
                  >
                    <span className="username">{first_name || last_name}</span>
                  </a>
                </Link> */}
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
