/**
 * Media upload endpoint
 * Handles image and video uploads (multipart) with a stubbed storage response.
 */
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({ multiples: false, maxFileSize: 100 * 1024 * 1024 });

    const parsed = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
      (resolve, reject) => {
        form.parse(req, (err: Error | null, fields: formidable.Fields, files: formidable.Files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      },
    );

    const uploadedFile = parsed.files.file;
    const file = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;

    if (!file) {
      return res.status(400).json({ error: 'Missing file upload' });
    }

    // Placeholder storage (TODO: integrate with Cloudinary/S3/Azure)
    const mediaId = `media-${Date.now()}`;
    const url = `https://placeholder-storage.litlabs/${mediaId}/${encodeURIComponent(
      file.originalFilename || 'upload',
    )}`;

    const mediaType = (file.mimetype?.startsWith('video/') ? 'video' : 'image') as
      | 'video'
      | 'image';

    res.status(200).json({
      success: true,
      media: {
        id: mediaId,
        url,
        thumbnailUrl: url,
        type: mediaType,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[Media Upload API] Error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}
