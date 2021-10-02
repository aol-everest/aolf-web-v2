function Error({ statusCode }) {
  return (
    <div className="not-found">
      <div>
        <h1 className="not-found-heading">{statusCode}</h1>
        <div className="not-found-sub-heading-container">
          <h2 className="not-found-sub-heading">
            {statusCode
              ? `An error ${statusCode} occurred on server`
              : "An error occurred on client"}
          </h2>
        </div>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
