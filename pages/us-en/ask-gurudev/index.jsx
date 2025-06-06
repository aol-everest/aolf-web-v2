/* eslint-disable react/no-unescaped-entities */
import React, {
  useCallback,
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import SearchOptions from '@components/askGurudev/SearchOptions/SearchOptions';
import CategoryTabs from '@components/askGurudev/CategoryTabs';
import { useQueryString } from '@hooks';
import SearchResultsList from '@components/askGurudev/SearchResultsList/SearchResultsList';
import { Loader } from '@components/loader';

export default function AskGurudev() {
  const [query, setQuery] = useQueryString('query', {
    defaultValue: 'What is the purpose of my life?',
  });
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [searchResult, setSearchResult] = useState({});
  const [selectedVotes, setSelectedVotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialPageLoad, setInitialPageLoad] = useState(true);
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
    }
  }, []);

  useEffect(() => {
    const getApiData = async (query) => {
      if (
        query &&
        query !== 'What is the purpose of my life?' &&
        initialPageLoad
      ) {
        setInitialPageLoad(false);
      }
      setSearchResult({});
      setLoading(true);
      try {
        const apiUrl = `https://askgurudev.me/public_search/?question=${query}`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'X-API-KEY': 'journey',
          },
        });
        const result = await response.json();
        setSearchResult(result);
        setSelectedPageIndex(0);
        setSelectedVotes({});
      } catch (error) {
        console.log('error', error);
      } finally {
        setLoading(false);
      }
    };
    getApiData(query);
  }, [query]);

  const onChangeQuery = useCallback((value) => {
    setInitialPageLoad(false);
    setQuery(value);
  }, []);

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
    const selectedVotesData = {
      ...selectedVotes,
      [selectedPageIndex]: rating,
    };
    setSelectedVotes(selectedVotesData);
    try {
      const apiUrl = `https://askgurudev.me/public_feedback/?hash=${searchResult.hash}&rating=${rating}&sample=${selectedPageIndex}`;
      await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'X-API-KEY': 'journey',
        },
      });

      setFeedbackText('Your feedback submitted successfully');
      setTimeout(() => {
        setFeedbackText('');
      }, 2000);
    } catch (error) {
      setFeedbackText(
        'we had a trouble submitting feeback, please try again later',
      );
      setTimeout(() => {
        setFeedbackText('');
      }, 2000);
      console.log('error', error);
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = searchResult?.matches && !searchResult?.matches.length;
  const currentMeta = searchResult?.meta;

  const EmptyResults = () => {
    return (
      <div className="disclaimer">
        <div className="emptyResults">
          <p>
            Sorry, there is a limited set of topics we can help with and we may
            not be able to answer this question. Try something else?
          </p>
        </div>
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
        return "Hi friend 😊 Thanks for trying AskGurudev, but something unexpected happened. Please try again later and see Gurudev's <a href='https://www.instagram.com/gurudev'>instagram</a> for wisdom!";
      case 'llm out of scope':
      case 'filtered honeypot':
      case 'above threshold':
      case 'above first threshold':
      case 'filtered stop word':
      case 'random':
        return 'Sorry, there is a limited set of topics we can help with and we may not be able to answer this question. Try something else?';
      case 'suicide':
        return "Hi there, below is a wisdom sheet from Gurudev. You are so loved and as Gurudev says, 'know that you are very much needed in this world' too. You are not alone, we are with you, and help is available. To speak with a certified listener in the USA, call the National Suicide Prevention Hotline at <a href='tel:988'>988</a>. In India, call the Aasra hotline at <a href='tel:+91-9820466726'>91-9820466726</a> . For other countries, find a helpline <a href='https://findahelpline.com/'>here</a>. To speak to an Art of Living teacher, call <a href='tel:(855) 202-4400'>(855) 202-4400</a>";
      default:
        return '';
    }
  };

  return (
    <main className="ask-gurudev-page">
      <section className="ask-gurudev-top">
        {feedbackText && (
          <div id="message" class="copy-message">
            <span class="icon-aol iconaol-stars"></span>
            {feedbackText}
          </div>
        )}
        <div className="container">
          <h1 className="page-title">Ask Gurudev</h1>
          <p className="tw-mt-4 tw-text-sm tw-text-gray-500 tw-text-center">
            Discover answers from Gurudev’s talks, discourses, and satsangs
          </p>
          <CategoryTabs
            setSelectedCategory={setSelectedCategory}
            selectedCategory={selectedCategory}
          />
        </div>
      </section>
      <SearchOptions
        onChangeQuery={onChangeQuery}
        setQuery={setQuery}
        query={query}
        isLoading={loading}
        setSearchResult={setSearchResult}
        selectedCategory={selectedCategory}
        setLoading={setLoading}
      />

      <section className="search-results-area" ref={elementRef}>
        <div className="container">
          <div className="tab-content categories-tab-content" id="nav-anger">
            {isEmpty && query && !loading ? (
              <EmptyResults />
            ) : !initialPageLoad && !query ? (
              <div className="disclaimer">{<CustomMessage />}</div>
            ) : (
              initialPageLoad && (
                <div className="disclaimer">
                  Hi there 😊 Type a question, press enter, and we’ll match it
                  to wisdom from Gurudev Sri Sri Ravi Shankar. What are you
                  wondering about?
                </div>
              )
            )}

            {loading && <Loader />}

            <SearchResultsList
              result={selectedQueryResponse || {}}
              handleVoteSelect={handleVoteSelect}
              selectedVotes={selectedVotes}
              selectedPageIndex={selectedPageIndex}
              query={query}
              currentMeta={searchResult?.meta}
              results={searchResult?.matches}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
