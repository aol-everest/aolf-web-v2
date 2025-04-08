import Head from 'next/head';
import Link from 'next/link';
import { useState, memo } from 'react';
import PropTypes from 'prop-types';

const ErrorIcon = memo(({ statusCode }) => {
  return (
    <img
      src="/img/med-error.svg"
      className="tw-w-24 tw-h-24"
      alt={`Error ${statusCode}`}
    />
  );
});

ErrorIcon.displayName = 'ErrorIcon';
ErrorIcon.propTypes = {
  statusCode: PropTypes.number.isRequired,
};

const ErrorDetails = ({ err }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!err?.message && !err?.stack) return null;

  return (
    <div className="tw-mt-6 tw-w-full tw-max-w-2xl">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="tw-text-gray-300 hover:tw-text-gray-400 tw-transition-colors tw-p-0.5 tw-rounded-full hover:tw-bg-gray-50/50 tw-absolute tw-right-4"
        aria-label="Toggle error details"
        aria-expanded={isExpanded}
      >
        <svg
          className="tw-w-4 tw-h-4"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM11 17V11H13V17H11ZM11 7V9H13V7H11Z"
            fill="currentColor"
          />
        </svg>
        <span className="tw-sr-only">Technical Details</span>
      </button>

      {isExpanded && (
        <div
          className="tw-mt-2 tw-p-3 tw-bg-gray-50/50 tw-rounded-md tw-font-mono tw-text-xs tw-overflow-auto tw-border tw-border-gray-100"
          role="region"
          aria-label="Error details"
        >
          <div className="tw-text-red-600 tw-font-medium">{err.message}</div>
          {err.stack && (
            <pre className="tw-mt-2 tw-text-gray-600 tw-whitespace-pre-wrap tw-text-[11px]">
              {err.stack}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

ErrorDetails.propTypes = {
  err: PropTypes.shape({
    message: PropTypes.string,
    stack: PropTypes.string,
  }),
};

const ServerError = ({ err }) => {
  return (
    <>
      <Head>
        <title>Server Error | Art of Living</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-p-4">
        <div className="tw-text-center tw-max-w-lg">
          <ErrorIcon />

          <h1 className="tw-text-4xl tw-font-bold tw-mt-6 tw-text-gray-800">
            500
          </h1>

          <h2 className="tw-mt-2 tw-text-lg tw-text-gray-600">
            An error occurred on server
          </h2>

          <p className="tw-mt-4 tw-text-sm tw-text-gray-500">
            We apologize for the inconvenience. Our team has been notified and
            is working to fix the issue.
          </p>

          <div className="tw-mt-8 tw-flex tw-justify-center tw-gap-4">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary tw-max-w-[160px] tw-w-full tw-text-center !tw-p-2"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="btn-secondary tw-max-w-[160px] tw-w-full tw-text-center !tw-p-2 tw-justify-center"
            >
              Return Home
            </Link>
          </div>

          <ErrorDetails err={err} />

          <div className="tw-mt-8 tw-text-sm tw-text-gray-500">
            <p>You might want to check out:</p>
            <div className="tw-mt-4 tw-space-y-2">
              <Link
                href="/us-en/daily-sky"
                className="tw-block tw-text-amber-500 hover:tw-underline"
              >
                Daily SKY Practices
              </Link>
              <Link
                href="/us-en/courses"
                className="tw-block tw-text-amber-500 hover:tw-underline"
              >
                All Courses
              </Link>
              <Link
                href="https://www.artofliving.org/us-en/contact-us"
                className="tw-block tw-text-amber-500 hover:tw-underline"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServerError;
