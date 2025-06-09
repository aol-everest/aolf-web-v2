import fs from 'fs';
import path from 'path';

/**
 * API Route: /api/downloadPass
 * Downloads generated Apple Wallet pass files
 */
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, data, filename } = req.query;

  try {
    let passBuffer;
    let downloadFilename;

    if (data) {
      // Heroku deployment: pass data is in URL parameter
      passBuffer = Buffer.from(data, 'base64');
      downloadFilename = filename || 'course-pass.pkpass';
    } else if (id) {
      // Development: pass data is stored in temp file
      if (!id) {
        return res.status(400).json({ error: 'Pass ID is required' });
      }

      const passPath = path.join(process.cwd(), 'temp', `${id}.pkpass`);

      if (!fs.existsSync(passPath)) {
        return res.status(404).json({ error: 'Pass not found' });
      }

      passBuffer = fs.readFileSync(passPath);
      downloadFilename = `${id}.pkpass`;

      // Clean up temporary file after sending
      setTimeout(() => {
        try {
          if (fs.existsSync(passPath)) {
            fs.unlinkSync(passPath);
          }
        } catch (error) {
          console.error('Error cleaning up temporary pass file:', error);
        }
      }, 5000);
    } else {
      return res.status(400).json({ error: 'Pass ID or data is required' });
    }

    // Set appropriate headers for .pkpass download
    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${downloadFilename}"`,
    );
    res.setHeader('Content-Length', passBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.send(passBuffer);
  } catch (error) {
    console.error('Error downloading pass:', error);
    res.status(500).json({
      error: 'Failed to download pass',
      message: error.message,
    });
  }
}
