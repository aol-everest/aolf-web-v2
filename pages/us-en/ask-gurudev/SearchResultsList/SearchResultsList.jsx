import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import SearchResult from '../SearchResult/SearchResult';
import SearchResultDefault from '../SearchResult/SearchResultDefault';

const SearchResultsList = ({ results, defaultVideos, debouncedQuery }) => {
  const [playingId, setPlayingId] = useState(null);
  const [first, second, third] = defaultVideos || [];
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {first && !debouncedQuery && (
        <>
          <SearchResultDefault
            key={first?.id}
            result={first}
            setPlayingId={setPlayingId}
            playingId={playingId}
          />
          <SearchResultDefault
            key={second?.id}
            result={second}
            setPlayingId={setPlayingId}
            playingId={playingId}
          />
          <SearchResultDefault
            key={third?.id}
            result={third}
            setPlayingId={setPlayingId}
            playingId={playingId}
          />
        </>
      )}
      {results?.map((result) => (
        <SearchResult
          key={result.id}
          result={result}
          setPlayingId={setPlayingId}
          playingId={playingId}
        />
      ))}
    </AnimatePresence>
  );
};

export default SearchResultsList;
