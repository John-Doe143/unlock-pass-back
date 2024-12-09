const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const port = 5000;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",  // Local development
    "https://your-frontend-url.vercel.app"  // Deployed front-end URL
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Encryption key
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
  ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
  : null;

// Check if ENCRYPTION_KEY is valid
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  console.error("Invalid ENCRYPTION_KEY. It must be a 32-byte hexadecimal string.");
  process.exit(1);
}

// Decrypt password
const decryptPassword = (encryptedPassword, iv) => {
  try {
    const ivBuffer = Buffer.from(iv, 'hex');
    const encryptedPasswordBuffer = Buffer.from(encryptedPassword, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, ivBuffer);
    let decrypted = decipher.update(encryptedPasswordBuffer, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Error decrypting password:', error);
    throw new Error('Decryption failed');
  }
};

// API Endpoint
app.post('/api/decrypt-password', (req, res) => {
  const { encryptedPassword, iv } = req.body;

  if (!encryptedPassword || !iv) {
    return res.status(400).json({ error: 'Both encryptedPassword and IV are required.' });
  }

  try {
    const decryptedPassword = decryptPassword(encryptedPassword, iv);
    res.status(200).json({ decryptedPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
