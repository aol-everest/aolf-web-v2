import * as Sentry from '@sentry/nextjs';
import NextErrorComponent from 'next/error';
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
        className="tw-flex tw-items-center tw-text-xs tw-text-gray-500 hover:tw-text-gray-700 tw-transition-colors tw-px-2 tw-py-1 tw-rounded-md hover:tw-bg-gray-50"
        aria-label="Toggle error details"
        aria-expanded={isExpanded}
      >
        <svg
          className={`tw-w-3 tw-h-3 tw-mr-1.5 tw-transition-transform ${isExpanded ? 'tw-rotate-90' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M9 18L15 12L9 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Technical Details
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
    <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-p-4">
      <div className="tw-text-center tw-max-w-lg">
        <ErrorIcon statusCode={500} />

        <h1 className="tw-text-4xl tw-font-bold tw-mt-6 tw-text-gray-800">
          500
        </h1>

        <h2 className="tw-mt-2 tw-text-lg tw-text-gray-600">
          An error occurred on server
        </h2>

        <p className="tw-mt-4 tw-text-sm tw-text-gray-500">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>

        <div className="tw-mt-8 tw-flex tw-justify-center tw-gap-4">
          <button
            onClick={() => window.history.back()}
            className="btn-primary tw-max-w-[160px] tw-w-full tw-text-center !tw-p-2"
            aria-label="Go back to previous page"
          >
            Go Back
          </button>
          <Link
            href="/"
            className="btn-secondary tw-max-w-[160px] tw-w-full tw-text-center !tw-p-2 tw-justify-center"
            aria-label="Return to home page"
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
              href="/us-en/library"
              className="tw-block tw-text-amber-500 hover:tw-underline"
            >
              Meditation Library
            </Link>
            <Link
              href="/contact"
              className="tw-block tw-text-amber-500 hover:tw-underline"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

ServerError.propTypes = {
  err: PropTypes.shape({
    message: PropTypes.string,
    stack: PropTypes.string,
  }),
};

const MyError = ({ statusCode, hasGetInitialPropsRun, err }) => {
  if (process.env.NODE_ENV !== 'production' && err) {
    console.error(err);
  }

  if (!hasGetInitialPropsRun && err) {
    Sentry.captureException(err);
  }

  // If the status code is 500, render the static 500 page
  if (statusCode === 500) {
    return <ServerError err={err} />;
  }

  const errorMessage =
    statusCode === 404
      ? 'This page could not be found'
      : 'An error occurred on server';

  return (
    <>
      <Head>
        <title>{`Error ${statusCode || 500} | Art of Living`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-p-4">
        <div className="tw-text-center tw-max-w-lg">
          <ErrorIcon statusCode={statusCode} />

          <h1 className="tw-text-4xl tw-font-bold tw-mt-6 tw-text-gray-800">
            {statusCode || 500}
          </h1>

          <h2 className="tw-mt-2 tw-text-lg tw-text-gray-600">
            {errorMessage}
          </h2>

          <p className="tw-mt-4 tw-text-sm tw-text-gray-500">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>

          <div className="tw-mt-8 tw-flex tw-justify-center tw-gap-4">
            <button
              onClick={() => window.history.back()}
              className="btn-primary tw-max-w-[160px] tw-w-full tw-text-center !tw-p-2"
              aria-label="Go back to previous page"
            >
              Go Back
            </button>
            <Link
              href="/"
              className="btn-secondary tw-max-w-[160px] tw-w-full tw-text-center !tw-p-2 tw-justify-center"
              aria-label="Return to home page"
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

MyError.propTypes = {
  statusCode: PropTypes.number.isRequired,
  hasGetInitialPropsRun: PropTypes.bool.isRequired,
  err: PropTypes.shape({
    message: PropTypes.string,
    stack: PropTypes.string,
  }),
};

MyError.getInitialProps = async (contextData) => {
  const { res, err, asPath } = contextData;

  // First, capture the error in Sentry
  await Sentry.captureUnderscoreErrorException(contextData);

  // Get error props from NextErrorComponent
  const errorInitialProps = await NextErrorComponent.getInitialProps({
    res,
    err,
  });

  // If it's a 500 error, set the status code
  if (res?.statusCode === 500) {
    errorInitialProps.statusCode = 500;
  }

  // Include error message in all environments
  errorInitialProps.err = {
    message: err?.message,
    stack: err?.stack,
  };

  errorInitialProps.hasGetInitialPropsRun = true;

  if (err) {
    Sentry.captureException(err);
    await Sentry.flush(2000);
    return errorInitialProps;
  }

  // Unexpected errors
  Sentry.captureException(
    new Error(`_error.js getInitialProps missing data at path: ${asPath}`),
  );
  await Sentry.flush(2000);

  return errorInitialProps;
};

export default MyError;
