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
      <InstagramEmbed url={video} width="100%" captioned igVersion={12} />
    </div>
  );
};
export default InstagramVideo;
