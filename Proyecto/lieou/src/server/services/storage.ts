import { Config, Effect } from "effect"
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { StorageError } from "@/server/schemas/error"

export class StorageService extends Effect.Service<StorageService>()(
  "StorageService",
  {
    effect: Effect.gen(function* () {

      const bucketName = yield* Config.string("R2_BUCKET_NAME")
      const publicUrl = yield* Config.string("R2_PUBLIC_URL")


      const accountId = yield* Config.string("R2_ACCOUNT_ID")
      const accessKeyId = yield* Config.string("R2_ACCESS_KEY_ID")
      const secretAccessKey = yield* Config.string("R2_SECRET_ACCESS_KEY")


      const client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      })

      return {
        getPresignedUploadUrl: (key: string, contentType: string) => Effect.gen(function* () {
          if (!bucketName) return yield* Effect.die("Missing R2_BUCKET_NAME")

          const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            ContentType: contentType,
          })

          return yield* Effect.tryPromise({
            try: () => getSignedUrl(client, command, { expiresIn: 3600 }),
            catch: (error) => new StorageError({ message: 'Failed to generate presigned URL', cause: error })
          })
        }),

        getPublicUrl: (key: string) => {
          if (!publicUrl) throw new Error("Missing R2_PUBLIC_URL")
          return `${publicUrl}/${key}`
        },

        deleteObject: (key: string) => Effect.gen(function* () {
          if (!bucketName) return yield* Effect.die("Missing R2_BUCKET_NAME")

          const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
          })

          yield* Effect.tryPromise({
            try: () => client.send(command),
            catch: (error) => new StorageError({ message: 'Failed to delete object', cause: error })
          })
        })
      }
    }),
    dependencies: [],
    accessors: true
  }
) { }
