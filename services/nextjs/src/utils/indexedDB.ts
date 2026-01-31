const DB_NAME = 'motowear_custom_images'
const STORE_NAME = 'images'
const DB_VERSION = 1

function open_db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

export async function save_custom_image(
  name: string,
  blob: Blob,
): Promise<void> {
  const db = await open_db()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(blob, name)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function get_custom_image(name: string): Promise<Blob | null> {
  const db = await open_db()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(name)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result ?? null)
  })
}

export async function delete_custom_image(name: string): Promise<void> {
  const db = await open_db()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(name)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function get_custom_image_as_base64(name: string) {
  const blob = await get_custom_image(name)
  if (!blob) {
    return null
  }

  const array_buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(array_buffer)
  const binary = String.fromCharCode(...bytes)

  return `data:${blob.type};base64,${btoa(binary)}`
}
