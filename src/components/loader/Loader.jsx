import React from "react";
import Fade from "react-reveal/Fade";

export const Loader = () => {
  return (
    <Fade opposite>
      <div className="cover-spin"></div>
    </Fade>
  );
};
