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

export async function upload_custom_order_image(
  order_id: number,
  base64_data: string,
  filename: string,
) {
  const match = base64_data.match(/^data:(.+);base64,(.+)$/)
  const content_type = match?.[1] ?? 'application/octet-stream'
  const buffer = Buffer.from(match?.[2] ?? base64_data, 'base64')
  const object_name = `custom_orders/${order_id}/${sanitizeFilename(filename)}`

  await minio.putObject(bucketName, object_name, buffer, buffer.length, {
    'Content-Type': content_type,
  })

  return object_name
}

export async function get_custom_order_images() {
  const result: Record<number, string[]> = {}
  const prefix = 'custom_orders/'
  const stream = minio.listObjects(bucketName, prefix, true)

  for await (const obj of stream) {
    const parts = obj.name.slice(prefix.length).split('/')
    const order_id = parseInt(parts[0], 10)
    const filename = parts[1]
    if (!result[order_id]) {
      result[order_id] = []
    }
    result[order_id].push(filename)
  }

  return result
}
