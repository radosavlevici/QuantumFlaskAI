const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/dashboard/summary',
  method: 'GET',
};

console.log('Testing API connection to: http://localhost:5000/api/dashboard/summary');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response data:');
    try {
      const parsedData = JSON.parse(data);
      console.log(JSON.stringify(parsedData, null, 2));
      console.log('\nAPI connection successful!');
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error(`Error connecting to API: ${error.message}`);
});

req.end();