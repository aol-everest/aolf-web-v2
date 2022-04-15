import { withSSRContext } from "aws-amplify";
import { api } from "@utils";
import { useRouter } from "next/router";

export async function getServerSideProps({ req }) {
  const { Auth } = withSSRContext({ req });
  try {
    const user = await Auth.currentAuthenticatedUser();
    const currentSession = await Auth.currentSession();
    const token = currentSession.idToken.jwtToken;
    const res = await api.get({
      path: "profile",
      token,
    });
    return {
      props: {
        authenticated: true,
        username: user.username,
        profile: res,
        token,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {},
    };
  }
}

function DevOnly({ profile = {} }) {
  const router = useRouter();
  const { log } = router.query;
  const clearCaches = () => {
    caches.keys().then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          return caches.delete(key);
        }),
      );
    });
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
    alert("Complete Cache Cleared");
    window.location.reload(true);
  };
  return (
    <>
      <div className="tw-p-5 tw-text-center">
        <button className="btn btn-warning" onClick={clearCaches}>
          Re-load App
        </button>
      </div>
      {log && (
        <div className="tw-bg-gray-200 tw-text-white tw-text-sm">
          <div className="tw-bg-gray-500 tw-px-4 tw-py-3 tw-text-yellow-300">
            <strong>Debug</strong>
          </div>
          <pre className="tw-block tw-px-4 tw-py-3 tw-m-0 tw-overflow-scroll">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      )}
    </>
  );
}

export default DevOnly;
