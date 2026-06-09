const dotenv = require('dotenv');

dotenv.config({ override: true });

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiry = '8h';

if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required. Add JWT_SECRET to your .env file.');
}

module.exports = {
  jwtSecret,
  jwtExpiry
};
