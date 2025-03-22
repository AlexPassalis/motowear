import { readSecret } from '@/utils/readSecret'
import { sanitizeFilename } from '@/utils/sanitize'
import { File } from 'formidable'
import { Client } from 'minio'

const minio = new Client({
  endPoint: 'minio',
  port: 9000,
  useSSL: false,
  accessKey: readSecret('MINIO_ROOT_USER'),
  secretKey: readSecret('MINIO_ROOT_PASSWORD'),
})

const bucketName = 'product'

export async function uploadFile(path: string, file: File): Promise<void> {
  const objectName = `${path}/${sanitizeFilename(
    file.originalFilename || 'undefinedOriginalFilename'
  )}`
  await minio.fPutObject(bucketName, objectName, file.filepath, {})
}

export async function deleteFile(
  path: string,
  fileName: string
): Promise<void> {
  const objectName = `${path}/${fileName}`
  await minio.removeObject(bucketName, objectName)
}

type MinioClientWithRemoveObjects = Client & {
  removeObjects: (
    bucketName: string,
    objects: string[],
    callback: (err: Error | null) => void
  ) => void
}

export function deleteTypeImages(productType: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const prefix = `${productType}/`
    const objectsToDelete: string[] = []
    const stream = minio.listObjects(bucketName, prefix, true)

    stream.on('data', obj => {
      if (obj.name) {
        objectsToDelete.push(obj.name)
      }
    })
    stream.on('error', err => reject(err))
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
          }
        )
      } else {
        resolve()
      }
    })
  })
}
