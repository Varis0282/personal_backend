const express = require('express');
const router = express.Router();
const multer = require('multer');
const { google } = require('googleapis');
const stream = require("stream"); // Added

const auth = new google.auth.GoogleAuth({
  keyFile: './mereguru-e1d836781f5f.json', // Replace with the path to your service account key file
  scopes: ['https://www.googleapis.com/auth/drive'],
})

const drive = google.drive({
  version: 'v3',
  // auth: '391024470519-p08kf1lnosiao35da2grsac03fl0tg0s.apps.googleusercontent.com',
  auth: auth
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const fileMetadata = {
      name: req.file.originalname,
      parents: ['1dq8pq2d6e13YzZuCW7esXC33P9O5bh3l']
    };

    const media = {
      mimeType: req.file.mimetype,
      body: new stream.PassThrough().end(req.file.buffer),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    console.log('File uploaded successfully. File ID:', response.data.id);
    res.json({ fileId: response.data.id });
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    res.status(500).json({ message: 'Error uploading file to Google Drive' });
  }
});

router.get('/thumbnail/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;

    // Request the thumbnail link from the file metadata
    const fileMetadata = await drive.files.get({ fileId: fileId, fields: 'thumbnailLink' });
    const thumbnailLink = fileMetadata.data.thumbnailLink;

    // Redirect the client to the thumbnail link
    res.redirect(thumbnailLink);
  } catch (error) {
    console.error('Error retrieving thumbnail from Google Drive:', error);
    res.status(500).json({ message: 'Error retrieving thumbnail from Google Drive' });
  }
});

router.get('/download/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );
    const fileMetadata = await drive.files.get({ fileId: fileId });
    const fileName = fileMetadata.data.name;

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    response.data
      .on('end', () => {
        console.log('Done');
      })
      .on('error', err => {
        console.error('Error downloading file:', err);
        res.status(500).json({ message: 'Error downloading file' });
      })
      .pipe(res);
  } catch (error) {
    console.error('Error downloading file from Google Drive:', error);
    res.status(500).json({ message: 'Error downloading file from Google Drive' });
  }
});


module.exports = router;