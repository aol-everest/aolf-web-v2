'use client';
import { askGurudevQuestions } from '@utils';
import React, {
  useCallback,
  useRef,
  useEffect,
  useMemo,
  useState,
} from 'react';

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
  const [localQuery, setLocalQuery] = useState(query);

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
    setLocalQuery(event.target.value);
  }, []);

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const selectedCategoryQuestions = useMemo(() => {
    return questions.find((item) => item.name === selectedCategory);
  }, [selectedCategory, questions]);

  const shuffledQuestions = useMemo(() => {
    return shuffleArray([...(selectedCategoryQuestions?.questions || [])]);
  }, [selectedCategory]);

  const randomQuestions = useMemo(() => {
    return shuffledQuestions?.slice(0, 3);
  }, [shuffledQuestions]);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      onChangeQuery(localQuery); // Trigger search action on Enter key press
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <section className="ask-gurudev-main-search">
        <div className="container">
          <div className="main-search-area">
            <div className="search-tags">
              {randomQuestions?.map((question, index) => {
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
                value={localQuery}
                onChange={onSearchChangeQuery}
                autoComplete="off"
                ref={queryInputRef}
                className={`${localQuery ? 'input has-value' : ''}`}
                onKeyDown={handleKeyPress} // Call handleKeyPress on key down
              />
              <button
                className="search-button"
                onClick={localQuery ? () => onChangeQuery(localQuery) : null}
                style={{
                  backgroundImage: `url(/img/map-search-input-icon-2.svg)`,
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </form>
  );
};

export default SearchOptions;
