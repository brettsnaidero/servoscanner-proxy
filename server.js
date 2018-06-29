const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

const app = express();

const myLimit = typeof process.argv[2] === 'undefined' ? '100kb' : process.argv[2];

app.get('/', (req, res) => {
  res.send(`
    <!html>
    <html lang="en">
      <head>
        <title>ServoScanner</title>
        <style>
          body {
            font-family: sans-serif;
          }
          .page {
            padding: 20px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <h1>ServoScanner API</h1>
          <div id="servo-scanner-entrypoint"></div>
        </div>
      </body>
    </html>
  `);
});

app.use(bodyParser.json({ limit: myLimit }));

app.all('*', (req, res) => {
  // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
  res.header('Access-Control-Allow-Origin', 'https://servoscanner.info');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, PATCH, POST, DELETE');
  res.header('Access-Control-Allow-Headers', req.header('access-control-request-headers'));

  if (req.method === 'OPTIONS') {
    // CORS Preflight
    res.send();
  } else {
    const targetURL = req.header('Target-URL');
    if (!targetURL) {
      res.send(500, { error: 'There is no Target-URL header in the request' });
      return;
    }
    if (req.header('dataType')) {
      request({
        url: targetURL,
        method: req.method,
        json: req.body,
        headers: {
          Authorization: req.header('Authorization'),
          dataType: req.header('dataType'),
          grant_type: req.header('grant_type'),
        },
      }, (error, response) => {
        if (error) {
          console.error(`error: ${response.statusCode}`);
        }
      }).pipe(res);
    } else {
      request({
        url: targetURL,
        method: req.method,
        json: req.body,
        headers: {
          Authorization: req.header('Authorization'),
          'Content-Type': req.header('Content-Type'),
          'Access-Control-Allow-Origin': req.header('Access-Control-Allow-Origin'),
          apikey: req.header('apikey'),
          transactionid: req.header('transactionid'),
          requesttimestamp: req.header('requesttimestamp'),
        },
      }, (error, response) => {
        if (error) {
          console.error(`error: ${response.statusCode}`);
        }
      }).pipe(res);
    }

  }
});

app.set('port', process.env.PORT || 3001);

app.listen(app.get('port'), () => {
  console.log(`Proxy server listening on port ${app.get('port')}`);
});
