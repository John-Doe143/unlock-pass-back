const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const port = 5000;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",  // Local development
    "https://pass-pi.vercel.app" // Deployed front-end
  ],
  methods: ["GET", "POST", "OPTIONS"], // Allowed HTTP methods
  credentials: true // Allow cookies or authorization headers
}));

app.use(express.json());

// Encryption Key
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

// Decrypt Password Function
const decryptPassword = (encryptedPassword, iv) => {
  try {
    const ivBuffer = Buffer.from(iv, 'hex');
    const encryptedPasswordBuffer = Buffer.from(encryptedPassword, 'hex');
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, ivBuffer);
    let decrypted = decipher.update(encryptedPasswordBuffer, undefined, "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Error decrypting password:", error);
    throw new Error("Decryption failed");
  }
};

// Decrypt Password Endpoint
app.post("/api/decrypt-password", (req, res) => {
  const { encryptedPassword, iv } = req.body;

  if (!encryptedPassword || !iv) {
    return res.status(400).json({ error: "Both encryptedPassword and IV are required." });
  }

  try {
    const decryptedPassword = decryptPassword(encryptedPassword, iv);
    res.status(200).json({ decryptedPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle Preflight Requests
app.options('*', cors());

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
