import React, { useState } from "react";

import { MdFeedback } from "react-icons/md";
import { CgClose } from "react-icons/cg";
import { GlobalBannerContext, useGlobalBannerContext } from "@contexts";

export const GlobalBottomBanner = ({ children, ...props }) => {
  const [store, setStore] = useState();
  const { show, bannerProps } = store || {};

  const showBanner = (bannerProps) => {
    setStore({
      ...store,
      show: true,
      bannerProps,
    });
  };

  const hideBanner = () => {
    setStore({
      ...store,
      show: false,
      bannerProps: {},
    });
  };

  const renderComponent = () => {
    if (!show) {
      return null;
    }
    return <BottomBanner id="global-banner" {...bannerProps} />;
  };

  return (
    <GlobalBannerContext.Provider value={{ store, showBanner, hideBanner }}>
      {children}
      {renderComponent()}
    </GlobalBannerContext.Provider>
  );
};

export const BottomBanner = () => {
  const { hideBanner, store } = useGlobalBannerContext();
  const { bannerProps } = store || {};
  const { children } = bannerProps || {};

  const handleBannerToggle = () => {
    hideBanner();
  };
  return (
    <aside className="tw-fixed tw-z-50 tw-whitespace-normal tw-text-center tw-bottom-0 tw-inset-x-0 tw-top-auto">
      <MdFeedback className="tw-text-xl tw-mx-3" />
      <span className="tw-mx-2">{children}</span>
      <CgClose
        className="tw-text-xl tw-mx-2 tw-my-2 tw-font-bold tw-absolute tw-right-0 tw-top-0"
        onClick={handleBannerToggle}
      />
    </aside>
  );
};
