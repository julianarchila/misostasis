import { Effect } from "effect"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export class StorageService extends Effect.Service<StorageService>()(
  "StorageService",
  {
    effect: Effect.gen(function* () {
      // Lazy initialization of the client to avoid issues during build time if env vars are missing
      const getClient = () => {
        const accountId = process.env.R2_ACCOUNT_ID
        const accessKeyId = process.env.R2_ACCESS_KEY_ID
        const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

        if (!accountId || !accessKeyId || !secretAccessKey) {
          throw new Error("Missing R2 credentials configuration")
        }

        return new S3Client({
          region: "auto",
          endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        })
      }

      const bucketName = process.env.R2_BUCKET_NAME
      const publicUrl = process.env.R2_PUBLIC_URL

      if (!bucketName || !publicUrl) {
          // We can't strictly fail here if we want the service to be constructible even without env vars 
          // (e.g. for tests that mock it), but for a "live" implementation it's fatal.
          // However, since this is the implementation block, it runs when the service is started.
          // I'll throw if they are missing.
          // But I'll wrap it in the method calls to be safe or use Effect.die
      }

      return {
        getPresignedUploadUrl: (key: string, contentType: string) => Effect.gen(function* () {
            if (!bucketName) return yield* Effect.die("Missing R2_BUCKET_NAME")
            
            const client = getClient()
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                ContentType: contentType,
            })

            return yield* Effect.tryPromise({
                try: () => getSignedUrl(client, command, { expiresIn: 3600 }),
                catch: (error) => new Error(`Failed to generate presigned URL: ${error}`)
            })
        }),
        
        getPublicUrl: (key: string) => {
            if (!publicUrl) throw new Error("Missing R2_PUBLIC_URL")
            return `${publicUrl}/${key}`
        }
      }
    }),
    dependencies: [],
    accessors: true
  }
) { }
