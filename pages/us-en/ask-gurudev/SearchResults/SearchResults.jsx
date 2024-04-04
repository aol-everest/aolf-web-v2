'use client';

import React, { useCallback } from 'react';
import { SearchResultsList } from '../SearchResultsList/SearchResultsList';

import styles from './styles.module.css';

export const EmptyResults = () => {
  return (
    <div className={styles.emptyResults}>
      <p>No results found. Try broadening your search.</p>
    </div>
  );
};

export const SearchResults = ({
  results,
  debouncedQuery,
  error,
  isEmpty,
  isLoading,
  setQuery,
  setDebouncedQuery,
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

  return (
    <>
      {isLoading && <div className="cover-spin"></div>}
      <section className="search-results-area">
        <div className="container">
          <h2 className="section-title">How can I get enlightened</h2>
          <nav className="category-tabs-wrap">
            <div
              className="nav nav-tabs category-tabs"
              id="nav-tab"
              role="tablist"
            >
              <button
                onClick={() => handlePredefinedElements('Relationship')}
                className="nav-link active"
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
                className="nav-link"
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
                className="nav-link"
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
                className="nav-link"
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
                className="nav-link"
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
                className="nav-link"
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
                className="nav-link"
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
                className="nav-link"
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
                className="nav-link"
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
                {results && isEmpty && debouncedQuery && <EmptyResults />}
                <SearchResultsList results={results} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
