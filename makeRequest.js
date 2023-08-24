const http = require('http');
const request = require('request');
const digest = require('digest-header');

const makeRequest = async (requestData) => {
  let options = requestData.options

  // First login attempt: this will fail, but it will serve to generate the Digest auth headers
  const authPromise = new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', async () => {
        const wwwAuthenticate = res.headers['x-www-authenticate'];
        const userpass = `${requestData.username}:${requestData.password}`;
        const auth = digest(options.method, options.path, wwwAuthenticate, userpass);
        console.log("AUTH FOUND");
        console.log(auth.split(','));
        console.log(auth);

        resolve(auth);
      });
    });

    req.on('error', error => {
      console.error('Error:', error);
      reject(error);
    });

    req.end();
  });

  // Once generated, make the actual request
  const auth = await authPromise;
  const options2 = {
    method: `${options.method}`,
    url: `${requestData.protocol}://${options.hostname}${options.path}`,
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Authorization': auth,
    },
    body: requestData.body,
  };

  try {
    const response = await new Promise((resolve, reject) => {
      request(options2, function (error, response) {
        if (error) {
          reject(error);
          return error
        } else {
          resolve(response);
        }
      });
    });

    console.log(response.body);
    return response
  } catch (error) {
    console.error('Error:', error);
  }
};

module.exports = { makeRequest };
