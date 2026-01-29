require('dotenv').config();
const { scrapeURL } = require('./services/scraper');

const testURL = 'https://www.example.com';

console.log('Testing URL scraper...');
console.log('Environment:', process.env.NODE_ENV || 'development');

scrapeURL(testURL)
  .then(result => {
    console.log('\n✅ SUCCESS!');
    console.log('Method used:', result.method);
    console.log('Text length:', result.text.length);
    console.log('First 200 chars:', result.text.substring(0, 200));
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  });
