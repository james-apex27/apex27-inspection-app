const https = require('https');
const url = require('url');

exports.handler = async (event) => {
  const apiKey = process.env.APEX27_API_KEY;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  const params = event.queryStringParameters || {};
  const targetPath = params.path || '/';
  delete params.path;

  const queryStr = Object.keys(params).length
    ? '?' + new URLSearchParams(params).toString()
    : '';

  const targetUrl = `https://api.apex27.co.uk${targetPath}${queryStr}`;

  const isMultipart = (event.headers['content-type'] || '').includes('multipart');
  const contentType = event.headers['content-type'] || 'application/json';

  const options = {
    method: event.httpMethod,
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': contentType,
    },
  };

  return new Promise((resolve) => {
    const req = https.request(targetUrl, options, (res) => {
      let data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        resolve({
          statusCode: res.statusCode,
          headers: { ...corsHeaders, 'Content-Type': res.headers['content-type'] || 'application/json' },
          body: buffer.toString('base64'),
          isBase64Encoded: true,
        });
      });
    });
    req.on('error', (e) => {
      resolve({ statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: e.message }) });
    });
    if (event.body && event.httpMethod !== 'GET') {
      const bodyBuffer = event.isBase64Encoded
        ? Buffer.from(event.body, 'base64')
        : Buffer.from(event.body);
      req.write(bodyBuffer);
    }
    req.end();
  });
};
