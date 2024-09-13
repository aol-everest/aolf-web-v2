import React from 'react';

export default function Popup({ children, closeAction }) {
  return (
    <>
      <div
        class="inactive-popup modal fade bd-example-modal-lg show"
        id="inactive-popup"
        tabindex="-1"
        role="dialog"
        aria-labelledby="inactiveModalLabel"
        aria-hidden="true"
      >
        <div
          class="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div class="modal-content">
            <div class="modal-header">
              <button
                type="button"
                class="close"
                data-dismiss="modal"
                aria-label="Close"
                onClick={closeAction}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">{children}</div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show"></div>
    </>
  );
}
