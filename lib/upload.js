import { put } from "@vercel/blob";

// Upload anh len Vercel Blob neu co token, nguoc lai tra ve dataURL (dev fallback)
// Luu y: tren Vercel bat buoc phai enable Blob Storage va co BLOB_READ_WRITE_TOKEN
export async function uploadImage(file, folder = "receipts") {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { url } = await put(filename, buffer, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false
    });
    return url;
  }

  // Fallback dev: luu duoi dang base64 dataURL (khong khuyen dung o production)
  console.warn("[upload] Chua co BLOB_READ_WRITE_TOKEN, luu anh dang base64 (chi dung dev).");
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}
