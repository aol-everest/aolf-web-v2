import { useAuth } from '@contexts';
import { pushRouteWithUTMQuery } from '@service';
import { useRouter } from 'next/router';
import { navigateToLogin } from '@utils';

export const withAuth = (Component = null, options = {}) => {
  const AuthenticatedRoute = (props) => {
    const router = useRouter();
    const { isAuthenticated, profile } = useAuth();
    console.log(useAuth());
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

  return AuthenticatedRoute;
};
