import fs from 'fs'
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
  console.log(
    `=== MINIO UPLOAD: Attempting to upload ${file.originalFilename} ===`
  )
  console.log(
    `File details: size=${file.size}, type=${file.mimetype}, temp path=${file.filepath}`
  )
  console.log(`Target: bucket=${bucketName}, objectName=${objectName}`)

  return new Promise((resolve, reject) => {
    // Check if file exists and is accessible
    try {
      const stats = fs.statSync(file.filepath)
      console.log(
        `File exists: size=${stats.size}, last modified=${stats.mtime}`
      )
    } catch (err) {
      console.error(`ERROR: Cannot access file at ${file.filepath}:`, err)
      return reject(
        new Error(`Cannot access file at ${file.filepath}: ${err.message}`)
      )
    }

    minio.fPutObject(bucketName, objectName, file.filepath, (err, etag) => {
      if (err) {
        console.error(`=== MINIO UPLOAD FAILED: ${file.originalFilename} ===`)
        console.error(err)
        return reject(err)
      }
      console.log(`=== MINIO UPLOAD SUCCESS: ${file.originalFilename} ===`)
      console.log(
        `Uploaded as ${objectName} in ${bucketName} with etag ${etag}`
      )

      fs.unlink(file.filepath, unlinkErr => {
        if (unlinkErr) {
          console.error(
            `ERROR: Failed to delete temporary file at ${file.filepath}:`,
            unlinkErr
          )
          // Not rejecting here because the main operation (upload) was successful
        } else {
          console.log(
            `Temporary file at ${file.filepath} deleted successfully.`
          )
        }
      })

      resolve(etag)
    })
  })
}
