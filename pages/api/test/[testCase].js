export default function handler(req, res) {
  const { testCase } = req.query;
  console.log('testCase', testCase);

  switch (testCase) {
    case 'test-503':
      res.status(503).json({
        message: 'Service Temporarily Unavailable',
        statusCode: 503,
      });
      break;

    case 'test-400':
      res.status(400).json({
        message: 'Bad Request - Invalid parameters',
        statusCode: 400,
      });
      break;

    case 'test-401':
      res.status(401).json({
        message: 'Unauthorized - Please login again',
        statusCode: 401,
      });
      break;

    case 'test-404':
      res.status(404).json({
        message: 'Resource not found',
        statusCode: 404,
      });
      break;

    case 'test-network-error':
      // Simulate a network error by not sending any response
      res.socket.destroy();
      break;

    default:
      res.status(200).json({ message: 'OK' });
  }
}
