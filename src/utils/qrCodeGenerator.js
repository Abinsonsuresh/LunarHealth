import QRCode from "qrcode"

/**
 * Generates a QR code Data URL from the given content.
 * @param {string} content - The string content to encode.
 * @param {object} options - Optional configuration.
 * @param {number} options.width - Width of the QR code in pixels (overrides scale).
 * @param {number} options.margin - Margin around the QR code in modules (default: 4).
 * @param {string} options.color.dark - Color of the dark modules (default: "#000000ff").
 * @param {string} options.color.light - Color of the light modules (default: "#ffffffff").
 * @returns {Promise<string>} - Resolves to the Data URL of the generated QR code image.
 */
export const generateQRCode = async (content, options = {}) => {
  try {
    // qrcode.toDataURL returns a Promise
    return await QRCode.toDataURL(content, options)
  } catch (err) {
    console.error("Error generating QR code:", err)
    throw err
  }
}
