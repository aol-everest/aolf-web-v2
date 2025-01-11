export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { lat, lng } = req.query;
    const timestamp = Math.floor(Date.now() / 1000); // Current time in seconds since the epoch
    const apiKey = process.env.GOOGLE_API_KEY; // Store your API key in an environment variable

    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        res.status(200).json(data);
      } else {
        res
          .status(400)
          .json({ error: 'Error fetching timezone data', details: data });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Internal Server Error', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
