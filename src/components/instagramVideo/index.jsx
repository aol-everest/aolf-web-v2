/* eslint-disable no-inline-styles/no-inline-styles */
import { useEffect } from 'react';
import { InstagramEmbed } from 'react-social-media-embed';

const InstagramVideo = ({ video }) => {
  useEffect(() => {
    if (window.instgrm && window.instgrm.Embeds) {
      window.instgrm.Embeds.process();
    }
  }, []);
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <InstagramEmbed
        url={video}
        width="100%"
        height="auto"
        captioned
        igVersion={12}
        placeholderSpinnerDisabled
        placeholderProps={{
          url: video,
          linkText: 'Please click to view on Instagram',
          spinnerDisabled: true,
        }}
      />
    </div>
  );
};
export default InstagramVideo;
