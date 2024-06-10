const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Cloudinary Konfiguration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'ds4nokwd3',
  api_key: process.env.CLOUDINARY_API_KEY || '727516436138348',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'LDt1qY5yWqfJvX41EVvXSfYs40o'
});

// Multer Cloudinary Storage Konfiguration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    format: async (req, file) => file.mimetype.startsWith('image/') ? 'jpg' : 'mp4',
    public_id: (req, file) => Date.now().toString()
  }
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Hauptseite
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Unterbeitrag
app.get('/unterbeitrag1', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'unterbeitrag1.html'));
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    res.json({ url: req.file.path });
  } else {
    res.status(400).send('Datei-Upload fehlgeschlagen.');
  }
});

app.get('/media', async (req, res) => {
  try {
    const { resources } = await cloudinary.search
      .expression('folder:uploads')
      .sort_by('public_id', 'desc')
      .max_results(30)
      .execute();
    const mediaFiles = resources.map(file => ({
      url: file.secure_url,
      type: file.format.startsWith('mp4') ? 'video/mp4' : 'image/jpeg'
    }));
    res.json(mediaFiles);
  } catch (error) {
    res.status(500).send('Fehler beim Abrufen der Medien: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});

