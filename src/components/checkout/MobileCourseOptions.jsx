import { COURSE_TYPES, MEMBERSHIP_TYPES, PAYMENT_TYPES } from '@constants';
import classNames from 'classnames';
import { Field } from 'formik';

export const MobileCourseOptions = ({
  expenseAddOn,
  isOfflineExpense,
  workshop,
  fee,
  delfee,
  hasGroupedAddOnProducts,
  formikProps,
  userSubscriptions,
  openSubscriptionPaywallPage,
  discount,
  showCouponCodeField,
  paymentOptionChange,
  isUsableCreditAvailable,
  UpdatedFeeAfterCredits,
  isComboDetailAvailable,
  values,
  onComboDetailChange,
  onAccommodationChange,
  totalFee,
}) => {
  const {
    premiumRate,
    productTypeId,
    isEarlyBirdAllowed,
    isInstalmentAllowed,
    instalmentTenure,
    instalmentGapUnit,
    instalmentGap,
    instalmentAmount,
    groupedAddOnProducts,
    usableCredit,
    addOnProducts = [],
    id,
    title,
    availableBundles,
  } = workshop;

  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(productTypeId) >= 0;
  const gatewayToInfinity =
    COURSE_TYPES.GATEWAY_TO_INFINITY_COURSE.value === productTypeId;
  const isMeditationDeluxe =
    COURSE_TYPES.MEDITATION_DELUXE_COURSE.value === productTypeId;
  const isJourneyPremium =
    userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PREMIUM.value];
  const isJourneyPlus = userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PLUS.value];
  const isBasicMember =
    userSubscriptions[MEMBERSHIP_TYPES.BASIC_MEMBERSHIP.value];

  if (isInstalmentAllowed) {
    return (
      <div className="order__card__payment d-block d-lg-none">
        <h6 className="order__card__payment-title">Payment Options</h6>
        <div className="order__card__payment-option">
          <Field
            className={classNames('form-check-input radio', {
              error:
                formikProps.errors.paymentOption &&
                formikProps.touched.paymentOption,
            })}
            type="radio"
            name="paymentOption"
            checked={formikProps.values.paymentOption === PAYMENT_TYPES.FULL}
            value={PAYMENT_TYPES.FULL}
            onChange={() =>
              paymentOptionChange(formikProps, PAYMENT_TYPES.FULL)
            }
          />
          <label htmlFor="payment-full">
            Pay in full <span>${fee}</span>
          </label>
        </div>
        <div className="order__card__payment-option">
          <Field
            className={classNames('form-check-input radio', {
              error:
                formikProps.errors.paymentOption &&
                formikProps.touched.paymentOption,
            })}
            type="radio"
            name="paymentOption"
            checked={formikProps.values.paymentOption === PAYMENT_TYPES.LATER}
            value={PAYMENT_TYPES.LATER}
            disabled={!showCouponCodeField}
            onChange={() =>
              paymentOptionChange(formikProps, PAYMENT_TYPES.LATER)
            }
          />
          <label htmlFor="payment-later">
            Pay later <span>${instalmentAmount} today</span>
          </label>
        </div>
        <div className="order__card__payment-tooltip">
          Pay in {instalmentTenure} X ${instalmentAmount} interest-free payments
          every {instalmentGap} {instalmentGapUnit}(s), starting today
        </div>
        {!showCouponCodeField && (
          <div className="mt-1 reciept__more word-wrap text-justify">
            Pay later is currently only available for SKY
          </div>
        )}
      </div>
    );
  }
  if (isComboDetailAvailable) {
    return (
      <div className="reciept__payment reciept__header d-block d-lg-none">
        <div className="reciept__payment-option">
          <input
            className="custom-radio"
            type="radio"
            name="payment"
            id={id}
            checked={values.comboDetailId ? values.comboDetailId === id : true}
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
    );
  }
  // if (!isCourseOptionRequired) {
  return (
    <div className="order__card__payment d-block d-lg-none">
      <>
        {isMeditationDeluxe && (
          <div className="reciept reciept--box d-none d-lg-block">
            <div className="reciept__header">
              <p className="reciept__item reciept__item_main font-weight-normal">
                <span>
                  <img src="/img/ic-timer.svg" alt="timer" />
                  Limited Time Offer
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
                “I used to suffer from anxiety and my health was greatly
                affected by it. I feel so free and light now.”
                <span className="d-block mt-3 font-normal">- Millie I.</span>
              </p>
            </div>

            <div className="reciept__more">
              Additional Notes: Housing will be offsite. Please contact the
              course coordinator for details, and to make arrangements.
              <a href="#">See more</a>
            </div>
          </div>
        )}
        {gatewayToInfinity && (
          <div className="reciept reciept--box d-none d-lg-block">
            <div className="reciept__header">
              <p className="reciept__item reciept__item_main font-weight-normal">
                <span>
                  <img src="/img/ic-timer.svg" alt="timer" />
                  Limited Time Offer
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
                “I used to suffer from anxiety and my health was greatly
                affected by it. I feel so free and light now.”
                <span className="d-block mt-3 font-normal">- Millie I.</span>
              </p>
            </div>

            <div className="reciept__more">
              Additional Notes: Housing will be offsite. Please contact the
              course coordinator for details, and to make arrangements.
              <a href="#">See more</a>
            </div>
          </div>
        )}
        {isSilentRetreatType ? (
          <div className="mobile_board">
            {!isEarlyBirdAllowed && (
              <h1 className="title reciept__item reciept__item_main">
                <span>Register</span>
              </h1>
            )}
            {isEarlyBirdAllowed && (
              <p className="reciept__item reciept__item_main">
                <span>
                  <img src="/img/ic-timer.svg" alt="timer" />
                  Limited Time Offer:
                </span>
              </p>
            )}
            {!isJourneyPremium && !isJourneyPlus && (
              <ul className="reciept__payment_list">
                <div className="reciept__payment-option">
                  <input
                    className="custom-radio"
                    type="radio"
                    name="priceType"
                    id="payment-lg-regular-card"
                    value="regular"
                    checked={formikProps.values.priceType === 'regular'}
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
                              className="custom-checkbox tw-w-auto"
                              placeholder=" "
                              checked={isChecked}
                              onChange={formikProps.handleChange(
                                product.productName,
                              )}
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
                              className="custom-checkbox tw-w-auto"
                              placeholder=" "
                              checked={isChecked}
                              onChange={formikProps.handleChange(
                                product.productName,
                              )}
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

            {hasGroupedAddOnProducts && (
              <>
                <h6 className="room__board__title mt-4">
                  Expense Type {isOfflineExpense && '*'}
                </h6>
                <h6 className="room__board__sub-heading">
                  *Expense includes meals
                </h6>
                <div
                  className={classNames('select-room select-room_rounded', {
                    'no-valid':
                      formikProps.errors.accommodation &&
                      formikProps.touched.accommodation,
                  })}
                >
                  <div tabIndex="1" className="select-room__current">
                    <span className="select-room__placeholder">
                      Select Expense Type
                    </span>
                    {groupedAddOnProducts['Residential Add On'].map(
                      (residentialAddOn) => {
                        return (
                          <div
                            className="select-room__value"
                            key={residentialAddOn.productSfid}
                          >
                            <input
                              type="radio"
                              id={residentialAddOn.productSfid}
                              value={residentialAddOn.unitPrice}
                              name="room-lg"
                              checked={
                                formikProps.values?.accommodation
                                  ?.productSfid === residentialAddOn.productSfid
                              }
                              className="select-room__input"
                            />
                            <span className="select-room__input-text">
                              {residentialAddOn.productName}{' '}
                              <span className="price">
                                $
                                {residentialAddOn.unitPrice +
                                  (expenseAddOn?.unitPrice || 0)}
                              </span>
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                  <ul className="select-room__list">
                    {groupedAddOnProducts['Residential Add On'].map(
                      (residentialAddOn) => {
                        return (
                          <li
                            key={residentialAddOn.productSfid}
                            onClick={() =>
                              onAccommodationChange(
                                formikProps,
                                residentialAddOn,
                              )
                            }
                            className={
                              residentialAddOn.isFull &&
                              'tw-pointer-events-none tw-opacity-60'
                            }
                          >
                            <label
                              htmlFor={residentialAddOn.productSfid}
                              aria-hidden="aria-hidden"
                              data-value={residentialAddOn.unitPrice}
                              className="select-room__option"
                            >
                              <span>{residentialAddOn.productName}</span>
                              {residentialAddOn.isFull && (
                                <span className="tw-dark:bg-gray-700 tw-dark:text-gray-500 tw-rounded tw-bg-gray-100 tw-px-2.5 tw-py-0.5 tw-text-xs tw-text-gray-800">
                                  Full
                                </span>
                              )}
                              <span className="price">
                                $
                                {residentialAddOn.unitPrice +
                                  (expenseAddOn?.unitPrice || 0)}
                              </span>
                            </label>
                          </li>
                        );
                      },
                    )}
                  </ul>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="reciept__header_v1 full-padding">
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

              {hasGroupedAddOnProducts && (
                <>
                  <h6 className="room__board__title mt-4">
                    Expense Type {isOfflineExpense && '*'}
                  </h6>
                  <h6 className="room__board__sub-heading">
                    *Expense includes meals
                  </h6>
                  <div
                    className={classNames('select-room select-room_rounded', {
                      'no-valid':
                        formikProps.errors.accommodation &&
                        formikProps.touched.accommodation,
                    })}
                  >
                    <div tabIndex="1" className="select-room__current">
                      <span className="select-room__placeholder">
                        Select Expense Type
                      </span>
                      {groupedAddOnProducts['Residential Add On'].map(
                        (residentialAddOn) => {
                          return (
                            <div
                              className="select-room__value"
                              key={residentialAddOn.productSfid}
                            >
                              <input
                                type="radio"
                                id={residentialAddOn.productSfid}
                                value={residentialAddOn.unitPrice}
                                name="room-lg"
                                checked={
                                  formikProps.values?.accommodation
                                    ?.productSfid ===
                                  residentialAddOn.productSfid
                                }
                                className="select-room__input"
                              />
                              <span className="select-room__input-text">
                                {residentialAddOn.productName}{' '}
                                <span className="price">
                                  $
                                  {residentialAddOn.unitPrice +
                                    (expenseAddOn?.unitPrice || 0)}
                                </span>
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                    <ul className="select-room__list">
                      {groupedAddOnProducts['Residential Add On'].map(
                        (residentialAddOn) => {
                          return (
                            <li
                              key={residentialAddOn.productSfid}
                              onClick={() =>
                                onAccommodationChange(
                                  formikProps,
                                  residentialAddOn,
                                )
                              }
                              className={
                                residentialAddOn.isFull &&
                                'tw-pointer-events-none tw-opacity-60'
                              }
                            >
                              <label
                                htmlFor={residentialAddOn.productSfid}
                                aria-hidden="aria-hidden"
                                data-value={residentialAddOn.unitPrice}
                                className="select-room__option"
                              >
                                <span>{residentialAddOn.productName}</span>
                                {residentialAddOn.isFull && (
                                  <span className="tw-dark:bg-gray-700 tw-dark:text-gray-500 tw-rounded tw-bg-gray-100 tw-px-2.5 tw-py-0.5 tw-text-xs tw-text-gray-800">
                                    Full
                                  </span>
                                )}
                                <span className="price">
                                  $
                                  {residentialAddOn.unitPrice +
                                    (expenseAddOn?.unitPrice || 0)}
                                </span>
                              </label>
                            </li>
                          );
                        },
                      )}
                    </ul>
                  </div>
                </>
              )}
            </div>
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
                            className="custom-checkbox tw-w-auto"
                            placeholder=" "
                            checked={isChecked}
                            onChange={formikProps.handleChange(
                              product.productName,
                            )}
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
      </>
      <div className="reciept__total">
        <span>Total</span>
        <span>${totalFee}</span>
      </div>
    </div>
  );
  // }
};
