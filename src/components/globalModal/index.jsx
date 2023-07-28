import { MODAL_TYPES } from "@constants";
import { GlobalModalContext } from "@contexts";
import { useState } from "react";
import { CustomModal } from "./CustomModal";
import { EmptyModal } from "./EmptyModal";
import { LoginModal } from "./LoginModal";

const MODAL_COMPONENTS = {
  [MODAL_TYPES.LOGIN_MODAL]: LoginModal,
  [MODAL_TYPES.CUSTOM_MODAL]: CustomModal,
  [MODAL_TYPES.EMPTY_MODAL]: EmptyModal,
};

export const GlobalModal = ({ children }) => {
  const [store, setStore] = useState();
  const { modalType, modalProps } = store || {};

  const showModal = (modalType, modalProps) => {
    setStore({
      ...store,
      modalType,
      modalProps,
    });
  };

  const hideModal = () => {
    setStore({
      ...store,
      modalType: null,
      modalProps: {},
    });
  };

  const renderComponent = () => {
    const ModalComponent = MODAL_COMPONENTS[modalType];
    if (!modalType || !ModalComponent) {
      return null;
    }
    return <ModalComponent id="global-modal" {...modalProps} />;
  };

  return (
    <GlobalModalContext.Provider value={{ store, showModal, hideModal }}>
      {renderComponent()}
      {children}
    </GlobalModalContext.Provider>
  );
};
