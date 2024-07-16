import { useEffect } from 'react';

const InstagramVideo = ({ videoId }) => {
  useEffect(() => {
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    }
  }, []);

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={`https://www.instagram.com/p/${videoId}/`}
      data-instgrm-version="12"
    >
      <div>
        <a
          href={`https://www.instagram.com/p/${videoId}/`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Watch on Instagram
        </a>
      </div>
    </blockquote>
  );
};

export default InstagramVideo;
