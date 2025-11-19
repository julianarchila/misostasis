import { Effect } from "effect"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

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
        uploadImage: (input: { filename: string; contentType: string; data: string }) => Effect.gen(function* () {
            if (!bucketName) return yield* Effect.die("Missing R2_BUCKET_NAME")
            
            const client = getClient()
            const key = `places/${crypto.randomUUID()}-${input.filename}`
            
            // Convert base64 to Buffer
            const buffer = Buffer.from(input.data, 'base64')
            
            yield* Effect.tryPromise({
                try: () => client.send(new PutObjectCommand({
                    Bucket: bucketName,
                    Key: key,
                    Body: buffer,
                    ContentType: input.contentType,
                })),
                catch: (error) => new Error(`Failed to upload image: ${error}`)
            })
            
            return {
                publicUrl: publicUrl ? `${publicUrl}/${key}` : "",
                key
            }
        })
      }
    }),
    dependencies: [],
    accessors: true
  }
) { }
