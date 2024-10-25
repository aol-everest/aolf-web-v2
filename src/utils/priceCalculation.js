import { COURSE_TYPES } from '@constants';

export const priceCalculation = ({
  workshop,
  discount,
  agreementCMEAccepted,
}) => {
  const {
    listPrice,
    unitPrice,
    CMEPricing,
    showPrice,
    productTypeId,
    afterCreditPrice,
  } = workshop || {};

  let fee = afterCreditPrice || unitPrice;
  let delfee = listPrice;

  if (afterCreditPrice != null) {
    fee = afterCreditPrice;
  } else if (agreementCMEAccepted && CMEPricing?.unitPrice) {
    fee = CMEPricing.unitPrice;
  } else if (discount) {
    fee = discount.newPrice;
    delfee = discount.oldPrice;
  } else if (COURSE_TYPES.SKY_BREATH_MEDITATION.value.includes(productTypeId)) {
    delfee = showPrice || listPrice;
  } else if (listPrice === unitPrice) {
    delfee = null;
  }

  if (delfee && fee >= delfee) {
    delfee = null;
  }

  return { fee, delfee };
};
