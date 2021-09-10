import React, { useState } from "react";
import classNames from "classnames";

export const MobileFilterModal = (props) => {
  const [isHidden, setIsHidden] = useState(true);

  const showModal = () => {
    setIsHidden(false);
    document.body.classList.add("overflow-hidden");
  };

  const hideModal = () => {
    setIsHidden(true);
    document.body.classList.remove("overflow-hidden");
  };

  const clearAction = () => {
    if (props.clearEvent) {
      props.clearEvent();
    }
    setIsHidden(true);
    document.body.classList.remove("overflow-hidden");
  };

  const { modalTitle, buttonText, children } = props;
  return (
    <>
      <div
        className="btn_outline_box btn-modal_dropdown full-btn mt-3"
        onClick={showModal}
      >
        <a className="btn" href="#">
          {buttonText}
        </a>
      </div>
      <div
        className={classNames("mobile-modal-v1 mobile-modal", {
          active: !isHidden,
        })}
      >
        <div className="mobile-modal-v1--header mobile-modal--header">
          <div
            className="mobile-modal-v1--close mobile-modal--close"
            onClick={hideModal}
          >
            <img src="/img/ic-close.svg" alt="close" />
          </div>
          <h2 className="mobile-modal-v1--title mobile-modal--title">
            {modalTitle}
          </h2>
          {children}
        </div>
        <div className="mobile-modal-v1--body mobile-modal--body">
          <div className="row m-0 align-items-center justify-content-between">
            <div className="clear" onClick={clearAction}>
              Clear
            </div>
            <div className="btn_box_primary select-btn" onClick={hideModal}>
              Select
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
