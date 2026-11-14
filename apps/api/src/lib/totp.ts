import crypto from 'crypto';

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Generate a random RFC 6238 Base32 secret for TOTP authenticators
 */
export function generateTotpSecret(length = 20): string {
  const randomBytes = crypto.randomBytes(length);
  let secret = '';
  for (let i = 0; i < randomBytes.length; i++) {
    secret += BASE32_CHARS[randomBytes[i] % 32];
  }
  return secret;
}

/**
 * Generate standard otpauth:// URI for Google Authenticator / Authy / Apple Keychain
 */
export function generateTotpURI(params: { issuer: string; label: string; secret: string }): string {
  const encodedIssuer = encodeURIComponent(params.issuer);
  const encodedLabel = encodeURIComponent(params.label);
  return `otpauth://totp/${encodedIssuer}:${encodedLabel}?secret=${params.secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generate 6-digit TOTP token for given secret at current timestamp
 */
export function generateTotpToken(secret: string, offsetSteps = 0): string {
  const timeStep = 30;
  const counter = Math.floor(Date.now() / 1000 / timeStep) + offsetSteps;
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigInt64BE(BigInt(counter));

  // Base32 decode
  let bits = '';
  for (const char of secret.toUpperCase().replace(/=+$/, '')) {
    const val = BASE32_CHARS.indexOf(char);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  const key = Buffer.from(bytes);

  const hmac = crypto.createHmac('sha1', key).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (code % 1000000).toString().padStart(6, '0');
}

/**
 * Verify 6-digit TOTP token with time-drift tolerance window
 */
export function verifyTotpToken(params: { token: string; secret: string; window?: number }): boolean {
  if (!params.token || !params.secret) return false;
  const window = params.window ?? 1;

  for (let drift = -window; drift <= window; drift++) {
    const expected = generateTotpToken(params.secret, drift);
    if (expected === params.token) {
      return true;
    }
  }
  return false;
}
