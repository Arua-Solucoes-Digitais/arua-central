import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

const COST = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LENGTH = 64;

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 200;

function derive(password: string, salt: Buffer, options: ScryptOptions, length: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, length, options, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

// A senha nunca é guardada: só o resultado do scrypt, com um sal aleatório por senha.
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await derive(password, salt, COST, KEY_LENGTH);
  return `scrypt$${COST.N}$${COST.r}$${COST.p}$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, N, r, p, salt, key] = stored.split("$");
  if (scheme !== "scrypt" || !N || !r || !p || !salt || !key) return false;
  const expected = Buffer.from(key, "base64url");
  const actual = await derive(
    password,
    Buffer.from(salt, "base64url"),
    { N: Number(N), r: Number(r), p: Number(p), maxmem: COST.maxmem },
    expected.length,
  );
  return timingSafeEqual(actual, expected);
}
