import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import SearchResult from '../SearchResult/SearchResult';

const SearchResultsList = ({ result, debouncedQuery }) => {
  const [playingId, setPlayingId] = useState(null);
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <SearchResult
        result={result}
        setPlayingId={setPlayingId}
        playingId={playingId}
      />
    </AnimatePresence>
  );
};

export default SearchResultsList;
