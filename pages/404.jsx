import Head from 'next/head';
import Link from 'next/link';

const NotFoundIcon = () => (
  <img src="/img/med-error.svg" className="tw-w-24 tw-h-24" alt="404" />
);

const PageNotFound = () => {
  return (
    <>
      <Head>
        <title>Page Not Found | Art of Living</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-p-4">
        <div className="tw-text-center tw-max-w-lg">
          <NotFoundIcon />

          <h1 className="tw-text-4xl tw-font-bold tw-mt-6 tw-text-gray-800">
            404
          </h1>

          <h2 className="tw-mt-2 tw-text-lg tw-text-gray-600">
            This page could not be found
          </h2>

          <p className="tw-mt-4 tw-text-sm tw-text-gray-500">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>

          <div className="tw-mt-8 tw-flex tw-justify-center tw-gap-4">
            <button
              onClick={() => window.history.back()}
              className="btn-primary tw-max-w-[160px] tw-w-full tw-text-center !tw-p-2"
            >
              Go Back
            </button>
            <Link
              href="/"
              className="btn-secondary tw-max-w-[160px] tw-w-full tw-text-center !tw-p-2 tw-justify-center"
            >
              Return Home
            </Link>
          </div>

          <div className="tw-mt-8 tw-text-sm tw-text-gray-500">
            <p>You might want to check out:</p>
            <div className="tw-mt-4 tw-space-y-2">
              <Link
                href="/us-en/daily-sky"
                className="tw-block hover:tw-underline tw-text-amber-500"
              >
                Daily SKY Practices
              </Link>
              <Link
                href="/us-en/library"
                className="tw-block hover:tw-underline tw-text-amber-500"
              >
                Meditation Library
              </Link>
              <Link
                href="/contact"
                className="tw-block hover:tw-underline tw-text-amber-500"
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

export default PageNotFound;
