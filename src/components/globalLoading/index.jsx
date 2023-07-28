import { GlobalLoadingContext } from "@contexts";
import { useState } from "react";

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
      <div className="tw-fixed tw-top-0 tw-z-[99999] tw-h-full tw-w-full">
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
