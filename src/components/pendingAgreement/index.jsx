/* eslint-disable react/display-name */
/* eslint-disable react/no-unescaped-entities */
import { ALERT_TYPES } from '@constants';
import { useGlobalAlertContext, useGlobalLoadingContext } from '@contexts';
import { api } from '@utils';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';

export const PendingAgreementModal = React.forwardRef((props, ref) => {
  const [isPPAgreementError, setIsPPAgreementError] = useState(false);
  const [iAggreedPPA, setIAggreedPPA] = useState(false);

  const handleChange = (e) => {
    setIAggreedPPA(e.target.checked);
  };

  React.useImperativeHandle(ref, () => ({
    validatePPAgreement() {
      if (!iAggreedPPA) {
        setIsPPAgreementError(true);
        return false;
      }
      setIsPPAgreementError(false);
      return true;
    },
  }));

  return (
    <center>
      <center>
        Our records indicate that you have not yet completed Health Agreement.
      </center>
      <div className="order">
        <div className="agreement__group_important">
          <div className="agreement__group">
            <input
              type="checkbox"
              className={classNames('custom-checkbox', {
                error: isPPAgreementError,
              })}
              placeholder=" "
              name="ppaAgreement"
              checked={iAggreedPPA}
              onChange={handleChange}
            />
            <label htmlFor="ppaAgreement"></label>
            <p className="agreement__text">
              I agree to the health information statement below. I represent
              that I am in good health, and I will inform the health info desk
              of any limiting health conditions before the course begins.
            </p>
          </div>
          {isPPAgreementError && (
            <div className="agreement__important agreement__important_desktop">
              <img
                className="agreement__important-icon"
                src="/img/warning.svg"
                alt="warning"
              />
              Please check the box in order to continue
            </div>
          )}
        </div>
      </div>
    </center>
  );
});

export const PendingAgreement = () => {
  const router = useRouter();
  const { showLoader, hideLoader } = useGlobalLoadingContext();
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const modalEl = useRef(null);

  useEffect(() => {
    if (!router.isReady) return;
    showAlert(ALERT_TYPES.CUSTOM_ALERT, {
      children: <PendingAgreementModal ref={modalEl} />,
      className: 'retreat-prerequisite-big meditation-digital-membership',
      title: 'Action required',
      footer: () => {
        return (
          <button className="btn-secondary v2" onClick={aggreePPModal}>
            I Agree
          </button>
        );
      },
      closeModalAction: () => {
        hideAlert();
      },
    });
  }, [router.isReady]);

  const aggreePPModal = async (e) => {
    if (e) e.preventDefault();

    if (modalEl.current.validatePPAgreement()) {
      showLoader();
      try {
        await api.post({
          path: 'markAllPendingHealthQuestionAgreement',
          body: { yesForAllPending: true },
        });
      } catch (error) {
        console.log(error);
      }
      hideLoader();
      hideAlert();
    }
  };

  return null;
};
