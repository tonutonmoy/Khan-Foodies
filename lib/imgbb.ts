const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

export interface ImgBBUploadResult {
  url: string;
  displayUrl: string;
  deleteUrl: string;
}

export async function uploadToImgBB(
  imageBase64: string,
  name?: string
): Promise<ImgBBUploadResult> {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error('IMGBB_API_KEY is not configured');
  }

  const body = new URLSearchParams();
  body.append('image', imageBase64);
  if (name) body.append('name', name);

  const response = await fetch(`${IMGBB_UPLOAD_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || result.status_txt || 'ImgBB upload failed');
  }

  return {
    url: result.data.url as string,
    displayUrl: result.data.display_url as string,
    deleteUrl: result.data.delete_url as string,
  };
}

export async function fileToBase64(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString('base64');
}
