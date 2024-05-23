const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('uploads'));
app.use(express.static('public')); // Dies sorgt dafür, dass Dateien aus dem public-Verzeichnis bedient werden

// HTTPS erzwingen
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    res.json({ filename: req.file.filename });
  } else {
    res.status(400).send('Datei-Upload fehlgeschlagen.');
  }
});

app.get('/media', (req, res) => {
  const directoryPath = path.join(__dirname, 'uploads');
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).send('Verzeichnis kann nicht durchsucht werden: ' + err);
    }
    const mediaFiles = files.map(file => {
      const fileType = file.split('.').pop();
      return { url: `/uploads/${file}`, type: fileType.startsWith('mp4') ? 'video/mp4' : 'image/jpeg' };
    });
    res.json(mediaFiles);
  });
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
