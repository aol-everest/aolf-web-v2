import React, { useState } from "react";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string } from "yup";
import { api } from "@utils";
import { FaCheckCircle } from "react-icons/fa";
import { useAuth } from "@contexts";
import { useQuery } from "react-query";
import { WithContext as ReactTags } from "react-tag-input";
import ErrorPage from "next/error";
import { Loader } from "@components";

const KeyCodes = {
  TAB: 9,
  SPACE: 32,
  comma: 188,
  enter: 13,
};

const delimiters = [
  KeyCodes.TAB,
  KeyCodes.SPACE,
  KeyCodes.comma,
  KeyCodes.enter,
];

export const CouponStack = ({ closeDetailAction, existingEmail }) => {
  const { user } = useAuth();
  const [tags, setTags] = useState([
    { id: "Thailand", text: "Thailand" },
    { id: "India", text: "India", className: "error" },
    { id: "Vietnam", text: "Vietnam" },
    { id: "Turkey", text: "Turkey", className: "success" },
  ]);
  const [message, setMessage] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const { validCoupons, isLoading, isError, error } = useQuery(
    "myTalkableCoupons",
    async () => {
      const response = await api.get({
        path: "myTalkableCoupons",
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading) return <Loader />;
  console.log(validCoupons);
  async function onChangeEmailSubmitted({ username }) {
    setLoading(true);
    try {
      if (user.profile.email === username) {
        throw new Error(`${username} is already your email address`);
      }

      await api.post({
        path: "change-email",
        body: {
          newEmail: username,
        },
      });

      // await Auth.currentAuthenticatedUser({ bypassCache: true });
      setShowSuccessMessage(true);
      setMessage("");
      setShowMessage(false);
    } catch (ex) {
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      setMessage(message ? `Error: ${message} (${statusCode})` : ex.message);
      setShowMessage(true);
    }
    setLoading(false);
  }

  async function onConfirmCodeSubmitted({ code }) {
    setLoading(true);
    try {
      /* const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();
      await api.post({
        path: "change-email-confirm",
        body: {
          code,
          newEmail: submittedEmail,
          accessToken:
            currentAuthenticatedUser.signInUserSession.accessToken.jwtToken,
        },
      });

      await Auth.currentAuthenticatedUser({ bypassCache: true }); */
      // setStep("change-email");
      setMessage("");
      setShowMessage(false);
    } catch (ex) {
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      setMessage(message ? `Error: ${message} (${statusCode})` : ex.message);
      setShowMessage(true);
    }
    setLoading(false);
  }

  // async function onConfirmCodeResendCode() {
  //   try {
  //     const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();

  //     await async_fetch(`${process.env.domain}/change-email`, {
  //       method: "post",
  //       body: JSON.stringify({
  //         newEmail: submittedEmail,
  //         accessToken:
  //           currentAuthenticatedUser.signInUserSession.accessToken.jwtToken,
  //       }),
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `${(await Auth.currentSession())
  //           .getIdToken()
  //           .getJwtToken()}`,
  //       },
  //     });
  //   } catch (e) {
  //     console.log(e.message);
  //   }
  // }

  const handleDelete = (i) => {
    setTags(tags.filter((tag, index) => index !== i));
  };

  const handleAddition = (tag) => {
    setTags([...tags, tag]);
  };

  return (
    <div className="profile-update__form">
      <h6 className="profile-update__title">Stack Coupon:</h6>
      <div className="profile-update__card order__card">
        <ReactTags
          tags={tags}
          delimiters={delimiters}
          handleDelete={handleDelete}
          handleAddition={handleAddition}
          placeholder="Coupon codes"
        />
      </div>
      <div className="tw-flex tw-justify-end tw-mt-6">
        <button type="submit" className="btn-primary d-block ml-4 v2">
          Verify
        </button>
      </div>
    </div>
  );
};
