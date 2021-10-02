import React from "react";

const InternalServerError = () => {
  return (
    <div className="not-found">
      <div>
        <h1 className="not-found-heading">404</h1>
        <div className="not-found-sub-heading-container">
          <h2 className="not-found-sub-heading">Server-side error occurred.</h2>
        </div>
      </div>
    </div>
  );
};

export default InternalServerError;
