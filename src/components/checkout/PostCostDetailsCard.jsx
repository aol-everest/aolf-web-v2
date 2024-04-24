import { COURSE_TYPES, MEMBERSHIP_TYPES } from '@constants';
import classNames from 'classnames';
import { Fragment } from 'react';
import { FieldWrapper } from './FieldWrapper';
import { InputDropDown } from './InputDropDown';
import { StyledInput } from './StyledInput';

export const PostCostDetailsCard = ({
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
  ...rest
}) => {
  const {
    productTypeId,
    isInstalmentAllowed,
    isEarlyBirdAllowed,
    premiumRate,
    usableCredit,
    addOnProducts,
    groupedAddOnProducts,
  } = workshop || {};

  const expenseAddOn = addOnProducts.find((product) => product.isExpenseAddOn);

  const isSilentRetreatType =
    COURSE_TYPES.SILENT_RETREAT.value.indexOf(productTypeId) >= 0;
  const isJourneyPremium =
    userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PREMIUM.value];
  const isJourneyPlus = userSubscriptions[MEMBERSHIP_TYPES.JOURNEY_PLUS.value];
  const isBasicMember =
    userSubscriptions[MEMBERSHIP_TYPES.BASIC_MEMBERSHIP.value];
  if (isCourseOptionRequired) {
    return (
      <>
        <div className="room__board">
          <h6 className="room__board__title">Course Options</h6>
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
                    <ul className="reciept__payment_list !tw-p-0 !tw-py-2">
                      <div className="reciept__payment-option">
                        <input
                          className="custom-radio"
                          type="radio"
                          name="payment-type"
                          id="payment-lg-regular"
                          defaultChecked
                          checked={formikProps.values.priceType === 'regular'}
                          value="regular"
                          onChange={formikProps.handleChange('priceType')}
                        />
                        <label htmlFor="payment-lg-regular">
                          <span>Regular Tuition</span>
                          <span>
                            {delfee && (
                              <span className="discount">${delfee}</span>
                            )}{' '}
                            ${fee}
                          </span>
                        </label>
                      </div>
                      {!isUsableCreditAvailable && (
                        <div className="reciept__payment-option">
                          <input
                            className="custom-radio"
                            type="radio"
                            name="priceType"
                            id="payment-lg-premium"
                            checked={formikProps.values.priceType === 'premium'}
                            value="premium"
                            onChange={formikProps.handleChange('priceType')}
                          />
                          <label htmlFor="payment-lg-premium">
                            <span>Premium/Journey+ Tuition:</span>
                            <span>
                              {premiumRate &&
                                premiumRate.listPrice &&
                                premiumRate.listPrice !==
                                  premiumRate.unitPrice && (
                                  <span className="discount">
                                    ${delfee || premiumRate.listPrice}
                                  </span>
                                )}{' '}
                              ${premiumRate.unitPrice}
                              {(addOnProducts || hasGroupedAddOnProducts) &&
                                `+expenses`}
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
                                <span className="ml-2">
                                  {product.productName}:
                                </span>
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
                            <span className="discount">
                              ${discount.oldPrice}
                            </span>{' '}
                            ${discount.newPrice}
                            {(addOnProducts || hasGroupedAddOnProducts) &&
                              `+expenses`}
                          </span>
                        )}
                        {!discount && premiumRate && (
                          <span>
                            {premiumRate &&
                              premiumRate.listPrice &&
                              premiumRate.listPrice !==
                                premiumRate.unitPrice && (
                                <span className="discount">
                                  ${delfee || premiumRate.listPrice}
                                </span>
                              )}{' '}
                            ${premiumRate.unitPrice}
                            {(addOnProducts || hasGroupedAddOnProducts) &&
                              `+expenses`}
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
                </div>
              )}

              {!isSilentRetreatType && (
                <>
                  <div>
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
                    <>
                      <ul className="reciept__payment_list">
                        {addOnProducts.map((product) => {
                          if (
                            !product.isExpenseAddOn ||
                            (product.isExpenseAddOn && !hasGroupedAddOnProducts)
                          ) {
                            const isChecked = product.isAddOnSelectionRequired
                              ? true
                              : formikProps.values['CME'];

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
                                          'CME',
                                          !isChecked,
                                        )
                                      }
                                      value="CME"
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
                      {cmeAddOn && (
                        <>
                          <p className="tw-my-5 tw-ml-2 tw-text-[14px] tw-text-[#31364e]">
                            Please uncheck the box, if you do not want to claim
                            CME credits.
                          </p>

                          {formikProps.values['CME'] && (
                            <CMEInputCmp formikProps={formikProps} />
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </>
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
                <div tabIndex="2" className="select-room__current">
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
                              formikProps.values?.accommodation?.productSfid ===
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
                            onAccommodationChange(formikProps, residentialAddOn)
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
          {isOfflineExpense && (
            <div className="reciept__payment-tooltip reciept__payment-tooltip_small">
              * Expences to be collected offline
            </div>
          )}
        </div>
        <div className="reciept__total">
          <span>Total</span>
          <span>${totalFee}</span>
        </div>
      </>
    );
  }
  return null;
};

const CMEInputCmp = ({ formikProps }) => {
  const onPopupChangeEvent = (formikProps, field) => (value) => {
    formikProps.setFieldValue(field, value?.name || '');
  };
  return (
    <Fragment>
      <div className="order__card !tw-border-0 !tw-shadow-none !tw-p-2">
        <div className="d-flex w-50 justify-content-start">
          <FieldWrapper formikKey={'claimingType'} formikProps={formikProps}>
            <InputDropDown
              placeholder="CE Claiming type"
              formikProps={formikProps}
              formikKey="claimingType"
              closeEvent={onPopupChangeEvent(formikProps, 'claimingType')}
            >
              {({ closeHandler }) => (
                <>
                  <li
                    onClick={closeHandler({
                      name: 'Physician - MD',
                      value: 'Physician - MD',
                    })}
                  >
                    Physician - MD
                  </li>
                  <li
                    onClick={closeHandler({
                      name: 'Physician - DO',
                      value: 'Physician - DO',
                    })}
                  >
                    Physician - DO
                  </li>
                  <li
                    onClick={closeHandler({
                      name: 'Physician Assistant',
                      value: 'Physician Assistant',
                    })}
                  >
                    Physician Assistant
                  </li>
                  <li
                    onClick={closeHandler({
                      name: 'Physical Therapist',
                      value: 'Physical Therapist',
                    })}
                  >
                    Physical Therapist
                  </li>
                  <li
                    onClick={closeHandler({
                      name: 'Nurse',
                      value: 'Nurse',
                    })}
                  >
                    Nurse
                  </li>
                  <li
                    onClick={closeHandler({
                      name: 'Dentist',
                      value: 'Dentist',
                    })}
                  >
                    Dentist
                  </li>
                  <li
                    onClick={closeHandler({
                      name: 'Other',
                      value: 'Other',
                    })}
                  >
                    Other
                  </li>
                </>
              )}
            </InputDropDown>
          </FieldWrapper>
        </div>
        {formikProps.values['claimingType'] === 'Other' && (
          <StyledInput
            placeholder="Specify details (Other)"
            formikProps={formikProps}
            formikKey="contactClaimingTypeOther"
            fullWidth
          ></StyledInput>
        )}
        <div className="d-flex justify-content-start mt-lg-0">
          <FieldWrapper
            formikKey={'certificateOfAttendance'}
            formikProps={formikProps}
          >
            <InputDropDown
              placeholder="I would like to get the following"
              formikProps={formikProps}
              formikKey="certificateOfAttendance"
              closeEvent={onPopupChangeEvent(
                formikProps,
                'certificateOfAttendance',
              )}
            >
              {({ closeHandler }) => (
                <>
                  <li
                    onClick={closeHandler({
                      name: 'CE Credits',
                      value: 'CE Credits',
                    })}
                  >
                    CE Credits
                  </li>
                  <li
                    onClick={closeHandler({
                      name: 'Certificate of Attendance',
                      value: 'Certificate of Attendance',
                    })}
                  >
                    Certificate of Attendance
                  </li>
                </>
              )}
            </InputDropDown>
          </FieldWrapper>
        </div>
      </div>
    </Fragment>
  );
};

export default PostCostDetailsCard;
