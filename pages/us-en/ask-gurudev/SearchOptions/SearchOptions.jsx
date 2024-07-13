'use client';
import { askGurudevQuestions } from '@utils';
import React, { useCallback, useRef, useEffect, useMemo } from 'react';

const SearchOptions = ({
  query,
  onChangeQuery,
  setQuery,
  setDebouncedQuery,
  isLoading,
  setSearchResult,
  selectedCategory,
}) => {
  const queryInputRef = useRef(null);
  const questions = askGurudevQuestions();

  useEffect(() => {
    if (queryInputRef.current) {
      queryInputRef.current.focus();
    }
  }, [queryInputRef]);

  const onSubmit = useCallback((event) => {
    event.preventDefault();
  }, []);

  const onSearchChangeQuery = useCallback((event) => {
    if (!event.target.value) {
      setSearchResult({});
      setQuery('');
      setDebouncedQuery('');
      queryInputRef.current.value = '';
    }
    onChangeQuery(event);
  }, []);

  const selectedCategoryQuestions = useMemo(() => {
    return questions.find((item) => item.name === selectedCategory);
  }, [selectedCategory, questions]);

  return (
    <form onSubmit={onSubmit}>
      <section className="ask-gurudev-main-search">
        <div className="container">
          <div className="main-search-area">
            <div className="search-tags">
              {selectedCategoryQuestions?.questions?.map((question, index) => {
                return (
                  <div
                    key={index}
                    className="search-tag"
                    onClick={() => setQuery(question)}
                  >
                    {question}
                  </div>
                );
              })}
            </div>

            <div className="search-input-box">
              <input
                type="search"
                placeholder="Search by question or topic"
                name="query"
                id="query"
                disabled={isLoading}
                value={query}
                onChange={onSearchChangeQuery}
                autoComplete={false}
                ref={queryInputRef}
                className={`${query ? 'input has-value' : ''}`}
              />
            </div>
          </div>
        </div>
      </section>
    </form>
  );
};

export default SearchOptions;
