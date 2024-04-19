'use client';
import React, { useCallback, useRef, useEffect } from 'react';

const SearchOptions = ({ query, onChangeQuery, setQuery }) => {
  const queryInputRef = useRef(null);

  useEffect(() => {
    if (queryInputRef.current) {
      queryInputRef.current.focus();
    }
  }, [queryInputRef]);

  const onSubmit = useCallback((event) => {
    event.preventDefault();
  }, []);

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
                value={query}
                onChange={onChangeQuery}
                ref={queryInputRef}
              />
            </div>
            <div className="search-tags">
              <div
                className="search-tag"
                onClick={() => setQuery('How to always be happy in life')}
              >
                How to always be happy in life?
              </div>
              <div
                className="search-tag"
                onClick={() =>
                  setQuery('Why am I born? What is the purpose of my life')
                }
              >
                Why am I born? What is the purpose of my life
              </div>
              <div
                className="search-tag"
                onClick={() => setQuery('How can I get enlightened')}
              >
                How can I get enlightened
              </div>
            </div>
          </div>
        </div>
      </section>
    </form>
  );
};

export default SearchOptions;
