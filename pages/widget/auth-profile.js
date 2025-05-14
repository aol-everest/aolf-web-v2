import { useEffect } from 'react';
import { useAuth } from '@contexts';
import { api } from '@utils';
import { useQuery } from '@tanstack/react-query';

const ALLOWED_ORIGIN_REGEX = /^https:\/\/([a-z0-9-]+\.)*artofliving\.org$/i;

export default function AuthProfileWidget() {
  const { isAuthenticated, profile } = useAuth() || {};
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

  useEffect(() => {
    function handler(event) {
      if (!ALLOWED_ORIGIN_REGEX.test(event.origin)) return;

      const exploreMenu = [
        ...introData.map((item) => ({
          name: item.title,
          link: item.slug ? `/us-en/explore/${item.slug}` : '#',
        })),
      ];

      if (event.data?.type === 'get-auth-profile') {
        event.source.postMessage(
          {
            type: 'auth-profile',
            data: {
              isAuthenticated,
              profile,
              exploreMenu,
            },
          },
          event.origin,
        );
      }
    }
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [isAuthenticated, profile, introData]);

  return null;
}
