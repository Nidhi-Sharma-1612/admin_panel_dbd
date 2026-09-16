import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

let client: S3Client | null = null;

function getClient() {
  if (!client) {
    client = new S3Client({
      endpoint: getEnv("S3_ENDPOINT"),
      region: process.env.S3_REGION ?? "us-east-1",
      credentials: {
        accessKeyId: getEnv("S3_ACCESS_KEY"),
        secretAccessKey: getEnv("S3_SECRET_KEY"),
      },
      forcePathStyle: true,
    });
  }
  return client;
}

export async function uploadFile(params: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<string> {
  const bucket = getEnv("S3_BUCKET");
  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
    }),
  );

  const publicBase = getEnv("S3_PUBLIC_URL_BASE").replace(/\/$/, "");
  return `${publicBase}/${params.key}`;
}

// Fetches an object directly from S3/MinIO — used by the /api/media proxy
// route so the public frontend and browsers only ever need to reach the
// admin panel's own (already-HTTPS) domain, never MinIO's internal endpoint.
export async function getObject(key: string): Promise<{
  body: ReadableStream;
  contentType: string | null;
  contentLength: number | null;
}> {
  const bucket = getEnv("S3_BUCKET");
  const result = await getClient().send(new GetObjectCommand({ Bucket: bucket, Key: key }));

  if (!result.Body) throw new Error("Object has no body");

  return {
    body: result.Body.transformToWebStream(),
    contentType: result.ContentType ?? null,
    contentLength: result.ContentLength ?? null,
  };
}

export async function deleteFile(key: string): Promise<void> {
  const bucket = getEnv("S3_BUCKET");
  await getClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export function keyFromUrl(url: string): string {
  const publicBase = getEnv("S3_PUBLIC_URL_BASE").replace(/\/$/, "");
  return url.startsWith(publicBase) ? url.slice(publicBase.length + 1) : url;
}
