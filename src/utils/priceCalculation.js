export const priceCalculation = ({
  workshop,
  discount,
  agreementCMEAccepted,
}) => {
  const { listPrice, unitPrice, CMEPricing, showPrice, productTypeId } =
    workshop || {};

  let fee = "";
  let delfee = "";

  if (agreementCMEAccepted) {
    fee = CMEPricing.unitPrice;
  } else if (discount) {
    fee = discount.newPrice;
    delfee = discount.oldPrice;
  } else if (
    `${process.env.REACT_APP_SKY_BREATH_MEDITATION_CTYPE}`.indexOf(
      productTypeId,
    ) >= 0
  ) {
    fee = unitPrice;
    delfee = showPrice ? showPrice : listPrice;
  } else if (listPrice === unitPrice) {
    fee = unitPrice;
    delfee = "";
  } else {
    fee = unitPrice;
    delfee = listPrice;
  }
  return {
    fee,
    delfee,
  };
};
