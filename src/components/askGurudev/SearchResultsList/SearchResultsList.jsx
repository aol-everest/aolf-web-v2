import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import SearchResult from '../SearchResult/SearchResult';

const SearchResultsList = ({
  result,
  selectedVotes,
  handleVoteSelect,
  selectedPageIndex,
  query,
  currentMeta,
  results,
}) => {
  const [playingId, setPlayingId] = useState(null);
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <SearchResult
        selectedResult={result}
        setPlayingId={setPlayingId}
        playingId={playingId}
        handleVoteSelect={handleVoteSelect}
        selectedVotes={selectedVotes}
        selectedPageIndex={selectedPageIndex}
        query={query}
        currentMeta={currentMeta}
        results={results}
      />
    </AnimatePresence>
  );
};

export default SearchResultsList;
