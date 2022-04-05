import React, { Fragment } from "react";
import classNames from "classnames";
import { Field } from "formik";
import { COURSE_TYPES, MEMBERSHIP_TYPES, PAYMENT_TYPES } from "@constants";

export const MobileCourseOptions = ({
  expenseAddOn,
  isOfflineExpense,
  workshop,
  fee,
  delfee,
  hasGroupedAddOnProducts,
  totalFee,
  formikProps,
  userSubscriptions,
  openSubscriptionPaywallPage,
  discount,
  showCouponCodeField,
  paymentOptionChange,
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
    addOnProducts = [],
  } = workshop;
  const isSKYType =
    COURSE_TYPES.SKY_BREATH_MEDITATION.value.indexOf(productTypeId) >= 0;
  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(productTypeId) >= 0;
  const isSahajSamadhiMeditationType =
    COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.value.indexOf(productTypeId) >= 0;
  const isJourneyPremium =
    userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PREMIUM.value];
  const isJourneyPlus = userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PLUS.value];
  const isBasicMember =
    userSubscriptions[MEMBERSHIP_TYPES.BASIC_MEMBERSHIP.value];
  return (
    <>
      <>
        <div className="order__card__payment d-block d-lg-none">
          <h6 className="order__card__payment-title">Course options</h6>

          {!isInstalmentAllowed && (
            <>
              {isSilentRetreatType && (
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
                          checked={formikProps.values.priceType === "regular"}
                          onChange={formikProps.handleChange("priceType")}
                        />
                        <label htmlFor="payment-lg-regular-card">
                          <span>Regular rate</span>
                          <span>
                            {delfee && (
                              <span className="discount">${delfee}</span>
                            )}{" "}
                            ${fee}
                          </span>
                        </label>
                      </div>
                      <div className="reciept__payment-option">
                        <input
                          className="custom-radio"
                          type="radio"
                          name="priceType"
                          id="payment-lg-premium-card"
                          checked={formikProps.values.priceType === "premium"}
                          value="premium"
                          onChange={formikProps.handleChange("priceType")}
                        />
                        <label htmlFor="payment-lg-premium-card">
                          <span>Premium/Journey+ rate:</span>
                          <span>
                            {premiumRate &&
                              premiumRate.listPrice &&
                              premiumRate.listPrice !==
                                premiumRate.unitPrice && (
                                <span className="discount">
                                  ${delfee || premiumRate.listPrice}
                                </span>
                              )}{" "}
                            ${premiumRate.unitPrice}
                          </span>
                        </label>
                      </div>
                      {addOnProducts.map((product) => {
                        if (
                          !product.isExpenseAddOn ||
                          (product.isExpenseAddOn && !hasGroupedAddOnProducts)
                        ) {
                          const isChecked = product.isAddOnSelectionRequired
                            ? true
                            : formikProps.values[product.productName];
                          return (
                            <li>
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
                                <span className="ml-2">
                                  {product.productName} Required:
                                </span>
                              </span>
                              <span className="ml-2">${product.unitPrice}</span>
                            </li>
                          );
                        }
                      })}
                      {!isJourneyPremium && !isBasicMember && !isJourneyPlus && (
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
                        <span>Premium/Journey+ rate:</span>
                        {discount && discount.newPrice && (
                          <span>
                            <span className="discount">
                              ${discount.oldPrice}
                            </span>{" "}
                            ${discount.newPrice}
                          </span>
                        )}
                        {discount === null && premiumRate && (
                          <span>
                            {premiumRate &&
                              premiumRate.listPrice &&
                              premiumRate.listPrice !==
                                premiumRate.unitPrice && (
                                <span className="discount">
                                  ${delfee || premiumRate.listPrice}
                                </span>
                              )}{" "}
                            ${premiumRate.unitPrice}
                          </span>
                        )}
                      </li>
                      {addOnProducts.map((product) => {
                        if (
                          !product.isExpenseAddOn ||
                          (product.isExpenseAddOn && !hasGroupedAddOnProducts)
                        ) {
                          const isChecked = product.isAddOnSelectionRequired
                            ? true
                            : formikProps.values[product.productName];

                          return (
                            <li>
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
                                <span className="ml-2">
                                  {product.productName} Required:
                                </span>
                              </span>
                              <span className="ml-2">${product.unitPrice}</span>
                            </li>
                          );
                        }
                      })}
                    </ul>
                  )}
                </div>
              )}

              {!isSilentRetreatType && (
                <>
                  <div className="reciept__header_v1 full-padding">
                    {delfee && (
                      <>
                        <h1 className="title reciept__title_v1">
                          Limited Time Offer: ${fee}
                        </h1>
                        <p className="price">
                          Regular Course Fee:{" "}
                          <span className="discount">${delfee}</span>
                        </p>
                      </>
                    )}
                    {!delfee && <p className="price">Course Fee: ${fee}</p>}
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
                          <li>
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
                              <span className="ml-2">
                                {product.productName} Required:
                              </span>
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
          )}
        </div>

        {hasGroupedAddOnProducts && (
          <div className="order__card__payment d-block d-lg-none">
            <h6 className="order__card__payment-title">
              Room &amp; Board {isOfflineExpense && "*"}
            </h6>
            <div
              className={classNames("select-room", {
                "no-valid":
                  formikProps.errors.accommodation &&
                  formikProps.touched.accommodation,
              })}
            >
              <div tabIndex="1" className="select-room__current">
                <span className="select-room__placeholder">
                  Select Room &amp; Board
                </span>
                {groupedAddOnProducts["Residential Add On"].map(
                  (residentialAddOn) => {
                    return (
                      <div
                        className="select-room__value"
                        key={residentialAddOn.productSfid}
                      >
                        <input
                          type="radio"
                          id={`${residentialAddOn.productSfid}-card`}
                          value={residentialAddOn.unitPrice}
                          name="room"
                          className="select-room__input"
                        />
                        <span className="select-room__input-text">
                          {residentialAddOn.productName}{" "}
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
                {groupedAddOnProducts["Residential Add On"].map(
                  (residentialAddOn) => {
                    return (
                      <li
                        key={residentialAddOn.productSfid}
                        onClick={() =>
                          this.handleAccommodationChange(
                            formikProps,
                            residentialAddOn,
                          )
                        }
                      >
                        <label
                          htmlFor={`${residentialAddOn.productSfid}-card`}
                          aria-hidden="aria-hidden"
                          data-value={residentialAddOn.unitPrice}
                          className="select-room__option"
                        >
                          <span>{residentialAddOn.productName}</span>
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
            {isOfflineExpense && (
              <div className="reciept__payment-tooltip reciept__payment-tooltip_small">
                * Expences to be collected offline
              </div>
            )}
          </div>
        )}
        <div className="order__card__total d-lg-none">
          <span>Total</span>
          <span>${totalFee}</span>
        </div>
      </>
      {isInstalmentAllowed && (
        <div className="order__card__payment d-block d-lg-none">
          <h6 className="order__card__payment-title">Payment Options</h6>
          <div className="order__card__payment-option">
            <Field
              className={classNames("form-check-input radio", {
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
            <label for="payment-full">
              Pay in full <span>${fee}</span>
            </label>
          </div>
          <div class="order__card__payment-option">
            <Field
              className={classNames("form-check-input radio", {
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
            <label for="payment-later">
              Pay later <span>${instalmentAmount} today</span>
            </label>
          </div>
          <div className="order__card__payment-tooltip">
            Pay in {instalmentTenure} X ${instalmentAmount} interest-free
            payments every {instalmentGap} {instalmentGapUnit}(s), starting
            today
          </div>
          {!showCouponCodeField && (
            <div className="mt-1 reciept__more word-wrap text-justify">
              Pay later is currently only available for SKY
            </div>
          )}
        </div>
      )}
    </>
  );
};
