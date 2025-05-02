import { useEffect } from 'react';
import { useAuth } from '@contexts';
import { orgConfig } from '@org';
import { AOL_MENU, IAHV_MENU, PWHT_MENU, HB_MENU } from '@config/navigation';

const ALLOWED_ORIGIN_REGEX = /^https:\/\/([a-z0-9-]+\.)*artofliving\.org$/i;

function getMenu(orgName) {
  switch (orgName) {
    case 'AOL':
      return AOL_MENU;
    case 'IAHV':
      return IAHV_MENU;
    case 'PWHT':
      return PWHT_MENU;
    default:
      return HB_MENU;
  }
}

export default function AuthProfileWidget() {
  const { isAuthenticated, profile } = useAuth() || {};
  const menu = getMenu(orgConfig.name);

  useEffect(() => {
    function handler(event) {
      if (!ALLOWED_ORIGIN_REGEX.test(event.origin)) return;
      if (event.data?.type === 'get-auth-profile') {
        event.source.postMessage(
          {
            type: 'auth-profile',
            data: {
              isAuthenticated,
              profile,
              menu,
            },
          },
          event.origin,
        );
      }
    }
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [isAuthenticated, profile, menu]);

  return null;
}
