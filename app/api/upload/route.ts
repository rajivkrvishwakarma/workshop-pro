import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/utils/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    
    // Optional folder parameter
    let folder = formData.get('folder') as string;
    if (!folder) {
      folder = 'workshop/attachments';
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: 'No files provided' }, { status: 400 });
    }

    const uploadedUrls = [];

    // Process each file
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary
      const url = await uploadToCloudinary(buffer, file.type, folder);
      uploadedUrls.push({
        url,
        type: file.type,
        size: file.size,
        name: file.name
      });
    }

    return NextResponse.json({ success: true, data: uploadedUrls });

  } catch (error: any) {
    console.error('Error uploading files:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
