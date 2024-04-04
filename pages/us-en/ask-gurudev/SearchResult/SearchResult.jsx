import * as React from 'react';
import cs from 'clsx';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

import styles from './styles.module.css';

export const SearchResult = React.forwardRef(function SearchResult(
  { result, className },
  ref,
) {
  const time = result.metadata.start.split('.')[0];
  const youtubeUrl = `https://youtube.com/watch?v=${result.metadata.videoId}&t=${time}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${result.metadata.videoId}/maxresdefault.jpg`;

  const MAX_WORDS = 30;

  const truncateToWords = (html, maxWords) => {
    // Create a temporary element to parse the HTML string
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;

    // Get the text content from the HTML
    const textContent = tempElement.textContent || tempElement.innerText || '';

    // Split the text content into words
    const words = textContent.trim().split(/\s+/);

    // Take the first `maxWords` words and join them back into a string
    const truncatedText = words.slice(0, maxWords).join(' ');

    return truncatedText;
  };

  return (
    <motion.div
      className={cs(styles.searchResult, className)}
      initial={{ scale: 0, translateY: -50 }}
      animate={{ scale: 1, translateY: 0 }}
      exit={{ scale: 0, translateY: 50 }}
      ref={ref}
    >
      <div className="ask-gurudev-video-item">
        <div className="video-text">
          <p
            dangerouslySetInnerHTML={{
              __html: truncateToWords(result.matchedHtml, MAX_WORDS),
            }}
          />
        </div>
        <div className="video-player-wrap">
          <Link
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className={styles.frame}
          >
            {thumbnailUrl ? (
              <Image
                className={styles.thumbnail}
                src={thumbnailUrl}
                alt={`YouTube ${result.metadata.title}`}
                width={378}
                height={203}
                unoptimized
                blurDataURL={result.metadata.preview}
              />
            ) : (
              result.metadata.title
            )}

            <div className={styles.overlay}>
              <div className={styles.youtubeButton} />
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
});
