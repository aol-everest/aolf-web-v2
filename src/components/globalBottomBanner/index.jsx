import { useState } from "react";

import { GlobalBannerContext, useGlobalBannerContext } from "@contexts";
import { CgClose } from "react-icons/cg";
import { MdFeedback } from "react-icons/md";

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
    <aside className="tw-fixed tw-inset-x-0 tw-bottom-0 tw-top-auto tw-z-50 tw-whitespace-normal tw-text-center">
      <MdFeedback className="tw-mx-3 tw-text-xl" />
      <span className="tw-mx-2">{children}</span>
      <CgClose
        className="tw-absolute tw-right-0 tw-top-0 tw-mx-2 tw-my-2 tw-text-xl tw-font-bold"
        onClick={handleBannerToggle}
      />
    </aside>
  );
};
