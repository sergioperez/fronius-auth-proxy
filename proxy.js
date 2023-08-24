const express = require('express');
const { makeRequest } = require('./makeRequest');

const app = express();
const port = 3000; 

app.use(express.json());

app.all('/request', async (req, res) => {
  console.log('Requested Route:', req.path);
  console.log(req.body)
  try {
    console.log(req.method)
    const requestData = {
      protocol: req.protocol,
      options: {
        hostname: req.query.hostname,
        port: req.query.port,
        path: req.query.path,
        method: req.method,
      },
      body: JSON.stringify(req.body),
      username: req.query.username,
      password: req.query.password,
    };

    request_result = await makeRequest(requestData);
    res = request_result
    //res.status(200).json({ message: 'Request completed successfully.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while making the request.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

