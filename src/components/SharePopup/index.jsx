import React, { useEffect, useState } from 'react';

export const SharePopup = ({
  currentShareLink,
  showButton = true,
  showSharePopupParent = false,
  setShowSharePopupParent,
}) => {
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (setShowSharePopupParent) {
      setShowSharePopup(showSharePopupParent);
    }
  }, [showSharePopupParent]);

  const handleSharePopup = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (navigator.share && isMobile) {
      navigator
        .share({
          title: 'Check this out!',
          text: 'Have a look at this amazing content on Art of Living!',
          url: currentShareLink,
        })
        .then(() => {
          console.log('Content shared successfully');
        })
        .catch((error) => {
          console.error('Error sharing content:', error);
        });
    } else {
      setShowSharePopup(true);
    }
  };

  const copyToClipboard = (data) => {
    navigator.clipboard
      .writeText(data)
      .then(() => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000); // Reset the copied state after 2 seconds
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <>
      {showButton && (
        <div class="course-share">
          <button
            class="share-button"
            onClick={() => {
              handleSharePopup();
            }}
          >
            <img
              src="/img/share-icon.svg"
              alt="Share"
              width="24"
              class="icon-share"
            />
          </button>
        </div>
      )}

      {showToast && (
        <div id="message" class="copy-message">
          <span class="icon-aol iconaol-stars"></span>Content has been copied
          successfully.
        </div>
      )}

      {showSharePopup && (
        <div id="share-popup" class="share-popup">
          <div class="share-popup-content">
            <button
              id="close-popup"
              class="close-popup"
              onClick={() => {
                if (setShowSharePopupParent) {
                  setShowSharePopupParent(false);
                }
                setShowSharePopup(false);
              }}
            >
              <span class="icon-aol iconaol-close"></span>
            </button>
            <h3>Share this link</h3>
            <div class="copy-link-container">
              <input
                type="text"
                id="copy-input"
                value={currentShareLink}
                readonly
              />
              <button
                id="copy-button"
                class="copy-button"
                onClick={() => copyToClipboard(currentShareLink)}
              >
                <span class="icon-aol iconaol-copy"></span>
              </button>
            </div>
            <div class="share-icons">
              <a
                href={`https://twitter.com/intent/tweet?url=${currentShareLink}`}
                target="_blank"
                class="share-icon twitter"
              >
                <img
                  src="/img/twitter-icon-round.png"
                  height="60"
                  width="60"
                  alt="Twitter"
                />
                Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${currentShareLink}`}
                target="_blank"
                class="share-icon linkedin"
              >
                <img
                  src="/img/linkedin-icon-round.png"
                  height="60"
                  width="60"
                  alt="Twitter"
                />
                LinkedIn
              </a>
              <a
                href={`https://reddit.com/submit?url=${currentShareLink}`}
                target="_blank"
                class="share-icon reddit"
              >
                <img
                  src="/img/reddit-icon-round.png"
                  height="60"
                  width="60"
                  alt="Twitter"
                />
                Reddit
              </a>
              <a
                href={`https://pinterest.com/pin/create/button/?url=${currentShareLink}`}
                target="_blank"
                class="share-icon pinterest"
              >
                <img
                  src="/img/pinterest-icon-round.png"
                  height="60"
                  width="60"
                  alt="Twitter"
                />
                Pinterest
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${currentShareLink}`}
                target="_blank"
                class="share-icon facebook"
              >
                <img
                  src="/img/fb-icon-round.png"
                  height="60"
                  width="60"
                  alt="Twitter"
                />
                Facebook
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
