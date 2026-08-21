import crypto from 'crypto';

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  mimeType: string,
  folder: string = 'workshop',
  resourceType: string = 'auto'
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials missing in environment variables');
  }

  const timestamp = Math.round(new Date().getTime() / 1000).toString();
  const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

  const formData = new FormData();
  
  // Convert buffer to Blob for fetch API using Uint8Array to satisfy TS
  const blob = new Blob([new Uint8Array(fileBuffer)], { type: mimeType });
  formData.append('file', blob);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', folder);

  // Use resourceType endpoint — 'video' is required for audio files in Cloudinary
  const uploadResourceType = resourceType || 'auto';
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${uploadResourceType}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to upload to Cloudinary');
  }

  const data = await response.json();
  return data.secure_url;
}
