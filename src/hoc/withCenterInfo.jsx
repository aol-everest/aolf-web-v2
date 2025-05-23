import React from 'react';
import { usePathname } from 'next/navigation';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from '@components/linkWithUTM';
import { api, createCompleteAddress, joinPhoneNumbers } from '@utils';
import { useQuery } from '@tanstack/react-query';
import ErrorPage from 'next/error';
import { PageLoading } from '@components';

const getCenterDetailsApi = async (id) => {
  const res = await api.get({
    path: 'getCenter',
    param: {
      id,
    },
  });
  return res;
};

export const withCenterInfo = (WrappedComponent) => {
  return function CenterInfo(props) {
    const router = useRouter();
    const { id } = router.query;
    const pathname = usePathname();
    const COURSES_PAGE = `/us-en/centers/courses/${id}`;
    const MEETUPS_PAGE = `/us-en/centers/meetups/${id}`;
    const EVENTS_PAGE = `/us-en/centers/events/${id}`;

    const {
      data: centerDetail,
      isLoading,
      isError,
      error,
    } = useQuery({
      queryKey: ['centerDetail', id],
      queryFn: async () => {
        const response = await getCenterDetailsApi(id);
        return response.data;
      },
      enabled: router.isReady && !!id,
    });

    if (isError) return <ErrorPage statusCode={500} title={error.message} />;
    if (isLoading || !router.isReady) return <PageLoading />;

    const phoneNumber = joinPhoneNumbers(
      centerDetail.phone1,
      centerDetail.phone2,
    );

    return (
      <>
        <main className="page--find-a-course">
          <section className="title-header">
            <h1 className="page-title">
              Welcome to the {centerDetail.centerName} Center
            </h1>
            <div className="event-title-info">
              <div className="address">
                <span className="icon-aol iconaol-location-bold"></span>
                <span>Address:</span>{' '}
                <strong>
                  {createCompleteAddress({
                    streetAddress1: centerDetail.streetAddress1,
                    streetAddress2: centerDetail.streetAddress2,
                    city: centerDetail.city,
                    zipCode: centerDetail.postalOrZipCode,
                    state: centerDetail.stateProvince,
                  })}
                </strong>
              </div>
              <div className="email">
                <span className="icon-aol iconaol-sms-bold"></span>
                <span>Email:</span>{' '}
                <a href={`mailto:${centerDetail.email}`}>
                  <strong>{centerDetail.email}</strong>
                </a>
              </div>
              <div className="phone">
                <span className="icon-aol iconaol-call-bold"></span>
                <span>Phone:</span> <strong>{phoneNumber}</strong>
              </div>
            </div>
          </section>
          <section className="section-course-find">
            <div className="container">
              <div className="courses-area">
                <div className="courses-tabs">
                  <ul className="tab-links">
                    <li>
                      <Link href={COURSES_PAGE} legacyBehavior scroll={false}>
                        <a
                          className={classNames('profile-tab', {
                            active: pathname === COURSES_PAGE,
                          })}
                          href="#"
                        >
                          Courses
                        </a>
                      </Link>
                    </li>
                    <li>
                      <Link href={MEETUPS_PAGE} legacyBehavior scroll={false}>
                        <a
                          className={classNames('profile-tab', {
                            active: pathname === MEETUPS_PAGE,
                          })}
                          href="#"
                        >
                          Meetups
                        </a>
                      </Link>
                    </li>
                    <li>
                      <Link href={EVENTS_PAGE} legacyBehavior scroll={false}>
                        <a
                          className={classNames('profile-tab', {
                            active: pathname === EVENTS_PAGE,
                          })}
                          href="#"
                        >
                          Events
                        </a>
                      </Link>
                    </li>
                  </ul>
                </div>
                <WrappedComponent {...props} centerDetail={centerDetail} />
              </div>
            </div>
          </section>
        </main>
      </>
    );
  };
};
