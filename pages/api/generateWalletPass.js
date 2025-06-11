import { PKPass } from 'passkit-generator';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import {
  getAppleWalletStyle,
  createPassLayout,
} from '../../src/utils/passDesigner.js';

/**
 * Gets certificates from environment variables (for Heroku deployment)
 */
function getCertificatesFromEnv() {
  const wwdrBase64 = process.env.APPLE_WWDR_CERT_BASE64;
  const signerCertBase64 = process.env.APPLE_SIGNER_CERT_BASE64;
  const signerKeyBase64 = process.env.APPLE_SIGNER_KEY_BASE64;
  const signerKeyPassphrase = process.env.APPLE_SIGNER_KEY_PASSPHRASE || '';

  if (!wwdrBase64 || !signerCertBase64 || !signerKeyBase64) {
    return null;
  }

  try {
    return {
      wwdr: Buffer.from(wwdrBase64, 'base64'),
      signerCert: Buffer.from(signerCertBase64, 'base64'),
      signerKey: Buffer.from(signerKeyBase64, 'base64'),
      signerKeyPassphrase,
    };
  } catch (error) {
    console.error('Error decoding certificates from environment:', error);
    return null;
  }
}

/**
 * Checks if certificates are available (development vs production)
 */
function areCertificatesAvailable() {
  console.log('🔍 Checking certificate availability...');

  // First try environment variables (production/Heroku)
  const envCerts = getCertificatesFromEnv();
  if (envCerts) {
    console.log('✅ Certificates found in environment variables');
    return true;
  }
  console.log('❌ No certificates in environment variables');

  // Fallback to local files (development)
  const certificatesPath = path.join(process.cwd(), 'certificates');
  console.log('🔍 Checking local certificates directory:', certificatesPath);

  const requiredCerts = ['wwdr.pem', 'signerCert.pem', 'signerKey.pem'];
  const certsExist = requiredCerts.every((cert) => {
    const certPath = path.join(certificatesPath, cert);
    const exists = fs.existsSync(certPath);
    console.log(
      `📜 ${cert}: ${exists ? '✅ Found' : '❌ Missing'} at ${certPath}`,
    );
    return exists;
  });

  console.log('📋 All local certificates available:', certsExist);
  return certsExist;
}

/**
 * API Route: /api/generateWalletPass
 * Generates both Apple Wallet (.pkpass) and Google Pay JWT for wallet passes
 */
export default async function handler(req, res) {
  console.log('🚀 API: generateWalletPass called');
  console.log('📝 Method:', req.method);

  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const passData = req.body;
    console.log('📦 Pass data received:', {
      title: passData.title,
      attendeeName: passData.attendeeName,
      serialNumber: passData.serialNumber,
      organizationName: passData.organizationName,
    });

    // Check if certificates are available (environment or local files)
    console.log('🔍 Checking certificate availability...');
    const hasCertificates = areCertificatesAvailable();
    console.log('📜 Certificates available:', hasCertificates);

    let applePassBuffer = null;
    let appleWalletUrl = null;
    let applePassId = null;

    // Generate Apple Wallet pass only if certificates are available
    if (hasCertificates) {
      console.log('🍎 Generating Apple Wallet pass...');
      try {
        applePassBuffer = await generateAppleWalletPass(passData);
        applePassId = `${passData.serialNumber}_${Date.now()}`;
        console.log(
          '✅ Apple pass generated successfully, size:',
          applePassBuffer.length,
          'bytes',
        );

        // For Heroku, we'll return the pass as a data URL instead of storing it
        const passBase64 = applePassBuffer.toString('base64');
        appleWalletUrl = `/api/downloadPass?data=${passBase64}&filename=${applePassId}.pkpass`;
        console.log('🔗 Apple Wallet URL created:', appleWalletUrl);
      } catch (error) {
        console.error('❌ Apple Wallet pass generation failed:', error.message);
        console.error('❌ Apple Wallet error stack:', error.stack);
      }
    } else {
      console.warn(
        '⚠️ Apple Wallet certificates not found. Skipping Apple Wallet pass generation.',
      );
    }

    // Generate Google Wallet pass
    console.log('🤖 Generating Google Wallet pass...');
    let googleWalletJwt = null;
    try {
      googleWalletJwt = await generateGoogleWalletJwt(passData);
      console.log('✅ Google Wallet JWT generated successfully');
    } catch (error) {
      console.error('❌ Google Wallet pass generation failed:', error.message);
      console.error('❌ Google Wallet error stack:', error.stack);
    }

    // Return success if at least one wallet type was generated
    if (appleWalletUrl || googleWalletJwt) {
      console.log('✅ Pass generation successful');
      console.log(
        '🍎 Apple Wallet URL:',
        appleWalletUrl ? 'Generated' : 'Not available',
      );
      console.log(
        '🤖 Google Wallet JWT:',
        googleWalletJwt ? 'Generated' : 'Not available',
      );

      res.status(200).json({
        success: true,
        appleWalletUrl,
        googleWalletJwt,
        passId: applePassId,
        warnings: {
          appleCertificates: !hasCertificates
            ? 'Apple Wallet certificates not configured'
            : null,
          googleWallet: !googleWalletJwt
            ? 'Google Wallet credentials not configured'
            : null,
        },
      });
    } else {
      // Development mode: provide mock URLs when no credentials are available
      if (
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'test'
      ) {
        res.status(200).json({
          success: true,
          appleWalletUrl: null,
          googleWalletJwt: null,
          passId: null,
          developmentMode: true,
          message:
            'Development mode: No wallet credentials configured. Please set up certificates and environment variables for production.',
          warnings: {
            appleCertificates: !hasCertificates
              ? 'Apple Wallet certificates not configured'
              : null,
            googleWallet: 'Google Wallet credentials not configured',
          },
        });
      } else {
        throw new Error(
          'Neither Apple Wallet nor Google Wallet pass could be generated. Please check your configuration.',
        );
      }
    }
  } catch (error) {
    console.error('Error generating wallet pass:', error);
    res.status(500).json({
      error: 'Failed to generate wallet pass',
      message: error.message,
    });
  }
}

