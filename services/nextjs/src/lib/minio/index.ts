import { Client } from 'minio'
import { envServer } from '@/envServer'
import { sanitizeFilename } from '@/utils/sanitize'
import { File } from 'formidable'

const minio = new Client({
  endPoint: 'minio',
  port: 9000,
  useSSL: false,
  accessKey: envServer.MINIO_ROOT_USER,
  secretKey: envServer.MINIO_ROOT_PASSWORD,
})

const bucketName = 'motowear'

export async function uploadFile(path: string, file: File) {
  const objectName = `${path}/${sanitizeFilename(
    file.originalFilename || 'undefined_file_name',
  )}`
  await minio.fPutObject(bucketName, objectName, file.filepath, {})
}

export async function deleteFile(path: string, fileName: string) {
  const objectName = `${path}/${fileName}`
  await minio.removeObject(bucketName, objectName)
}

export async function getFileNames(product_type: string) {
  const fileNames: string[] = []
  const prefix = `${product_type}/`
  const stream = minio.listObjects(bucketName, prefix, false)

  for await (const obj of stream) {
    if (obj.name) {
      const strippedName = obj.name.startsWith(prefix)
        ? obj.name.slice(prefix.length)
        : obj.name
      fileNames.push(strippedName)
    }
  }
  return fileNames
}

type MinioClientWithRemoveObjects = Client & {
  removeObjects: (
    bucketName: string,
    objects: string[],
    callback: (err: Error | null) => void,
  ) => void
}

export function deleteTypeImages(productType: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const prefix = `${productType}/`
    const objectsToDelete: string[] = []
    const stream = minio.listObjects(bucketName, prefix, true)

    stream.on('data', (obj) => {
      if (obj.name) {
        objectsToDelete.push(obj.name)
      }
    })
    stream.on('error', (err) => reject(err))
    stream.on('end', () => {
      if (objectsToDelete.length > 0) {
        ;(minio as MinioClientWithRemoveObjects).removeObjects(
          bucketName,
          objectsToDelete,
          (err: Error | null) => {
            if (err) {
              return reject(err)
            }
            resolve()
          },
        )
      } else {
        resolve()
      }
    })
  })
}
