export interface DecodedJwtPayload {
  sub?: string;
  userId?: string;
  roles?: string[];
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function decodeUtf8(bytes: number[]): string {
  let out = '';
  let i = 0;
  while (i < bytes.length) {
    const c = bytes[i++];
    if (c < 0x80) {
      out += String.fromCharCode(c);
    } else if (c >= 0xc0 && c < 0xe0) {
      const c2 = bytes[i++];
      out += String.fromCharCode(((c & 0x1f) << 6) | (c2 & 0x3f));
    } else if (c >= 0xe0 && c < 0xf0) {
      const c2 = bytes[i++];
      const c3 = bytes[i++];
      out += String.fromCharCode(((c & 0x0f) << 12) | ((c2 & 0x3f) << 6) | (c3 & 0x3f));
    } else {
      const c2 = bytes[i++];
      const c3 = bytes[i++];
      const c4 = bytes[i++];
      const codePoint =
        (((c & 0x07) << 18) | ((c2 & 0x3f) << 12) | ((c3 & 0x3f) << 6) | (c4 & 0x3f)) -
        0x10000;
      out += String.fromCharCode(0xd800 + (codePoint >> 10), 0xdc00 + (codePoint & 0x3ff));
    }
  }
  return out;
}

function decodeBase64(input: string): string {
  const clean = input.replace(/=+$/, '');
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i += 4) {
    const c1 = BASE64_CHARS.indexOf(clean[i]);
    const c2 = BASE64_CHARS.indexOf(clean[i + 1]);
    const c3 = i + 2 < clean.length ? BASE64_CHARS.indexOf(clean[i + 2]) : -1;
    const c4 = i + 3 < clean.length ? BASE64_CHARS.indexOf(clean[i + 3]) : -1;

    if (c1 === -1 || c2 === -1) break;

    bytes.push((c1 << 2) | (c2 >> 4));
    if (c3 !== -1) {
      bytes.push(((c2 & 15) << 4) | (c3 >> 2));
    }
    if (c4 !== -1) {
      bytes.push(((c3 & 3) << 6) | c4);
    }
  }

  return decodeUtf8(bytes);
}

export function decodeJwtPayload(token: string): DecodedJwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeBase64(base64)) as DecodedJwtPayload;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return true;
  if (typeof payload.exp !== 'number') return false;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSeconds;
}

export function normalizeRoleName(role: string): string {
  return role.startsWith('ROLE_') ? role.slice(5) : role;
}