/**
 * Generates Apple Wallet pass (.pkpass)
 */
async function generateAppleWalletPass(passData) {
  // For Heroku deployment, certificates are stored as environment variables (base64 encoded)
  const certificates = getCertificatesFromEnv();

  if (!certificates) {
    throw new Error(
      'Apple Wallet certificates not configured for production deployment.',
    );
  }

  // Create pass model directory if it doesn't exist
  const modelPath = path.join(process.cwd(), 'pass-models', 'event.pass');
  if (!fs.existsSync(modelPath)) {
    await createDefaultPassModel(modelPath);
  }

  const pass = await PKPass.from(
    {
      model: modelPath,
      certificates,
    },
    {
      serialNumber: passData.serialNumber,
      organizationName: passData.organizationName,
      description: passData.description,
    },
  );

  // Configure pass data with beautiful design
  pass.setBarcodes({
    message: passData.qrCodeData,
    format: 'PKBarcodeFormatQR',
    messageEncoding: 'iso-8859-1',
  });

  // Use the design system for beautiful layouts
  const layout = createPassLayout(passData);

  // Add primary fields
  layout.primary.forEach((field) => {
    pass.primaryFields.push(field);
  });

  // Add secondary fields
  layout.secondary.forEach((field) => {
    pass.secondaryFields.push(field);
  });

  // Add auxiliary fields
  layout.auxiliary.forEach((field) => {
    pass.auxiliaryFields.push(field);
  });

  // Add back fields
  layout.back.forEach((field) => {
    pass.backFields.push(field);
  });

  return pass.getAsBuffer();
}

/**
 * Generates Google Wallet JWT for Event Tickets
 */
