# Wallet Pass Setup Guide

This guide explains how to set up Apple Wallet and Google Pay pass generation for course registrations.

## Overview

The wallet pass system generates both Apple Wallet (.pkpass) and Google Pay passes containing QR codes for course attendance. This solves the issue where QR codes in emails are too small for mobile scanning.

## Features

- ✅ Apple Wallet pass generation (.pkpass files)
- ✅ Google Wallet pass generation (JWT-based event tickets)
- ✅ Automatic device detection (iOS/Android)
- ✅ QR code generation for attendance scanning
- ✅ Course details display on passes
- ✅ Downloadable from thank you page
- ✅ Email link integration ready
- ✅ Heroku/cloud deployment ready (ephemeral file system compatible)
- ✅ Certificate handling via environment variables

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
7. Upload Certificate Signing Request (CSR) - see CSR generation below
8. Download the certificate

### 2.1. Generate Certificate Signing Request (CSR)

Create a CSR file using Keychain Access (macOS) or OpenSSL:

**Using Keychain Access (macOS):**

1. Open Keychain Access
2. Menu: Keychain Access > Certificate Assistant > Request a Certificate From a Certificate Authority
3. Fill in:
   - User Email Address: your Apple ID email
   - Common Name: your name or company
   - CA Email Address: leave blank
   - Request is: "Saved to disk"
4. Save as `PassTypeCertificate.certSigningRequest`

**Using OpenSSL (any platform):**

