import classNames from 'classnames';
import { api } from '@utils';
import { useEffect, useState, useCallback, useRef } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useQueryState, parseAsString } from 'nuqs';
import { useGlobalAlertContext } from '@contexts';
import { ALERT_TYPES } from '@constants';

const DISCOUNT_STATUS = {
  INITIAL: 0,
  SUCCESS: 1,
  ERROR: 2,
  VALIDATING: 3,
  NETWORK_ERROR: 4,
  INVALID_FORMAT: 5,
  RATE_LIMITED: 6,
};

// Rate limiting configuration
const RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  WINDOW_MS: 60000, // 1 minute
  COOLDOWN_MS: 30000, // 30 seconds
};

// Debug logging utility
const debugLog = (message, data = {}) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DiscountInput] ${message}`, data);
  }
};

export const DiscountInputNew = ({
  label = 'Do you have a discount code?',
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
  ticketsPayload,
  ...rest
}) => {
  const { showAlert } = useGlobalAlertContext();
  const [showTag, setShowTag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(DISCOUNT_STATUS.INITIAL);
  const [couponCode, setCouponCode] = useQueryState(
    'couponCode',
    parseAsString,
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationAttempts, setInitializationAttempts] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const MAX_INIT_ATTEMPTS = 3;

  // Rate limiting state
  const rateLimitRef = useRef({
    attempts: [],
    cooldownUntil: null,
  });

  // Check if rate limited
  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT.WINDOW_MS;

    // Clean up old attempts
    rateLimitRef.current.attempts = rateLimitRef.current.attempts.filter(
      (time) => time > windowStart,
    );

    // Check if in cooldown
    if (
      rateLimitRef.current.cooldownUntil &&
      now < rateLimitRef.current.cooldownUntil
    ) {
      const remainingSeconds = Math.ceil(
        (rateLimitRef.current.cooldownUntil - now) / 1000,
      );
      return {
        isLimited: true,
        message: `Too many attempts. Please wait ${remainingSeconds} seconds before trying again.`,
        remainingTime: remainingSeconds,
      };
    }

    // Check attempts count
    if (rateLimitRef.current.attempts.length >= RATE_LIMIT.MAX_ATTEMPTS) {
      rateLimitRef.current.cooldownUntil = now + RATE_LIMIT.COOLDOWN_MS;
      return {
        isLimited: true,
        message: `Too many attempts. Please wait 30 seconds before trying again.`,
        remainingTime: 30,
      };
    }

    return { isLimited: false };
  }, []);

  // Add attempt to rate limit tracking
  const trackAttempt = useCallback(() => {
    rateLimitRef.current.attempts.push(Date.now());
  }, []);

  // Handle URL coupon code on initial load with retry logic
  useEffect(() => {
    const applyUrlCoupon = async () => {
      if (!isInitialized && couponCode && !formikProps.values[formikKey]) {
        debugLog('Attempting to apply URL coupon', {
          couponCode,
          attempt: initializationAttempts + 1,
        });

        try {
          formikProps.setFieldValue(formikKey, couponCode.toUpperCase());
          await validateCoupon(couponCode.toUpperCase(), true);
          setIsInitialized(true);
          debugLog('Successfully initialized coupon from URL');
        } catch (error) {
          debugLog('Failed to initialize coupon', { error });
          if (initializationAttempts < MAX_INIT_ATTEMPTS) {
            setInitializationAttempts((prev) => prev + 1);
          } else {
            debugLog('Max initialization attempts reached');
            setIsInitialized(true);
            setCouponCode(null);
          }
        }
      }
    };

    applyUrlCoupon();
  }, [couponCode, isInitialized, initializationAttempts]);

  const validateCouponFormat = (code) => {
    if (!code) return false;
    const isValidFormat = /^[A-Z0-9]{4,20}$/.test(code);
    if (!isValidFormat) {
      debugLog('Invalid coupon format', { code });
      return false;
    }
    return true;
  };

  const handleStatusTransition = async (newStatus) => {
    setIsTransitioning(true);
    setStatus(newStatus);
    // Small delay to allow for smooth transitions
    await new Promise((resolve) => setTimeout(resolve, 150));
    setIsTransitioning(false);
  };

  const preparePayload = useCallback(
    (code) => {
      debugLog('Preparing payload', { code });
      let AddOnProductIds = [];

      // Get selected add-on if any
      if (formikProps.values.selectedAddOn) {
        AddOnProductIds.push(formikProps.values.selectedAddOn);
      }

      // Get accommodation add-on if any
      const accommodation = formikProps.values.accommodation;
      if (accommodation?.productSfid && !accommodation?.isExpenseAddOn) {
        AddOnProductIds.push(accommodation.productSfid);
      }

      // Add other add-on products
      AddOnProductIds = [
        ...AddOnProductIds,
        ...addOnProducts.map(({ productSfid }) => productSfid),
      ];

      let payload = {
        shoppingRequest: {
          products: {
            productType,
            productSfId: product,
            AddOnProductIds,
          },
          couponCode: code || formikProps.values[formikKey]?.trim(),
        },
        userId,
      };

      if (ticketsPayload) {
        payload.shoppingRequest.tickets = ticketsPayload;
      }

      if (isBackendRequest) {
        payload = {
          ...payload,
          isBackendRequest: true,
          email: formikProps.values.email,
        };
      }

      debugLog('Prepared payload', payload);
      return payload;
    },
    [
      formikProps.values,
      product,
      productType,
      addOnProducts,
      userId,
      isBackendRequest,
      ticketsPayload,
      formikKey,
    ],
  );

  const onChangeAction = (evt) => {
    const value = evt.target.value.toUpperCase();
    formikProps.setFieldTouched(formikKey);
    formikProps.setFieldValue(formikKey, value);
    debugLog('Coupon input changed', { value });
  };

  // Handle rate limit error display
  const handleRateLimitError = useCallback(
    (rateLimitCheck) => {
      const { message, remainingTime } = rateLimitCheck;

      // Show field error
      formikProps.setFieldError(formikKey, message);

      // Show global alert
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: (
          <div>
            <strong>Rate Limit Exceeded</strong>
            <p>{message}</p>
            <p className="tw-text-sm tw-mt-1">
              Please note: Rapid coupon attempts are limited to protect our
              system.
            </p>
          </div>
        ),
        timeout: Math.min(remainingTime * 1000, 5000), // Show for remaining time or max 5 seconds
      });
    },
    [showAlert, formikKey, formikProps],
  );

  const validateCoupon = async (codeOverride, isInitialLoad = false) => {
    const value = codeOverride || formikProps.values[formikKey]?.trim();
    if (!value) {
      debugLog('No coupon value to validate');
      return;
    }

    // Check rate limit before validation
    if (!isInitialLoad) {
      const rateLimitCheck = checkRateLimit();
      if (rateLimitCheck.isLimited) {
        await handleStatusTransition(DISCOUNT_STATUS.RATE_LIMITED);
        handleRateLimitError(rateLimitCheck);
        return;
      }
      trackAttempt();
    }

    if (!validateCouponFormat(value)) {
      await handleStatusTransition(DISCOUNT_STATUS.INVALID_FORMAT);
      formikProps.setFieldError(
        formikKey,
        'Invalid coupon format. Please use only letters and numbers (4-20 characters).',
      );
      return;
    }

    try {
      debugLog('Starting coupon validation', { value, isInitialLoad });
      setLoading(true);
      setShowTag(true);
      await handleStatusTransition(DISCOUNT_STATUS.VALIDATING);
      formikProps.handleBlur(formikKey);

      const payload = preparePayload(value);
      const results = await api.post({
        path: 'applyCoupon',
        body: payload,
      });

      if (results.status !== 200) {
        throw new Error(results.error || 'Internal Server error.');
      }

      debugLog('Coupon validation successful', results);
      await handleStatusTransition(DISCOUNT_STATUS.SUCCESS);
      applyDiscount(results);
      if (!isInitialLoad) {
        setCouponCode(value);
      }

      if (setUser && results.user) {
        setUser(results.user);
      }
    } catch (error) {
      debugLog('Coupon validation failed', { error });
      const data = error.response?.data;
      let errorMessage;
      let errorStatus;

      if (error.message === 'Network Error') {
        errorMessage =
          'Unable to validate coupon. Please check your internet connection.';
        errorStatus = DISCOUNT_STATUS.NETWORK_ERROR;
      } else {
        errorMessage = data
          ? `Error: ${data.message} (${data.statusCode})`
          : error.message;
        errorStatus = DISCOUNT_STATUS.ERROR;
      }

      await handleStatusTransition(errorStatus);
      formikProps.setFieldError(formikKey, errorMessage);
      applyDiscount(null);
      if (!isInitialLoad) {
        setCouponCode(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (e) => {
    if (e) {
      e.preventDefault();
    }
    await validateCoupon();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyCoupon();
    }
  };

  const removeCoupon = (e) => {
    if (e) {
      e.preventDefault();
    }
    debugLog('Removing coupon');
    setShowTag(false);
    setStatus(DISCOUNT_STATUS.INITIAL);
    applyDiscount(null);
    formikProps.setFieldValue(formikKey, '');
    setCouponCode(null);
    setIsInitialized(false);
    setInitializationAttempts(0);

    if (clearCoupon) {
      clearCoupon();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case DISCOUNT_STATUS.SUCCESS:
        return 'badge-success';
      case DISCOUNT_STATUS.ERROR:
      case DISCOUNT_STATUS.NETWORK_ERROR:
      case DISCOUNT_STATUS.INVALID_FORMAT:
      case DISCOUNT_STATUS.RATE_LIMITED:
        return 'badge-danger';
      case DISCOUNT_STATUS.VALIDATING:
        return 'badge-info';
      default:
        return 'badge-light';
    }
  };

  const getStatusAnimation = () => {
    if (isTransitioning)
      return 'tw-transition-all tw-duration-150 tw-ease-in-out';
    return '';
  };

  const hasError =
    formikProps.errors[formikKey] && formikProps.touched[formikKey];

  return (
    <>
      <label
        className={classNames(containerClass, {
          error: hasError,
          'validate-error': hasError,
        })}
      >
        {label}
      </label>
      <div className="relative">
        {showTag ? (
          <span
            className={classNames(
              'discount-text-input badge',
              'react-tag',
              getStatusColor(status),
              getStatusAnimation(),
              {
                'tw-opacity-75': isTransitioning,
              },
            )}
          >
            {formikProps.values[formikKey]}
            {!loading && (
              <a
                className={classNames('react-tag-remove', {
                  '!tw-text-white': status === DISCOUNT_STATUS.ERROR,
                })}
                onClick={removeCoupon}
              >
                ×
              </a>
            )}
          </span>
        ) : (
          <div className="relative w-full">
            <input
              {...rest}
              type="text"
              id={formikKey}
              name={formikKey}
              value={formikProps.values[formikKey] || ''}
              onChange={onChangeAction}
              onBlur={applyCoupon}
              onKeyDown={onKeyDown}
              placeholder="Add code & press Enter"
              disabled={loading || status === DISCOUNT_STATUS.RATE_LIMITED}
              className={classNames(
                'discount-input-field !pr-8 w-full',
                getStatusAnimation(),
                {
                  'has-error': hasError,
                  'tw-opacity-50': status === DISCOUNT_STATUS.RATE_LIMITED,
                },
              )}
            />
            {loading && (
              <div
                className={classNames(
                  'absolute right-2 top-1/2 -translate-y-1/2',
                  getStatusAnimation(),
                )}
              >
                <AiOutlineLoading3Quarters className="animate-spin tw-text-gray-400 tw-text-xl" />
              </div>
            )}
          </div>
        )}
      </div>
      {hasError && (
        <div
          className={classNames(
            'tw-text-xs tw-text-red-500 tw-mt-1',
            getStatusAnimation(),
            {
              'tw-font-medium': status === DISCOUNT_STATUS.RATE_LIMITED,
            },
          )}
        >
          {formikProps.errors[formikKey]}
        </div>
      )}
    </>
  );
};
