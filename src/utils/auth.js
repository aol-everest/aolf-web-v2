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
    return session.tokens || null;
  } catch (err) {
    console.error('Session error:', err);
    return null;
  }
};

const logout = async () => {
  await signOut();
  clearStorage();
  // clearStorage();
  console.log('Logged out and cache cleared');
};

export const Auth = {
  fetchUserProfile,
  logout,
  getSession,
};
