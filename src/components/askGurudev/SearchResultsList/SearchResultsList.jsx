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
}) => {
  const [playingId, setPlayingId] = useState(null);
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <SearchResult
        result={result}
        setPlayingId={setPlayingId}
        playingId={playingId}
        handleVoteSelect={handleVoteSelect}
        selectedVotes={selectedVotes}
        selectedPageIndex={selectedPageIndex}
        query={query}
        currentMeta={currentMeta}
      />
    </AnimatePresence>
  );
};

export default SearchResultsList;
