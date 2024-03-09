const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');

const app = express();

const drive = google.drive({
  version: 'v3',
  auth: '391024470519-p08kf1lnosiao35da2grsac03fl0tg0s.apps.googleusercontent.com',
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), (req, res) => {
  const fileMetadata = {
    name: req.file.originalname,
  };

  const media = {
    mimeType: req.file.mimetype,
    body: req.file.buffer,
  };

  drive.files.create(
    {
      resource: fileMetadata,
      media: media,
      fields: 'id',
    },
    (err, file) => {
      if (err) {
        console.error(err);
        res.status(500).send(err.message);
      } else {
        res.json({ fileId: file.data.id });
      }
    }
  );
});