```bash
# Generate private key
openssl genrsa -out private.key 2048

# Generate CSR
openssl req -new -key private.key -out certificate.csr \
  -subj "/C=US/ST=CA/L=Walnut Creek/O=Art of Living/OU=IT Department/CN=Pass Type Certificate"
```

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
Download from [Apple PKI page](https://www.apple.com/certificateauthority/) - "Worldwide Developer Relations - G6 (Expiring 03/19/2036)" or the most current version available

The downloaded file will be `AppleWWDRCAG6.cer`. Convert it to PEM format:

```bash
openssl x509 -inform DER -outform PEM -in AppleWWDRCAG6.cer -out wwdr.pem
```

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

## Google Wallet Setup

### 1. Create Google Wallet API Issuer Account

1. Go to [Google Pay & Wallet Console](https://pay.google.com/business/console)
2. Create a **Google Wallet API Issuer account** (required for event tickets)
3. Note your **Issuer ID** for environment variables

**Note:** This is the same console URL, but it's officially called the "Google Pay & Wallet Console" and has sections for both Google Pay (payments) and Google Wallet (passes/tickets)

### 2. Google Cloud Console Setup

**For non-Android developers** (web, email, SMS integration):

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or use existing
3. Enable "**Google Wallet API**"
4. Create Service Account:
   - Go to IAM & Admin > Service Accounts
   - Create new service account with "Google Wallet API" access
   - Download JSON key file with private key

### 3. Setup Requirements

According to [Google Wallet API documentation](https://developers.google.com/wallet/tickets/events):

- ✅ **Event Tickets**: Our use case fits perfectly
- ✅ **QR Code/Barcode scanning**: Supported for attendance verification
- ✅ **Multi-platform**: Works on Android, web, email, SMS
- ✅ **REST API**: For server-side pass generation

## Environment Variables

### Local Development (.env.local)

```env
# Apple Wallet Configuration
APPLE_PASS_TYPE_IDENTIFIER=pass.com.aolf.course
APPLE_TEAM_IDENTIFIER=YOUR_TEAM_ID
APPLE_SIGNER_KEY_PASSPHRASE=your_private_key_passphrase

# Google Wallet Configuration (for passes, not payments)
GOOGLE_WALLET_ISSUER_ID=your_issuer_id
GOOGLE_WALLET_ISSUER_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_WALLET_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
```

### Production Deployment (Heroku/Cloud)

For production environments with ephemeral file systems, store certificates as base64-encoded environment variables:

```bash
# Convert certificates to base64
# Linux/Ubuntu:
base64 -w 0 certificates/wwdr.pem > wwdr_base64.txt
base64 -w 0 certificates/signerCert.pem > signer_cert_base64.txt
base64 -w 0 certificates/signerKey.pem > signer_key_base64.txt

# macOS:
base64 -i certificates/wwdr.pem -o wwdr_base64.txt
base64 -i certificates/signerCert.pem -o signer_cert_base64.txt
base64 -i certificates/signerKey.pem -o signer_key_base64.txt

# Set environment variables (Heroku example)
heroku config:set APPLE_WWDR_CERT_BASE64="$(cat wwdr_base64.txt)"
heroku config:set APPLE_SIGNER_CERT_BASE64="$(cat signer_cert_base64.txt)"
heroku config:set APPLE_SIGNER_KEY_BASE64="$(cat signer_key_base64.txt)"
heroku config:set APPLE_PASS_TYPE_IDENTIFIER="pass.com.aolf.course"
heroku config:set APPLE_TEAM_IDENTIFIER="YOUR_TEAM_ID"
heroku config:set APPLE_SIGNER_KEY_PASSPHRASE="your_passphrase"
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

### Google Wallet Pass Fields

- **Header:** Attendee name
- **Card Title:** Course title
- **Subheader:** "Event Ticket"
- **Text Modules:** Dates, location, instructor
- **Barcode:** QR code with attendance data
- **Event Details:** Venue, date/time, seat information

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

// Google Wallet link
const googleLink = `https://pay.google.com/gp/v/save/${googleWalletJwt}`;
```

## Troubleshooting

### Common Issues

**Apple Wallet:**

- "Pass cannot be added" - Check certificate validity and pass.json format
- Pass not displaying correctly - Verify image files and field structure
- QR code not scanning - Check barcode format and data encoding

**Google Wallet:**

- JWT signature errors - Verify private key format and issuer email
- Pass not appearing - Check issuer ID and Google Wallet API setup
- Authorization errors - Verify service account permissions

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

This will log detailed information about pass generation.

## Deployment

### Heroku/Cloud Deployment

The system is fully compatible with Heroku's ephemeral file system and other cloud platforms.

#### Why This Matters

Heroku uses an ephemeral file system, which means files stored locally are lost when dynos restart. Our implementation handles this by:

- Storing certificates as environment variables (base64 encoded)
- Handling temporary pass files via URL parameters instead of file storage
- Memory-efficient pass generation without persistent storage

#### Quick Heroku Setup

```bash
# Convert certificates to base64 (if not done already)
# Linux/Ubuntu:
base64 -w 0 certificates/wwdr.pem > wwdr_base64.txt
base64 -w 0 certificates/signerCert.pem > signer_cert_base64.txt
base64 -w 0 certificates/signerKey.pem > signer_key_base64.txt

# macOS:
base64 -i certificates/wwdr.pem -o wwdr_base64.txt
base64 -i certificates/signerCert.pem -o signer_cert_base64.txt
base64 -i certificates/signerKey.pem -o signer_key_base64.txt

# Set all Heroku environment variables
heroku config:set APPLE_WWDR_CERT_BASE64="$(cat wwdr_base64.txt)"
heroku config:set APPLE_SIGNER_CERT_BASE64="$(cat signer_cert_base64.txt)"
heroku config:set APPLE_SIGNER_KEY_BASE64="$(cat signer_key_base64.txt)"
heroku config:set APPLE_PASS_TYPE_IDENTIFIER="pass.com.aolf.course"
heroku config:set APPLE_TEAM_IDENTIFIER="YOUR_TEAM_ID"
heroku config:set APPLE_SIGNER_KEY_PASSPHRASE="your_passphrase"
heroku config:set GOOGLE_WALLET_ISSUER_ID="your_issuer_id"
heroku config:set GOOGLE_WALLET_ISSUER_EMAIL="your-service-account@project.iam.gserviceaccount.com"
heroku config:set GOOGLE_WALLET_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"

# Deploy
git push heroku main
```

#### Test Deployment

```bash
# Quick deployment test
curl -X POST https://your-app.herokuapp.com/api/generateWalletPass \
  -H "Content-Type: application/json" \
  -d '{"serialNumber":"test123","title":"Test Course","organizationName":"Art of Living","description":"Test Course Registration","qrCodeData":"{\"test\":\"data\"}"}'
```

Key features for cloud deployment:

- ✅ Certificates stored as base64 environment variables
- ✅ No temporary file storage dependency
- ✅ Memory-efficient pass generation
- ✅ Automatic fallback when certificates unavailable

### Production Considerations

1. **Certificate Storage:** Use base64-encoded environment variables for cloud platforms
2. **Security:** Store certificates securely (environment variables, secrets manager)
3. **Caching:** Implement pass caching to avoid regenerating identical passes
4. **Monitoring:** Add error tracking and pass generation analytics
5. **Scalability:** System handles ephemeral file systems automatically

## Support

For issues with:

- Apple Wallet: Check Apple Developer documentation
- Google Wallet: Check Google Wallet API documentation
- Implementation: Check error logs and verify certificate setup
