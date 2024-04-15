import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { api } from '@utils';

// Create a context for managing authentication state
const AuthContext = createContext();

// Custom hook to access the AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const fetchCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();

      const profile = await api.get({
        path: 'profile',
        token: session.tokens.accessToken,
      });
      const userInfo = {
        user,
        session,
        profile,
        token: session.tokens.accessToken,
        isAuthenticated: !!user,
        reloadProfile: fetchCurrentUser,
      };
      console.log(userInfo);
      setCurrentUser(userInfo);
    } catch (error) {
      setCurrentUser({ isAuthenticated: false });
      console.log('Error fetching current user:', error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    // Subscribe to Hub events for authentication
    const hubListenerCancelToken = Hub.listen('auth', ({ payload }) => {
      console.log(payload);
      switch (payload.event) {
        case 'signedIn':
          console.log('user have been signedIn successfully.');
          fetchCurrentUser();
          break;
        case 'signedOut':
          console.log('user have been signedOut successfully.');
          setCurrentUser({ isAuthenticated: false });
          break;
        case 'tokenRefresh':
          console.log('auth tokens have been refreshed.');
          break;
        case 'tokenRefresh_failure':
          console.log('failure while refreshing auth tokens.');
          break;
        case 'signInWithRedirect':
          console.log('signInWithRedirect API has successfully been resolved.');
          break;
        case 'signInWithRedirect_failure':
          console.log(
            'failure while trying to resolve signInWithRedirect API.',
          );
          break;
        case 'customOAuthState':
          console.info('custom state returned from CognitoHosted UI');
          break;
      }
    });

    return () => {
      hubListenerCancelToken();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ ...currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
