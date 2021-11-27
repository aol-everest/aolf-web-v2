import React, { useState } from "react";
import { GlobalLoadingContext } from "@contexts";
import { FadeInAnimation } from "@components";

export const GlobalLoading = ({ children }) => {
  const [store, setStore] = useState();
  const { show, playerProps } = store || {};

  const showLoader = (props) => {
    setStore({
      ...store,
      show: true,
      props,
    });
  };

  const hideLoader = () => {
    setStore({
      ...store,
      show: false,
      props: {},
    });
  };

  const renderComponent = () => {
    if (!show) {
      return null;
    }
    return (
      <FadeInAnimation
        style={{
          top: 0,
          width: "100%",
          height: "100%",
          position: "fixed",
          zIndex: 9999,
        }}
      >
        <div className="cover-spin"></div>
      </FadeInAnimation>
    );
  };

  return (
    <GlobalLoadingContext.Provider value={{ store, showLoader, hideLoader }}>
      {children}
      {renderComponent()}
    </GlobalLoadingContext.Provider>
  );
};
