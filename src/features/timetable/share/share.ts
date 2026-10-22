export type ShareResult = 'shared' | 'cancelled' | 'failed'

/** Whether the phone's share sheet (KakaoTalk, Instagram, …) can take this picture. */
export function canShareImage(file: File): boolean {
  return typeof navigator.canShare === 'function' && typeof navigator.share === 'function' && navigator.canShare({ files: [file] })
}

/** Opens the share sheet with the picture alone: some apps drop the file when text comes along. */
export async function shareImage(file: File): Promise<ShareResult> {
  try {
    await navigator.share({ files: [file] })
    return 'shared'
  } catch (error) {
    return error instanceof DOMException && error.name === 'AbortError' ? 'cancelled' : 'failed'
  }
}

/** Saves the picture as a download (computers, and browsers without a share sheet). */
export function downloadImage(file: File): void {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  link.click()
  // Give the browser a moment to start the download before letting go of the data.
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
