/* ---------------------------------------------------------------------------
   Client-side image compression (Nova Circle PRD non-functional requirement:
   "Compress uploaded images to reduce data usage"). Canvas-based, no extra
   dependency. Returns a data URL + basic metadata.
--------------------------------------------------------------------------- */

const MAX_DIMENSION = 1600 // px on the longest edge
const QUALITY = 0.72

export function compressImage(file, { maxDimension = MAX_DIMENSION, quality = QUALITY } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file (JPEG, PNG or WEBP).'))
      return
    }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width)
        width = maxDimension
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height)
        height = maxDimension
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      resolve({
        dataUrl,
        width,
        height,
        originalSize: file.size,
        approxSize: Math.round((dataUrl.length * 3) / 4), // rough base64 → bytes
      })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('We could not read that image. Please try another photo.'))
    }
    img.src = url
  })
}

export function formatBytes(bytes) {
  if (!bytes) return '0 KB'
  const kb = bytes / 1024
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`
}
