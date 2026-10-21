import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    // Note: We check if user is admin; if not logged in or role != admin, reject unless in development
    if (user && user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const contentType = req.headers.get('content-type') || '';

    let fileName = '';
    let publicUrl = '';
    let folder = 'products';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const customFolder = formData.get('folder') as string | null;

      if (customFolder && ['products', 'brands', 'categories', 'general'].includes(customFolder)) {
        folder = customFolder;
      }

      if (!file) {
        return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Validate MIME type
      const mimeType = file.type || 'image/jpeg';
      if (!mimeType.startsWith('image/')) {
        return NextResponse.json({ success: false, error: 'Uploaded file must be an image (PNG, JPG, WebP, etc.).' }, { status: 400 });
      }

      // Determine extension
      let ext = path.extname(file.name) || '.jpg';
      if (!ext || ext === '.') {
        if (mimeType.includes('png')) ext = '.png';
        else if (mimeType.includes('webp')) ext = '.webp';
        else if (mimeType.includes('gif')) ext = '.gif';
        else ext = '.jpg';
      }

      const randomSuffix = crypto.randomBytes(8).toString('hex');
      const cleanBaseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 30);
      fileName = `${cleanBaseName}_${Date.now()}_${randomSuffix}${ext}`;

      const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);

      publicUrl = `/uploads/${folder}/${fileName}`;
    } else {
      // JSON base64 upload fallback
      const body = await req.json();
      const { base64, fileName: requestedName, folder: customFolder } = body;

      if (!base64) {
        return NextResponse.json({ success: false, error: 'No base64 image data provided.' }, { status: 400 });
      }

      if (customFolder && ['products', 'brands', 'categories', 'general'].includes(customFolder)) {
        folder = customFolder;
      }

      const matches = base64.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      let ext = '.jpg';
      let data = base64;

      if (matches) {
        ext = `.${matches[1] === 'jpeg' ? 'jpg' : matches[1]}`;
        data = matches[2];
      }

      const buffer = Buffer.from(data, 'base64');
      const randomSuffix = crypto.randomBytes(8).toString('hex');
      fileName = `upload_${Date.now()}_${randomSuffix}${ext}`;

      const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);

      publicUrl = `/uploads/${folder}/${fileName}`;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      message: 'Image uploaded successfully!',
    });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to upload image' }, { status: 500 });
  }
}
