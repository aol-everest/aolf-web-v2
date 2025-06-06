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
  const [persistKey] = useState(() => key || uuidv4());

  const storageKey = `${storagePrefix}${persistKey}`;

  const saveData = (data) => {
    if (!data) return;

    const storageData = {
      data,
      expiry: Date.now() + expiryTime,
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(storageData));
      setPersistedData(data);
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  };

  const loadData = () => {
    try {
      const storedData = localStorage.getItem(storageKey);
      if (!storedData) return null;

      const { data, expiry } = JSON.parse(storedData);

      // Check if data has expired
      if (Date.now() > expiry) {
        localStorage.removeItem(storageKey);
        setPersistedData(null);
        return null;
      }

      setPersistedData(data);
      return data;
    } catch (error) {
      console.error('Error loading form data:', error);
      return null;
    }
  };

  const clearData = () => {
    try {
      localStorage.removeItem(storageKey);
      setPersistedData(null);
    } catch (error) {
      console.error('Error clearing form data:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
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
