/* eslint-disable react/no-unescaped-entities */
import React, { useCallback, useState, useEffect } from 'react';
import SearchOptions from './SearchOptions/SearchOptions';
import SearchResults from './SearchResults/SearchResults';
import { useDebounce } from 'react-use';
import { useRouter } from 'next/router';
import { useQueryString } from '@hooks';

export default function AskGurudev() {
  const [query, setQuery] = useQueryString('query');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [incorrectResponse, setIncorrectResponse] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
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
    2000,
    [query],
  );

  useEffect(() => {
    const getApiData = async (query) => {
      setLoading(true);
      try {
        const apiUrl = `https://aolf-ask-gurudev-41c0d69b7bde.herokuapp.com/search?query=${query}`;
        const response = await fetch(apiUrl);
        const result = await response.json();
        setResults(result.searchResults);
        setIncorrectResponse(result.showBetterSearchMessage);
      } catch (error) {
        console.log('error', error);
      } finally {
        setLoading(false);
      }
    };

    if (debouncedQuery) {
      getApiData(debouncedQuery);
    }
  }, [debouncedQuery]);

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

  useEffect(() => {
    const handleEnterKey = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission
        // Perform your search or other action here
      }
    };

    document.addEventListener('keydown', handleEnterKey);

    return () => {
      document.removeEventListener('keydown', handleEnterKey);
    };
  }, []);

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
        setDebouncedQuery={setDebouncedQuery}
        query={query}
        isLoading={loading}
        setResults={setResults}
      />

      <div className="homePage">
        <div className="body">
          <SearchResults
            setQuery={setQuery}
            setDebouncedQuery={setDebouncedQuery}
            isEmpty={isEmpty}
            debouncedQuery={debouncedQuery}
            error={false}
            isLoading={loading}
            results={results}
            query={query}
            incorrectResponse={incorrectResponse}
          />
        </div>
      </div>
    </main>
  );
}
