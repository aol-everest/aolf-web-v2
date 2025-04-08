import { COURSE_TYPES } from '@constants';

const getBasePrice = (workshop, agreementCMEAccepted) => {
  const { afterCreditPrice, CMEPricing, unitPrice } = workshop;

  if (afterCreditPrice != null) {
    return afterCreditPrice;
  }

  if (agreementCMEAccepted && CMEPricing?.unitPrice) {
    return CMEPricing.unitPrice;
  }

  return unitPrice;
};

const getDisplayPrice = (workshop, basePrice) => {
  const { listPrice, showPrice, productTypeId, unitPrice } = workshop;

  // If it's a SKY course, use showPrice or listPrice
  if (COURSE_TYPES.SKY_BREATH_MEDITATION.value.includes(productTypeId)) {
    return showPrice || listPrice;
  }

  // If list price equals unit price, no display price needed
  if (listPrice === unitPrice) {
    return null;
  }

  // If base price is greater than or equal to list price, no display price needed
  if (basePrice >= listPrice) {
    return null;
  }

  return listPrice;
};

export const priceCalculation = ({
  workshop,
  discount,
  agreementCMEAccepted,
}) => {
  if (!workshop) {
    return { fee: 0, delfee: null };
  }

  // Get initial base price
  let fee = getBasePrice(workshop, agreementCMEAccepted);

  // Apply discount if available
  if (discount) {
    fee = discount.newPrice;
    return {
      fee,
      delfee: discount.oldPrice > fee ? discount.oldPrice : null,
    };
  }

  // Get display price
  const delfee = getDisplayPrice(workshop, fee);

  return { fee, delfee };
};
