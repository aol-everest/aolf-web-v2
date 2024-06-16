import classNames from 'classnames';

export const ViewCardDetail = ({
  isMobile,
  profile = {},
  switchCardDetailView,
}) => {
  const { cardLast4Digit } = profile;
  return (
    <form className="profile-form-wrap">
      <div className="form-item card-number">
        <label for="cardnum">Card number</label>
        <input
          className="mt-0 w-100"
          type="text"
          placeholder="Card Number"
          value={`**** **** **** ${cardLast4Digit || '****'}`}
          readOnly
        />
      </div>
      <div className="form-item expiry">
        <label for="exp">Expiry</label>
        <input
          type="text"
          placeholder="MM/YY"
          value="**/**"
          readOnly
          className={classNames({
            'w-100': isMobile,
          })}
        />
      </div>
      <div className="form-item cvv">
        <label for="cvv">CVV</label>
        <input
          type="text"
          placeholder="CVC"
          value="****"
          readOnly
          className={classNames({
            'w-100': isMobile,
          })}
        />
      </div>

      <div className="form-actions col-1-1">
        <button className="primary-btn" onClick={switchCardDetailView}>
          Update Card
        </button>
      </div>
    </form>
  );
};
