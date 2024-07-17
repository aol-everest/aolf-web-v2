import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames';

export const MobileFilterModal = (props) => {
  const [isHidden, setIsHidden] = useState(true);

  const showModal = () => {
    setIsHidden(false);
    document.body.classList.add('overflow-hidden');
  };

  const hideModal = () => {
    setIsHidden(true);
    document.body.classList.remove('overflow-hidden');
  };

  const clearAction = () => {
    if (props.clearEvent) {
      props.clearEvent();
    }
    setIsHidden(true);
    document.body.classList.remove('overflow-hidden');
  };

  const { label, value, children, hideClearOption = false } = props;
  return (
    <>
      <label>{label}</label>
      <div
        className="btn_outline_box btn-modal_dropdown full-btn mt-3"
        onClick={showModal}
      >
        <a
          className={classNames('btn', {
            '!tw-text-slate-300': !value,
          })}
          href="#"
        >
          {value || 'Select...'}
        </a>
      </div>
      <div
        className={classNames('mobile-modal', {
          active: !isHidden,
        })}
      >
        <div className="mobile-modal--header">
          <div
            id="course-close_mobile"
            className="mobile-modal--close"
            onClick={hideModal}
          >
            <img src="/img/ic-close.svg" alt="close" />
          </div>
          <h2 className="mobile-modal--title">{label}</h2>
          {children}
        </div>
        <div className="mobile-modal--body">
          <div className="row m-0 align-items-center justify-content-between">
            {!hideClearOption && (
              <div className="clear" onClick={clearAction}>
                Clear
              </div>
            )}
            <div
              className="filter-save-button btn_box_primary select-btn"
              onClick={hideModal}
            >
              Select
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
