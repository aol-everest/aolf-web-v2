import { orgConfig } from '@org';
import { useCallback, useRef } from 'react';

export const RetreatPrerequisiteWarning = ({
  warningPayload,
  btnText = 'Art of Living Part 1',
  closeRetreatPrerequisiteWarning,
}) => {
  const backdropRef = useRef(null);

  const handleClick = useCallback(
    (event) => {
      // Check if the clicked element is the backdrop or one of its descendants
      if (event.target === backdropRef.current) {
        // If the clicked element is the backdrop itself, close the modal
        closeRetreatPrerequisiteWarning();
      }
    },
    [closeRetreatPrerequisiteWarning],
  );

  return (
    <div
      className="meetup-rsvp modal modal-window modal-window_no-log fade bd-example-modal-lg show"
      id="rsvpPrerequisite"
      ref={backdropRef}
      onClick={handleClick}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="title">Prerequisite</h2>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="modal-main-text">
              {warningPayload && warningPayload.message}
            </div>
            <div className="modal-main-text">
              If our records are not accurate, please contact customer service
              at{' '}
              <a href={`tel:${orgConfig.contactNumberLink}`}>
                {orgConfig.contactNumber}
              </a>{' '}
              or email us at{' '}
              <a href="mailto:app.support@us.artofliving.org">
                app.support@us.artofliving.org
              </a>
              . We will be happy to help you so you can sign up.
            </div>
            <div className="modal-actions">
              <button
                type="button"
                onClick={closeRetreatPrerequisiteWarning}
                className="btn btn-primary find-courses submit-btn"
              >
                Discover {btnText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
