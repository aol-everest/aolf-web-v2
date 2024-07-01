import { MODAL_TYPES } from '@constants';
import { useAuth, useGlobalModalContext } from '@contexts';
import { pushRouteWithUTMQuery } from '@service';
import { PageLoading } from '@components';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { navigateToLogin } from '@utils';

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
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!router.isReady) return;
    const navigateTo = router.query.next || '/';
    if (isAuthenticated) {
      pushRouteWithUTMQuery(router, {
        pathname: navigateTo,
      });
    } else {
      // setLoading(false);
      navigateToLogin(router);
    }
  }, [router.isReady, isAuthenticated]);

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
