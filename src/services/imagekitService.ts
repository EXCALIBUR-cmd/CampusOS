import imagekit from "@/lib/imagekit";

export async function uploadFile(
  fileBufferOrBase64: Buffer | string,
  fileName: string,
  folder: string = "general"
) {
  try {
    const pubKey = process.env.IMAGEKIT_PUBLIC_KEY || "";
    const privKey = process.env.IMAGEKIT_PRIVATE_KEY || "";

    const isConfigured =
      pubKey.length > 5 &&
      !pubKey.includes("your_") &&
      privKey.length > 5 &&
      !privKey.includes("your_");

    if (!isConfigured) {
      console.warn("[ImageKit] Keys not configured. Using mock URL. Public key:", pubKey);
      return {
        success: true,
        url: `https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=400`,
        fileId: "mock_imagekit_file_id",
      };
    }

    console.log(`[ImageKit] Uploading "${fileName}" to folder "/${folder}"...`);

    const uploadResponse = await imagekit.upload({
      file: fileBufferOrBase64,
      fileName: fileName,
      folder: `/${folder}`,
    });

    console.log(`[ImageKit] Upload success: ${uploadResponse.url}`);
    return {
      success: true,
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
    };
  } catch (error: any) {
    console.error("[ImageKit] Upload FAILED:", error.message, error);
    return {
      success: false,
      error: error.message,
      url: null,
      fileId: null,
    };
  }
}

