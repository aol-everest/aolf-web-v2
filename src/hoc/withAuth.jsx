import { useAuth } from '@contexts';
import { pushRouteWithUTMQuery } from '@service';
import { useRouter } from 'next/router';

export const withAuth = (Component = null, options = {}) => {
  const AuthenticatedRoute = (props) => {
    const router = useRouter();
    const { isAuthenticated, profile } = useAuth();
    if (isAuthenticated) {
      if (options.role) {
        if (options.role.includes(profile.userType)) {
          return <Component {...props} />;
        } else {
          pushRouteWithUTMQuery(router, {
            pathname: '/unauthorized',
          });
        }
      }
      return <Component {...props} />;
    }
    pushRouteWithUTMQuery(router, {
      pathname: options.pathAfterFailure || '/login',
      query: {
        next: router.asPath,
      },
    });
    return null;
  };

  return AuthenticatedRoute;
};
