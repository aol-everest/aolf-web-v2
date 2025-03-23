import { useMemo } from 'react';
import { COURSE_TYPES } from '@constants';

const getBasePrice = (workshop, agreementCMEAccepted) => {
  if (!workshop) return 0;

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
  if (!workshop) return null;

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

const calculateAddOnFees = (addOnProducts, values, hasGroupedAddOnProducts) => {
  return addOnProducts.reduce((total, addOn) => {
    const { unitPrice, isAddOnSelectionRequired, productName, isExpenseAddOn } =
      addOn;

    // Skip expense add-ons if we have grouped add-ons
    if (isExpenseAddOn && hasGroupedAddOnProducts) {
      return total;
    }

    // Add price if product is required or selected
    if (isAddOnSelectionRequired || values[productName]) {
      return total + (unitPrice || 0);
    }

    return total;
  }, 0);
};

const calculateAccommodationFee = (accommodation, expenseAddOn) => {
  if (!accommodation) return 0;

  // If it's an expense add-on, just return that price
  if (accommodation.isExpenseAddOn) {
    return expenseAddOn?.unitPrice || 0;
  }

  // Otherwise return accommodation price plus expense add-on if applicable
  const accommodationPrice = accommodation.unitPrice || 0;
  const expensePrice = expenseAddOn?.unitPrice || 0;

  return accommodationPrice + expensePrice;
};

const calculateDiscountAmount = (discount, subtotal) => {
  if (!discount) return 0;

  // If discount specifies a new price directly
  if (discount.newPrice != null) {
    return Math.max(0, subtotal - discount.newPrice);
  }

  // If discount specifies an amount
  if (discount.amount != null) {
    return Math.min(subtotal, discount.amount);
  }

  // If discount specifies a percentage
  if (discount.percentage != null) {
    return (subtotal * discount.percentage) / 100;
  }

  return 0;
};

export const usePriceCalculation = ({
  workshop,
  agreementCMEAccepted,
  premiumRate,
  addOnProducts = [],
  hasGroupedAddOnProducts,
  values = {},
  discount,
  isCCNotRequired,
}) => {
  return useMemo(() => {
    // Get initial base price and display price
    const initialBasePrice = getBasePrice(workshop, agreementCMEAccepted);
    let displayPrice = getDisplayPrice(workshop, initialBasePrice);

    // Calculate course fee with premium rate if applicable
    const isRegularPrice = !values.priceType || values.priceType === 'regular';
    const courseFee = isRegularPrice
      ? initialBasePrice
      : premiumRate?.unitPrice || initialBasePrice;

    // Add fees for add-on products
    const addOnFees = calculateAddOnFees(
      addOnProducts,
      values,
      hasGroupedAddOnProducts,
    );

    // Add accommodation fees
    const accommodationFee = calculateAccommodationFee(
      values.accommodation,
      addOnProducts.find((product) => product.isExpenseAddOn),
    );

    // Calculate subtotal before discount
    const subtotal = courseFee + addOnFees + accommodationFee;

    // Calculate discount amount
    const discountAmount = calculateDiscountAmount(discount, subtotal);

    // Calculate final total after discount
    const total = Math.max(0, subtotal - discountAmount);

    // Update display price if discount is available
    if (discount && discount.oldPrice > total) {
      displayPrice = discount.oldPrice;
    }

    // Determine if payment is required
    const isPaymentRequired = total !== 0 ? true : !isCCNotRequired;

    return {
      basePrice: initialBasePrice,
      displayPrice,
      courseFee,
      addOnFees,
      accommodationFee,
      subtotal,
      discountAmount,
      total,
      isPaymentRequired,
    };
  }, [
    workshop,
    agreementCMEAccepted,
    premiumRate,
    addOnProducts,
    hasGroupedAddOnProducts,
    values,
    discount,
    isCCNotRequired,
  ]);
};
