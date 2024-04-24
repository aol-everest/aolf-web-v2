'use client';
import React, { useCallback, useRef, useEffect } from 'react';

const SearchOptions = ({
  query,
  onChangeQuery,
  setQuery,
  setDebouncedQuery,
  isLoading,
  setResults,
}) => {
  const queryInputRef = useRef(null);

  useEffect(() => {
    if (queryInputRef.current) {
      queryInputRef.current.focus();
    }
  }, [queryInputRef]);

  const onSubmit = useCallback((event) => {
    event.preventDefault();
  }, []);

  const clearInput = () => {
    setResults([]);
    setQuery('');
    setDebouncedQuery('');
    queryInputRef.current.value = '';
  };

  return (
    <form onSubmit={onSubmit}>
      <section className="ask-gurudev-main-search">
        <div className="container">
          <div className="main-search-area">
            <div className="search-input-box">
              <input
                type="search"
                placeholder="Ask a question..."
                name="query"
                id="query"
                disabled={isLoading}
                value={query}
                onChange={onChangeQuery}
                ref={queryInputRef}
                className={`${query ? 'input has-value' : ''}`}
              />
              <button class="clear-button" onClick={clearInput}>
                <img src="/img/ic-close.svg" alt="close" />
              </button>
            </div>
            <div className="search-tags">
              <div
                className="search-tag"
                onClick={() => setQuery('How to always be happy in life?')}
              >
                How to always be happy in life?
              </div>
              <div
                className="search-tag"
                onClick={() =>
                  setQuery('Why am I born? What is the purpose of my life?')
                }
              >
                Why am I born? What is the purpose of my life?
              </div>
              <div
                className="search-tag"
                onClick={() => setQuery('How can I get enlightened?')}
              >
                How can I get enlightened?
              </div>
            </div>
          </div>
        </div>
      </section>
    </form>
  );
};

export default SearchOptions;
