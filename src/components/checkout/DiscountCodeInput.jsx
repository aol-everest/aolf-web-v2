import { api } from "@utils";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { FieldWrapper } from "./FieldWrapper";

export const DiscountCodeInput = ({
  label,
  formikProps,
  formikKey,
  containerClass,
  fullWidth,
  productType = "workshop",
  addOnProducts = [],
  product,
  applyDiscount,
  clearCoupon,
  setUser,
  userId = null,
  isBackendRequest = false,
  inputClass = "discount-code",
  tagClass = "",
  ...rest
}) => {
  const [showTag, setShowTag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(0);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [response, setResponse] = useState(null);

  // Validating coupon if present on the initial load
  useEffect(() => {
    if (formikProps.values[formikKey]) {
      applyCoupon();
    }
  }, []);

  const onChangeAction = (evt) => {
    formikProps.setFieldTouched(formikKey);
    formikProps.setFieldValue(formikKey, evt.target.value.toUpperCase());
  };

  const validateCoupon = async () => {
    const value = formikProps.values[formikKey].trim();
    if (value.length === 0) {
      return;
    }
    formikProps.handleBlur(formikKey);
    setLoading(true);
    setShowTag(true);
    setStatus(0);

    try {
      let plan = formikProps.values.plan;
      // const {
      //   token: accessToken,
      //   product = plan,
      //   addOnProducts = [],
      //   productType = "workshop",
      //   applyDiscount,
      //   setUser,
      //   userId,
      // } = this.props;

      let AddOnProductIds = formikProps.values.selectedAddOn
        ? [formikProps.values.selectedAddOn]
        : [];

      const accommodationAddon = formikProps.values.accommodation
        ?.isExpenseAddOn
        ? []
        : formikProps.values.accommodation?.productSfid
        ? [formikProps.values.accommodation?.productSfid]
        : [];

      AddOnProductIds = [
        ...AddOnProductIds,
        ...accommodationAddon,
        ...addOnProducts.map(({ productSfid }) => productSfid),
      ];
      let payLoad = {
        shoppingRequest: {
          products: {
            productType,
            productSfId: product,
            AddOnProductIds: AddOnProductIds,
          },
          couponCode: value,
        },
        userId,
      };
      if (isBackendRequest) {
        const userEmail = formikProps.values["email"];
        payLoad = { ...payLoad, isBackendRequest: true, email: userEmail };
      }
      let results = await api.post({
        path: "applyCoupon",
        body: payLoad,
      });
      if (results.status !== 200) {
        throw new Error(results.error || "Internal Server error.");
      }
      setIsCouponApplied(true);
      setStatus(1);
      setLoading(false);
      setResponse(results);

      applyDiscount(results);
      if (setUser) {
        setUser(results.user || null);
      }
    } catch (ex) {
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      formikProps.setFieldError(
        formikKey,
        message ? `Error: ${message} (${statusCode})` : ex.message,
      );

      setIsCouponApplied(false);
      setStatus(2);
      setLoading(false);
      setResponse({
        discountNotApplicableReason: message
          ? `Error: ${message} (${statusCode})`
          : ex.message,
      });
      applyDiscount(null);
    }
  };

  const applyCoupon = async (e) => {
    if (e) e.preventDefault();
    const value = formikProps?.values[formikKey]?.trim();
    if (value.length === 0) {
      return;
    }

    await validateCoupon();
  };

  const onKeyDown = (e) => {
    if (e.keyCode === 13) {
      applyCoupon(e);
    }
  };

  const removeCoupon = (e) => {
    if (e) e.preventDefault();
    setShowTag(false);
    setStatus(0);
    applyDiscount(null);
    formikProps.values[formikKey] = "";
    if (clearCoupon) {
      clearCoupon();
    }
  };

  return (
    <FieldWrapper
      label={label}
      formikKey={formikKey}
      formikProps={formikProps}
      containerClass={containerClass}
      fullWidth={fullWidth}
    >
      <>
        {!showTag && (
          <>
            <input
              type="text"
              {...rest}
              id={formikKey}
              value={formikProps.values[formikKey]}
              name={formikKey}
              onChange={onChangeAction}
              className={inputClass}
              onBlur={applyCoupon}
              onKeyDown={onKeyDown}
            />
            {loading && <span className="loader-inline"></span>}
          </>
        )}
        {showTag && (
          <>
            <div className={`${tagClass} react-tag-container`}>
              <span
                className={classNames("badge", "react-tag", {
                  "badge-light": status === 0,
                  "badge-success": status === 1,
                  "badge-danger": status === 2,
                })}
              >
                {formikProps.values[formikKey]}
                <a
                  className={classNames("react-tag-remove", {
                    "!tw-text-white": status === 2,
                  })}
                  onClick={removeCoupon}
                >
                  ×
                </a>
              </span>
              {loading && <span className="loader-inline"></span>}
            </div>
          </>
        )}
      </>
    </FieldWrapper>
  );
};
