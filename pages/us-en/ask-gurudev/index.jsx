/* eslint-disable react/no-unescaped-entities */
import React, { useCallback, useState, useEffect } from 'react';
import SearchOptions from './SearchOptions/SearchOptions';
import { SearchResults } from './SearchResults/SearchResults';
import { useDebounce } from 'react-use';
import { useRouter } from 'next/router';
import { useQueryString } from '@hooks';

export default function AskGurudev() {
  const [query, setQuery] = useQueryString('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const query = url.searchParams.get('query');
    if (query) {
      setQuery(query);
      setDebouncedQuery(query);
    }
  }, []);

  useDebounce(
    () => {
      setDebouncedQuery(query);
    },
    500,
    [query],
  );

  const onChangeQuery = useCallback((event) => {
    setQuery(event.target.value);
  }, []);

  useEffect(() => {
    if (!router.query.query && debouncedQuery) {
      setQuery('');
      setDebouncedQuery('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query]);

  // Update the route's searchParams to match local query state
  useEffect(() => {
    const newQuery = {
      ...router.query,
      query: debouncedQuery,
    };

    if (!debouncedQuery) {
      delete newQuery.query;
    }

    setQuery(newQuery?.query || null);
  }, [router, debouncedQuery]);

  const results = [];
  const isEmpty = results && !results.length;

  return (
    <main className="ask-gurudev-page">
      <section className="ask-gurudev-top">
        <div className="container">
          <h1 className="page-title">Ask Gurudev</h1>
          <div className="page-description">
            Ask any question and instantly receive Gurudev's wisdom and insight!
          </div>
        </div>
      </section>
      <SearchOptions
        onChangeQuery={onChangeQuery}
        setQuery={setQuery}
        query={query}
      />

      <div className="homePage">
        <div className="body">
          <SearchResults
            setQuery={setQuery}
            setDebouncedQuery={setDebouncedQuery}
            isEmpty={isEmpty}
            debouncedQuery={debouncedQuery}
            error={false}
            isLoading={false}
            results={results}
          />
        </div>
      </div>
    </main>
  );
}
