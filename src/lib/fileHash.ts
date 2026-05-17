function toHex(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes)
  let out = ''
  for (const b of arr) out += b.toString(16).padStart(2, '0')
  return '0x' + out
}

export async function sha256File(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buf)
  return toHex(digest)
}

export async function sha256Files(files: File[]): Promise<string[]> {
  return Promise.all(files.map(sha256File))
}
