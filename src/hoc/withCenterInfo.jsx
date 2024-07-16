import { useAuth, useGlobalModalContext } from '@contexts';
import { pushRouteWithUTMQuery } from '@service';
import dynamic from 'next/dynamic';
import { NextSeo } from 'next-seo';
import { useQueryState } from 'nuqs';
import { FaCamera } from 'react-icons/fa';
import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { Loader } from '@components/loader';
import { MODAL_TYPES } from '@constants';
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
    console.log(id);
    const [loading, setLoading] = useState(false);
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
        {loading && <Loader />}
        <main className="page--find-a-course">
          <section className="title-header">
            <h1 class="page-title">
              Welcome to the {centerDetail.centerName} Center
            </h1>
            <div class="event-title-info">
              <div class="address">
                <span class="icon-aol iconaol-location-bold"></span>
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
              <div class="email">
                <span class="icon-aol iconaol-sms-bold"></span>
                <span>Email:</span>{' '}
                <a href={`mailto:${centerDetail.email}`}>
                  <strong>{centerDetail.email}</strong>
                </a>
              </div>
              <div class="phone">
                <span class="icon-aol iconaol-call-bold"></span>
                <span>Phone:</span> <strong>{phoneNumber}</strong>
              </div>
            </div>
          </section>
          <section className="section-course-find">
            <div className="container">
              <div class="courses-area">
                <div class="courses-tabs">
                  <ul class="tab-links">
                    <li>
                      <Link href={COURSES_PAGE} legacyBehavior>
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
                      <Link href={MEETUPS_PAGE} legacyBehavior>
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
                      <Link href={EVENTS_PAGE} legacyBehavior>
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
