import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "lb_access";
const SIX_MONTHS = 60 * 60 * 24 * 180;
const ROLE_FAMILY = "family";
const ROLE_ADMIN = "admin";

function getAccessCode(): string {
  const code = process.env.ACCESS_CODE;
  if (!code) {
    throw new Error("ACCESS_CODE is not configured");
  }
  return code;
}

function getAdminCode(): string | undefined {
  return process.env.ADMIN_CODE || undefined;
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not configured");
  }
  return secret;
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

function sign(role: string): string {
  const signature = createHmac("sha256", getSessionSecret()).update(role).digest("hex");
  return `${role}.${signature}`;
}

function verify(token: string | undefined): string | null {
  if (!token) {
    return null;
  }
  const separator = token.indexOf(".");
  if (separator < 0) {
    return null;
  }
  const role = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = createHmac("sha256", getSessionSecret()).update(role).digest("hex");
  if (!safeEqual(signature, expected)) {
    return null;
  }
  return role;
}

async function currentRole(): Promise<string | null> {
  const store = await cookies();
  return verify(store.get(COOKIE_NAME)?.value);
}

export async function isAuthed(): Promise<boolean> {
  const role = await currentRole();
  return role === ROLE_FAMILY || role === ROLE_ADMIN;
}

export async function isAdmin(): Promise<boolean> {
  return (await currentRole()) === ROLE_ADMIN;
}

export async function grantAccess(submittedCode: string): Promise<boolean> {
  const adminCode = getAdminCode();
  let role: string | null = null;
  if (adminCode && safeEqual(submittedCode, adminCode)) {
    role = ROLE_ADMIN;
  } else if (safeEqual(submittedCode, getAccessCode())) {
    role = ROLE_FAMILY;
  }
  if (!role) {
    return false;
  }

  const store = await cookies();
  store.set(COOKIE_NAME, sign(role), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SIX_MONTHS,
  });
  return true;
}

export async function clearAccess(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
