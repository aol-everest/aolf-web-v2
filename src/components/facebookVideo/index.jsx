import { Loader } from '@components/loader';
import { useEffect, useState } from 'react';

const FacebookVideo = ({ video }) => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const handleFBEvent = () => {
      if (window.FB) {
        window.FB.Event.subscribe('xfbml.render', () => {
          setIsLoading(false); // Set loading state to false when video is rendered
        });
        window.FB.XFBML.parse(); // Parse the XFBML markup
      }
    };
    handleFBEvent();
  }, []);

  return (
    <div className="video-wrapper">
      {isLoading && <Loader />}
      <div
        className="fb-video"
        data-href={video}
        data-show-text="false"
        data-allowfullscreen="false"
        data-width="auto"
        data-height="auto"
        data-controls="true" // Enable video controls
        style={{ display: isLoading ? 'none' : 'block' }}
      ></div>
    </div>
  );
};

export default FacebookVideo;
