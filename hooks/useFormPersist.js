import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_PREFIX = 'form_persist_';
const DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Hook for persisting form data in localStorage with expiry
 * @param {string} key - Unique identifier for the form
 * @param {Object} options - Configuration options
 * @param {number} options.expiryTime - Time in milliseconds before data expires (default: 5 minutes)
 * @param {string} options.storagePrefix - Prefix for localStorage key (default: 'form_persist_')
 * @returns {Object} - Form persistence methods and state
 */
export const useFormPersist = (key, options = {}) => {
  const { expiryTime = DEFAULT_EXPIRY, storagePrefix = STORAGE_PREFIX } =
    options;

  const [persistedData, setPersistedData] = useState(null);
  const [persistKey] = useState(() => {
    const newKey = key || uuidv4();
    console.log('[FormPersist] Generated key:', newKey);
    return newKey;
  });

  const storageKey = `${storagePrefix}${persistKey}`;
  console.log('[FormPersist] Using storage key:', storageKey);

  const saveData = (data) => {
    if (!data) {
      console.log('[FormPersist] Save attempted with no data');
      return;
    }

    const storageData = {
      data,
      expiry: Date.now() + expiryTime,
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(storageData));
      setPersistedData(data);
      console.log('[FormPersist] Data saved successfully:', {
        key: storageKey,
        expiry: new Date(storageData.expiry).toISOString(),
      });
    } catch (error) {
      console.error('[FormPersist] Error saving data:', error);
    }
  };

  const loadData = () => {
    try {
      const storedData = localStorage.getItem(storageKey);
      console.log('[FormPersist] Attempting to load data for key:', storageKey);

      if (!storedData) {
        console.log('[FormPersist] No data found for key:', storageKey);
        return null;
      }

      const { data, expiry } = JSON.parse(storedData);
      console.log('[FormPersist] Found data:', {
        key: storageKey,
        expiry: new Date(expiry).toISOString(),
        hasExpired: Date.now() > expiry,
      });

      if (Date.now() > expiry) {
        console.log('[FormPersist] Data expired, clearing storage');
        localStorage.removeItem(storageKey);
        setPersistedData(null);
        return null;
      }

      setPersistedData(data);
      console.log('[FormPersist] Data loaded successfully');
      return data;
    } catch (error) {
      console.error('[FormPersist] Error loading data:', error);
      return null;
    }
  };

  const clearData = () => {
    try {
      localStorage.removeItem(storageKey);
      setPersistedData(null);
      console.log('[FormPersist] Data cleared for key:', storageKey);
    } catch (error) {
      console.error('[FormPersist] Error clearing data:', error);
    }
  };

  useEffect(() => {
    console.log('[FormPersist] Initial load attempt for key:', storageKey);
    loadData();
  }, [persistKey]);

  return {
    persistKey,
    persistedData,
    saveData,
    loadData,
    clearData,
  };
};
