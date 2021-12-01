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
      <FadeInAnimation className="t-0 w-full h-full fixed z-50">
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
