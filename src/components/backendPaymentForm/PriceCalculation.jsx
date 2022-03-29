import React from "react";

export const PriceCalculationComponent = ({
  savingFromOfferings,
  priceBookName,
  listPrice,
  unitPrice,
  courseAddOnFee = 0,
  earlyBirdEndDate,
  groupedAddOnProductsFirst,
  addOnProductFirst,
  earlyBirdDays,
  isEarlyBirdAllowed,
  selectedUnitPrice,
  selectedListPrice,
  discount,
  paymentMode,
  instalmentAmount,
  instalmentTenure,
  instalmentGap,
  instalmentGapUnit,
  agreementCMEAccepted,
  CMEPricing,
  showPrice,
  comboPrice = null,
}) => {
  let feeDom = "";
  let offeringDom = "";
  let AddOnProductsDom = "";

  if (agreementCMEAccepted) {
    feeDom = (
      <p className="price">
        <b>Fee:</b>{" "}
        <ins>
          <span className="amount">${CMEPricing.unitPrice}</span>
        </ins>
      </p>
    );
  } else if (paymentMode === "instalment") {
    feeDom = (
      <p className="price">
        <b>Fee:</b>{" "}
        <del>
          <span className="amount">${unitPrice}</span>
        </del>
        <ins>
          <span className="amount">
            {instalmentTenure} Installment of ${instalmentAmount} every{" "}
            {instalmentGap} {instalmentGapUnit}(s)
          </span>
        </ins>
      </p>
    );
  } else if (discount) {
    feeDom = (
      <p className="price">
        <b>Fee:</b>{" "}
        <del>
          <span className="amount">${discount.oldPrice}</span>
        </del>
        <ins>
          <span className="amount">${discount.newPrice}</span>
        </ins>
      </p>
    );
  } else if (selectedListPrice) {
    if (selectedListPrice !== selectedUnitPrice) {
      feeDom = (
        <p className="price">
          <b>Fee:</b>{" "}
          <del>
            <span className="amount">${selectedListPrice}</span>
          </del>
          <ins>
            <span className="amount">${selectedUnitPrice}</span>
          </ins>
        </p>
      );
    } else {
      feeDom = <p>Fee: ${selectedListPrice}</p>;
    }
  } else if (comboPrice) {
    feeDom = <p>Fee: ${comboPrice.comboUnitPrice}</p>;
  } else if (courseAddOnFee > 0) {
    feeDom = <p>Total Fee: ${courseAddOnFee + unitPrice}</p>;
  } else if (listPrice === unitPrice) {
    feeDom = <p>Fee: ${unitPrice}</p>;
  } else {
    feeDom = (
      <p className="price">
        <b>Fee:</b>{" "}
        <del>
          <span className="amount">${listPrice}</span>
        </del>
        <ins>
          <span className="amount">${unitPrice}</span>
        </ins>
      </p>
    );
    /*switch (priceBookName) {
      case 'Standard Price Book':
        if (showPrice) {
          feeDom = (
            <p className="price">
              <b>Course Fee :</b>{' '}
              <del>
                <span className="amount">${listPrice}</span>
              </del>
            </p>
          );
          offeringDom = (
            <p className="price">
              <b>For a Limited Time Only:</b>{' '}
              <ins>
                <span className="amount">${unitPrice}</span>
              </ins>
            </p>
          );
        }
        break;
      case 'Repeater Price Book':
        break;
      case 'Early Bird Price Book':
      case 'For Subscribed Journey Users Price Book':
        offeringDom =
          isEarlyBirdAllowed && listPrice - unitPrice - savingFromOfferings > 0 ? (
            <p>
              <b>IMP:</b> The fee will increase by ${listPrice - unitPrice - savingFromOfferings}
              {earlyBirdEndDate && ` on ${moment.utc(earlyBirdEndDate).format('MMM D, YYYY')}`}
              {!earlyBirdEndDate && ` - ${earlyBirdDays} days before the workshop start date`}
            </p>
          ) : (
            ''
          );
        break;
      default:
    }*/
  }

  if (groupedAddOnProductsFirst) {
    AddOnProductsDom = (
      <>
        Additional Expenses:
        <ul>
          {groupedAddOnProductsFirst.map(
            ({ productSfid, productName, unitPrice }) => (
              <li key={productSfid}>{`${productName} : $${unitPrice}`}</li>
            ),
          )}
        </ul>
      </>
    );
  } else if (addOnProductFirst) {
    AddOnProductsDom = (
      <>
        Additional Expenses:
        <ul>
          <li>${addOnProductFirst.unitPrice}</li>
        </ul>
      </>
    );
  }
  return (
    <>
      {feeDom}
      {offeringDom}
      {AddOnProductsDom}
    </>
  );
};
