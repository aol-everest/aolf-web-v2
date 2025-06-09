# Heroku Wallet Pass Setup Guide

This guide explains how to deploy the wallet pass system on Heroku with proper certificate and file handling.

## Overview

Heroku uses an ephemeral file system, which means files stored locally are lost when dynos restart. Our implementation handles this by:

- Storing certificates as environment variables (base64 encoded)
- Handling temporary pass files via URL parameters instead of file storage

## Quick Setup

### 1. Convert Certificates to Base64

```bash
# Convert your certificates to base64 format
base64 -w 0 certificates/wwdr.pem > wwdr_base64.txt
base64 -w 0 certificates/signerCert.pem > signer_cert_base64.txt
base64 -w 0 certificates/signerKey.pem > signer_key_base64.txt
```

### 2. Set Heroku Environment Variables

```bash
heroku config:set APPLE_WWDR_CERT_BASE64="$(cat wwdr_base64.txt)"
heroku config:set APPLE_SIGNER_CERT_BASE64="$(cat signer_cert_base64.txt)"
heroku config:set APPLE_SIGNER_KEY_BASE64="$(cat signer_key_base64.txt)"
heroku config:set APPLE_PASS_TYPE_IDENTIFIER="pass.com.aolf.course"
heroku config:set APPLE_TEAM_IDENTIFIER="YOUR_TEAM_ID"
heroku config:set APPLE_SIGNER_KEY_PASSPHRASE="your_passphrase"
```

### 3. Deploy

```bash
git push heroku main
```

## Testing

Test the deployment:

```bash
curl -X POST https://your-app.herokuapp.com/api/generateWalletPass \
  -H "Content-Type: application/json" \
  -d '{"serialNumber":"test123","title":"Test Course","organizationName":"Art of Living","description":"Test Course Registration","qrCodeData":"{\"test\":\"data\"}"}'
```

## Key Changes for Heroku

1. **Certificates stored as environment variables** (base64 encoded)
2. **No temporary file storage** - passes delivered via URL parameters
3. **Automatic fallback** to development mode when certificates not available
4. **Memory-efficient** pass generation

Your wallet pass system is now fully compatible with Heroku's ephemeral file system! 🚀
