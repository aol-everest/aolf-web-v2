import * as React from 'react';
import { AnimatePresence } from 'framer-motion';
import SearchResult from '../SearchResult/SearchResult';

const SearchResultsList = ({ results }) => {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {results?.map((result) => (
        <SearchResult key={result.id} result={result} />
      ))}
    </AnimatePresence>
  );
};

export default SearchResultsList;