async function generateGoogleWalletJwt(passData) {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  const issuerEmail = process.env.GOOGLE_WALLET_ISSUER_EMAIL;
  // Use course/event specific class ID to group similar events
  const classId = `${issuerId}.${passData.productTypeId || 'aol_course'}`;
  const objectId = `${issuerId}.${passData.serialNumber}`;

  if (!issuerId || !issuerEmail) {
    throw new Error('Google Wallet credentials not configured');
  }

  // Create Event Ticket Class (template for all tickets of this event)
  const eventTicketClass = {
    id: classId,
    issuerName: 'Art of Living Foundation',
    reviewStatus: 'UNDER_REVIEW',
    eventName: {
      defaultValue: {
        language: 'en-US',
        value: passData.title,
      },
    },
    venue: {
      name: {
        defaultValue: {
          language: 'en-US',
          value: passData.location || 'Art of Living Center',
        },
      },
      address: {
        defaultValue: {
          language: 'en-US',
          value: passData.location || 'Art of Living Center',
        },
      },
    },
    dateTime: {
      start: passData.startDate,
      end: passData.endDate,
    },
    logo: {
      sourceUri: {
        uri: 'https://cdn.artofliving.org/sites/www.artofliving.org/files/aol-logo.png',
      },
      contentDescription: {
        defaultValue: {
          language: 'en-US',
          value: 'Art of Living Logo',
        },
      },
    },
    hexBackgroundColor: '#003366',
    heroImage: {
      sourceUri: {
        uri: 'https://cdn.artofliving.org/sites/www.artofliving.org/files/course-hero.jpg',
      },
      contentDescription: {
        defaultValue: {
          language: 'en-US',
          value: 'Course Hero Image',
        },
      },
    },
  };

  // Create Event Ticket Object (specific ticket instance)
  const eventTicketObject = {
    id: objectId,
    classId: classId,
    state: 'ACTIVE',
    ticketHolderName: passData.attendeeName,
    ticketNumber: passData.serialNumber,
    barcode: {
      type: 'QR_CODE',
      value: passData.qrCodeData,
      alternateText: 'Course Registration QR Code',
    },
    textModulesData: [
      {
        header: 'Course Details',
        body: `${passData.title}\nInstructor: ${passData.instructor || 'TBD'}\nDates: ${passData.startDate} - ${passData.endDate}`,
        id: 'COURSE_DETAILS',
      },
      {
        header: 'Registration Info',
        body: `Attendee: ${passData.attendeeName}\nOrder: ${passData.orderExternalId}\nEmail: ${passData.attendeeEmail}`,
        id: 'REGISTRATION_INFO',
      },
    ],
    linksModuleData: {
      uris: [
        {
          uri: 'https://www.artofliving.org',
          description: 'Art of Living Website',
          id: 'WEBSITE_LINK',
        },
        {
          uri: `tel:+1-800-897-5342`,
          description: 'Contact Support',
          id: 'SUPPORT_PHONE',
        },
      ],
    },
    locations: [
      {
        latitude: 37.4,
        longitude: -122.1,
      },
    ],
  };

  // Create JWT claims using official Google Wallet API structure
  const claims = {
    iss: issuerEmail,
    aud: 'google',
    origins: [process.env.NEXT_PUBLIC_SITE_URL || 'www.artofliving.org'],
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    payload: {
      // Use official Event Ticket API structure
      eventTicketClasses: [eventTicketClass],
      eventTicketObjects: [eventTicketObject],
    },
  };

  // Sign JWT with private key
  const privateKey =
    process.env.GOOGLE_WALLET_PRIVATE_KEY?.replace(/\\n/g, '\n') ||
    'REPLACE_WITH_YOUR_PRIVATE_KEY';

  if (privateKey === 'REPLACE_WITH_YOUR_PRIVATE_KEY') {
    throw new Error('Google Wallet private key not configured');
  }

  return jwt.sign(claims, privateKey, { algorithm: 'RS256' });
}

/**
 * Creates a default pass model if one doesn't exist
 */
async function createDefaultPassModel(modelPath) {
  // Create directory structure
  fs.mkdirSync(modelPath, { recursive: true });

  // Create beautiful pass.json with dynamic styling
  const defaultStyle = getAppleWalletStyle({ productTypeId: 'default' });

  const passJson = {
    formatVersion: 1,
    passTypeIdentifier:
      process.env.APPLE_PASS_TYPE_IDENTIFIER || 'pass.com.artofliving',
    teamIdentifier: process.env.APPLE_TEAM_IDENTIFIER || 'YNTUJH5452',
    organizationName: 'Art of Living Foundation',
    description: 'Course Registration Pass',
    logoText: defaultStyle.logoText,
    backgroundColor: defaultStyle.backgroundColor,
    foregroundColor: defaultStyle.foregroundColor,
    labelColor: defaultStyle.labelColor,
    relevantDate: defaultStyle.relevantDate,
    eventTicket: {
      primaryFields: [],
      secondaryFields: [],
      auxiliaryFields: [],
      backFields: [],
      headerFields: [],
    },
    locations: defaultStyle.locations,
    // Add visual enhancements
    maxDistance: 1000, // Show pass when within 1km of location
    sharingProhibited: false, // Allow sharing
    suppressStripShine: false, // Keep the glossy appearance
  };

  fs.writeFileSync(
    path.join(modelPath, 'pass.json'),
    JSON.stringify(passJson, null, 2),
  );

  // Create placeholder images (you should replace these with actual images)
  const placeholderImage = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64',
  );

  const imageFiles = ['icon.png', 'icon@2x.png', 'logo.png', 'logo@2x.png'];
  imageFiles.forEach((filename) => {
    fs.writeFileSync(path.join(modelPath, filename), placeholderImage);
  });

  console.log(
    'Created default pass model. Please replace with your actual images and certificates.',
  );
}
