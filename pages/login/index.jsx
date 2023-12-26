import { MODAL_TYPES } from '@constants';
import { useAuth, useGlobalModalContext } from '@contexts';
import { pushRouteWithUTMQuery } from '@service';
import { PageLoading } from '@components';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

/* export const getServerSideProps = async (context) => {
  const { query, req, res } = context;
  const { next } = query;
  try {
    const { Auth } = await withSSRContext({ req });
    // const user = await Auth.currentAuthenticatedUser();
    const currentSession = await Auth.currentSession();
    const token = currentSession.idToken.jwtToken;
    await api.get({
      path: "profile",
      token,
    });
    return {
      redirect: {
        permanent: false,
        destination: next ? next : `/`,
      },
      props: {},
    };
  } catch (err) {
    console.error(err);
  }
  return { props: {} };
}; */

function Login() {
  const router = useRouter();
  // const [loading, setLoading] = useState(true);
  const { showModal } = useGlobalModalContext();
  const { authenticated } = useAuth();

  useEffect(() => {
    if (!router.isReady) return;
    const { mode = 'LOGIN_MODE' } = router.query;
    const navigateTo = router.query.next || '/';
    if (authenticated) {
      pushRouteWithUTMQuery(router, {
        pathname: navigateTo,
      });
    } else {
      // setLoading(false);
      showModal(MODAL_TYPES.LOGIN_MODAL, {
        navigateTo,
        closeModalAction: () => {
          pushRouteWithUTMQuery(router, '/us-en/course');
        },
        defaultView: mode,
      });
    }
  }, [router.isReady]);

  /* async function signIn({ username, password }) {
    try {
      await Auth.authenticateUser(username, password);

      pushRouteWithUTMQuery(router,"/us-en/course");
    } catch (error) {
      console.log("error signing in", error);
    }
  } */
  if (!router.isReady) return <PageLoading />;

  return (
    <main className="aol_mainbody login-screen">
      {/* {loading && <PageLoading />} */}
    </main>
  );
}
Login.hideHeader = true;

export default Login;
