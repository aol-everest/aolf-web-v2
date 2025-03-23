import { useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Cache for storing stripe instances by publishable key
const stripeInstanceCache = new Map();

// Validate Stripe publishable key format
const isValidPublishableKey = (key) => {
  if (!key || typeof key !== 'string') return false;

  // Stripe publishable keys start with 'pk_' and are followed by 'test_' or 'live_'
  const validPrefixes = ['pk_test_', 'pk_live_'];
  const isValidFormat =
    validPrefixes.some((prefix) => key.startsWith(prefix)) && key.length >= 32;

  return isValidFormat;
};

export const useStripeLoader = (publishableKey) => {
  const stripePromise = useMemo(() => {
    // Return null for undefined/null keys to prevent Stripe initialization error
    if (!publishableKey) {
      return null;
    }

    // Validate key format before attempting to load Stripe
    if (!isValidPublishableKey(publishableKey)) {
      console.warn('Invalid Stripe publishable key format:', publishableKey);
      return null;
    }

    try {
      // Check if we already have a Stripe instance for this publishable key
      if (stripeInstanceCache.has(publishableKey)) {
        return stripeInstanceCache.get(publishableKey);
      }

      // Create new Stripe instance and cache it
      const newStripePromise = loadStripe(publishableKey);
      stripeInstanceCache.set(publishableKey, newStripePromise);
      return newStripePromise;
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      return null;
    }
  }, [publishableKey]); // Only re-run if publishableKey changes

  return stripePromise;
};
