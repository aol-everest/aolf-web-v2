import React from "react";
import { isEmpty } from "lodash";
import PriceCalculationComponent from "@components/backendPaymentForm/PriceCalculationComponent";

export function BackendRegisterationDetail({
  workshop,
  userWorkshop,
  groupedAddOnProductsFirst,
  addOnProductFirst,
  selectedAddOn,
  discount,
  selectedUnitPrice,
  selectedListPrice,
  paymentMode,
  priceToShow,
  courseAddOnFee,
  selectedComboCourseId,
}) {
  const {
    id,
    title,
    shortAddress,
    email,
    contactName,
    formattedStartDate,
    formattedEndDate,
    formattedStartDateOnly,
    formattedEndDateOnly,
    formattedWeekDay,
    formattedWeekEnd,
    courseId,
    phone1,
    primaryTeacherName,
    primaryTeacherPic,
    coTeacher1Name,
    coTeacher1Pic,
    coTeacher2Name,
    coTeacher2Pic,
    listPrice,
    unitPrice,
    savingFromOfferings,
    priceBookName,
    earlyBirdDays,
    isEarlyBirdAllowed,
    instalmentAmount,
    instalmentTenure,
    instalmentGap,
    instalmentGapUnit,
    earlyBirdEndDate,
    showPrice,
    earlyBirdFeeIncreasing,
    isGenericWorkshop,
    name,
    eventStartTime,
    eventEndTime,
    availableBundles,
    usableCredit,
  } = userWorkshop || workshop || {};

  const comboPrice = availableBundles?.find(
    (availableBundle) =>
      selectedComboCourseId === availableBundle.comboProductSfid,
  );

  const isUsableCreditAvailable = usableCredit && !isEmpty(usableCredit);

  let UpdatedFeeAfterCredits;
  if (
    isUsableCreditAvailable &&
    usableCredit.creditMeasureUnit === "Quantity" &&
    usableCredit.availableCredit === 1
  ) {
    UpdatedFeeAfterCredits = 0;
  } else if (
    isUsableCreditAvailable &&
    usableCredit.creditMeasureUnit === "Amount"
  ) {
    if (usableCredit.availableCredit > unitPrice) {
      UpdatedFeeAfterCredits = 0;
    } else {
      UpdatedFeeAfterCredits = unitPrice - usableCredit.availableCredit;
    }
  }

  return (
    <div className="col-md-6 col-sm-6 col-xs-12 wlc_left_wrap">
      <div className="row">
        <div className="col-sm-12">
          <h2 className="title">{title}</h2>
          {!isGenericWorkshop && (
            <div className="row">
              <div className="col-sm-12 col-12 datetime-box">
                <h6>Date:</h6>
                <div>
                  Start: {formattedStartDateOnly} : {eventStartTime}
                </div>
                <div>
                  End: {formattedEndDateOnly} : {eventEndTime}
                </div>
              </div>
              {/* <div className="col-sm-6 col-12 datetime-box">
                  <h6>Time:</h6>
                  <div>Weekdays: {formattedWeekDay}</div>
                  <div>Weekend: {formattedWeekEnd}</div>
                </div> */}
            </div>
          )}
          <p>Venue: {shortAddress}</p>
        </div>

        <div className="col-sm-12 workshopCourseBlk">
          <div className="row">
            <div className="col-sm-12 col-md-6 leftBlk">
              <p>Course ID: {name}</p>
              {priceToShow}
              {!priceToShow && (
                <PriceCalculationComponent
                  // groupedAddOnProductsFirst={groupedAddOnProductsFirst}
                  // addOnProductFirst={addOnProductFirst}
                  listPrice={listPrice}
                  unitPrice={unitPrice}
                  courseAddOnFee={courseAddOnFee}
                  savingFromOfferings={savingFromOfferings}
                  priceBookName={priceBookName}
                  earlyBirdDays={earlyBirdDays}
                  isEarlyBirdAllowed={isEarlyBirdAllowed}
                  selectedUnitPrice={selectedUnitPrice}
                  selectedListPrice={selectedListPrice}
                  discount={discount}
                  paymentMode={paymentMode}
                  instalmentAmount={instalmentAmount}
                  instalmentTenure={instalmentTenure}
                  instalmentGap={instalmentGap}
                  instalmentGapUnit={instalmentGapUnit}
                  earlyBirdEndDate={earlyBirdEndDate}
                  showPrice={showPrice}
                  comboPrice={comboPrice}
                />
              )}
              {earlyBirdFeeIncreasing && (
                <p>
                  Register soon. Course fee will go up by $
                  {earlyBirdFeeIncreasing.increasingFee} on{" "}
                  {earlyBirdFeeIncreasing.increasingBy}
                </p>
              )}
              {isUsableCreditAvailable && (
                <p>
                  {usableCredit.message} ${UpdatedFeeAfterCredits}.
                </p>
              )}
            </div>
            <div className="col-sm-12 col-md-6 rightBlk">
              <p>
                Contact: {contactName}, <a href={`tel:${phone1}`}>{phone1},</a>
              </p>
              <p>
                <a href={`mailto:${email}`}>{email}</a>
              </p>
            </div>
            {!isGenericWorkshop && (
              <div className="col-sm-12 teacherWrap extrMrg">
                <span className="name">Teacher:</span>
                <div className="row">
                  {primaryTeacherName && (
                    <div className="col-sm-12">
                      <img
                        className="img"
                        src={primaryTeacherPic || "/img/user.png"}
                      />
                      <a href="#" className="name">
                        {primaryTeacherName}
                      </a>
                    </div>
                  )}
                  {coTeacher1Name && (
                    <div className="col-sm-12">
                      {"  "}
                      <img
                        className="img"
                        src={coTeacher1Pic || "/img/user.png"}
                      />
                      <a href="#" className="name">
                        {coTeacher1Name}
                      </a>
                    </div>
                  )}
                  {coTeacher2Name && (
                    <div className="col-sm-12">
                      {"  "}
                      <img
                        className="img"
                        src={coTeacher2Pic || "/img/user.png"}
                      />
                      <a href="#" className="name">
                        {coTeacher2Name}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
