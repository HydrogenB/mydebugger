// Serverless function for testing if a site can be rendered in an iframe
import fetch from 'node-fetch';
import { URL } from 'url';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  try {
    // Validate URL
    const targetUrl = new URL(url);
    
    // Create an HTML page with an iframe to test
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>IFrame Test</title>
          <script>
            // Record if iframe loads successfully
            function handleLoad() {
              window.parent.postMessage({ success: true }, '*');
            }
            
            // Record if iframe fails to load
            function handleError() {
              window.parent.postMessage({ error: true }, '*');
            }
          </script>
        </head>
        <body>
          <iframe 
            src="${targetUrl.toString()}" 
            width="100%" 
            height="300" 
            onload="handleLoad()" 
            onerror="handleError()">
          </iframe>
        </body>
      </html>
    `;
    
    // Send the test page
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
    
  } catch (error) {
    return res.status(400).json({ 
      error: `Invalid URL: ${error.message}`, 
      url 
    });
  }
}