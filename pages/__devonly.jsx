// import ReactJsonPrint from "react-json-print";
import { withSSRContext } from "aws-amplify";
import { api, isSSR } from "@utils";

export async function getServerSideProps({ req, resolvedUrl, query }) {
  const { Auth } = withSSRContext({ req });
  try {
    const user = await Auth.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
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
  return (
    <div className="tw-bg-gray-200 tw-text-white tw-text-sm">
      <div className="tw-bg-gray-500 tw-px-4 tw-py-3 tw-text-yellow-300">
        <strong>Debug</strong>
      </div>
      <pre className="tw-block tw-px-4 tw-py-3 tw-m-0 tw-overflow-scroll">
        {JSON.stringify(profile, null, 2)}
      </pre>
    </div>
  );
}

export default DevOnly;
