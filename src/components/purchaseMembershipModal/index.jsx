import renderHTML from "react-render-html";

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
        {modalSubscription.description &&
          renderHTML(modalSubscription.description)}
        <p className="modal-gray-text">
          * Available to SKY Breath Meditation graduates
        </p>
      </div>
    </>
  );
};
