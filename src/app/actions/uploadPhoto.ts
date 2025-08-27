"use server";

import { put } from "@vercel/blob";

export async function uploadPhotoAction(file: File) {
  const blob = await put(`user-uploads/${Date.now()}-${file.name}`, file, {
    access: "public",
  });
  return blob.url;
}
