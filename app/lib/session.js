import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "dev-insecure-secret-change-me";

if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  console.warn(
    "[session] SESSION_SECRET is not set in production — set a long random value in .env.local!"
  );
}

// Stateless signed token: base64url("email:expiresAt:signature").
// No sessions table needed — the signature alone proves it was issued by
// our server and hasn't been tampered with or expired.
export function createSessionToken(email, ttlMinutes = 60) {
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
  const payload = `${email}:${expiresAt}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifySessionToken(token) {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [email, expiresAtStr, sig] = decoded.split(":");
    if (!email || !expiresAtStr || !sig) return null;

    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(`${email}:${expiresAtStr}`)
      .digest("hex");

    // Constant-time comparison to avoid timing attacks.
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expected);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    if (Date.now() > Number(expiresAtStr)) return null;

    return { email };
  } catch {
    return null;
  }
}
