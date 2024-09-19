import { useAuth } from '@contexts';
import { pushRouteWithUTMQuery } from '@service';
import { useRouter } from 'next/router';
import { navigateToLogin } from '@utils';

export const withAuth = (Component = null, options = {}) => {
  const { role, ...rest } = options;
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
    navigateToLogin(router);
    return null;
  };

  if (rest) {
    Object.entries(rest).forEach(([key, value]) => {
      AuthenticatedRoute[key] = value;
    });
  }

  return AuthenticatedRoute;
};
