require('dotenv').config();

const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
  PORT,
  FRONTEND_URL,
  NODE_ENV,
};
