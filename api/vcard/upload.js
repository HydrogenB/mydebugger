import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'You must be signed in to upload files' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(process.cwd(), 'public', 'uploads');
    form.keepExtensions = true;
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(form.uploadDir)) {
      fs.mkdirSync(form.uploadDir, { recursive: true });
    }

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to parse form data' });
      }

      const file = files.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Generate unique filename
      const fileName = `${uuidv4()}${path.extname(file.originalFilename)}`;
      const oldPath = file.filepath;
      const newPath = path.join(form.uploadDir, fileName);

      try {
        fs.renameSync(oldPath, newPath);
        const fileUrl = `/uploads/${fileName}`;
        return res.status(200).json({ url: fileUrl });
      } catch (error) {
        console.error('Error moving file:', error);
        return res.status(500).json({ error: 'Failed to save file' });
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
}
