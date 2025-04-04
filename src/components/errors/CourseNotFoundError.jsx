import Head from 'next/head';
import Link from 'next/link';
import { memo } from 'react';

const ErrorIcon = memo(() => {
  return (
    <img
      src="/img/med-error.svg"
      className="tw-w-24 tw-h-24"
      alt="Course Not Found"
    />
  );
});

ErrorIcon.displayName = 'ErrorIcon';

const CourseNotFoundError = () => {
  return (
    <>
      <Head>
        <title>Course Not Found | Art of Living</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-p-4">
        <div className="tw-text-center tw-max-w-lg">
          <ErrorIcon />

          <h1 className="tw-text-4xl tw-font-bold tw-mt-6 tw-text-gray-800">
            Course Not Found
          </h1>

          <h2 className="tw-mt-2 tw-text-lg tw-text-gray-600">
            This course is not valid or currently unavailable
          </h2>

          <p className="tw-mt-4 tw-text-sm tw-text-gray-500">
            Please try again later, choose a different course, or contact
            support for assistance.
          </p>

          <div className="tw-mt-8 tw-flex tw-justify-center tw-gap-4">
            <button
              onClick={() => window.history.back()}
              className="btn-primary tw-max-w-[160px] tw-w-full tw-text-center !tw-p-2"
            >
              Go Back
            </button>
            <Link
              href="/us-en/courses"
              className="btn-secondary tw-max-w-[160px] tw-w-full tw-text-center !tw-p-2 tw-justify-center"
            >
              Browse Courses
            </Link>
          </div>

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

export default CourseNotFoundError;
