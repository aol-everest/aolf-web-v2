/**
 * Wallet Pass Service
 * Handles generation and management of both Apple Wallet and Google Pay passes
 */

/**
 * Generates wallet pass data for Apple Wallet (.pkpass) and Google Pay
 * @param {Object} passData - The pass data from workshop and attendee record
 * @returns {Promise<Object>} - Object containing Apple and Google wallet URLs
 */
export const generateWalletPass = async (passData) => {
  console.log('🌐 Making fetch request to /api/generateWalletPass');
  console.log('📤 Request payload:', passData);

  try {
    const response = await fetch('/api/generateWalletPass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passData),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ HTTP error response:', errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    console.log('📥 Response data:', data);
    return data;
  } catch (error) {
    console.error('❌ Error generating wallet pass:', error);
    throw error;
  }
};

/**
 * Formats workshop and attendee data for wallet pass generation
 * @param {Object} workshop - Workshop details
 * @param {Object} attendeeRecord - Attendee details
 * @param {string} attendeeId - Attendee ID
 * @returns {Object} - Formatted pass data
 */
export const formatPassData = (workshop, attendeeRecord, attendeeId) => {
  const {
    title = '',
    meetupTitle,
    productTypeId,
    id: courseId,
    formattedStartDateOnly,
    formattedEndDateOnly,
    primaryTeacherName,
    eventStartDate,
    eventEndDate,
    eventStartTime,
    eventEndTime,
    mode,
    locationStreet,
    locationCity,
    locationProvince,
    locationPostalCode,
    locationCountry,
    timings,
  } = workshop;

  const {
    first_name,
    last_name,
    email: userEmail,
    orderExternalId,
    ammountPaid,
  } = attendeeRecord;

  // Create QR code data - this will be used for attendance verification
  const qrCodeData = {
    attendeeId,
    courseId,
    orderExternalId,
    email: userEmail,
  };

  // Format location for display
  const location =
    mode === 'IN_PERSON'
      ? `${locationStreet || ''}, ${locationCity || ''}, ${locationProvince || ''} ${locationPostalCode || ''}, ${locationCountry || ''}`.trim()
      : 'Online';

  // Get first timing for primary display
  const primaryTiming = timings && timings.length > 0 ? timings[0] : null;

  return {
    // Pass identification
    serialNumber: `${attendeeId}_${courseId}`,
    passTypeIdentifier:
      process.env.APPLE_PASS_TYPE_IDENTIFIER || 'pass.com.aolf.course',

    // Course information
    title: title || meetupTitle || 'Art of Living Course',
    description: `Course Registration for ${title || meetupTitle}`,
    courseId,
    productTypeId,

    // Attendee information
    attendeeName: `${first_name || ''} ${last_name || ''}`.trim(),
    attendeeEmail: userEmail,
    attendeeId,

    // Event details
    startDate: eventStartDate,
    endDate: eventEndDate,
    startTime: eventStartTime,
    endTime: eventEndTime,
    formattedStartDate: formattedStartDateOnly,
    formattedEndDate: formattedEndDateOnly,
    location,
    instructor: primaryTeacherName,

    // Timing details
    timings: timings || [],
    primaryTiming,

    // Payment details
    orderNumber: orderExternalId,
    amountPaid: ammountPaid,

    // QR code for attendance
    qrCodeData: JSON.stringify(qrCodeData),

    // Additional metadata
    organizationName: 'Art of Living Foundation',
    mode,
  };
};

/**
 * Detects user device and returns appropriate wallet type
 * @returns {string} - 'apple' for iOS, 'google' for Android, 'both' for unknown
 */
export const detectDeviceWallet = () => {
  if (typeof window === 'undefined') return 'both';

  const userAgent = window.navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'apple';
  } else if (/android/.test(userAgent)) {
    return 'google';
  }

  return 'both';
};

/**
 * Downloads a file from URL
 * @param {string} url - File URL
 * @param {string} filename - Filename for download
 */
export const downloadFile = (url, filename) => {
  console.log('📥 Starting file download');
  console.log('🔗 URL:', url);
  console.log('📎 Filename:', filename);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);

  console.log('🖱️ Clicking download link...');
  link.click();

  document.body.removeChild(link);
  console.log('✅ Download initiated');
};

/**
 * Opens Google Pay "Add to Wallet" flow
 * @param {string} jwt - Google Pay JWT token
 */
export const addToGoogleWallet = (jwt) => {
  const url = `https://pay.google.com/gp/v/save/${jwt}`;
  window.open(url, '_blank');
};

/**
 * Handles wallet pass action based on device type
 * @param {Object} passUrls - Object containing apple and google wallet URLs
 * @param {string} deviceType - Device type ('apple', 'google', or 'both')
 */
export const handleWalletAction = (passUrls, deviceType = null) => {
  console.log('🎯 handleWalletAction called');
  console.log('📱 Device type:', deviceType);
  console.log('🔗 Pass URLs:', {
    appleWalletUrl: passUrls.appleWalletUrl ? 'Available' : 'Not available',
    googleWalletJwt: passUrls.googleWalletJwt ? 'Available' : 'Not available',
  });

  const detectedDevice = deviceType || detectDeviceWallet();
  console.log('📱 Detected device:', detectedDevice);

  if (detectedDevice === 'apple' && passUrls.appleWalletUrl) {
    console.log('🍎 Handling Apple Wallet download');
    // For iOS devices, download the .pkpass file
    downloadFile(passUrls.appleWalletUrl, 'course-pass.pkpass');
  } else if (detectedDevice === 'google' && passUrls.googleWalletJwt) {
    console.log('🤖 Handling Google Wallet action');
    // For Android devices, open Google Pay
    addToGoogleWallet(passUrls.googleWalletJwt);
  } else {
    console.log('🖥️ Showing both wallet options (desktop or missing URLs)');
    // For unknown devices or desktop, show both options
    return {
      showBothOptions: true,
      appleWalletUrl: passUrls.appleWalletUrl,
      googleWalletJwt: passUrls.googleWalletJwt,
    };
  }

  console.log('✅ Wallet action handled, not showing both options');
  return { showBothOptions: false };
};
