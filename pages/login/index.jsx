import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Auth } from "aws-amplify";
import { withSSRContext } from "aws-amplify";
import { useGlobalModalContext } from "@contexts";
import { MODAL_TYPES } from "@constants";
import { api } from "@utils";

export const getServerSideProps = async (context) => {
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
};

function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { showModal } = useGlobalModalContext();

  useEffect(() => {
    if (!router.isReady) return;
    handleLogin();
  }, [router.isReady]);

  async function handleLogin() {
    const navigateTo = router.query.next || "/";
    try {
      const currentSession = await Auth.currentSession();
      router.push(navigateTo);
    } catch (err) {
      console.log(err);
      setLoading(false);
      showModal(MODAL_TYPES.LOGIN_MODAL, {
        navigateTo,
        closeModalAction: () => {
          router.push("/us-en/course");
        },
      });
    }
  }

  async function signIn({ username, password }) {
    try {
      await Auth.signIn(username, password);

      router.push("/us-en/course");
    } catch (error) {
      console.log("error signing in", error);
    }
  }

  return (
    <main className="aol_mainbody login-screen">
      {loading && (
        <div className="tw-top-0 tw-w-full tw-h-full tw-fixed tw-z-[99999]">
          <div className="cover-spin"></div>
        </div>
      )}
    </main>
  );
}
Login.hideHeader = true;

export default Login;
