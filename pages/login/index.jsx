import { useEffect } from "react";
import { useRouter } from "next/router";
import { Auth } from "aws-amplify";
import { useGlobalModalContext } from "@contexts";
import { MODAL_TYPES } from "@constants";

export const getServerSideProps = async (context) => {
  const { query, req, res } = context;
  const { next } = query;
  try {
    const { Auth } = await withSSRContext(context);
    const user = await Auth.currentAuthenticatedUser();
    const token = user.signInUserSession.idToken.jwtToken;
    await api.get({
      path: "profile",
      token,
    });
    res.writeHead(302, {
      Location: next ? next : `/`,
    });
    res.end();
  } catch (err) {
    console.error(err);
  }
  return { props: {} };
};

function Login() {
  const router = useRouter();
  const { showModal } = useGlobalModalContext();
  useEffect(() => {
    const navigateTo = router.query.next || "/";
    showModal(MODAL_TYPES.LOGIN_MODAL, {
      navigateTo,
      hideCloseBtn: true,
    });
  }, []);

  async function signIn({ username, password }) {
    try {
      await Auth.signIn(username, password);

      router.push("/workshop");
    } catch (error) {
      console.log("error signing in", error);
    }
  }

  return <main className="aol_mainbody login-screen"></main>;
}
Login.hideHeader = true;

export default Login;
