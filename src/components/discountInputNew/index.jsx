import classNames from 'classnames';
import { api } from '@utils';
import { useEffect, useState } from 'react';

export const DiscountInputNew = ({
  label,
  fullWidth,
  containerClass = '',
  formikProps,
  formikKey,
  productType = 'workshop',
  addOnProducts = [],
  product,
  applyDiscount,
  clearCoupon,
  setUser,
  userId = null,
  isBackendRequest = false,
  ...rest
}) => {
  const [showTag, setShowTag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(0);

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
        const userEmail = formikProps.values['email'];
        payLoad = { ...payLoad, isBackendRequest: true, email: userEmail };
      }
      let results = await api.post({
        path: 'applyCoupon',
        body: payLoad,
      });
      if (results.status !== 200) {
        throw new Error(results.error || 'Internal Server error.');
      }
      setStatus(1);
      setLoading(false);

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
      setStatus(2);
      setLoading(false);
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
    formikProps.values[formikKey] = '';
    if (clearCoupon) {
      clearCoupon();
    }
  };

  return (
    <>
      <label
        className={classNames(`${containerClass}`, {
          error:
            formikProps.errors[formikKey] && formikProps.touched[formikKey],
          'validate-error':
            formikProps.errors[formikKey] && formikProps.touched[formikKey],
        })}
      >
        Do you have a discount code?
      </label>
      {showTag ? (
        <span
          className={classNames('discount-text-input badge', 'react-tag', {
            'badge-light': status === 0,
            'badge-success': status === 1,
            'badge-danger': status === 2,
          })}
        >
          {formikProps.values[formikKey]}
          {!loading && (
            <a
              className={classNames('react-tag-remove', {
                '!tw-text-white': status === 2,
              })}
              onClick={removeCoupon}
            >
              ×
            </a>
          )}
        </span>
      ) : (
        <input
          {...rest}
          id={formikKey}
          value={formikProps.values[formikKey]}
          name={formikKey}
          onChange={onChangeAction}
          onBlur={applyCoupon}
          onKeyDown={onKeyDown}
          placeholder="Add code"
          disabled={loading}
        />
      )}
      {loading && <span className="loader-inline"></span>}
    </>
  );
};
