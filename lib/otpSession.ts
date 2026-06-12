const STORAGE_KEY = "herald_otp_session";
const TTL_MS = 23 * 60 * 60 * 1000; // 23 hours (slightly under the 24h JWT)

interface OtpSession {
  email: string;
  walletPubkey: string;
  token: string;
  expiresAt: number;
}

function load(): OtpSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session: OtpSession = JSON.parse(raw);
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveOtpSession(email: string, walletPubkey: string, token: string) {
  try {
    const session: OtpSession = {
      email: email.trim().toLowerCase(),
      walletPubkey,
      token,
      expiresAt: Date.now() + TTL_MS,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {}
}

export function getValidOtpSession(email: string, walletPubkey: string): string | null {
  const session = load();
  if (!session) return null;
  if (
    session.email === email.trim().toLowerCase() &&
    session.walletPubkey === walletPubkey
  ) {
    return session.token;
  }
  return null;
}

export function clearOtpSession() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}
