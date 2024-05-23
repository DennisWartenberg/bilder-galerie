const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('uploads'));

// Serve the index.html file
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

app.post('/upload', upload.single('image'), (req, res) => {
    if (req.file) {
        res.json({ filename: req.file.filename });
    } else {
        res.status(400).send('File upload failed.');
    }
});

app.get('/images', (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads');

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory: ' + err);
        }

        const images = files.map(file => ({
            url: `/${file}`
        }));

        res.json(images);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});