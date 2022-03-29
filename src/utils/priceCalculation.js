import { COURSE_TYPES } from "@constants";
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
    `${COURSE_TYPES.SKY_BREATH_MEDITATION.value}`.indexOf(productTypeId) >= 0
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
  if (fee > delfee) {
    return {
      fee,
      delfee: null,
    };
  }
  return {
    fee,
    delfee,
  };
};
