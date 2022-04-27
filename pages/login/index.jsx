import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useGlobalModalContext } from "@contexts";
import { MODAL_TYPES } from "@constants";
import { api, Auth } from "@utils";
import { useAuth } from "@contexts";
import { PageLoading } from "@components";

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
    if (!router.isReady && authenticated) return;
    const navigateTo = router.query.next || "/";
    if (authenticated) {
      router.push({
        pathname: navigateTo,
      });
    } else {
      // setLoading(false);
      showModal(MODAL_TYPES.LOGIN_MODAL, {
        navigateTo,
        closeModalAction: () => {
          router.push("/us-en/course");
        },
      });
    }
  }, [router.isReady]);

  /* async function signIn({ username, password }) {
    try {
      await Auth.authenticateUser(username, password);

      router.push("/us-en/course");
    } catch (error) {
      console.log("error signing in", error);
    }
  } */

  return (
    <main className="aol_mainbody login-screen">
      {/* {loading && <PageLoading />} */}
    </main>
  );
}
Login.hideHeader = true;

export default Login;
