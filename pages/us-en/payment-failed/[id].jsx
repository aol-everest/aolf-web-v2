import { useRouter } from 'next/router';
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

function PaymentFailed() {
  const router = useRouter();
  const { error, previous } = router.query;

  const errorMessage = decodeURIComponent(
    error || 'Payment failed. Please try again.',
  );

  return (
    <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-p-4">
      <div className="tw-text-center tw-max-w-lg">
        <ErrorIcon />

        <h1 className="tw-text-4xl tw-font-bold tw-mt-6 tw-text-gray-800">
          Payment Failed
        </h1>

        <h2 className="tw-mt-2 tw-text-lg tw-text-gray-600">
          The course you are trying to purchase is got failed. you can try again
          by clicking the button below.
        </h2>

        <p className="tw-mt-4 tw-text-sm tw-text-gray-500">{errorMessage}</p>

        <div className="tw-mt-8 tw-flex tw-justify-center tw-gap-4">
          <Link
            href={previous}
            className="btn-primary tw-max-w-[160px] tw-w-full tw-text-center !tw-p-2"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}

// PaymentFailed.noHeader = true;
PaymentFailed.hideFooter = true;

export default PaymentFailed;
