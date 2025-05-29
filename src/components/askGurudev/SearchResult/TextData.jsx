import React from 'react';
import RelatedData from './RelatedData';

const TextData = ({
  setShowSharePopup,
  currentMeta,
  query,
  isSourceUrl,
  result,
  copyToClipboard,
  isFeedbackSelected,
  handleVoteSelect,
  results,
  setActiveKey,
  activeKey,
}) => {
  const CustomMessage = () => {
    const message = getErrorMessagesForMeta();
    return (
      <div className="emptyResults">
        <p dangerouslySetInnerHTML={{ __html: message }} />
      </div>
    );
  };

  const getErrorMessagesForMeta = () => {
    switch (currentMeta) {
      case 'suicide':
        return "Hi there, below is a wisdom sheet from Gurudev. You are so loved and as Gurudev says, 'know that you are very much needed in this world' too. You are not alone, we are with you, and help is available. To speak with a certified listener in the USA, call the National Suicide Prevention Hotline at <a href='tel:988'>988</a>. In India, call the Aasra hotline at <a href='tel:+91-9820466726'>91-9820466726</a> . For other countries, find a helpline <a href='https://findahelpline.com/'>here</a>. To speak to an Art of Living teacher, call <a href='tel:(855) 202-4400'>(855) 202-4400</a>";
      default:
        return "Here is a wisdom sheet we found related to your question. It may not be specific to your situation, but we hope it's helpful!";
    }
  };

  const handleShare = () => {
    setShowSharePopup(true);
  };

  const getFormattedText = (text) => {
    return text?.replace(/\n/g, '<br />');
  };

  return (
    <div className="tab-pane active" id="nav-anger" role="tabpanel">
      <div class="tab-answer-precontent">
        <label>
          <span class="icon-aol iconaol-book"></span>Answer
        </label>
        {query && <div className="pretext">{<CustomMessage />}</div>}
      </div>
      <div className="tab-content-text">
        <p
          dangerouslySetInnerHTML={{
            __html: getFormattedText(result.content),
          }}
        />
      </div>
      <div class="tab-content-footer">
        <div class="source-info">
          <strong>Source:</strong>{' '}
          {isSourceUrl ? (
            <a
              href={result.source}
              target="_blank"
              rel="noopener noreferrer"
              className="source-link"
            >
              {result.source}
            </a>
          ) : (
            result.source
          )}
        </div>
        <div class="tab-content-action">
          <button class="tc-action-btn" id="share-button" onClick={handleShare}>
            <span class="icon-aol iconaol-export"></span>
          </button>
          <button
            class="tc-action-btn copy-btn"
            onClick={() => copyToClipboard(result.content)}
          >
            <span class="icon-aol iconaol-copy"></span>
          </button>
        </div>
      </div>
      <div class="tab-content-voting">
        <div class="vote-up-down">
          <label>Did this answer your question?</label>
          <div class="vote-actions">
            <button
              className={`vote-btn ${isFeedbackSelected === 1 ? 'active' : ''}`}
              onClick={() => handleVoteSelect(true)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.23242 15.2917L8.81575 17.2917C9.14909 17.625 9.89909 17.7917 10.3991 17.7917H13.5658C14.5658 17.7917 15.6491 17.0417 15.8991 16.0417L17.8991 9.95835C18.3158 8.79168 17.5658 7.79168 16.3158 7.79168H12.9824C12.4824 7.79168 12.0658 7.37501 12.1491 6.79168L12.5658 4.12501C12.7324 3.37501 12.2324 2.54168 11.4824 2.29168C10.8158 2.04168 9.98242 2.37501 9.64909 2.87501L6.23242 7.95835"
                  stroke="#31364E"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                />
                <path
                  d="M1.98242 15.2916V7.12496C1.98242 5.95829 2.48242 5.54163 3.64909 5.54163H4.48242C5.64909 5.54163 6.14909 5.95829 6.14909 7.12496V15.2916C6.14909 16.4583 5.64909 16.875 4.48242 16.875H3.64909C2.48242 16.875 1.98242 16.4583 1.98242 15.2916Z"
                  stroke="#31364E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className={`vote-btn ${isFeedbackSelected === -1 ? 'active' : ''}`}
              onClick={() => handleVoteSelect(false)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.7668 4.70837L11.1834 2.70837C10.8501 2.37504 10.1001 2.20837 9.6001 2.20837H6.43344C5.43344 2.20837 4.3501 2.95837 4.1001 3.95837L2.1001 10.0417C1.68344 11.2084 2.43344 12.2084 3.68344 12.2084H7.01677C7.51677 12.2084 7.93344 12.625 7.8501 13.2084L7.43344 15.875C7.26677 16.625 7.76677 17.4584 8.51677 17.7084C9.18344 17.9584 10.0168 17.625 10.3501 17.125L13.7668 12.0417"
                  stroke="#31364E"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                />
                <path
                  d="M18.0163 4.70833V12.875C18.0163 14.0417 17.5163 14.4583 16.3496 14.4583H15.5163C14.3496 14.4583 13.8496 14.0417 13.8496 12.875V4.70833C13.8496 3.54167 14.3496 3.125 15.5163 3.125H16.3496C17.5163 3.125 18.0163 3.54167 18.0163 4.70833Z"
                  stroke="#31364E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <RelatedData
        results={results}
        setActiveKey={setActiveKey}
        activeKey={activeKey}
        copyToClipboard={copyToClipboard}
      />
    </div>
  );
};

export default TextData;
