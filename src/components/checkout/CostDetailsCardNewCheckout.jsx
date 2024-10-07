import { COURSE_TYPES, MEMBERSHIP_TYPES, PAYMENT_TYPES } from '@constants';
import classNames from 'classnames';
import { Field } from 'formik';

export const CostDetailsCardNewCheckout = ({
  workshop,
  formikProps,
  fee,
  delfee,
  showCouponCodeField,
  userSubscriptions,
  hasGroupedAddOnProducts,
  discount,
  isComboDetailAvailable,
  isOfflineExpense,
  openSubscriptionPaywallPage,
  onAccommodationChange,
  paymentOptionChange,
  values,
  onComboDetailChange,
  ...rest
}) => {
  const {
    id,
    title,
    productTypeId,
    isInstalmentAllowed,
    premiumRate,
    usableCredit,
    addOnProducts = [],
    groupedAddOnProducts,
    instalmentAmount,
    instalmentTenure,
    instalmentGapUnit,
    instalmentGap,
    availableBundles,
    subscriptionDetails,
    afterCreditPricMessage,
  } = workshop || {};

  const expenseAddOn = addOnProducts.find((product) => product.isExpenseAddOn);

  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(productTypeId) >= 0;
  const gatewayToInfinity =
    COURSE_TYPES.GATEWAY_TO_INFINITY_COURSE.value === productTypeId;
  const isJourneyPremium =
    !!userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PREMIUM.value];
  const isJourneyPlus =
    !!userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PLUS.value];
  const isBasicMember =
    !!userSubscriptions[MEMBERSHIP_TYPES.BASIC_MEMBERSHIP.value];

  if (gatewayToInfinity) {
    return (
      <div className="reciept reciept--box d-none d-lg-block">
        <div className="reciept__header">
          <h2 className="title">
            <span className="icon-wrap">
              <img src="/img/stars-02.svg" width="20" height="20" alt="" />
            </span>
            Limited time offer
          </h2>
          <ul className="reciept__item_list ">
            <li>
              <p className="font-weight-normal">Regular Tuition</p>
              <p className="font-weight-bold">
                {delfee && (
                  <span className="discount font-weight-bold">[${delfee}]</span>
                )}{' '}
                ${fee}
              </p>
            </li>
          </ul>
        </div>

        <div className="reciept__details text-center">
          <a href="">
            <img
              src="/img/trustpilot-logo-mobile.png"
              width="129"
              height="61"
              alt="logo"
            />
          </a>

          <p className="comments__quote comments__quote--max-width mt-4">
            “I used to suffer from anxiety and my health was greatly affected by
            it. I feel so free and light now.”
            <span className="d-block mt-3 font-normal">- Millie I.</span>
          </p>
        </div>

        <div className="reciept__more">
          Additional Notes: Housing will be offsite. Please contact the course
          coordinator for details, and to make arrangements.
          <a href="#">See more</a>
        </div>
      </div>
    );
  }

  if (isInstalmentAllowed) {
    return (
      <>
        <div className="reciept__header">
          <p className="reciept__item reciept__item_main">
            <span>
              <img src="/img/ic-timer.svg" alt="timer" />
              Payment Options
            </span>
          </p>
          <div className="reciept__payment">
            <div className="reciept__payment-option">
              <Field
                className={classNames('custom-radio', {
                  error:
                    formikProps.errors.paymentOption &&
                    formikProps.touched.paymentOption,
                })}
                type="radio"
                checked={
                  formikProps.values.paymentOption === PAYMENT_TYPES.FULL
                }
                name="paymentOption"
                value={PAYMENT_TYPES.FULL}
                onChange={() =>
                  paymentOptionChange(formikProps, PAYMENT_TYPES.FULL)
                }
              />
              <label htmlFor="payment-lg-full">
                <span>Pay in full:</span>
                <span>${fee}</span>
              </label>
            </div>
            <div className="reciept__payment-option">
              <Field
                className={classNames('custom-radio', {
                  error:
                    formikProps.errors.paymentOption &&
                    formikProps.touched.paymentOption,
                })}
                type="radio"
                checked={
                  formikProps.values.paymentOption === PAYMENT_TYPES.LATER
                }
                name="paymentOption"
                value={PAYMENT_TYPES.LATER}
                onChange={() =>
                  paymentOptionChange(formikProps, PAYMENT_TYPES.LATER)
                }
                disabled={!showCouponCodeField}
              />
              <label htmlFor="payment-lg-later">
                <span>Pay later:</span>
                <span>${instalmentAmount} today</span>
              </label>
            </div>
            <div className="reciept__payment-tooltip">
              Pay in {instalmentTenure} X ${instalmentAmount} interest-free
              payments every {instalmentGap} {instalmentGapUnit}(s), starting
              today
            </div>
          </div>
          {!showCouponCodeField && (
            <div className="reciept__more word-wrap text-justify">
              Pay later is currently only available for SKY
            </div>
          )}
        </div>

        {isComboDetailAvailable && (
          <>
            <p className="reciept__item reciept__item_main">
              <span>
                <img src="/img/ic-timer.svg" alt="timer" />
                Course Options
              </span>
            </p>
            <div className="reciept__payment reciept__header">
              <div className="reciept__payment-option">
                <input
                  className="custom-radio"
                  type="radio"
                  name="payment"
                  id={id}
                  checked={
                    values.comboDetailId ? values.comboDetailId === id : true
                  }
                  onChange={() => onComboDetailChange(formikProps, id)}
                />
                <label htmlFor="payment-lg-meditation">
                  <span>{title}:</span>
                  <span>
                    {delfee && <s>${delfee}</s>} ${fee}
                  </span>
                </label>
              </div>
              {availableBundles.map((availableBundle) => {
                const isChecked =
                  values.comboDetailId === availableBundle.comboProductSfid;
                return (
                  <>
                    <div className="reciept__payment-option reciept__payment-option_special-offer">
                      <span className="special-offer">Special Offer</span>
                      <input
                        className="custom-radio"
                        type="radio"
                        name="payment"
                        id={availableBundle.comboProductSfid}
                        checked={isChecked}
                        onChange={() =>
                          onComboDetailChange(
                            formikProps,
                            availableBundle.comboProductSfid,
                          )
                        }
                      />
                      <label htmlFor="payment-lg-retreat">
                        <span>{availableBundle.comboName}:</span>
                        <span className="d-flex">
                          {availableBundle.comboListPrice && (
                            <span className="discount">
                              ${availableBundle.comboListPrice}
                            </span>
                          )}{' '}
                          ${availableBundle.comboUnitPrice}
                        </span>
                      </label>
                    </div>
                    <div className="reciept__payment-tooltip">
                      {availableBundle.comboDescription || ''}
                    </div>
                  </>
                );
              })}
            </div>
          </>
        )}
      </>
    );
  }
  return (
    <>
      <div className="offer-box">
        {!afterCreditPricMessage && (
          <h2 className="title">
            <span className="icon-wrap">
              <img src="/img/stars-02.svg" width="20" height="20" alt="" />
            </span>
            Limited time offer
          </h2>
        )}

        {!isJourneyPremium && !isJourneyPlus && (
          <>
            <div className="offer-type">
              <div className="form-item radio">
                {isSilentRetreatType && (
                  <input
                    type="radio"
                    name="payment-type"
                    id="payment-lg-regular-card"
                    defaultChecked
                    checked={formikProps.values.priceType === 'regular'}
                    value="regular"
                    onChange={formikProps.handleChange('priceType')}
                  />
                )}

                <label htmlFor="payment-lg-regular-card">
                  <span className="radio-text">Regular Tuition:</span>
                  <span className="radio-value">
                    {delfee && <s>${delfee}</s>} {`$${fee}`}
                  </span>
                </label>
              </div>
            </div>
            {expenseAddOn?.unitPrice && (
              <div className="offer-type">
                <div className="form-item radio">
                  <label htmlFor="payment-lg-regular-card">
                    <span className="radio-text">Expense:</span>
                    <span className="radio-value">
                      {`$${expenseAddOn?.unitPrice}`}
                    </span>
                  </label>
                </div>
              </div>
            )}
            {expenseAddOn?.unitPrice && !hasGroupedAddOnProducts && (
              <div className="note">Note: *Expense includes meals</div>
            )}
            {!afterCreditPricMessage && isSilentRetreatType && (
              <div className="offer-type">
                <div className="form-item radio">
                  <input
                    type="radio"
                    name="priceType"
                    id="payment-lg-premium-card"
                    checked={formikProps.values.priceType === 'premium'}
                    value="premium"
                    onChange={formikProps.handleChange('priceType')}
                  />
                  <label htmlFor="payment-lg-premium-card">
                    <span className="radio-text">
                      Premium/Journey+ Tuition:
                    </span>
                    <span className="radio-value">
                      {premiumRate &&
                        premiumRate.listPrice &&
                        premiumRate.listPrice !== premiumRate.unitPrice && (
                          <s>${delfee || premiumRate.listPrice}</s>
                        )}{' '}
                      ${premiumRate.unitPrice} +expenses
                    </span>
                  </label>
                </div>
                <div className="offer-additions">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: subscriptionDetails?.description,
                    }}
                  ></div>
                </div>
              </div>
            )}
            {afterCreditPricMessage && (
              <div className="credit-text">
                {afterCreditPricMessage} ${fee}.
              </div>
            )}

            {!isJourneyPremium &&
              !isBasicMember &&
              !isJourneyPlus &&
              !afterCreditPricMessage &&
              isSilentRetreatType && (
                <div className="offer-action">
                  <button
                    className="btn-submit"
                    onClick={openSubscriptionPaywallPage(
                      MEMBERSHIP_TYPES.JOURNEY_PLUS.value,
                    )}
                    disabled={formikProps.values.priceType === 'regular'}
                  >
                    Join Journey+
                  </button>
                </div>
              )}
          </>
        )}
        {(isJourneyPremium || isJourneyPlus) && (
          <>
            <div className="offer-type">
              <div className="form-item radio">
                <label htmlFor="payment-lg-regular">
                  <span className="radio-text">
                    {!afterCreditPricMessage && !isSilentRetreatType
                      ? 'Regular Tuition'
                      : 'Premium/Journey+ Tuition'}
                    :
                  </span>
                  <span className="radio-value">
                    {discount && discount.newPrice && (
                      <>
                        <s> ${discount.oldPrice}</s>
                        {(addOnProducts?.length > 0 ||
                          hasGroupedAddOnProducts) &&
                          `$${discount.newPrice} ${
                            afterCreditPricMessage &&
                            isSilentRetreatType &&
                            '+expenses'
                          }`}
                      </>
                    )}
                    {!discount && premiumRate && (
                      <>
                        {premiumRate &&
                          premiumRate.listPrice &&
                          premiumRate.listPrice !== premiumRate.unitPrice && (
                            <s>${delfee || premiumRate.listPrice}</s>
                          )}
                        {addOnProducts?.length > 0 || hasGroupedAddOnProducts
                          ? `$${premiumRate.unitPrice} +expenses`
                          : `$${premiumRate.unitPrice}`}
                      </>
                    )}
                  </span>
                </label>
              </div>
            </div>
            {hasGroupedAddOnProducts && (
              <div className="note">Note: *Expense includes meals</div>
            )}
            {afterCreditPricMessage && (
              <div className="credit-text">
                {afterCreditPricMessage} ${fee}.
              </div>
            )}
          </>
        )}
      </div>
      <div className="room-board-pricing">
        {hasGroupedAddOnProducts && (
          <>
            <div className="form-item">
              <label>Expense Type {isOfflineExpense && '*'}</label>

              <select
                placeholder="Select Expense Type"
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  const selectedObject = groupedAddOnProducts[
                    'Residential Add On'
                  ].find(
                    (residentialAddOn) =>
                      residentialAddOn.priceBookEntryId === selectedValue,
                  );
                  onAccommodationChange(formikProps, selectedObject);
                }}
                value={
                  formikProps.values?.accommodation?.priceBookEntryId ?? null
                }
              >
                <option value="">Select Expense Type</option>

                {groupedAddOnProducts['Residential Add On'].map(
                  (residentialAddOn) => {
                    return (
                      <option
                        value={residentialAddOn.priceBookEntryId}
                        key={residentialAddOn.priceBookEntryId}
                      >
                        {residentialAddOn.productName}
                        {residentialAddOn.isFull && 'Full'} $
                        {residentialAddOn.unitPrice +
                          (expenseAddOn?.unitPrice || 0)}
                      </option>
                    );
                  },
                )}
              </select>
              <h6 className="room__board__sub-heading">
                *Expense includes meals
              </h6>
            </div>
          </>
        )}
        {isOfflineExpense && (
          <div className="reciept__payment-tooltip reciept__payment-tooltip_small">
            * Expences to be collected offline
          </div>
        )}
        {formikProps.errors.accommodation &&
          formikProps.touched.accommodation && (
            <div className="agreement__important">
              <img
                className="agreement__important-icon"
                src="/img/warning.svg"
                alt="warning"
              />
              Please select expense type in order to continue
            </div>
          )}
      </div>
    </>
  );
};

export default CostDetailsCardNewCheckout;
