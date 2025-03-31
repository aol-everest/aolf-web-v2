import { useState, useEffect } from 'react';
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
  console.log('Calculating addon fees with:', {
    addOnProducts,
    values,
    hasGroupedAddOnProducts,
  });

  return addOnProducts.reduce((total, addOn) => {
    const {
      unitPrice,
      isAddOnSelectionRequired,
      productName,
      isExpenseAddOn,
      isCMEAddOn,
    } = addOn;

    // Skip expense add-ons if we have grouped add-ons
    if (isExpenseAddOn && hasGroupedAddOnProducts) {
      console.log('Skipping expense addon:', addOn);
      return total;
    }

    // For CME addon, check the CME field instead of productName
    const isSelected = isCMEAddOn ? values['CME'] : values[productName];

    // Add price if product is required or selected
    if (isAddOnSelectionRequired || isSelected) {
      console.log('Adding addon fee for:', {
        productName,
        unitPrice,
        isRequired: isAddOnSelectionRequired,
        isSelected,
        isCMEAddOn,
      });
      return total + (unitPrice || 0);
    }

    console.log('Skipping addon:', {
      productName,
      reason: 'not required and not selected',
      isCMEAddOn,
      isSelected,
    });
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
  const [currentValues, setCurrentValues] = useState(values);

  useEffect(() => {
    setCurrentValues(values);
  }, [values]);

  // Add logging to track values
  console.log('usePriceCalculation called with values:', {
    workshopId: workshop?.id,
    agreementCMEAccepted,
    premiumRate,
    addOnProductsCount: addOnProducts.length,
    hasGroupedAddOnProducts,
    formValues: currentValues,
    discountApplied: !!discount,
    isCCNotRequired,
  });

  // Get initial base price and display price
  const initialBasePrice = getBasePrice(workshop, agreementCMEAccepted);
  let displayPrice = getDisplayPrice(workshop, initialBasePrice);

  // Calculate course fee with premium rate if applicable
  const isRegularPrice =
    !currentValues.priceType || currentValues.priceType === 'regular';
  const courseFee = isRegularPrice
    ? initialBasePrice
    : premiumRate?.unitPrice || initialBasePrice;

  // Add fees for add-on products
  const addOnFees = calculateAddOnFees(
    addOnProducts,
    currentValues,
    hasGroupedAddOnProducts,
  );

  // Add accommodation fees
  const accommodationFee = calculateAccommodationFee(
    currentValues.accommodation,
    addOnProducts.find((product) => product.isExpenseAddOn),
  );

  // Calculate subtotal before discount
  const subtotal = courseFee + addOnFees + accommodationFee;

  // Calculate discount amount - only apply to course fee, not add-ons
  let discountAmount = 0;
  let total = subtotal;
  let originalPrice = null;

  if (discount) {
    // Store the original course price for display
    originalPrice = courseFee;

    // Handle non-discounted products
    const nonDiscountedAmount = (discount.nonDiscountedProducts || []).reduce(
      (sum, product) => {
        return sum + (product.unitPrice || 0);
      },
      0,
    );

    // Apply discount only to course fee
    if (discount.newPrice != null) {
      discountAmount = Math.max(0, courseFee - discount.newPrice);
      total = discount.newPrice + addOnFees + accommodationFee;
    } else if (discount.amount != null) {
      discountAmount = Math.min(courseFee, discount.amount);
      total = courseFee - discountAmount + addOnFees + accommodationFee;
    } else if (discount.percentage != null) {
      discountAmount = (courseFee * discount.percentage) / 100;
      total = courseFee - discountAmount + addOnFees + accommodationFee;
    }
  }

  // Update display price if discount is available
  displayPrice = discount
    ? originalPrice
    : getDisplayPrice(workshop, initialBasePrice);

  // Determine if payment is required
  const isPaymentRequired = total !== 0 ? true : !isCCNotRequired;

  console.log('Price calculation result:', {
    initialBasePrice,
    displayPrice,
    courseFee,
    addOnFees,
    accommodationFee,
    subtotal,
    discountAmount,
    total,
    isPaymentRequired,
    originalPrice,
  });

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
};
