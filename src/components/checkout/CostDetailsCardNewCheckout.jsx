import { COURSE_TYPES, MEMBERSHIP_TYPES, PAYMENT_TYPES } from '@constants';
import classNames from 'classnames';
import { Field } from 'formik';

export const CostDetailsCardNewCheckout = ({
  workshop,
  formikProps,
  fee,
  delfee,
  offering,
  showCouponCodeField,
  userSubscriptions,
  hasGroupedAddOnProducts,
  discount,
  isComboDetailAvailable,
  isCourseOptionRequired,
  isOfflineExpense,
  openSubscriptionPaywallPage,
  totalFee,
  isUsableCreditAvailable,
  UpdatedFeeAfterCredits,
  onAccommodationChange,
  cmeAddOn,
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
    isEarlyBirdAllowed,
    premiumRate,
    usableCredit,
    addOnProducts,
    groupedAddOnProducts,
    instalmentAmount,
    instalmentTenure,
    instalmentGapUnit,
    instalmentGap,
    availableBundles,
  } = workshop || {};
  console.log('premiumRate', premiumRate);
  console.log('delfee', delfee);

  const expenseAddOn = addOnProducts.find((product) => product.isExpenseAddOn);

  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(productTypeId) >= 0;
  const isMeditationDeluxe =
    COURSE_TYPES.MEDITATION_DELUXE_COURSE.value === productTypeId;
  const gatewayToInfinity =
    COURSE_TYPES.GATEWAY_TO_INFINITY_COURSE.value === productTypeId;
  const isJourneyPremium =
    !!userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PREMIUM.value];
  const isJourneyPlus =
    !!userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PLUS.value];
  const isBasicMember =
    !!userSubscriptions[MEMBERSHIP_TYPES.BASIC_MEMBERSHIP.value];

  console.log('isUsableCreditAvailable', isUsableCreditAvailable);
  console.log('adddd', addOnProducts);

  if (gatewayToInfinity) {
    return (
      <div className="reciept reciept--box d-none d-lg-block">
        <div className="reciept__header">
          <h2 class="title">
            <span class="icon-wrap">
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

  const isPremiumPriceType = formikProps?.values?.priceType === 'premium';

  return (
    <>
      <div class="offer-box">
        <h2 class="title">
          <span class="icon-wrap">
            <img src="/img/stars-02.svg" width="20" height="20" alt="" />
          </span>

          {delfee
            ? `Limited time offer: $${
                isPremiumPriceType ? premiumRate.unitPrice || fee : fee
              }`
            : 'Limited time offer'}
        </h2>

        {!isJourneyPremium && !isJourneyPlus && (
          <>
            <div class="form-item radio">
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
                <span class="radio-text">Regular Tuition:</span>
                <span class="radio-value">
                  {delfee && <s>${delfee}</s>} {`$${fee}`}
                </span>
              </label>
            </div>
            {!isUsableCreditAvailable && isSilentRetreatType && (
              <div class="form-item radio">
                <input
                  type="radio"
                  name="priceType"
                  id="payment-lg-premium-card"
                  checked={formikProps.values.priceType === 'premium'}
                  value="premium"
                  onChange={formikProps.handleChange('priceType')}
                />
                <label htmlFor="payment-lg-premium-card">
                  <span class="radio-text">Premium/Journey+ Tuition:</span>
                  <span class="radio-value">
                    {premiumRate &&
                      premiumRate.listPrice &&
                      premiumRate.listPrice !== premiumRate.unitPrice && (
                        <s>${delfee || premiumRate.listPrice}</s>
                      )}{' '}
                    ${premiumRate.unitPrice}
                  </span>
                </label>
              </div>
            )}
            {isUsableCreditAvailable && (
              <div className="credit-text">
                {usableCredit.message} ${UpdatedFeeAfterCredits}.
              </div>
            )}

            <ul>
              {addOnProducts.map((product) => {
                if (
                  !product.isExpenseAddOn ||
                  (product.isExpenseAddOn && !hasGroupedAddOnProducts)
                ) {
                  const isChecked = product.isAddOnSelectionRequired
                    ? true
                    : formikProps.values[product.productName];
                  return (
                    <li key={product.productSfid}>
                      <span>
                        {!product.isAddOnSelectionRequired && (
                          <input
                            type="checkbox"
                            className="custom-checkbox"
                            placeholder=" "
                            checked={isChecked}
                            onChange={() =>
                              formikProps.setFieldValue(
                                product.productName,
                                !isChecked,
                              )
                            }
                            value={product.productName}
                            name={product.productName}
                            id={product.productSfid}
                            disabled={product.isAddOnSelectionRequired}
                          />
                        )}
                        <label htmlFor={product.productSfid}></label>
                        <span className="ml-2">{product.productName}:</span>
                      </span>
                      <span className="ml-2">${product.unitPrice}</span>
                    </li>
                  );
                }
              })}

              {!isJourneyPremium &&
                !isBasicMember &&
                !isJourneyPlus &&
                !isUsableCreditAvailable &&
                isSilentRetreatType && (
                  <li className="journey-button-new">
                    <button
                      className="btn-outline"
                      onClick={openSubscriptionPaywallPage(
                        MEMBERSHIP_TYPES.JOURNEY_PLUS.value,
                      )}
                    >
                      Join Journey+
                    </button>
                  </li>
                )}
            </ul>
          </>
        )}
        {(isJourneyPremium || isJourneyPlus) && (
          <>
            <div class="form-item radio">
              <label htmlFor="payment-lg-regular">
                <span class="radio-text">
                  {!isUsableCreditAvailable && !isSilentRetreatType
                    ? 'Regular Tuition'
                    : 'Premium/Journey+ Tuition'}
                  :
                </span>
                <span class="radio-value">
                  {discount && discount.newPrice && (
                    <>
                      <s> ${discount.oldPrice}</s>
                      {(addOnProducts?.length > 0 || hasGroupedAddOnProducts) &&
                        `${discount.newPrice} +expenses`}
                    </>
                  )}
                  {!discount && premiumRate && (
                    <>
                      {premiumRate &&
                        premiumRate.listPrice &&
                        premiumRate.listPrice !== premiumRate.unitPrice && (
                          <s>${delfee || premiumRate.listPrice}</s>
                        )}
                      {premiumRate.listPrice === premiumRate.unitPrice &&
                        `$${premiumRate.unitPrice}`}
                      {(addOnProducts?.length > 0 || hasGroupedAddOnProducts) &&
                        `$${premiumRate.unitPrice} +expenses`}
                    </>
                  )}
                </span>
              </label>
            </div>
            {hasGroupedAddOnProducts && (
              <div class="note">Note: *Expense includes meals</div>
            )}

            {isUsableCreditAvailable && (
              <div className="credit-text">
                {usableCredit.message} ${UpdatedFeeAfterCredits}.
              </div>
            )}

            <ul>
              {addOnProducts.map((product) => {
                if (
                  !product.isExpenseAddOn ||
                  (product.isExpenseAddOn && !hasGroupedAddOnProducts)
                ) {
                  const isChecked = product.isAddOnSelectionRequired
                    ? true
                    : formikProps.values[product.productName];

                  return (
                    <li key={product.productSfid}>
                      <span>
                        {!product.isAddOnSelectionRequired && (
                          <input
                            type="checkbox"
                            className="custom-checkbox"
                            placeholder=" "
                            checked={isChecked}
                            onChange={() =>
                              formikProps.setFieldValue(
                                product.productName,
                                !isChecked,
                              )
                            }
                            value={product.productName}
                            name={product.productName}
                            id={product.productSfid}
                            disabled={product.isAddOnSelectionRequired}
                          />
                        )}
                        <label htmlFor={product.productSfid}></label>
                        <span className="ml-2">{product.productName}:</span>
                      </span>
                      <span className="ml-2">${product.unitPrice}</span>
                    </li>
                  );
                }
              })}
            </ul>
          </>
        )}
      </div>
      <div className="room-board-pricing">
        {hasGroupedAddOnProducts && (
          <>
            <div class="form-item">
              <label>Expense Type {isOfflineExpense && '*'}</label>
              <h6 className="room__board__sub-heading">
                *Expense includes meals
              </h6>

              <select
                placeholder="Select Expense Type"
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  console.log('selectedValue', selectedValue);
                  // Find the selected object based on the identifier
                  const selectedObject = groupedAddOnProducts[
                    'Residential Add On'
                  ].find(
                    (residentialAddOn) =>
                      residentialAddOn.priceBookEntryId === selectedValue,
                  );
                  console.log(selectedObject);
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
                        key={residentialAddOn.unitPrice}
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
            </div>
          </>
        )}
        {isOfflineExpense && (
          <div className="reciept__payment-tooltip reciept__payment-tooltip_small">
            * Expences to be collected offline
          </div>
        )}
      </div>
    </>
  );
};

export default CostDetailsCardNewCheckout;
