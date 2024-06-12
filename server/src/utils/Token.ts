import { sign, verify } from "jsonwebtoken";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

require("dotenv").config();
const BUCKET = process.env.BUCKET;
const AWS_REGION = process.env.AWS_REGION;
const PRIVATE_ACCESS_KEY_PATH = process.env.PRIVATE_ACCESS_KEY_PATH;
const PUBLIC_ACCESS_KEY_PATH = process.env.PUBLIC_ACCESS_KEY_PATH;
const PRIVATE_REFRESH_KEY_PATH = process.env.PRIVATE_REFRESH_KEY_PATH;
const PUBLIC_REFRESH_KEY_PATH = process.env.PUBLIC_REFRESH_KEY_PATH;

const client = new S3Client({ region: AWS_REGION });

export const getKey = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  try {
    const response = await client.send(command);
    const str = await response.Body?.transformToString();
    return str;
  } catch (err) {
    console.error(err);
  }
};

class Token {
  privateKey: any;
  publicKey: any;
  expiration: number;
  constructor(expirationMs: number = 600000) {
    this.privateKey = "";
    this.publicKey = "";
    this.expiration = expirationMs;
  }

  create(userId: number) {
    const expiration = Math.floor(Date.now()) + this.expiration;
    const header = {
      alg: "RS256",
      typ: "JWT",
    };
    const payload = {
      userId: userId,
      iat: Date.now(),
      exp: expiration,
    };
    const token = sign(payload, this.privateKey, { header });
    return token;
  }

  async pullKeys(privateKeyPath: any, publicKeyPath: any): Promise<void> {
    let maybePrivateKey = await getKey(privateKeyPath);
    let maybePublicKey = await getKey(publicKeyPath);
    if (maybePrivateKey) this.privateKey = maybePrivateKey;
    if (maybePublicKey) this.publicKey = maybePublicKey;
  }

  verify(token: any) {
    if (!token) {
      return false;
    }
    return JSON.parse(JSON.stringify(verify(token, this.publicKey)));
  }
}

export const AccessToken = new Token();
export const RefreshToken = new Token(8.64e7);
AccessToken.pullKeys(PRIVATE_ACCESS_KEY_PATH, PUBLIC_ACCESS_KEY_PATH);
RefreshToken.pullKeys(PRIVATE_REFRESH_KEY_PATH, PUBLIC_REFRESH_KEY_PATH);
