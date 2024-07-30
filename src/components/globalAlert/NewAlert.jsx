import { useGlobalAlertContext } from '@contexts';
import classNames from 'classnames';

export const NewAlert = () => {
  const { hideAlert, store } = useGlobalAlertContext();
  const { alertProps } = store || {};
  const { closeModalAction, children } = alertProps || {};

  const handleAlertToggle = () => {
    hideAlert();
    if (closeModalAction) {
      closeModalAction();
    }
  };
  return (
    <>
      <div
        className="confirmation-message modal fade bd-example-modal-lg show"
        tabindex="-1"
        onClick={handleAlertToggle}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-body">
              <div className="confirmation-message-info">{children}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};
