import { useState } from 'react';
import {
  generateWalletPass,
  formatPassData,
  detectDeviceWallet,
  handleWalletAction,
} from '@utils';
import PassPreview from './PassPreview';

/**
 * WalletPassButton Component
 * Renders wallet pass buttons based on device type and handles pass generation
 */
const WalletPassButton = ({
  workshop,
  attendeeRecord,
  attendeeId,
  className = '',
  onError = null,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showBothOptions, setShowBothOptions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [passUrls, setPassUrls] = useState(null);
  const deviceType = detectDeviceWallet();

  const handleGeneratePass = async () => {
    if (isGenerating) {
      console.log('🔄 Already generating pass, skipping...');
      return;
    }

    console.log('🚀 Starting wallet pass generation...');
    console.log('📱 Device type detected:', deviceType);
    setIsGenerating(true);

    try {
      // Format the pass data
      const passData = formatPassData(workshop, attendeeRecord, attendeeId);
      console.log('📋 Pass data formatted:', {
        title: passData.title,
        attendeeName: passData.attendeeName,
        serialNumber: passData.serialNumber,
        organizationName: passData.organizationName,
      });

      // Generate the wallet pass
      console.log('📡 Calling generateWalletPass API...');
      const response = await generateWalletPass(passData);
      console.log('✅ API Response received:', response);

      if (response.success) {
        // Handle development mode
        if (response.developmentMode) {
          alert(
            `Development Mode:\n\n${response.message}\n\nBoth Apple Wallet and Google Wallet require proper setup for production use.`,
          );
          return;
        }

        // Show warnings if any
        if (response.warnings) {
          if (response.warnings.appleCertificates) {
            console.warn('Apple Wallet:', response.warnings.appleCertificates);
          }
          if (response.warnings.googleWallet) {
            console.warn('Google Wallet:', response.warnings.googleWallet);
          }
        }

        console.log('🎯 Handling wallet action for device:', deviceType);
        const result = handleWalletAction(response, deviceType);
        console.log('🎯 Wallet action result:', result);

        if (result.showBothOptions) {
          console.log('📱 Showing both wallet options');
          setPassUrls(response);
          setShowBothOptions(true);
        }
      } else {
        throw new Error(response.message || 'Failed to generate wallet pass');
      }
    } catch (error) {
      console.error('❌ Error generating wallet pass:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });
      if (onError) {
        onError(error.message || 'Failed to generate wallet pass');
      } else {
        alert('Failed to generate wallet pass. Please try again.');
      }
    } finally {
      console.log('🏁 Pass generation finished, resetting state');
      setIsGenerating(false);
    }
  };

  const handleAppleWallet = () => {
    console.log('🍎 Apple Wallet button clicked');
    console.log('🔗 Apple Wallet URL:', passUrls?.appleWalletUrl);
    if (passUrls?.appleWalletUrl) {
      console.log('🚀 Opening Apple Wallet URL...');
      window.open(passUrls.appleWalletUrl, '_blank');
    } else {
      console.error('❌ No Apple Wallet URL available');
    }
  };

  const handleGoogleWallet = () => {
    if (passUrls?.googleWalletJwt) {
      const url = `https://pay.google.com/gp/v/save/${passUrls.googleWalletJwt}`;
      window.open(url, '_blank');
    }
  };

  // If showing both options (desktop or unknown device)
  if (showBothOptions) {
    return (
      <div className={`wallet-pass-options ${className}`}>
        <p className="tw-text-sm tw-text-gray-600 tw-mb-3">
          Add your course pass to your mobile wallet:
        </p>
        <div className="tw-flex tw-flex-col tw-gap-2 sm:tw-flex-row">
          <button
            onClick={handleAppleWallet}
            className="tw-flex tw-items-center tw-justify-center tw-px-4 tw-py-2 tw-bg-black tw-text-white tw-rounded-lg tw-text-sm tw-font-medium hover:tw-bg-gray-800 tw-transition-colors"
            disabled={!passUrls?.appleWalletUrl}
          >
            <svg
              className="tw-w-4 tw-h-4 tw-mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.56 3.75c-.735.85-1.89 1.5-3.05 1.42-.13-1.18.47-2.34 1.15-3.09.69-.78 1.9-1.36 2.93-1.4.1 1.22-.37 2.43-1.03 3.07zm.73 1.25c-1.63-.09-3.02.92-3.8.92-.79 0-1.99-.87-3.28-.85-1.69.03-3.24.98-4.11 2.5-1.75 3.03-.45 7.51 1.26 9.96.83 1.2 1.84 2.55 3.16 2.5 1.28-.05 1.76-.82 3.31-.82 1.54 0 1.98.82 3.31.79 1.37-.03 2.26-1.24 3.11-2.44 1-1.39 1.4-2.73 1.42-2.8-.03-.01-2.73-1.05-2.76-4.17-.02-2.61 2.13-3.86 2.23-3.92-1.22-1.78-3.11-1.98-3.78-2.01z" />
            </svg>
            Add to Apple Wallet
          </button>

          <button
            onClick={handleGoogleWallet}
            className="tw-flex tw-items-center tw-justify-center tw-px-4 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-lg tw-text-sm tw-font-medium hover:tw-bg-blue-700 tw-transition-colors"
            disabled={!passUrls?.googleWalletJwt}
          >
            <svg
              className="tw-w-4 tw-h-4 tw-mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Add to Google Wallet
          </button>
        </div>
        <button
          onClick={() => setShowBothOptions(false)}
          className="tw-text-sm tw-text-gray-500 tw-mt-2 hover:tw-text-gray-700"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Single button for specific device type
  const getButtonText = () => {
    if (isGenerating) return 'Generating Pass...';

    switch (deviceType) {
      case 'apple':
        return 'Add to Apple Wallet';
      case 'google':
        return 'Add to Google Wallet';
      default:
        return 'Add to Wallet';
    }
  };

  const getButtonIcon = () => {
    if (deviceType === 'apple') {
      return (
        <svg
          className="tw-w-4 tw-h-4 tw-mr-2"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17.56 3.75c-.735.85-1.89 1.5-3.05 1.42-.13-1.18.47-2.34 1.15-3.09.69-.78 1.9-1.36 2.93-1.4.1 1.22-.37 2.43-1.03 3.07zm.73 1.25c-1.63-.09-3.02.92-3.8.92-.79 0-1.99-.87-3.28-.85-1.69.03-3.24.98-4.11 2.5-1.75 3.03-.45 7.51 1.26 9.96.83 1.2 1.84 2.55 3.16 2.5 1.28-.05 1.76-.82 3.31-.82 1.54 0 1.98.82 3.31.79 1.37-.03 2.26-1.24 3.11-2.44 1-1.39 1.4-2.73 1.42-2.8-.03-.01-2.73-1.05-2.76-4.17-.02-2.61 2.13-3.86 2.23-3.92-1.22-1.78-3.11-1.98-3.78-2.01z" />
        </svg>
      );
    }

    if (deviceType === 'google') {
      return (
        <svg
          className="tw-w-4 tw-h-4 tw-mr-2"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      );
    }

    return (
      <svg
        className="tw-w-4 tw-h-4 tw-mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    );
  };

  const getButtonStyles = () => {
    const baseStyles =
      'tw-flex tw-items-center tw-justify-center tw-px-4 tw-py-2 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-colors tw-min-w-[160px]';

    if (deviceType === 'apple') {
      return `${baseStyles} tw-bg-black tw-text-white hover:tw-bg-gray-800 disabled:tw-bg-gray-400`;
    }

    if (deviceType === 'google') {
      return `${baseStyles} tw-bg-blue-600 tw-text-white hover:tw-bg-blue-700 disabled:tw-bg-blue-400`;
    }

    return `${baseStyles} tw-bg-gray-800 tw-text-white hover:tw-bg-gray-700 disabled:tw-bg-gray-400`;
  };

  // Show preview if requested
  if (showPreview) {
    const passData = formatPassData(workshop, attendeeRecord, attendeeId);

    return (
      <div className={`wallet-pass-preview ${className}`}>
        <div className="tw-text-center tw-mb-4">
          <h3 className="tw-text-lg tw-font-semibold tw-mb-2">Pass Preview</h3>
          <p className="tw-text-sm tw-text-gray-600 tw-mb-4">
            This is how your wallet pass will look
          </p>

          {/* Preview Tabs */}
          <div className="tw-flex tw-justify-center tw-mb-4">
            <div className="tw-bg-gray-100 tw-rounded-lg tw-p-1 tw-flex">
              <button className="tw-px-3 tw-py-1 tw-rounded tw-text-sm tw-transition-colors tw-bg-white tw-shadow-sm">
                Apple Wallet
              </button>
              <button className="tw-px-3 tw-py-1 tw-rounded tw-text-sm tw-transition-colors tw-text-gray-600 hover:tw-text-gray-800">
                Google Pay
              </button>
            </div>
          </div>

          <PassPreview passData={passData} type="apple" />

          <div className="tw-flex tw-justify-center tw-gap-3 tw-mt-6">
            <button
              onClick={() => setShowPreview(false)}
              className="tw-px-4 tw-py-2 tw-text-gray-600 tw-border tw-border-gray-300 tw-rounded-lg tw-text-sm hover:tw-bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={(e) => {
                console.log('🖱️ Preview generate button clicked!');
                console.log('📱 Current device type:', deviceType);
                console.log('⚡ Is generating:', isGenerating);
                console.log('🎯 Event:', e);
                handleGeneratePass();
              }}
              disabled={isGenerating}
              className={getButtonStyles()}
            >
              {isGenerating ? 'Generating...' : 'Generate Pass'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`wallet-pass-button ${className}`}>
      <div className="tw-flex tw-gap-2">
        <button
          onClick={(e) => {
            console.log('🖱️ Main wallet button clicked!');
            console.log('📱 Current device type:', deviceType);
            console.log('⚡ Is generating:', isGenerating);
            console.log('🎯 Event:', e);
            handleGeneratePass();
          }}
          disabled={isGenerating}
          className={getButtonStyles()}
        >
          {isGenerating ? (
            <>
              <svg
                className="tw-animate-spin tw-w-4 tw-h-4 tw-mr-2"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="tw-opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="tw-opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              {getButtonIcon()}
              {getButtonText()}
            </>
          )}
        </button>

        <button
          onClick={() => setShowPreview(true)}
          className="tw-px-3 tw-py-2 tw-text-gray-600 tw-border tw-border-gray-300 tw-rounded-lg tw-text-sm hover:tw-bg-gray-50 tw-transition-colors"
          title="Preview pass design"
        >
          👁️
        </button>
      </div>
    </div>
  );
};

export default WalletPassButton;
