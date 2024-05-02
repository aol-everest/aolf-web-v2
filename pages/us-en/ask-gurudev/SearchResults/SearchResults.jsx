'use client';

import React, { useCallback } from 'react';
import SearchResultsList from '../SearchResultsList/SearchResultsList';

export const EmptyResults = () => {
  return (
    <div className="emptyResults">
      <h5>No results found, please refine your search criteria.</h5>
    </div>
  );
};

export const IncorrectResults = () => {
  return (
    <div className="emptyResults">
      <h5>For relavent results, please refine your search criteria.</h5>
    </div>
  );
};

const SearchResults = ({
  results,
  debouncedQuery,
  error,
  isEmpty,
  isLoading,
  setQuery,
  setDebouncedQuery,
  query,
  incorrectResponse,
}) => {
  const handlePredefinedElements = useCallback(
    (query) => {
      setQuery(query);
      setDebouncedQuery(query);
    },
    [setQuery, setDebouncedQuery],
  );

  if (error) {
    return <div>Error loading results</div>;
  }

  const isSelectedItem = (element) => {
    return query?.toLowerCase() === element.toLowerCase();
  };

  return (
    <>
      {isLoading && <div className="cover-spin"></div>}
      <section className="search-results-area">
        <div className="container">
          {results && incorrectResponse && !isEmpty && <IncorrectResults />}
          <nav className="category-tabs-wrap">
            <div
              className="nav nav-tabs category-tabs"
              id="nav-tab"
              role="tablist"
            >
              <button
                onClick={() => handlePredefinedElements('Relationship')}
                className={`nav-link ${isSelectedItem('Relationship') ? 'active' : ''}`}
                id="nav-relation-tab"
                data-bs-toggle="tab"
                data-bs-target="#nav-relation"
                type="button"
                role="tab"
                aria-controls="nav-relation"
                aria-selected="true"
              >
                <span className="icon-aol iconaol-relationship"></span>
                Relationship
              </button>
              <button
                onClick={() => handlePredefinedElements('Finance')}
                className={`nav-link ${isSelectedItem('Finance') ? 'active' : ''}`}
                id="nav-finance-tab"
                data-bs-toggle="tab"
                data-bs-target="#nav-finance"
                type="button"
                role="tab"
                aria-controls="nav-finance"
                aria-selected="false"
              >
                <span className="icon-aol iconaol-finance"></span>Finance
              </button>
              <button
                onClick={() => handlePredefinedElements('Health')}
                className={`nav-link ${isSelectedItem('Health') ? 'active' : ''}`}
                id="nav-health-tab"
                data-bs-toggle="tab"
                data-bs-target="#nav-health"
                type="button"
                role="tab"
                aria-controls="nav-health"
                aria-selected="false"
              >
                <span className="icon-aol iconaol-health-care"></span>Health
              </button>
              <button
                onClick={() => handlePredefinedElements('Enlightment')}
                className={`nav-link ${isSelectedItem('Enlightment') ? 'active' : ''}`}
                id="nav-enlight-tab"
                data-bs-toggle="tab"
                data-bs-target="#nav-enlight"
                type="button"
                role="tab"
                aria-controls="nav-enlight"
                aria-selected="true"
              >
                <span className="icon-aol iconaol-idea"></span>Enlightment
              </button>
              <button
                onClick={() => handlePredefinedElements('Guru')}
                className={`nav-link ${isSelectedItem('Guru') ? 'active' : ''}`}
                id="nav-guru-tab"
                data-bs-toggle="tab"
                data-bs-target="#nav-guru"
                type="button"
                role="tab"
                aria-controls="nav-guru"
                aria-selected="false"
              >
                <span className="icon-aol iconaol-ascetic"></span>Guru
              </button>
              <button
                onClick={() => handlePredefinedElements('Karma')}
                className={`nav-link ${isSelectedItem('Karma') ? 'active' : ''}`}
                id="nav-karma-tab"
                data-bs-toggle="tab"
                data-bs-target="#nav-karma"
                type="button"
                role="tab"
                aria-controls="nav-karma"
                aria-selected="false"
              >
                <span className="icon-aol iconaol-lotus"></span>Karma
              </button>
              <button
                onClick={() => handlePredefinedElements('God')}
                className={`nav-link ${isSelectedItem('God') ? 'active' : ''}`}
                id="nav-god-tab"
                data-bs-toggle="tab"
                data-bs-target="#nav-god"
                type="button"
                role="tab"
                aria-controls="nav-god"
                aria-selected="true"
              >
                <span className="icon-aol iconaol-hindu-god"></span>God
              </button>
              <button
                onClick={() => handlePredefinedElements('Meditation')}
                className={`nav-link ${isSelectedItem('Meditation') ? 'active' : ''}`}
                id="nav-meditation-tab"
                data-bs-toggle="tab"
                data-bs-target="#nav-meditation"
                type="button"
                role="tab"
                aria-controls="nav-meditation"
                aria-selected="false"
              >
                <span className="icon-aol iconaol-meditation"></span>Meditation
              </button>
              <button
                onClick={() => handlePredefinedElements('Death')}
                className={`nav-link ${isSelectedItem('Death') ? 'active' : ''}`}
                id="nav-death-tab"
                data-bs-toggle="tab"
                data-bs-target="#nav-death"
                type="button"
                role="tab"
                aria-controls="nav-death"
                aria-selected="false"
              >
                <span className="icon-aol iconaol-death"></span>Death
              </button>
            </div>
          </nav>

          {results && isEmpty && debouncedQuery && <EmptyResults />}
          {results && !isEmpty && (
            <div
              className="tab-content categories-tab-content"
              id="nav-tabContent"
            >
              <div
                className="tab-pane fade show active"
                id="nav-relation"
                role="tabpanel"
                aria-labelledby="nav-home-tab"
              >
                <div className="ask-gurudev-videos-list">
                  <SearchResultsList results={results} />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default SearchResults;
