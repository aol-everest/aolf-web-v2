import React from "react";
import { useAuth } from "@contexts";
import { useRouter } from "next/router";

export const withAuth = (Component = null, options = {}) => {
  const AuthenticatedRoute = (props) => {
    const router = useRouter();
    const { authenticated, user } = useAuth();
    if (authenticated) {
      if (options.role) {
        if (options.role.includes(user.profile.userType)) {
          return <Component {...props} />;
        } else {
          router.push({
            pathname: "/unauthorized",
          });
        }
      }
      return <Component {...props} />;
    }
    router.push({
      pathname: options.pathAfterFailure || "/login",
      query: {
        next: router.asPath,
      },
    });
    return null;
  };

  return AuthenticatedRoute;
};
