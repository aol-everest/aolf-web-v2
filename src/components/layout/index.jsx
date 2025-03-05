import { Footer, Header, NoHeader, WCFHeader } from '@components';
import classNames from 'classnames';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { pushRouteWithUTMQuery } from '@service';

export const Layout = ({
  hideHeader = false,
  hideFooter = false,
  wcfHeader = false,
  noHeader = false,
  sideGetStartedAction = false,
  children,
}) => {
  const router = useRouter();
  const [isShowingFindCourse, setShowingFindCourse] = useState(false);
  const showFindCourse = (e) => {
    if (e) e.preventDefault();
    setShowingFindCourse(true);
  };
  const hideFindCourse = (e) => {
    if (e) e.preventDefault();
    setShowingFindCourse(false);
  };
  const navigateToGetStartAction = () => {
    setShowingFindCourse(false);
    pushRouteWithUTMQuery(router, '/us-en/course-finder');
  };
  return (
    <>
      {!hideHeader && !noHeader && <Header />}
      {hideHeader && !wcfHeader && !noHeader && <NoHeader />}
      {hideHeader && wcfHeader && <WCFHeader />}
      {children}
      {sideGetStartedAction && (
        <div className="get-started-floating">
          <ul>
            <li>
              <a
                className="help-link"
                id="gs-help-link"
                onClick={showFindCourse}
              >
                Get Started
              </a>
              <div
                className={classNames('find-course', {
                  show: isShowingFindCourse,
                })}
              >
                <div className="title">Find the right course for you</div>
                <div className="desc">Answer a few quick questions...</div>
                <div className="actions">
                  <button
                    className="btn btn-primary"
                    onClick={navigateToGetStartAction}
                  >
                    Get started
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={hideFindCourse}
                  >
                    Not now
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      )}
      {!hideFooter && <Footer />}
    </>
  );
};
