import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api, Auth } from "@utils";
import classNames from "classnames";
import { FaCheckCircle, FaMinusCircle } from "react-icons/fa";
import Style from "./Verify.module.scss";

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

  const { studentEmail = null } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    async function fetchData() {
      try {
        await api.get({
          path: "change-email-confirm",
          param: router.query,
        });
        setSuccess(true);
        await Auth.logout({ global: true });
      } catch (ex) {
        const data = ex.response?.data;
        const { message, statusCode, code } = data || {};
        setMessage(
          message ? `Error: ${message} (${statusCode || code})` : ex.message,
        );
      }
    }

    async function fetchStudentData() {
      try {
        await api.get({
          path: "verify-email-confirm",
          param: router.query,
        });
        setSuccess(true);
        await Auth.signOut({ global: true });
      } catch (ex) {
        const data = ex.response?.data;
        const { message, statusCode, code } = data || {};
        setMessage(
          message ? `Error: ${message} (${statusCode || code})` : ex.message,
        );
      }
    }
    if (studentEmail) {
      fetchStudentData();
    } else {
      fetchData();
    }
  }, [router.isReady]);

  const handleModalToggle = () => {
    router.push("/us-en/course");
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
              Email Verification
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
                    {studentEmail
                      ? "Your Student status has been successfully verified."
                      : "Your Email has been successfully verified."}
                  </div>
                </>
              )}
              {message && !success && (
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
            {message && !success && (
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
