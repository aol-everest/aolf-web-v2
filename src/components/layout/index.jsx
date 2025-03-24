import { Footer, Header, NoHeader, WCFHeader } from '@components';
import classNames from 'classnames';
import { useState, useCallback, memo } from 'react';
import { useRouter } from 'next/router';
import { pushRouteWithUTMQuery } from '@service';
import PropTypes from 'prop-types';

const GetStartedFloating = memo(
  ({ isShowingFindCourse, onShow, onHide, onNavigate }) => (
    <div className="get-started-floating" role="complementary">
      <ul>
        <li>
          <a className="help-link" id="gs-help-link" onClick={onShow}>
            Get Started
          </a>

          <div
            id="find-course-panel"
            className={classNames('find-course', {
              show: isShowingFindCourse,
            })}
            aria-hidden={!isShowingFindCourse}
          >
            <h2 className="title">Find the right course for you</h2>
            <p className="desc">Answer a few quick questions...</p>
            <div className="actions">
              <button
                className="btn btn-primary"
                onClick={onNavigate}
                aria-label="Start finding courses"
              >
                Get started
              </button>
              <button
                className="btn btn-secondary"
                onClick={onHide}
                aria-label="Close find course panel"
              >
                Not now
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  ),
);

GetStartedFloating.displayName = 'GetStartedFloating';

GetStartedFloating.propTypes = {
  isShowingFindCourse: PropTypes.bool.isRequired,
  onShow: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

const getHeaderComponent = ({ hideHeader, wcfHeader, noHeader }) => {
  if (noHeader) return null;
  if (hideHeader) return <NoHeader />;
  if (wcfHeader) return <WCFHeader />;
  return <Header />;
};

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

  const handleShowFindCourse = useCallback((e) => {
    if (e) e.preventDefault();
    setShowingFindCourse(true);
  }, []);

  const handleHideFindCourse = useCallback((e) => {
    if (e) e.preventDefault();
    setShowingFindCourse(false);
  }, []);

  const handleNavigateToGetStart = useCallback(() => {
    setShowingFindCourse(false);
    pushRouteWithUTMQuery(router, '/us-en/course-finder');
  }, [router]);

  return (
    <div className="layout" role="main">
      {getHeaderComponent({ hideHeader, wcfHeader, noHeader })}

      {children}

      {sideGetStartedAction && (
        <GetStartedFloating
          isShowingFindCourse={isShowingFindCourse}
          onShow={handleShowFindCourse}
          onHide={handleHideFindCourse}
          onNavigate={handleNavigateToGetStart}
        />
      )}

      {!hideFooter && <Footer />}
    </div>
  );
};

Layout.propTypes = {
  hideHeader: PropTypes.bool,
  hideFooter: PropTypes.bool,
  wcfHeader: PropTypes.bool,
  noHeader: PropTypes.bool,
  sideGetStartedAction: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default memo(Layout);
