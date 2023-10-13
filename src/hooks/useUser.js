import { api } from '@utils';
import Router from 'next/router';
import { useEffect, useState } from 'react';

export function useUser({ redirectTo = false, redirectIfFound = false } = {}) {
  const [user, setUser] = useState(false);
  const [mutateUser, setMutateUser] = useState(false);
  api('/profile').then(({ data: user, mutate: mutateUser }) => {
    setUser(user);
    setMutateUser(mutateUser);
  });
  useEffect(() => {
    // if no redirect needed, just return (example: already on /dashboard)
    // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
    if (!redirectTo || !user) return;

    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !user?.isLoggedIn) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && user?.isLoggedIn)
    ) {
      Router.push(redirectTo);
    }
  }, [user, redirectIfFound, redirectTo]);

  return { user, mutateUser };
}
