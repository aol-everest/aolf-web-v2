/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import dynamic from 'next/dynamic';
import { api } from '@utils';
import { withAuth, withUserInfo } from '@hoc';
import Link from '@components/linkWithUTM';
import { useQuery } from '@tanstack/react-query';
import { Loader } from '@components/loader';

const EventList = dynamic(() =>
  import('@components/profile').then((mod) => mod.EventList),
);

const UpcomingCourses = () => {
  const { data = [], isLoading } = useQuery({
    queryKey: 'getUserUpcomingCourses',
    queryFn: async () => {
      const response = await api.get({
        path: 'getUserUpcomingCourses',
      });
      return response.data;
    },
  });

  const upcomingEvents = [...(data?.workshops || []), ...(data?.meetups || [])];

  return (
    <div>
      {isLoading && <Loader />}
      <div className="profile-form-box">
        {upcomingEvents.length === 0 && (
          <div className="no-events">
            <div className="no-events-icon">
              <span className="icon-aol iconaol-calendar"></span>
            </div>
            <div className="no-events-text">
              You don't have any events scheduled right now.
            </div>
            <div className="find-event-text">
              Find an upcoming{' '}
              <Link href="/us-en/courses" prefetch={false} legacyBehavior>
                <a href="#" className="link link_orange">
                  course
                </a>
              </Link>{' '}
              or{' '}
              <Link href="/us-en/meetup" prefetch={false} legacyBehavior>
                <a href="#" className="link link_orange">
                  meetup
                </a>
              </Link>{' '}
              to join.
            </div>
          </div>
        )}
        <div className="preffered-upcoming-events">
          <div className="course-listing">
            <EventList workshops={upcomingEvents}></EventList>
          </div>
          {/* <h2 className="title" /> */}
          {/* <h2 className="title">
            Here are the upcoming courses in your preferred center
          </h2>
          <div className="course-listing">
            <EventList
              workshops={upcomingEvents}
              isPreferredCenter={true}
            ></EventList>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default withAuth(withUserInfo(UpcomingCourses));
