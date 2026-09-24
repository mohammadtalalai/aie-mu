import crypto from "crypto";

const SESSION_SECRET =
  process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  console.warn(
    "[session] SESSION_SECRET is missing."
  );
}

/* =========================================================
   BASE64URL
========================================================= */

function base64UrlEncode(
  input
) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64UrlDecode(
  input
) {
  let value =
    input
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  while (
    value.length % 4
  ) {
    value += "=";
  }

  return Buffer.from(
    value,
    "base64"
  ).toString("utf8");
}

/* =========================================================
   CREATE SESSION
========================================================= */

export function createSessionToken(
  email,
  ttlMinutes = 60
) {
  if (!SESSION_SECRET) {
    throw new Error(
      "SESSION_SECRET is missing."
    );
  }

  const payload = {
    email,

    exp:
      Date.now() +
      ttlMinutes *
        60 *
        1000,

    iat: Date.now(),
  };

  const payloadString =
    JSON.stringify(payload);

  const encodedPayload =
    base64UrlEncode(
      payloadString
    );

  const signature =
    crypto
      .createHmac(
        "sha256",
        SESSION_SECRET
      )
      .update(
        encodedPayload
      )
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

  return `${encodedPayload}.${signature}`;
}

/* =========================================================
   VERIFY SESSION
========================================================= */

export function verifySessionToken(
  token
) {
  try {
    if (
      !token ||
      typeof token !== "string"
    ) {
      return null;
    }

    if (!SESSION_SECRET) {
      return null;
    }

    const parts =
      token.split(".");

    if (
      parts.length !== 2
    ) {
      return null;
    }

    const [
      encodedPayload,
      receivedSignature,
    ] = parts;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          SESSION_SECRET
        )
        .update(
          encodedPayload
        )
        .digest("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

    const receivedBuffer =
      Buffer.from(
        receivedSignature
      );

    const expectedBuffer =
      Buffer.from(
        expectedSignature
      );

    if (
      receivedBuffer.length !==
      expectedBuffer.length
    ) {
      return null;
    }

    if (
      !crypto.timingSafeEqual(
        receivedBuffer,
        expectedBuffer
      )
    ) {
      return null;
    }

    const payload =
      JSON.parse(
        base64UrlDecode(
          encodedPayload
        )
      );

    if (
      !payload?.email ||
      !payload?.exp
    ) {
      return null;
    }

    if (
      Number(payload.exp) <
      Date.now()
    ) {
      return null;
    }

    return {
      email: String(
        payload.email
      )
        .trim()
        .toLowerCase(),

      exp: Number(
        payload.exp
      ),

      iat: Number(
        payload.iat
      ),
    };
  } catch (error) {
    console.error(
      "[session] verify failed:",
      error
    );

    return null;
  }
}
