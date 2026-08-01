const path = require('path');

async function getSignedUrl(fileName) {
  return `http://localhost:4000/uploads/${fileName}`;
}

async function getUploadSignedUrl(fileName) {
  return `http://localhost:4000/uploads/${fileName}`;
}

async function getDownloadSignedUrl(fileName) {
  return `http://localhost:4000/uploads/${fileName}`;
}

module.exports = {
  getSignedUrl,
  getUploadSignedUrl,
  getDownloadSignedUrl,
};
