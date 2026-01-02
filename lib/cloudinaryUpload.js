// lib/cloudinaryUpload.js
export const uploadToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );

    // optional folder
    formData.append("folder", "employee-documents");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );


    const data = await response.json();

    if (!response.ok) {
      console.error("Cloudinary error response:", data);
      throw new Error(data.error?.message || "Upload failed");
    }

    file()

    return {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      bytes: data.bytes,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};
