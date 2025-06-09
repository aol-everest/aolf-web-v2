import { getCourseColors } from '@utils/passDesigner';

/**
 * PassPreview Component
 * Shows a visual preview of the wallet pass design
 */
const PassPreview = ({ passData, type = 'apple' }) => {
  const colors = getCourseColors(passData.productTypeId);

  if (type === 'apple') {
    return (
      <div className="tw-max-w-sm tw-mx-auto tw-bg-white tw-rounded-xl tw-shadow-lg tw-overflow-hidden">
        {/* Pass Header */}
        <div
          className="tw-p-4 tw-text-white"
          style={{ backgroundColor: colors.primary }}
        >
          <div className="tw-flex tw-justify-between tw-items-start tw-mb-3">
            <div className="tw-text-xs tw-font-medium tw-opacity-90">
              Art of Living
            </div>
            <div className="tw-w-8 tw-h-8 tw-bg-white tw-bg-opacity-20 tw-rounded-full tw-flex tw-items-center tw-justify-center">
              <span className="tw-text-xs">📱</span>
            </div>
          </div>

          {/* Primary Field */}
          <h2 className="tw-text-lg tw-font-bold tw-mb-3">{passData.title}</h2>

          {/* Secondary Fields */}
          <div className="tw-flex tw-justify-between tw-mb-3">
            {passData.attendeeName && (
              <div>
                <div className="tw-text-xs tw-opacity-70">Participant</div>
                <div className="tw-text-sm tw-font-medium">
                  {passData.attendeeName}
                </div>
              </div>
            )}
            {passData.formattedStartDate && (
              <div className="tw-text-right">
                <div className="tw-text-xs tw-opacity-70">Course Dates</div>
                <div className="tw-text-sm tw-font-medium">
                  {passData.formattedStartDate} - {passData.formattedEndDate}
                </div>
              </div>
            )}
          </div>

          {/* Auxiliary Fields */}
          <div className="tw-flex tw-justify-between tw-text-xs">
            {passData.location && (
              <div>
                <div className="tw-opacity-70">Location</div>
                <div className="tw-font-medium tw-truncate tw-max-w-[120px]">
                  {passData.location}
                </div>
              </div>
            )}
            {passData.instructor && (
              <div className="tw-text-right">
                <div className="tw-opacity-70">Instructor</div>
                <div className="tw-font-medium">{passData.instructor}</div>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Section */}
        <div className="tw-bg-white tw-p-6 tw-text-center">
          <div className="tw-w-32 tw-h-32 tw-mx-auto tw-bg-gray-100 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-mb-3">
            <div className="tw-text-gray-400 tw-text-center">
              <div className="tw-text-4xl tw-mb-1">⊞</div>
              <div className="tw-text-xs">QR Code</div>
            </div>
          </div>
          <div className="tw-text-xs tw-text-gray-600">
            Scan for attendance verification
          </div>
        </div>

        {/* Bottom Strip */}
        <div
          className="tw-h-2"
          style={{ backgroundColor: colors.secondary }}
        ></div>
      </div>
    );
  }

  // Google Pay Preview
  return (
    <div className="tw-max-w-sm tw-mx-auto tw-bg-white tw-rounded-2xl tw-shadow-lg tw-overflow-hidden">
      {/* Hero Image */}
      <div
        className="tw-h-32 tw-bg-gradient-to-r tw-from-blue-500 tw-to-purple-600"
        style={{ backgroundColor: colors.primary }}
      >
        <div className="tw-p-4 tw-h-full tw-flex tw-flex-col tw-justify-between tw-text-white">
          <div className="tw-flex tw-justify-between tw-items-start">
            <div className="tw-text-xs tw-font-medium tw-opacity-90">
              Art of Living Foundation
            </div>
            <div className="tw-text-xs tw-bg-white tw-bg-opacity-20 tw-px-2 tw-py-1 tw-rounded">
              Google Pay
            </div>
          </div>
          <div>
            <h3 className="tw-text-lg tw-font-bold">{passData.title}</h3>
            <div className="tw-text-sm tw-opacity-90">Course Registration</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="tw-p-4">
        {/* Header */}
        <div className="tw-mb-4">
          <h4 className="tw-font-bold tw-text-gray-800">
            {passData.attendeeName}
          </h4>
        </div>

        {/* Details */}
        <div className="tw-space-y-3 tw-mb-4">
          {passData.formattedStartDate && (
            <div>
              <div className="tw-text-xs tw-text-gray-500 tw-uppercase tw-font-medium">
                Course Dates
              </div>
              <div className="tw-text-sm tw-text-gray-800">
                {passData.formattedStartDate} - {passData.formattedEndDate}
              </div>
            </div>
          )}

          {passData.location && (
            <div>
              <div className="tw-text-xs tw-text-gray-500 tw-uppercase tw-font-medium">
                {passData.mode === 'ONLINE' ? 'Format' : 'Location'}
              </div>
              <div className="tw-text-sm tw-text-gray-800">
                {passData.location}
              </div>
            </div>
          )}

          {passData.instructor && (
            <div>
              <div className="tw-text-xs tw-text-gray-500 tw-uppercase tw-font-medium">
                Instructor
              </div>
              <div className="tw-text-sm tw-text-gray-800">
                {passData.instructor}
              </div>
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="tw-text-center tw-border-t tw-pt-4">
          <div className="tw-w-24 tw-h-24 tw-mx-auto tw-bg-gray-100 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-mb-2">
            <div className="tw-text-gray-400 tw-text-center">
              <div className="tw-text-2xl tw-mb-1">⊞</div>
              <div className="tw-text-xs">QR</div>
            </div>
          </div>
          <div className="tw-text-xs tw-text-gray-600">
            Show QR code for attendance
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassPreview;
