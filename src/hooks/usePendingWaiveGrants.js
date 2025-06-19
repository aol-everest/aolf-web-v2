import { useEffect, useState } from 'react';
import { useFormPersist } from './useFormPersist';
import { api } from '@utils';

/**
 * Hook to handle pending waiveGrants action after successful checkout
 * @param {string} attendeeId - The attendee ID from checkout
 * @returns {Object} - Processing state and error information
 */
export const usePendingWaiveGrants = (attendeeId) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [processed, setProcessed] = useState(false);

  const { persistedData, clearData } = useFormPersist('pendingWaiveGrants', {
    expiryTime: 1 * 60 * 60 * 1000, // 1 hour (same as policy page)
  });

  const processPendingWaiveGrants = async () => {
    if (!persistedData || processed || !attendeeId) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Call the waiveOffUserGrants API
      await api.post({
        path: 'waiveOffUserGrants',
        body: {
          waiveGrants: true,
          attendeeId: attendeeId,
        },
      });

      // Clear the stored data after successful API call
      clearData();
      setProcessed(true);

      console.log(
        'Pending waiveGrants processed successfully for attendee:',
        attendeeId,
      );
    } catch (err) {
      console.error(
        'Failed to process pending waiveGrants for attendee:',
        attendeeId,
        err,
      );
      setError(err);

      // Don't clear data on error - allow retry later
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-process when component mounts and data exists
  useEffect(() => {
    if (persistedData && !processed && attendeeId) {
      processPendingWaiveGrants();
    }
  }, [persistedData, processed, attendeeId]);

  return {
    hasPendingWaiveGrants: !!persistedData,
    isProcessing,
    error,
    processed,
    processPendingWaiveGrants, // Manual trigger if needed
  };
};
