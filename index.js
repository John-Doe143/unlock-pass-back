const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Encryption Key (ensure it is securely stored in .env)
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');  // 32-byte key

// Function to decrypt password
const decryptPassword = (encryptedPassword, iv) => {
  try {
    // Convert the IV and encryptedPassword to buffers
    const ivBuffer = Buffer.from(iv, 'hex');
    const encryptedPasswordBuffer = Buffer.from(encryptedPassword, 'hex');

    // Create a decipher instance using AES-256-CBC
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, ivBuffer);

    // Decrypt the password
    let decrypted = decipher.update(encryptedPasswordBuffer, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;  // Return the decrypted password
  } catch (error) {
    console.error('Error decrypting password:', error);
    throw new Error('Failed to decrypt password');
  }
};

// Endpoint to decrypt password
app.post('/api/decrypt-password', (req, res) => {
  const { encryptedPassword, iv } = req.body;

  if (!encryptedPassword || !iv) {
    return res.status(400).json({ error: 'Both encryptedPassword and iv are required.' });
  }

  try {
    const decryptedPassword = decryptPassword(encryptedPassword, iv);
    res.status(200).json({ decryptedPassword });
  } catch (error) {
    res.status(500).json({ error: 'Decryption failed.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
