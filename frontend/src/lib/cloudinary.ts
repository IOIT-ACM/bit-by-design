// --- Configuration ---
const CLOUDINARY_CONFIG = {
    cloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || "dsjstb47y",
    uploadPreset: import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
        "bit-by-design",
} as const;

export interface CloudinaryUploadResponse {
    secure_url: string;
    public_id: string;
    format: string;
    width: number;
    height: number;
    // ... other fields we might not need
}

/**
 * Upload a file to Cloudinary
 * @param file The file to upload
 * @returns The upload response from Cloudinary
 */
export async function uploadToCloudinary(
    file: File,
): Promise<CloudinaryUploadResponse> {
    if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
        console.log(
            "Cloudinary configuration is missing. Please check your environment variables.",
        );
        throw new Error(
            "Cloudinary configuration is missing. Please check your environment variables.",
        );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);

    const folderName = "bit-by-design-submissions";
    formData.append("folder", folderName);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
            {
                method: "POST",
                body: formData,
            },
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || "Image upload failed");
        }

        return response.json();
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
    }
}
