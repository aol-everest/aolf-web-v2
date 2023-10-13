/* eslint-disable react/no-unescaped-entities */

import { COURSE_TYPES } from '@constants';

export const PurchaseMembershipModal = ({ modalSubscription }) => {
  return (
    <>
      <p className="description">
        Access even more content to support peace of mind and deep relaxation.
        When you join Art of Living Journey's Digital Membership, you unlock a
        growing library of meditations and insights, available ad-free. What's
        included?
      </p>
      <div className="meditateMemberShip">
        {modalSubscription.description && (
          <span
            dangerouslySetInnerHTML={{ __html: modalSubscription.description }}
          ></span>
        )}

        <p className="modal-gray-text">
          * Available to {COURSE_TYPES.SKY_BREATH_MEDITATION.name} graduates
        </p>
      </div>
    </>
  );
};
