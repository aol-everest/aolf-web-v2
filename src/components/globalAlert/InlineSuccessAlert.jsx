import { useGlobalAlertContext } from '@contexts';
import classNames from 'classnames';
import { useEffect } from 'react';

export const InlineSuccessAlert = () => {
  const { hideAlert, store } = useGlobalAlertContext();
  const { alertProps } = store || {};
  const { closeModalAction, children, message, description, className } =
    alertProps || {};

  useEffect(() => {
    // Auto close after 2 minutes
    const timer = setTimeout(() => {
      handleAlertToggle();
    }, 10000); // 2 minutes in milliseconds

    // Cleanup timer on unmount or when alert changes
    return () => clearTimeout(timer);
  }, []);

  const handleAlertToggle = () => {
    hideAlert();
    if (closeModalAction) {
      closeModalAction();
    }
  };

  // If children is provided as a React component, use it directly
  if (children && typeof children !== 'string') {
    return (
      <div className="tw-fixed tw-left-4 tw-bottom-4 tw-z-[9999] tw-max-w-sm">
        <div className="tw-bg-green-50 tw-rounded-lg tw-p-4 tw-border tw-border-red-100">
          <div className="tw-flex tw-items-start tw-gap-2">
            <div className="tw-flex-shrink-0">
              <svg
                className="tw-h-5 tw-w-5 tw-text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="tw-flex-1 tw-min-w-0">{children}</div>
            <div className="tw-flex-shrink-0">
              <button
                className="tw-bg-red-50 tw-rounded-md tw-inline-flex tw-text-gray-400 hover:tw-text-gray-500 focus:tw-outline-none"
                onClick={handleAlertToggle}
              >
                <span className="tw-sr-only">Close</span>
                <svg
                  className="tw-h-5 tw-w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For message/description or string children format
  return (
    <div className="tw-fixed tw-left-4 tw-bottom-4 tw-z-[9999] tw-max-w-sm">
      <div className="tw-bg-green-50 tw-rounded-lg tw-p-4 tw-border tw-border-green-100">
        <div className="tw-flex tw-items-start tw-gap-2">
          <div className="tw-flex-shrink-0">
            <svg
              className="tw-h-5 tw-w-5 tw-text-green-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="tw-flex-1 tw-min-w-0">
            <p className="tw-text-sm tw-font-medium tw-text-gray-800 tw-break-words">
              {message || children}
            </p>
            {description && (
              <p className="tw-mt-1 tw-text-sm tw-text-gray-500">
                {description}
              </p>
            )}
          </div>
          <div className="tw-flex-shrink-0">
            <button
              className="tw-bg-green-50 tw-rounded-md tw-inline-flex tw-text-gray-400 hover:tw-text-gray-500 focus:tw-outline-none"
              onClick={handleAlertToggle}
            >
              <span className="tw-sr-only">Close</span>
              <svg
                className="tw-h-5 tw-w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
