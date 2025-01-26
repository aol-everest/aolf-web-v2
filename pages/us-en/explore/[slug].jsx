import React from 'react';
import { api } from '@utils';
import { useQuery } from '@tanstack/react-query';

const ExploreCourses = () => {
  const { data: introData = [] } = useQuery({
    queryKey: ['get-started-intro-series'], // Use the same query key
    queryFn: async () => {
      const response = await api.get({ path: 'get-started-intro-series' });
      return response;
    },
    enabled: false, // Prevent a refetch since the data is already cached
  });

  console.log('introData', introData);
  return <div>[slug]</div>;
};

export default ExploreCourses;
