import { useGlobalModalContext } from '@contexts';

export const EmptyModal = () => {
  const { hideModal, store } = useGlobalModalContext();
  const { modalProps } = store || {};
  const { closeModalAction, children } = modalProps || {};

  const handleModalToggle = () => {
    hideModal();
    if (closeModalAction) {
      closeModalAction();
    }
  };
  return children(handleModalToggle);
};
