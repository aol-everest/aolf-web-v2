/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { api } from '@utils';
import { withAuth, withUserInfo } from '@hoc';

const PastCoursesComp = dynamic(() =>
  import('@components/profile').then((mod) => mod.PastCourses),
);

const PastCourses = () => {
  const {
    data: pastCourses = {},
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: 'getUserPastCourses',
    queryFn: async () => {
      const response = await api.get({
        path: 'getUserPastCourses',
      });
      console.log('response.data', response);
      return response;
    },
  });

  return <PastCoursesComp pastCourses={pastCourses} />;
};

export default withAuth(withUserInfo(PastCourses));
