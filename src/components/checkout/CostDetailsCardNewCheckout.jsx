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
  console.log('formikProps', formikProps);
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

  if (isCourseOptionRequired) {
    return (
      <>
        <div class="offer-box">
          {!isInstalmentAllowed && (
            <>
              {isSilentRetreatType && (
                <div>
                  {!isEarlyBirdAllowed && (
                    <h2 class="title">
                      <span class="icon-wrap">
                        <img
                          src="/img/stars-02.svg"
                          width="20"
                          height="20"
                          alt=""
                        />
                      </span>
                      Register:
                    </h2>
                  )}
                  {isEarlyBirdAllowed && (
                    <h2 class="title">
                      <span class="icon-wrap">
                        <img
                          src="/img/stars-02.svg"
                          width="20"
                          height="20"
                          alt=""
                        />
                      </span>
                      Limited time offer:
                    </h2>
                  )}
                  {!isJourneyPremium && !isJourneyPlus && (
                    <>
                      <div class="form-item radio">
                        <input
                          type="radio"
                          name="payment-type"
                          id="payment-lg-regular"
                          defaultChecked
                          checked={formikProps.values.priceType === 'regular'}
                          value="regular"
                          onChange={formikProps.handleChange('priceType')}
                        />
                        <label htmlFor="payment-lg-regular">
                          <span class="radio-text">Regular Tuition</span>
                          <span class="radio-value">
                            {delfee && <s>${delfee}</s>} ${fee}
                          </span>
                        </label>
                      </div>
                      {!isUsableCreditAvailable && (
                        <div class="form-item radio">
                          <input
                            type="radio"
                            name="priceType"
                            id="payment-lg-premium"
                            checked={formikProps.values.priceType === 'premium'}
                            value="premium"
                            onChange={formikProps.handleChange('priceType')}
                          />
                          <label htmlFor="payment-lg-premium">
                            <span class="radio-text">
                              Premium/Journey+ Tuition
                            </span>
                            <span class="radio-value">
                              {premiumRate &&
                                premiumRate.listPrice &&
                                premiumRate.listPrice !==
                                  premiumRate.unitPrice && (
                                  <s>${delfee || premiumRate.listPrice}</s>
                                )}{' '}
                              ${premiumRate.unitPrice}
                              {(addOnProducts || hasGroupedAddOnProducts) &&
                                `+expenses`}
                            </span>
                          </label>
                        </div>
                      )}

                      <ul className="!tw-p-0 !tw-py-2">
                        {isUsableCreditAvailable && (
                          <div className="credit-text">
                            {usableCredit.message} ${UpdatedFeeAfterCredits}.
                          </div>
                        )}
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
                                      disabled={
                                        product.isAddOnSelectionRequired
                                      }
                                    />
                                  )}
                                  <label htmlFor={product.productSfid}></label>
                                  <span className="ml-2">
                                    {product.productName}:
                                  </span>
                                </span>
                                <span className="ml-2">
                                  ${product.unitPrice}
                                </span>
                              </li>
                            );
                          }
                        })}
                        {!isJourneyPremium &&
                          !isBasicMember &&
                          !isJourneyPlus &&
                          !isUsableCreditAvailable && (
                            <li className="btn-item">
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
                            Premium/Journey+ Tuition
                          </span>
                          <span class="radio-value">
                            {discount && discount.newPrice && (
                              <>
                                <s> ${discount.oldPrice}</s>${discount.newPrice}
                                {(addOnProducts || hasGroupedAddOnProducts) &&
                                  `+expenses`}
                              </>
                            )}
                            {!discount && premiumRate && (
                              <>
                                {premiumRate &&
                                  premiumRate.listPrice &&
                                  premiumRate.listPrice !==
                                    premiumRate.unitPrice && (
                                    <s>${delfee || premiumRate.listPrice}</s>
                                  )}{' '}
                                ${premiumRate.unitPrice}
                                {(addOnProducts || hasGroupedAddOnProducts) &&
                                  `+expenses`}
                              </>
                            )}
                          </span>
                        </label>
                      </div>
                      <ul>
                        {isUsableCreditAvailable && (
                          <div className="credit-text">
                            {usableCredit.message} ${UpdatedFeeAfterCredits}.
                          </div>
                        )}
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
                                      disabled={
                                        product.isAddOnSelectionRequired
                                      }
                                    />
                                  )}
                                  <label htmlFor={product.productSfid}></label>
                                  <span className="ml-2">
                                    {product.productName}:
                                  </span>
                                </span>
                                <span className="ml-2">
                                  ${product.unitPrice}
                                </span>
                              </li>
                            );
                          }
                        })}
                      </ul>
                    </>
                  )}
                </div>
              )}

              {!isSilentRetreatType && (
                <>
                  <div>
                    {delfee && (
                      <>
                        <h2 class="title">
                          <span class="icon-wrap">
                            <img
                              src="/img/stars-02.svg"
                              width="20"
                              height="20"
                              alt=""
                            />
                          </span>
                          Limited time offer: ${fee}
                        </h2>

                        <div class="form-item radio">
                          <label>
                            <span class="radio-text">Regular Tuition</span>
                            <span class="radio-value">
                              <s>${delfee}</s>
                            </span>
                          </label>
                        </div>
                      </>
                    )}
                    {!delfee && (
                      <div class="form-item radio">
                        <label>
                          <span class="radio-text">Course Fee</span>
                          <span class="radio-value">${fee}</span>
                        </label>
                      </div>
                    )}
                  </div>
                  {isUsableCreditAvailable && (
                    <div className="credit-text">
                      {usableCredit.message} ${UpdatedFeeAfterCredits}.
                    </div>
                  )}

                  {addOnProducts && addOnProducts.length > 0 && (
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
                                <span className="ml-2">
                                  {product.productName}:
                                </span>
                              </span>
                              <span className="ml-2">${product.unitPrice}</span>
                            </li>
                          );
                        }
                      })}
                    </ul>
                  )}
                </>
              )}
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
                    console.log(e.target.value);
                    onAccommodationChange(formikProps, e.target.value);
                  }}
                  value={formikProps.values?.accommodation ?? null}
                >
                  <option disabled value={null}>
                    Select Expense Type
                  </option>
                  {groupedAddOnProducts['Residential Add On'].map(
                    (residentialAddOn) => {
                      return (
                        <option
                          value={residentialAddOn.unitPrice}
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
  }

  //Previousy Known as Post Cost Details Card

  if (
    !isInstalmentAllowed &&
    !isComboDetailAvailable &&
    !isCourseOptionRequired
  ) {
    if (isMeditationDeluxe) {
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
                <p className="font-weight-normal">Gateways to Infinity</p>
                <p className="font-weight-bold">
                  <span className="discount font-weight-bold">
                    [$590] [$90]
                  </span>{' '}
                  $0
                </p>
              </li>
              <li>
                <p className="font-weight-normal">
                  {COURSE_TYPES.SKY_BREATH_MEDITATION.name}
                </p>
                <p className="font-weight-bold">
                  {delfee && (
                    <span className="discount font-weight-bold">
                      [${delfee}]
                    </span>
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
              “I used to suffer from anxiety and my health was greatly affected
              by it. I feel so free and light now.”
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
                    <span className="discount font-weight-bold">
                      [${delfee}]
                    </span>
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
              “I used to suffer from anxiety and my health was greatly affected
              by it. I feel so free and light now.”
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
    if (isSilentRetreatType) {
      return (
        <>
          <div>
            {!isEarlyBirdAllowed && (
              <h2 class="title">
                <span class="icon-wrap">
                  <img src="/img/stars-02.svg" width="20" height="20" alt="" />
                </span>
                Register
              </h2>
            )}
            {isEarlyBirdAllowed && (
              <h2 class="title">
                <span class="icon-wrap">
                  <img src="/img/stars-02.svg" width="20" height="20" alt="" />
                </span>
                Limited time offer:
              </h2>
            )}
            {!isJourneyPremium && !isJourneyPlus && (
              <>
                <div class="form-item radio">
                  <input
                    type="radio"
                    name="payment-type"
                    id="payment-lg-regular-card"
                    defaultChecked
                    checked={formikProps.values.priceType === 'regular'}
                    value="regular"
                    onChange={formikProps.handleChange('priceType')}
                  />
                  <label htmlFor="payment-lg-regular-card">
                    <span class="radio-text">Regular Tuition</span>
                    <span class="radio-value">
                      {delfee && <s>${delfee}</s>} ${fee}
                    </span>
                  </label>
                </div>

                {!isUsableCreditAvailable && (
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
                    !isUsableCreditAvailable && (
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
                    <span class="radio-text">Premium/Journey+ Tuition:</span>
                    <span class="radio-value">
                      {discount && discount.newPrice && (
                        <>
                          <s> ${discount.oldPrice}</s>${discount.newPrice}
                          {(addOnProducts?.length > 0 ||
                            hasGroupedAddOnProducts) &&
                            `+expenses`}
                        </>
                      )}
                      {!discount && premiumRate && (
                        <>
                          {premiumRate &&
                            premiumRate.listPrice &&
                            premiumRate.listPrice !== premiumRate.unitPrice && (
                              <s>${delfee || premiumRate.listPrice}</s>
                            )}{' '}
                          ${premiumRate.unitPrice}
                          {(addOnProducts?.length > 0 ||
                            hasGroupedAddOnProducts) &&
                            `+expenses`}
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
        </>
      );
    } else {
      return (
        <>
          <div className="reciept__header_v1">
            {delfee && (
              <>
                <h2 class="title">
                  <span class="icon-wrap">
                    <img
                      src="/img/stars-02.svg"
                      width="20"
                      height="20"
                      alt=""
                    />
                  </span>
                  Limited time offer: ${fee}
                </h2>
                <div class="form-item radio">
                  <label>
                    <span class="radio-text">Regular Tuition</span>
                    <span class="radio-value">
                      <s>${delfee}</s>
                    </span>
                  </label>
                </div>
              </>
            )}
            {!delfee && (
              <div class="form-item radio">
                <label>
                  <span class="radio-text">Course Fee</span>
                  <span class="radio-value">${fee}</span>
                </label>
              </div>
            )}
          </div>
          {isUsableCreditAvailable && (
            <div className="credit-text">
              {usableCredit.message} ${UpdatedFeeAfterCredits}.
            </div>
          )}
          {addOnProducts && addOnProducts.length > 0 && (
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
                        <label htmlFor={workshop.productSfid}></label>
                        <span className="ml-2">{product.productName}:</span>
                      </span>
                      <span className="ml-2">${product.unitPrice}</span>
                    </li>
                  );
                }
              })}
            </ul>
          )}
        </>
      );
    }
  }
  return (
    <>
      {isInstalmentAllowed && (
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
      )}
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
};

export default CostDetailsCardNewCheckout;
