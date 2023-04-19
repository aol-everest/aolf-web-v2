import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "@utils";
import classNames from "classnames";
import { FaCheckCircle, FaMinusCircle } from "react-icons/fa";
import Style from "./Corporate-email-verify.module.scss";
import { pushRouteWithUTMQuery } from "@service";

// export const getServerSideProps = async (context) => {
// const { query, req, res } = context;
// const { next } = query;
// const { Auth } = await withSSRContext(context);
// const user = await Auth.currentAuthenticatedUser();
// const token = user.signInUserSession.idToken.jwtToken;
// await api.get({
//   path: "profile",
//   token,
// });
//   res.writeHead(302, {
//     Location: `/`,
//   });
//   res.end();

//   return { props: {} };
// };

function Token() {
  const router = useRouter();
  const [message, setMessage] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    async function fetchData() {
      try {
        const { error, isError } = await api.get({
          path: "verifyCorporateAccount",
          param: { key: router.query.activate },
        });
        if (isError) {
          throw new Error(error);
        } else setSuccess(true);
        // await Auth.signOut({ global: true });
      } catch (ex) {
        const data = ex.response?.data;
        const { message, statusCode, code } = data || {};
        setMessage(
          message ? `Error: ${message} (${statusCode || code})` : ex.message,
        );
      }
    }
    if (router.query.activate) {
      fetchData();
    } else {
      setMessage("Activation code missing");
    }
  }, [router.isReady]);

  const handleModalToggle = () => {
    pushRouteWithUTMQuery(router, "/us-en/course");
  };

  return (
    <main className="aol_mainbody login-screen profile">
      <div className="profile-modal active show">
        <div className="modal-window__header">
          <button
            className={classNames(
              "modal-window__close modal-window__close_mobile",
              Style.mobileClose,
            )}
            onClick={handleModalToggle}
          >
            <div className="close-line"></div>
            <div className="close-line"></div>
          </button>
        </div>
        <div
          id="retreat-prerequisite"
          className="digital-member-join digital-member-join_journey course-join-card retreat-prerequisite active show"
        >
          <div className="course-join-card__body alert__body mt-5">
            <h2 className="course-join-card__title section-title tw-text-center">
              Account Verification
            </h2>
            <div className="tw-m-6 tw-text-center">
              {!message && !success && (
                <div className="cover-spin-inline"></div>
              )}
              {success && (
                <>
                  <div className="icon-container-success tw-w-[45px] tw-inline-block">
                    <FaCheckCircle />
                  </div>
                  <div className="tw-text-sm tw-mt-3">
                    Corporate user marked successfully.
                  </div>
                </>
              )}
              {message && (
                <>
                  <div className="icon-container-error tw-w-[45px] tw-inline-block">
                    <FaMinusCircle />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="course-details-card__footer text-center tw-min-h-[62px]">
            {!message && !success && (
              <>Please wait while we verify your email...</>
            )}
            {message && (
              <p className="validation-input text-center">{message}</p>
            )}
          </div>
          <button
            className="modal-window__close modal-window__close_desktop"
            onClick={handleModalToggle}
          >
            <div className="close-line"></div>
            <div className="close-line"></div>
          </button>
        </div>
      </div>
    </main>
  );
}
Token.hideHeader = true;

export default Token;
