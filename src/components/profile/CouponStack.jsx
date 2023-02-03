import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import { api } from "@utils";
import { useGlobalAlertContext } from "@contexts";
import { ALERT_TYPES } from "@constants";
import { useQuery } from "react-query";
import { WithContext as ReactTags } from "react-tag-input";
import ErrorPage from "next/error";
import { Loader } from "@components";
import { Dropdown } from "@components/checkout/Dropdown";

const KeyCodes = {
  TAB: 9,
  SPACE: 32,
  comma: 188,
  enter: 13,
};

const COURSE_TYPES = [
  {
    label: "Silent Retreat",
    value: "SILENT_RETREAT",
  },
  {
    label: "Sahaj Samadhi",
    value: "SAHAJ_SAMADHI_MEDITATION",
  },
  {
    label: "Sri Sri Yoga",
    value: "SRI_SRI_YOGA_MEDITATION",
  },
];

const delimiters = [
  KeyCodes.TAB,
  KeyCodes.SPACE,
  KeyCodes.comma,
  KeyCodes.enter,
];

const CouponMergeCmp = ({
  couponCodes,
  reedemableAmount,
  cancelAction,
  mergeAction,
}) => {
  return (
    <div className="profile-update__form">
      <h6 className="profile-update__title">Stack Coupon:</h6>
      <div className="profile-update__card order__card">
        <ol>
          {couponCodes.map((coupon) => {
            if (coupon.isValid) {
              return (
                <li key={coupon.id}>
                  Coupon <span className="tw-font-semibold">{coupon.id}</span>{" "}
                  is valid for a ${coupon.amount} value.
                </li>
              );
            }
            return (
              <li
                key={coupon.id}
                className={classNames({
                  "tw-text-orange-600": !coupon.isValid,
                })}
              >
                Coupon <span className="tw-font-semibold">{coupon.id}</span> is
                invalid.
              </li>
            );
          })}
        </ol>
        <div className="!tw-block tw-w-full tw-font-medium">
          New coupon generated will be ${reedemableAmount}.
        </div>
      </div>
      <div className="tw-flex tw-justify-end tw-mt-6">
        <button
          onClick={cancelAction}
          className="btn-primary d-block ml-4 v2 !tw-text-black !tw-bg-white !tw-border-solid !tw-bg-none !tw-border !tw-border-black hover:!tw-bg-slate-200"
        >
          Cancel
        </button>
        {reedemableAmount > 0 && (
          <button onClick={mergeAction} className="btn-primary d-block ml-4 v2">
            Merge
          </button>
        )}
      </div>
    </div>
  );
};

const CouponMergeResultCmp = ({
  newCouponCode,
  reedemableAmount,
  workshopType,
}) => {
  return (
    <div className="profile-update__form">
      <h6 className="profile-update__title">Stack Coupon:</h6>
      <div className="profile-update__card order__card">
        <div className="!tw-block tw-w-full tw-font-medium">
          A new coupon{" "}
          <span className="tw-font-extrabold">{newCouponCode}</span> with a
          value of ${reedemableAmount} has been generated for{" "}
          {COURSE_TYPES.find((c) => c.value === workshopType).label} workshop.
        </div>
      </div>
    </div>
  );
};

const CouponValidateCmp = ({ couponCodes, verifyCoupons }) => {
  return (
    <Formik
      initialValues={{
        couponCodes,
        courseType: "SILENT_RETREAT",
      }}
      validationSchema={Yup.object({
        couponCodes: Yup.array().min(1, "Must have at least 1 coupon"),
      })}
      enableReinitialize={true}
      onSubmit={async (
        values,
        { setSubmitting, isValid, errors, resetForm },
      ) => {
        console.log(values);
        await verifyCoupons(values, resetForm);
      }}
    >
      {(formikProps) => {
        return (
          <form onSubmit={formikProps.handleSubmit}>
            <div className="profile-update__form">
              <h6 className="profile-update__title">Stack Coupon:</h6>
              <div className="profile-update__card order__card">
                <Field
                  name="couponCodes"
                  component={CouponInput}
                  placeholder="Coupon codes"
                />
                <Dropdown
                  placeholder="Course Type"
                  formikProps={formikProps}
                  formikKey="courseType"
                  options={COURSE_TYPES}
                ></Dropdown>
              </div>
              <div className="tw-flex tw-justify-end tw-mt-6">
                <button type="submit" className="btn-primary d-block ml-4 v2">
                  Verify
                </button>
              </div>
            </div>
          </form>
        );
      }}
    </Formik>
  );
};

