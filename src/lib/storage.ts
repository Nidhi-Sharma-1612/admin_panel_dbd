import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

export async function deleteFile(key: string): Promise<void> {
  const bucket = getEnv("S3_BUCKET");
  await getClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export function keyFromUrl(url: string): string {
  const publicBase = getEnv("S3_PUBLIC_URL_BASE").replace(/\/$/, "");
  return url.startsWith(publicBase) ? url.slice(publicBase.length + 1) : url;
}
