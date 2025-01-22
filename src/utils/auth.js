import { getCurrentUser, fetchAuthSession, signOut } from 'aws-amplify/auth';
import { storeTokens, clearStorage } from '@passwordLess/storage.js';
import { api } from '@utils';

const fetchUserProfile = async () => {
  const user = await getCurrentUser();
  const session = await fetchAuthSession();
  await storeTokens(session.tokens);

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
  return userInfo;
};

const getSession = async () => {
  try {
    await getCurrentUser();
    const session = await fetchAuthSession();
    return session.tokens;
  } catch (err) {
    console.error(err);
  }
};

const logout = async () => {
  await signOut();
  localStorage.clear();
  clearStorage();
  console.log('Logged out and cache cleared');
};

export const Auth = {
  fetchUserProfile,
  logout,
  getSession,
};
