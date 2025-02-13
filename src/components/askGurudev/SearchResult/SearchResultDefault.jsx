import React from 'react';
import { motion } from 'framer-motion';
import { VideoItemComp } from './SearchResult';
import { truncateString } from '@utils';

const SearchResultDefault = React.forwardRef(function SearchResult(
  { result, setPlayingId, playingId },
  ref,
) {
  const thumbnailUrl = result?.snippet.thumbnails.standard.url;
  const updatedTitle = truncateString(result.snippet.description);

  const onPlayAction = (id) => {
    setPlayingId(id);
  };

  return (
    <motion.div
      className={['searchResult']}
      initial={{ scale: 0, translateY: -50 }}
      animate={{ scale: 1, translateY: 0 }}
      exit={{ scale: 0, translateY: 50 }}
      ref={ref}
    >
      <main className="ask-gurudev-video-item podcasts">
        <section className="video-text">
          <div className="video-text">
            <p>{updatedTitle}</p>
          </div>
          <div className="video-player-wrap">
            <VideoItemComp
              videoId={result.videoDetail.id}
              videoTitle={result.snippet.title}
              thumbnailUrl={thumbnailUrl}
              onPlayAction={onPlayAction}
              playingId={playingId}
            ></VideoItemComp>
          </div>
        </section>
      </main>
    </motion.div>
  );
});

export default SearchResultDefault;
