import React from 'react';

const Footer = ({ results, setSelectedPageIndex, selectedPageIndex }) => {
  const paginationArray = Array.from(
    { length: results?.length },
    (_, index) => index,
  );

  return (
    <div className="answer-bottom-area">
      <div className="callout">
        <a
          href="https://forms.gle/kAXV1GG7sAdDt5VA8"
          target="_blank"
          rel="noreferrer"
        >
          <img src="/img/callout_icon.svg" alt="callout" />
          Share feedback
        </a>
      </div>
      <div class="view-other-answers">
        <span>View more wisdom</span>
      </div>
      <div className="answer-pagination">
        <ul>
          {paginationArray?.length > 1 &&
            paginationArray.map((value) => (
              <li key={value} onClick={() => setSelectedPageIndex(value)}>
                <a className={value === selectedPageIndex ? 'active' : ''}>
                  {value + 1}
                </a>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default Footer;
