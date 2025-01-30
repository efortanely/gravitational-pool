const express = require('express');
const crypto = require('crypto');

const app = express();

// Generate a nonce for each request
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce; // Store the nonce for use in templates
  next();
});

// Set CSP header including the nonce
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', `default-src 'none'; script-src 'self' 'nonce-${res.locals.nonce}'; img-src 'self';`);
  next();
});

// Example route for HTML response
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>My App</title>
      </head>
      <body>
        <script nonce="${res.locals.nonce}">
          console.log('Hello, world!');
        </script>
      </body>
    </html>
  `);
});

app.listen(3000, () => console.log('App running on port 3000'));
