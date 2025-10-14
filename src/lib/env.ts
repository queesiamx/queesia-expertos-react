//src/lib/env.ts

export const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
export const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;
export const DELETE_URL = import.meta.env.VITE_CLOUDINARY_DELETE_URL as string | undefined;

export function assertCloudinaryEnv() {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary ENV missing: VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET"
    );
  }
}
