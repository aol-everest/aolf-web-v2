import { useGlobalAlertContext } from '@contexts';
import classNames from 'classnames';
import Style from './GlobalAlert.module.scss';

export const SuccessAlert = () => {
  const { hideAlert, store } = useGlobalAlertContext();
  const { alertProps } = store || {};
  const {
    closeModalAction,
    confirmBtnText = 'Got it',
    title = 'Success',
    children,
    className,
  } = alertProps || {};

  const handleAlertToggle = () => {
    hideAlert();
    if (closeModalAction) {
      closeModalAction();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleAlertToggle();
    }
  };

  return (
    <div
      className="alert__modal modal-window modal-window_no-log active show tw-z-[9999]"
      onClick={handleOverlayClick}
    >
      <div
        className={classNames(
          'tw-fixed tw-left-4 tw-right-4 md:tw-right-auto md:tw-left-4 tw-bottom-4 tw-bg-white tw-rounded-lg tw-shadow-lg tw-border tw-border-green-100 md:tw-max-w-sm tw-w-auto',
          className,
        )}
      >
        <div className="tw-p-3 md:tw-p-4">
          <div className="tw-flex tw-items-start tw-gap-2 md:tw-gap-3">
            <div className="tw-flex-shrink-0">
              <svg
                className="tw-h-5 tw-w-5 tw-text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="tw-flex-1 tw-min-w-0">
              <p className="tw-text-sm tw-font-medium tw-text-gray-800 tw-break-words">
                {children}
              </p>
            </div>
            <div className="tw-flex-shrink-0">
              <button
                className="tw-bg-white tw-rounded-md tw-inline-flex tw-text-gray-400 hover:tw-text-gray-500 focus:tw-outline-none tw-p-1"
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
    </div>
  );
};
