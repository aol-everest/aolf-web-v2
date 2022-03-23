import React, { useState } from "react";
import { GlobalLoadingContext } from "@contexts";
import { FadeInAnimation } from "@components";

export const GlobalLoading = ({ children }) => {
  const [store, setStore] = useState();
  const { show } = store || {};

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
      <div className="tw-top-0 tw-w-full tw-h-full tw-fixed tw-z-[99999]">
        <div className="cover-spin"></div>
      </div>
    );
  };

  return (
    <GlobalLoadingContext.Provider value={{ store, showLoader, hideLoader }}>
      {children}
      {renderComponent()}
    </GlobalLoadingContext.Provider>
  );
};
