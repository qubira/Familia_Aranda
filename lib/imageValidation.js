const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file) {
  if (!file || typeof file === "string") {
    return "No se recibió ningún archivo.";
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Formato no permitido. Usa JPG, PNG, WEBP o GIF.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "La imagen no debe pesar más de 5MB.";
  }
  return null;
}
