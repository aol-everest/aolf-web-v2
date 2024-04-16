import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { retrieveTokens, storeTokens } from '@passwordLess/storage.js';
import { api } from '@utils';

const fetchUserProfile = async () => {
  const user = await getCurrentUser();
  const session = await fetchAuthSession();
  await storeTokens(session.tokens);
  const data = await retrieveTokens();
  console.log(session);
  console.log(data);

  const profile = await api.get({
    path: 'profile',
  });
  const userInfo = {
    user,
    session,
    profile,
    tokens: session.tokens,
    isAuthenticated: !!user,
    reloadProfile: fetchUserProfile,
  };
  console.log(userInfo);
  return userInfo;
};

const getSession = async () => {
  try {
    await getCurrentUser();
    const session = await fetchAuthSession();
    return session.tokens;
  } catch (err) {
    console.log(err);
  }
};

const logout = async () => {};

export const Auth = {
  fetchUserProfile,
  logout,
  getSession,
};