export const CouponStack = () => {
  const { showAlert } = useGlobalAlertContext();
  const [couponCodes, setCouponCodes] = useState([]);
  const [workshopType, setWorkshopType] = useState(null);
  const [reedemableAmount, setReedemableAmount] = useState(0);
  const [newCouponCode, setNewCouponCode] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { status, data, isLoading, isError, error } = useQuery(
    "myTalkableCoupons",
    async () => {
      const response = await api.get({
        path: "myTalkableCoupons",
      });
      return response;
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (
      status === "success" &&
      data.validCoupons &&
      data.validCoupons.length > 0
    ) {
      const existingCoupons = data.validCoupons.map((coupon) => {
        return {
          id: coupon.couponCode,
          text: `${coupon.couponCode} ($${coupon.amount})`,
          className: "success",
          isValid: true,
          amount: coupon.amount,
        };
      });
      setCouponCodes([...existingCoupons]);
    }
  }, [status, data]);
  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading) return <Loader />;

  async function verifyCoupons(values, resetForm) {
    const { couponCodes, courseType } = values;
    setLoading(true);
    try {
      const result = await api.post({
        path: "validateCouponsAndGetReedemableAmount",
        body: {
          couponCodes: couponCodes
            .map((currentValue) => {
              return currentValue.id;
            })
            .join(","), //"VYAB-4I4F,O4UC-FUWV-8O4W,YAH9-4QNR,YAH9-4QNR",
          workshopType: courseType,
        },
      });
      if (result.isError) {
        throw new Error(result.error);
      }
      setCouponCodes(
        result.coupons.map((coupon) => {
          return {
            id: coupon.couponCode,
            text: `${coupon.couponCode} ($${coupon.amount})`,
            className: coupon.isValid ? "success" : "error",
            isValid: coupon.isValid,
            amount: coupon.amount,
          };
        }),
      );
      setReedemableAmount(result.reedemableAmount);
      setStep(2);
      setWorkshopType(courseType);
    } catch (ex) {
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: message ? `Error: ${message} (${statusCode})` : ex.message,
      });
    }
    setLoading(false);
  }

  const cancelAction = () => {
    setStep(1);
  };

  const mergeAction = async () => {
    setLoading(true);
    try {
      if (reedemableAmount <= 0) {
        throw new Error("Must have at least 1 valid coupon.");
      }
      const result = await api.post({
        path: "mergeCoupons",
        body: {
          couponCodes: couponCodes
            .filter((currentValue) => currentValue.isValid)
            .map((currentValue) => {
              return currentValue.id;
            })
            .join(","), //"VYAB-4I4F,O4UC-FUWV-8O4W,YAH9-4QNR,YAH9-4QNR",
          workshopType,
          reedemableAmount,
        },
      });

      setNewCouponCode(result.newCouponCode);
      setStep(3);
    } catch (ex) {
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: message ? `Error: ${message} (${statusCode})` : ex.message,
      });
    }
    setLoading(false);
  };

  return null;

  // switch (step) {
  //   case 1:
  //     return (
  //       <>
  //         {loading && <Loader />}
  //         <CouponValidateCmp
  //           couponCodes={couponCodes}
  //           verifyCoupons={verifyCoupons}
  //         />
  //       </>
  //     );
  //   case 2:
  //     return (
  //       <>
  //         {loading && <Loader />}
  //         <CouponMergeCmp
  //           couponCodes={couponCodes}
  //           reedemableAmount={reedemableAmount}
  //           cancelAction={cancelAction}
  //           mergeAction={mergeAction}
  //         />
  //       </>
  //     );
  //   case 3:
  //     return (
  //       <CouponMergeResultCmp
  //         newCouponCode={newCouponCode}
  //         reedemableAmount={reedemableAmount}
  //         workshopType={workshopType}
  //       />
  //     );
  // }
};
export const CouponInput = ({ field, label, form, ...rest }) => {
  const handleDelete = (i) => {
    form.setFieldValue(
      field.name,
      field.value.filter((tag, index) => index !== i),
    );
  };

  const handleAddition = (tag) => {
    form.setFieldValue(field.name, [...field.value, tag]);
  };
  return (
    <>
      <ReactTags
        tags={field.value}
        delimiters={delimiters}
        handleDelete={handleDelete}
        handleAddition={handleAddition}
        {...field}
        {...rest}
      />
      {form.errors[field.name] && (
        <div className="validation-message validation-mobile-message !tw-block tw-w-full">
          {form.errors[field.name]}
        </div>
      )}
    </>
  );
};
