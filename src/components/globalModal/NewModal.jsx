import { useGlobalModalContext } from '@contexts';
import classNames from 'classnames';

export const NewModal = () => {
  const { hideModal, store } = useGlobalModalContext();
  const { modalProps } = store || {};
  const {
    closeModalAction,
    title,
    children,
    className,
    footer = () => {},
  } = modalProps || {};

  const handleModalToggle = () => {
    hideModal();
    if (closeModalAction) {
      closeModalAction();
    }
  };
  return (
    <>
      <div className="add-new-modal modal fade bd-example-modal-lg show">
        {children}
      </div>
      <div class="modal-backdrop fade show"></div>
    </>
  );
};
