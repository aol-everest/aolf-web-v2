import { useAuth } from '@contexts';
import { withAuth } from '@hoc';
import { Auth } from '@utils';
import { useEffect } from 'react';

function DevOnly() {
  const { user, setUser } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userInfo = await Auth.reFetchProfile();

      setUser(userInfo);
    } catch (ex) {
      console.log(ex);
    }
  };

  return (
    <div className="tw-bg-gray-200 tw-text-sm tw-text-white">
      <div className="tw-bg-gray-500 tw-px-4 tw-py-3 tw-text-yellow-300">
        <strong>Debug</strong>
      </div>
      <pre className="tw-m-0 tw-block tw-overflow-scroll tw-px-4 tw-py-3">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}

export default withAuth(DevOnly);
