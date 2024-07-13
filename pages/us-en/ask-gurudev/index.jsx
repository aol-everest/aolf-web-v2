/* eslint-disable react/no-unescaped-entities */
import React, {
  useCallback,
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import SearchOptions from './SearchOptions/SearchOptions';
import CategoryTabs from './CategoryTabs';
import { useDebounce } from 'react-use';
import { useRouter } from 'next/router';
import { useQueryString } from '@hooks';
import Footer from './Footer';
import SearchResultsList from './SearchResultsList/SearchResultsList';
import { Loader } from '@components/loader';
import { ALERT_TYPES } from '@constants';
import { useGlobalAlertContext } from '@contexts';

export default function AskGurudev() {
  const { showAlert } = useGlobalAlertContext();
  const [query, setQuery] = useQueryString('query');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Anger');
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [searchResult, setSearchResult] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const elementRef = useRef(null);

  const selectedQueryResponse = useMemo(() => {
    return searchResult?.matches?.[selectedPageIndex];
  }, [searchResult, selectedPageIndex]);

  // const { data, isLoading, isError, error } = useQuery({
  //   queryKey: 'yt-playlist',
  //   queryFn: async () => {
  //     const result = await youtube.getPlaylistDetails(PLAYLIST_ID);
  //     return result;
  //   },
  // });

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
    1000,
    [query],
  );

  useEffect(() => {
    const getApiData = async (query) => {
      setLoading(true);
      try {
        const apiUrl = `https://askgurudev.me/search/?question=${query}`;
        const response = await fetch(apiUrl);
        const result = await response.json();
        setSearchResult(result);
        setSelectedPageIndex(0);
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
    if (elementRef.current) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [selectedQueryResponse]);

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

  const handleVoteSelect = async (isUpvoteSelected) => {
    const rating = isUpvoteSelected ? 1 : -1;
    try {
      const apiUrl = `https://askgurudev.me/feedback/?hash=${searchResult.hash}&rating=${rating}&sample=${selectedPageIndex}`;
      const response = await fetch(apiUrl);
      const result = await response.json();
      showAlert(ALERT_TYPES.SUCCESS_ALERT, {
        children: 'Your feedback submitted successfully',
      });
    } catch (error) {
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: 'we had a trouble submitting feeback, please try again later',
      });
      console.log('error', error);
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = searchResult?.matches && !searchResult?.matches.length;
  const currentMeta = selectedQueryResponse?.meta;

  const EmptyResults = () => {
    return (
      <div className="emptyResults">
        <h5>
          Sorry, there is a limited set of topics we can help with and we may
          not be able to answer this question. Try something else?
        </h5>
      </div>
    );
  };

  const CustomMessage = () => {
    const message = getErrorMessagesForMeta();
    return (
      <div className="emptyResults">
        <p dangerouslySetInnerHTML={{ __html: message }} />
      </div>
    );
  };

  const getErrorMessagesForMeta = () => {
    switch (currentMeta) {
      case 'error':
        return "Hi friend :) Thanks for trying the beta version of AskGurudev, but something unexpected happened. Please try again later and see Gurudev's <a href='https://www.instagram.com/gurudev'>instagram</a> for wisdom!";
      case 'llm out of scope':
      case 'filtered honeypot':
      case 'above threshold':
      case 'filtered stop word':
        return 'Sorry, there is a limited set of topics we can help with and we may not be able to answer this question. Try something else?';
      case 'suicide':
        return "Hi there, Below is a wisdom sheet from Gurudev. You are so loved and as Gurudev says, 'know that you are very much needed in this world' too. You are not alone, we are with you, and help is available. To speak with a certified listener in the USA, call the National Suicide Prevention Hotline at <a href='tel:988'>988</a>. In India, call the Aasra hotline at <a href='tel:+91-9820466726'>91-9820466726</a> . For other countries, find a helpline <a href='https://findahelpline.com/'>here</a>. To speak to an Art of Living teacher, call or message 408-759-1301.";
      default:
        return '';
    }
  };

  return (
    <main className="ask-gurudev-page">
      <section className="ask-gurudev-top">
        <div className="container">
          <h1 className="page-title">Ask Gurudev</h1>
          <CategoryTabs
            setSelectedCategory={setSelectedCategory}
            selectedCategory={selectedCategory}
          />
        </div>
      </section>
      <SearchOptions
        onChangeQuery={onChangeQuery}
        setQuery={setQuery}
        setDebouncedQuery={setDebouncedQuery}
        query={query}
        isLoading={loading}
        setSearchResult={setSearchResult}
        selectedCategory={selectedCategory}
      />

      <section className="search-results-area" ref={elementRef}>
        <div className="container">
          <div className="tab-content categories-tab-content" id="nav-anger">
            {isEmpty && debouncedQuery && !loading && <EmptyResults />}
            {<CustomMessage />}
            {loading && <Loader />}
            <SearchResultsList
              result={selectedQueryResponse || {}}
              debouncedQuery={debouncedQuery}
            />
          </div>
          {selectedQueryResponse && (
            <Footer
              results={searchResult?.matches}
              handleVoteSelect={handleVoteSelect}
              setSelectedPageIndex={setSelectedPageIndex}
              selectedPageIndex={selectedPageIndex}
            />
          )}
        </div>
      </section>
    </main>
  );
}
