import { COURSE_TYPES } from "@constants";

export const priceCalculation = ({
  workshop,
  discount,
  agreementCMEAccepted,
}) => {
  const { listPrice, unitPrice, CMEPricing, showPrice, productTypeId } =
    workshop || {};

  let fee = unitPrice;
  let delfee = listPrice;

  if (agreementCMEAccepted) {
    fee = CMEPricing.unitPrice;
  } else if (discount) {
    fee = discount.newPrice;
    delfee = discount.oldPrice;
  } else if (COURSE_TYPES.SKY_BREATH_MEDITATION.value.includes(productTypeId)) {
    fee = unitPrice;
    delfee = showPrice || listPrice;
  } else if (listPrice === unitPrice) {
    fee = unitPrice;
    delfee = null;
  }

  if (delfee && fee >= delfee) {
    return {
      fee,
      delfee: null,
    };
  } else {
    return {
      fee,
      delfee,
    };
  }
};
