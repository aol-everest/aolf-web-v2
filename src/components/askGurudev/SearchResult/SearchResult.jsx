/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';

import VideoData from './VideoData';
import TextData from './TextData';

const SearchResult = React.forwardRef(function SearchResult(
  {
    selectedResult,
    setPlayingId,
    playingId,
    selectedVotes,
    handleVoteSelect,
    selectedPageIndex,
    query,
    currentMeta,
    results,
  },
  ref,
) {
  const [result, setResult] = useState(selectedResult);
  const [updatedResults, setUpdatedResults] = useState(results);
  const [showToast, setShowToast] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Text');
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [activeKey, setActiveKey] = useState('unknown');
  const router = useRouter();

  useEffect(() => {
    setUpdatedResults(results);
  }, [results]);

  useEffect(() => {
    setResult(selectedResult);
  }, [selectedResult]);

  const currentUrl = `${window.location.origin}${router.asPath}`;

  const isSourceUrl = useMemo(() => {
    result.source &&
      typeof result.source === 'string' &&
      result.source.match(/^(https?:\/\/[^\s]+)/);
  }, [result]);

  const resultsData = useMemo(() => {
    let isVideoAvailable = false;
    let isTextAvailable = false;
    if (results?.length) {
      results.map((item) => {
        if (item.category.startsWith('video')) {
          isVideoAvailable = true;
        } else if (item.category.startsWith('text')) {
          isTextAvailable = true;
        }
      });
    }
    return {
      isVideoAvailable,
      isTextAvailable,
    };
  }, [results]);

  useEffect(() => {
    if (
      selectedTab === 'Text' &&
      resultsData.isTextAvailable &&
      resultsData.isVideoAvailable &&
      results.length
    ) {
      const updatedTextResults = results.filter((item) =>
        item.category.startsWith('text'),
      );
      setUpdatedResults(updatedTextResults);
      setResult(updatedTextResults?.[0]);
    }
  }, [resultsData, selectedTab]);

  useEffect(() => {
    if (
      selectedTab === 'Video' &&
      resultsData.isTextAvailable &&
      resultsData.isVideoAvailable &&
      results.length
    ) {
      const updatedTextResults = results.filter((item) =>
        item.category.startsWith('video'),
      );
      setUpdatedResults(updatedTextResults);
      setResult(updatedTextResults?.[0]);
    }
  }, [resultsData, selectedTab]);

  const onPlayAction = (id) => {
    setPlayingId(id);
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

  const handleTabChange = (type) => {
    setActiveKey('unknown');
    setSelectedTab(type);
  };

  const isFeedbackSelected = selectedVotes[selectedPageIndex];

  return (
    <motion.div
      // className={['searchResult']}
      initial={{ scale: 0, translateY: -50 }}
      animate={{ scale: 1, translateY: 0 }}
      exit={{ scale: 0, translateY: 50 }}
      ref={ref}
    >
      {resultsData.isTextAvailable && resultsData.isVideoAvailable && (
        <div
          class="tab-pane text-video"
          id="nav-death"
          role="tabpanel"
          aria-labelledby="nav-death-tab"
        >
          <div class="answer-tabs">
            <ul class="answer-tab-links">
              <li>
                <a
                  class={selectedTab === 'Text' ? 'active' : ''}
                  onClick={() => handleTabChange('Text')}
                >
                  Text
                </a>
              </li>
              <li>
                <a
                  class={selectedTab === 'Video' ? 'active' : ''}
                  onClick={() => handleTabChange('Video')}
                >
                  Video
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}
      {result?.category?.startsWith('video') ? (
        <VideoData
          results={updatedResults}
          setActiveKey={setActiveKey}
          activeKey={activeKey}
          isSourceUrl={isSourceUrl}
          isFeedbackSelected={isFeedbackSelected}
          handleVoteSelect={handleVoteSelect}
          onPlayAction={onPlayAction}
          result={result}
          playingId={playingId}
          copyToClipboard={copyToClipboard}
        />
      ) : (
        result.content && (
          <TextData
            setShowSharePopup={setShowSharePopup}
            currentMeta={currentMeta}
            query={query}
            isSourceUrl={isSourceUrl}
            copyToClipboard={copyToClipboard}
            result={result}
            isFeedbackSelected={isFeedbackSelected}
            handleVoteSelect={handleVoteSelect}
            results={updatedResults}
            setActiveKey={setActiveKey}
            activeKey={activeKey}
          />
        )
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
              onClick={() => setShowSharePopup(false)}
            >
              <span class="icon-aol iconaol-close"></span>
            </button>
            <h3>Share this link</h3>
            <div class="copy-link-container">
              <input type="text" id="copy-input" value={currentUrl} readonly />
              <button
                id="copy-button"
                class="copy-button"
                onClick={() => copyToClipboard(currentUrl)}
              >
                <span class="icon-aol iconaol-copy"></span>
              </button>
            </div>
            <div class="share-icons">
              <a
                href={`https://twitter.com/intent/tweet?url=${currentUrl}`}
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
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`}
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
                href={`https://reddit.com/submit?url=${currentUrl}`}
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
                href={`https://pinterest.com/pin/create/button/?url=${currentUrl}`}
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
                href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`}
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
    </motion.div>
  );
});

export default SearchResult;
