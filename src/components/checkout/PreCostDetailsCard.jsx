import { COURSE_TYPES, MEMBERSHIP_TYPES, PAYMENT_TYPES } from '@constants';
import classNames from 'classnames';
import { Field } from 'formik';

export const PreCostDetailsCard = ({
  workshop,
  formikProps,
  fee,
  delfee,
  showCouponCodeField,
  userSubscriptions,
  hasGroupedAddOnProducts,
  discount,
  isComboDetailAvailable,
  isCourseOptionRequired,
  openSubscriptionPaywallPage,
  isUsableCreditAvailable,
  UpdatedFeeAfterCredits,
  values,
  onComboDetailChange,
  paymentOptionChange,
}) => {
  const {
    id,
    title,
    productTypeId,
    isInstalmentAllowed,
    instalmentTenure,
    instalmentGapUnit,
    instalmentGap,
    instalmentAmount,
    isEarlyBirdAllowed,
    premiumRate,
    usableCredit,
    addOnProducts,
    availableBundles,
  } = workshop || {};

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

  if (
    !isInstalmentAllowed &&
    !isComboDetailAvailable &&
    !isCourseOptionRequired
  ) {
    if (isMeditationDeluxe) {
      return (
        <div className="reciept reciept--box d-none d-lg-block">
          <div className="reciept__header">
            <p className="reciept__item reciept__item_main font-weight-normal">
              <span>
                <img src="/img/ic-timer.svg" alt="timer" />
              </span>
            </p>
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
            <p className="reciept__item reciept__item_main font-weight-normal">
              <span>
                <img src="/img/ic-timer.svg" alt="timer" />
              </span>
            </p>
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
              <h1 className="title reciept__item reciept__item_main">
                <span>Register</span>
              </h1>
            )}
            {isEarlyBirdAllowed && (
              <p className="reciept__item reciept__item_main">
                <span>
                  <img src="/img/ic-timer.svg" alt="timer" />
                </span>
              </p>
            )}
            {!isJourneyPremium && !isJourneyPlus && (
              <ul className="reciept__payment_list">
                <div className="reciept__payment-option">
                  <input
                    className="custom-radio"
                    type="radio"
                    name="payment-type"
                    id="payment-lg-regular-card"
                    defaultChecked
                    checked={formikProps.values.priceType === 'regular'}
                    value="regular"
                    onChange={formikProps.handleChange('priceType')}
                  />

                  <label htmlFor="payment-lg-regular-card">
                    <span>Regular Tuition</span>
                    <span>
                      {delfee && <span className="discount">${delfee}</span>} $
                      {fee}
                    </span>
                  </label>
                </div>
                {!isUsableCreditAvailable && (
                  <div className="reciept__payment-option">
                    <input
                      className="custom-radio"
                      type="radio"
                      name="priceType"
                      id="payment-lg-premium-card"
                      checked={formikProps.values.priceType === 'premium'}
                      value="premium"
                      onChange={formikProps.handleChange('priceType')}
                    />
                    <label htmlFor="payment-lg-premium-card">
                      <span>Premium/Journey+ Tuition:</span>
                      <span>
                        {premiumRate &&
                          premiumRate.listPrice &&
                          premiumRate.listPrice !== premiumRate.unitPrice && (
                            <span className="discount">
                              ${delfee || premiumRate.listPrice}
                            </span>
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
            )}
            {(isJourneyPremium || isJourneyPlus) && (
              <ul className="reciept__payment_list">
                <li>
                  <span>Premium/Journey+ Tuition:</span>
                  {discount && discount.newPrice && (
                    <span>
                      <span className="discount">${discount.oldPrice}</span> $
                      {discount.newPrice}
                    </span>
                  )}
                  {!discount && premiumRate && (
                    <span>
                      {premiumRate &&
                        premiumRate.listPrice &&
                        premiumRate.listPrice !== premiumRate.unitPrice && (
                          <span className="discount">
                            ${delfee || premiumRate.listPrice}
                          </span>
                        )}{' '}
                      ${premiumRate.unitPrice}
                    </span>
                  )}
                </li>
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
                <h1 className="title reciept__title_v1">
                  Limited Time Offer: ${fee}
                </h1>
                <p className="price">
                  Regular Course Fee:{' '}
                  <span className="discount">${delfee}</span>
                </p>
              </>
            )}
            {!delfee && <p className="price">Course Fee: ${fee}</p>}
          </div>
          {isUsableCreditAvailable && (
            <div className="credit-text">
              {usableCredit.message} ${UpdatedFeeAfterCredits}.
            </div>
          )}
          {addOnProducts && addOnProducts.length > 0 && (
            <ul className="reciept__payment_list">
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
                  {delfee && <span className="discount">${delfee}</span>} ${fee}
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

export default PreCostDetailsCard;
