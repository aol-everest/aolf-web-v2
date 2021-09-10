import React from "react";
import Fade from "react-reveal/Fade";

export const InfiniteScrollLoader = () => {
  return (
    <Fade opposite>
      <div className="col-12 order-5">
        <div className="inline-loader-container">
          <div className="wrapper">
            <div className="circle circle-1" />
            <div className="circle circle-1a" />
            <div className="circle circle-2" />
            <div className="circle circle-3" />
          </div>
          <h1>Loading&hellip;</h1>
        </div>
      </div>
    </Fade>
  );
};
