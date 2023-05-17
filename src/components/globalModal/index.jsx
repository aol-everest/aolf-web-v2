import React, { useState } from "react";
import { LoginModal } from "./LoginModal";
import { CustomModal } from "./CustomModal";
import { MODAL_TYPES } from "@constants";
import { GlobalModalContext } from "@contexts";
import { EmptyModal } from "./EmptyModal";
import SchedulingModal from "./SchedulingModal";
import SchedulingPaymentModal from "./SchedulingPaymentModal";

const MODAL_COMPONENTS = {
  [MODAL_TYPES.LOGIN_MODAL]: LoginModal,
  [MODAL_TYPES.CUSTOM_MODAL]: CustomModal,
  [MODAL_TYPES.EMPTY_MODAL]: EmptyModal,
  [MODAL_TYPES.SCHEDULING_MODAL]: SchedulingModal,
  [MODAL_TYPES.SCHEDULING_PAYMENT_MODAL]: SchedulingPaymentModal,
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
