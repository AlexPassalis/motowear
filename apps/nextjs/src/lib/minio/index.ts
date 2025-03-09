import { readSecret } from '@/utils/readSecret'
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

export function uploadFile(file: File, objectName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    minio.fPutObject(bucketName, objectName, file.filepath, (err, etag) => {
      if (err) {
        console.error(
          err,
          `Failed to upload ${file.originalFilename} to ${bucketName}.`
        )
        return reject(err)
      }
      console.log(
        `Successfully uploaded ${file.originalFilename} as ${objectName} in ${bucketName}.`
      )
      resolve(etag)
    })
  })
}
