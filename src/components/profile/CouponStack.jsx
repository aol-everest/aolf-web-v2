import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import { api } from "@utils";
import { useGlobalAlertContext, useAuth } from "@contexts";
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
    label: "SKY Breath Meditation",
    value: "SKY_BREATH_MEDITATION",
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
      <h6 className="profile-update__title">Redeem Advocate Coupons</h6>
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
  const { user } = useAuth();

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(newCouponCode);
  };

  return (
    <div className="profile-update__form">
      <h6 className="profile-update__title">Redeem Advocate Coupons</h6>

      <div class="advocate-reward mt-4 mb-4">
        <div class="text-center">
          <p class="advocate-reward__text mb-4">
            Your rewards code with a value of ${reedemableAmount} has been
            created for{" "}
            {COURSE_TYPES.find((c) => c.value === workshopType).label}. A
            confirmation email with your rewards code has been sent to
            <span class="d-block">{user.profile.email}.</span>
          </p>
        </div>

        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-center">
          <p class="advocate-reward__label mb-4 mb-sm-0 !tw-w-fit">
            {newCouponCode} (${reedemableAmount})
          </p>

          <button
            class="advocate-reward__button align-self-end"
            onClick={handleCopyCoupon}
          >
            Copy Code
          </button>
        </div>
      </div>
    </div>
  );
};

const CouponValidateCmp = ({ couponCodes, mergeAction }) => {
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
        await mergeAction(values, resetForm);
      }}
    >
      {(formikProps) => {
        const { values, resetForm } = formikProps;
        const handleCouponSelection = (e, field, form, couponCode) => {
          if (e.target.checked) {
            form.setFieldValue("couponCodes", [...field.value, couponCode]);
          } else {
            const updatedCoupons = field.value.filter(
              (tag, index) => tag.id !== couponCode.id,
            );
            form.setFieldValue("couponCodes", [...updatedCoupons]);
          }
        };

        const { couponCodes: addedCoupons, courseType } = values;
        const isSubmit = addedCoupons.length > 0 && courseType;
        const totalReward =
          isSubmit && addedCoupons.reduce((a, b) => a + (b["amount"] || 0), 0);

        const handleSubmit = async (e) => {
          e.preventDefault();
          await mergeAction(values, resetForm);
        };

        return (
          <form onSubmit={formikProps.handleSubmit}>
            <div className="profile-update__form">
              <h6 className="profile-update__title">Redeem Advocate Coupons</h6>

              <form action="#" className="advocate-reward mt-4 mb-4">
                <div className="text-center">
                  <h4 className=" advocate-reward__title mb-4">
                    Select Rewards Codes to Redeem:
                  </h4>

                  <Field name="couponCodes">
                    {({ field, form }) => (
                      <ul className="advocate-reward__list">
                        {couponCodes.map((couponCode, key) => {
                          return (
                            <li key={key}>
                              <label className=" d-flex align-items-center">
                                <input
                                  type="checkbox"
                                  defaultChecked
                                  className="advocate-reward__checkbox mr-2"
                                  onClick={(e) =>
                                    handleCouponSelection(
                                      e,
                                      field,
                                      form,
                                      couponCode,
                                    )
                                  }
                                />

                                <p className="advocate-reward__label">
                                  {couponCode.text}
                                </p>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </Field>
                </div>

                <div class="volonteer-content__item_multiselect_body item-volonteer advocate-reward__select mt-4 mb-4">
                  <Dropdown
                    placeholder="Choose Course Type"
                    formikProps={formikProps}
                    formikKey="courseType"
                    options={COURSE_TYPES}
                    containerClass="tw-w-full"
                    innerFullWidth={true}
                  ></Dropdown>
                </div>

                <div class="d-flex flex-column flex-sm-row justify-content-between align-items-center">
                  <p class="d-none d-sm-block advocate-reward__total">
                    {isSubmit && `Rewards Selected Total: [$${totalReward}]`}
                  </p>
                  <button
                    className={classNames(
                      "advocate-reward__button align-self-end",
                      {
                        "advocate-reward__button--disabled": !isSubmit,
                      },
                    )}
                    disabled={!isSubmit}
                    onClick={handleSubmit}
                  >
                    Redeem
                  </button>
                </div>
              </form>
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

  const mergeAction = async (values, resetForm) => {
    const { couponCodes, courseType } = values;
    const reedemableAmount = couponCodes.reduce(
      (a, b) => a + (b["amount"] || 0),
      0,
    );
    setLoading(true);
    try {
      if (reedemableAmount <= 0) {
        throw new Error("Must have at least 1 valid coupon.");
      }
      const result = await api.post({
        path: "mergeCoupons",
        body: {
          couponCodes: couponCodes
            .map((currentValue) => {
              return currentValue.id;
            })
            .join(","), //"VYAB-4I4F,O4UC-FUWV-8O4W,YAH9-4QNR,YAH9-4QNR",
          workshopType: courseType,
          reedemableAmount,
        },
      });
      setStep(2);
      setReedemableAmount(reedemableAmount);
      setWorkshopType(courseType);
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

  switch (step) {
    case 1:
      return (
        <>
          {loading && <Loader />}
          <CouponValidateCmp
            couponCodes={couponCodes}
            mergeAction={mergeAction}
          />
        </>
      );
    case 2:
      return (
        <>
          {loading && <Loader />}
          <CouponMergeCmp
            couponCodes={couponCodes}
            reedemableAmount={reedemableAmount}
            cancelAction={cancelAction}
            mergeAction={mergeAction}
          />
        </>
      );
    case 3:
      return (
        <CouponMergeResultCmp
          newCouponCode={newCouponCode}
          reedemableAmount={reedemableAmount}
          workshopType={workshopType}
        />
      );
  }
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
