import { useGlobalModalContext } from '@contexts';
import classNames from 'classnames';

export const CustomModal = () => {
  const { hideModal, store } = useGlobalModalContext();
  const { modalProps } = store || {};
  const {
    closeModalAction,
    title,
    children,
    className,
    footer = () => {},
  } = modalProps || {};

  const handleModalToggle = () => {
    hideModal();
    if (closeModalAction) {
      closeModalAction();
    }
  };
  return (
    <div className="profile-modal active show tw-z-50">
      <div
        className={classNames(`digital-member-join_journey show`, className)}
      >
        <div className="close-modal new-btn-modal" onClick={handleModalToggle}>
          <div className="close-line"></div>
          <div className="close-line"></div>
        </div>
        <div className="course-details-card__body">
          <h3 className="course-join-card__title section-title">{title}</h3>
          {children}
        </div>
        {footer()}

        <div
          className="close-modal d-md-flex d-none"
          onClick={handleModalToggle}
        >
          <div className="close-line"></div>
          <div className="close-line"></div>
        </div>
      </div>
    </div>
  );
};
