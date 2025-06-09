# Wallet Pass Setup Guide

This guide explains how to set up Apple Wallet and Google Pay pass generation for course registrations.

## Overview

The wallet pass system generates both Apple Wallet (.pkpass) and Google Pay passes containing QR codes for course attendance. This solves the issue where QR codes in emails are too small for mobile scanning.

## Features

- ✅ Apple Wallet pass generation (.pkpass files)
- ✅ Google Pay pass generation (JWT-based)
- ✅ Automatic device detection (iOS/Android)
- ✅ QR code generation for attendance scanning
- ✅ Course details display on passes
- ✅ Downloadable from thank you page
- ✅ Email link integration ready

## Required Dependencies

The following packages are required (already added to package.json):

```json
{
  "passkit-generator": "^3.1.8",
  "jsonwebtoken": "^9.0.2"
}
```

## Apple Wallet Setup

### 1. Apple Developer Account Requirements

You need an Apple Developer Account to create wallet passes.

### 2. Create Pass Type Certificate

1. Log in to [Apple Developer Portal](https://developer.apple.com/account)
2. Go to Certificates, Identifiers & Profiles
3. Click "Identifiers" > "+" > "Pass Type IDs"
4. Create identifier: `pass.com.aolf.course` (or your preferred ID)
5. Go to "Certificates" > "+" > "Pass Type ID Certificate"
6. Select your Pass Type ID
7. Upload Certificate Signing Request (CSR)
8. Download the certificate

### 3. Set Up Certificates Directory

Create the following directory structure:

```
/certificates/
  ├── wwdr.pem          # Apple WWDR Certificate
  ├── signerCert.pem    # Your Pass Type Certificate
  └── signerKey.pem     # Your Private Key
```

### 4. Certificate Files

**WWDR Certificate (wwdr.pem):**
Download from [Apple PKI page](https://www.apple.com/certificateauthority/) - "Worldwide Developer Relations - G4"

**Signer Certificate (signerCert.pem):**
Convert your downloaded .cer file:

```bash
openssl x509 -inform DER -outform PEM -in pass.cer -out signerCert.pem
```

**Private Key (signerKey.pem):**
Export from Keychain Access:

1. Find your certificate in Keychain
2. Export as .p12 file
3. Convert to PEM:

```bash
openssl pkcs12 -in pass.p12 -out signerKey.pem -nodes
```

## Google Pay Setup

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or use existing
3. Enable "Google Pay API"
4. Create Service Account:
   - Go to IAM & Admin > Service Accounts
   - Create new service account
   - Download JSON key file

### 2. Google Pay Business Console

1. Go to [Google Pay Business Console](https://pay.google.com/business/console)
2. Create new issuer account
3. Note your Issuer ID

## Environment Variables

Add these to your `.env.local` file:

```env
# Apple Wallet Configuration
APPLE_PASS_TYPE_IDENTIFIER=pass.com.aolf.course
APPLE_TEAM_IDENTIFIER=YOUR_TEAM_ID
APPLE_SIGNER_KEY_PASSPHRASE=your_private_key_passphrase

# Google Pay Configuration
GOOGLE_WALLET_ISSUER_ID=your_issuer_id
GOOGLE_WALLET_ISSUER_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_WALLET_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
```

## Directory Structure

```
/project-root/
├── pages/api/
│   ├── generateWalletPass.js    # Main API endpoint
│   └── downloadPass.js          # Download endpoint
├── src/
│   ├── components/
│   │   └── WalletPassButton.jsx # React component
│   └── utils/
│       └── walletPass.js        # Utility functions
├── certificates/                # Apple certificates
│   ├── wwdr.pem
│   ├── signerCert.pem
│   └── signerKey.pem
├── pass-models/                 # Pass templates (auto-created)
│   └── event.pass/
└── temp/                        # Temporary pass storage (auto-created)
```

## Testing

### 1. Development Testing

1. Install dependencies: `npm install`
2. Set up certificates and environment variables
3. Start development server: `npm run dev`
4. Navigate to course thank you page
5. Click "Add to Wallet" button

### 2. Device Testing

**iOS Testing:**

- Email .pkpass file to iOS device
- Tap file in email to add to Wallet
- Verify QR code scans properly

**Android Testing:**

- Use Google Pay "Add to Wallet" link
- Verify pass appears in Google Pay
- Test QR code scanning

## Pass Content Structure

### Apple Wallet Pass Fields

- **Primary Field:** Course title
- **Secondary Fields:** Attendee name, course dates
- **Auxiliary Fields:** Location, instructor
- **Back Fields:** Order number, email, schedule details
- **Barcode:** QR code with attendance data

### Google Pay Pass Fields

- **Header:** Attendee name
- **Card Title:** Course title
- **Subheader:** "Course Registration"
- **Text Modules:** Dates, location, instructor
- **Barcode:** QR code with attendance data

## QR Code Data Format

The QR code contains JSON data for attendance verification:

```json
{
  "attendeeId": "12345",
  "courseId": "67890",
  "orderExternalId": "ORDER123",
  "email": "user@example.com"
}
```

## Email Integration

To add wallet pass links to emails, use the generated URLs:

```javascript
// After generating pass
const { appleWalletUrl, googleWalletJwt } = passResponse;

// Apple Wallet link
const appleLink = `${baseUrl}${appleWalletUrl}`;

// Google Pay link
const googleLink = `https://pay.google.com/gp/v/save/${googleWalletJwt}`;
```

## Troubleshooting

### Common Issues

**Apple Wallet:**

- "Pass cannot be added" - Check certificate validity and pass.json format
- Pass not displaying correctly - Verify image files and field structure
- QR code not scanning - Check barcode format and data encoding

**Google Pay:**

- JWT signature errors - Verify private key format and issuer email
- Pass not appearing - Check issuer ID and Google Pay API setup
- Authorization errors - Verify service account permissions

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

This will log detailed information about pass generation.

## Production Considerations

1. **File Storage:** Replace temporary file storage with cloud storage (AWS S3, Google Cloud Storage)
2. **Security:** Store certificates securely (environment variables, secrets manager)
3. **Caching:** Implement pass caching to avoid regenerating identical passes
4. **Monitoring:** Add error tracking and pass generation analytics
5. **Cleanup:** Implement automatic cleanup of temporary files

## Support

For issues with:

- Apple Wallet: Check Apple Developer documentation
- Google Pay: Check Google Pay API documentation
- Implementation: Check error logs and verify certificate setup
