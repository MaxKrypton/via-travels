import { S3Client } from "@aws-sdk/client-s3";
import { SECRETS } from "../helpers";

export const s3Client = new S3Client({
  credentials: {
    accessKeyId: SECRETS.AWS_ACCESS_KEY_ID,
    secretAccessKey: SECRETS.AWS_SECRET_ACCESS_KEY
  },
  region: process.env.AWS_REGION
});

