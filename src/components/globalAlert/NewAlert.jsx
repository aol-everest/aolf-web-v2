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
        class="confirmation-message modal fade bd-example-modal-lg show"
        tabindex="-1"
        onClick={handleAlertToggle}
      >
        <div
          class="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div class="modal-content">
            <div class="modal-body">
              <div class="confirmation-message-info">{children}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show"></div>
    </>
  );
};
