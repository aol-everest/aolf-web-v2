import React, { Fragment } from "react";
import { Field, ErrorMessage } from "formik";
import classNames from "classnames";
import { COURSE_TYPES, MEMBERSHIP_TYPES } from "@constants";

export const CourseOptions = ({
  workshop,
  fee,
  delfee,
  hasGroupedAddOnProducts,
  totalFee,
  formikProps,
  userSubscriptions,
  openSubscriptionPaywallPage,
}) => {
  const {
    premiumRate,
    productTypeId,
    isEarlyBirdAllowed,
    isInstalmentAllowed,
    groupedAddOnProducts,
    addOnProducts = [],
  } = workshop;
  return (
    <>
      <div className="order__card__payment d-block d-lg-none">
        <h6 className="order__card__payment-title">Course options</h6>

        {!isInstalmentAllowed && (
          <>
            {`${COURSE_TYPES.SILENT_RETREAT}`.indexOf(productTypeId) >= 0 && (
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
                {!userSubscriptions.hasOwnProperty(
                  MEMBERSHIP_TYPES.JOURNEY_PREMIUM,
                ) &&
                  !userSubscriptions.hasOwnProperty(
                    MEMBERSHIP_TYPES.JOURNEY_PLUS,
                  ) && (
                    <ul className="reciept__payment_list">
                      <div className="reciept__payment-option">
                        <input
                          className="custom-radio"
                          type="radio"
                          name="payment-type"
                          id="payment-lg-regular-card"
                          value="regular"
                          defaultChecked
                          onChange={handlePriceTypeChange}
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
                          name="payment-type"
                          id="payment-lg-premium-card"
                          value="premium"
                          onChange={handlePriceTypeChange}
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
                                    className="custom-checkbox"
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
                      {!userSubscriptions.hasOwnProperty(
                        MEMBERSHIP_TYPES.JOURNEY_PREMIUM,
                      ) &&
                        !userSubscriptions.hasOwnProperty(
                          MEMBERSHIP_TYPES.BASIC_MEMBERSHIP,
                        ) &&
                        !userSubscriptions.hasOwnProperty(
                          MEMBERSHIP_TYPES.JOURNEY_PLUS,
                        ) && (
                          <li className="btn-item">
                            <button
                              className="btn-outline"
                              onClick={openSubscriptionPaywallPage(
                                MEMBERSHIP_TYPES.JOURNEY_PLUS,
                              )}
                            >
                              Join Journey+
                            </button>
                          </li>
                        )}
                    </ul>
                  )}
                {(userSubscriptions.hasOwnProperty(
                  MEMBERSHIP_TYPES.JOURNEY_PREMIUM,
                ) ||
                  userSubscriptions.hasOwnProperty(
                    MEMBERSHIP_TYPES.JOURNEY_PLUS,
                  )) && (
                  <ul className="reciept__payment_list">
                    <li>
                      <span>Premium/Journey+ rate:</span>
                      {discount && discount.newPrice && (
                        <span>
                          <span className="discount">${discount.oldPrice}</span>{" "}
                          ${discount.newPrice}
                        </span>
                      )}
                      {discount === null && premiumRate && (
                        <span>
                          {premiumRate &&
                            premiumRate.listPrice &&
                            premiumRate.listPrice !== premiumRate.unitPrice && (
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
                                  className="custom-checkbox"
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

            {`${COURSE_TYPES.SILENT_RETREAT}`.indexOf(productTypeId) < 0 && (
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
                                className="custom-checkbox"
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
                    <div className="select-room__value">
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
  );
};
