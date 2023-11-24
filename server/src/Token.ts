import * as fs from "fs";
import { sign, verify, decode } from "jsonwebtoken";

class Token {
  privateKey: string;
  publicKey: string;
  expiration: number;
  constructor(
    privateKeyPath: string,
    publicKeyPath: string,
    expirationMs: number = 600000
  ) {
    this.privateKey = fs.readFileSync(privateKeyPath, "utf8");
    this.publicKey = fs.readFileSync(publicKeyPath, "utf8");
    this.expiration = expirationMs;
  }

  create(username: string) {
    const expiration = Math.floor(Date.now()) + this.expiration;
    const header = {
      alg: "RS256",
      typ: "JWT",
    };
    const payload = {
      username: username,
      iat: Date.now(),
      exp: expiration,
    };
    const token = sign(payload, this.privateKey, { header });
    return token;
  }

  verify(token: any) {
    return verify(token, this.publicKey);
  }
}

export const AccessToken = new Token(
  "../private-access.pem",
  "../public-access.pem"
);
export const RefreshToken = new Token(
  "../private-refresh.pem",
  "../public-refresh.pem",
  8.64e7
);
