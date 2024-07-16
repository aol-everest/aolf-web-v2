import { useEffect } from 'react';

const FacebookVideo = ({ videoId }) => {
  useEffect(() => {
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  }, []);

  return (
    <div
      className="fb-video"
      data-href={`https://www.facebook.com/watch/?v=${videoId}`}
      data-width="auto"
      data-show-text="false"
      data-allowfullscreen="true"
      data-controls="true" // Enable video controls
    ></div>
  );
};

export default FacebookVideo;
