import { Fade } from 'react-awesome-reveal';

export const Loader = () => {
  return (
    <Fade opposite>
      <div className="cover-spin"></div>
    </Fade>
  );
};
