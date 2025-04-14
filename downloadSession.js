const fs = require('fs');
const https = require('https');
const unzipper = require('unzipper');
const path = require('path');

const SESSION_PATH = path.join(__dirname, 'auth_data');

// Replace this with your actual Drive file ID
const FILE_ID = '1sKs0iqu0z4nw95KjHp-Mz39xPig0tx3_';
const URL = `https://drive.google.com/uc?export=download&id=${FILE_ID}`;

async function downloadAndUnzipSession() {
  if (fs.existsSync(SESSION_PATH)) {
    console.log('✅ auth_data already exists. Skipping download.');
    return;
  }

  console.log('⬇️  Downloading auth_data.zip from Google Drive...');

  const zipPath = path.join(__dirname, 'auth_data.zip');

  const file = fs.createWriteStream(zipPath);

  return new Promise((resolve, reject) => {
    https
      .get(URL, (response) => {
        if (response.statusCode !== 200) {
          return reject(
            `❌ Failed to download file. Status: ${response.statusCode}`
          );
        }

        response.pipe(file);

        file.on('finish', () => {
          file.close(async () => {
            console.log('📦 Unzipping auth_data.zip...');
            fs.createReadStream(zipPath)
              .pipe(unzipper.Extract({ path: SESSION_PATH }))
              .on('close', () => {
                console.log('✅ auth_data is ready!');
                fs.unlinkSync(zipPath); // Clean up zip
                resolve();
              })
              .on('error', reject);
          });
        });
      })
      .on('error', reject);
  });
}

module.exports = downloadAndUnzipSession;
