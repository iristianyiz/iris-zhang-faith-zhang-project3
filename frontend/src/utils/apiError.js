/**
 * Maps fetch/API errors to safe user-facing messages (no stack traces).
 */
export const NOT_LOGGED_IN_MESSAGE =
  "You are not logged in. Please sign in again.";

export function getApiErrorMessage(
  err,
  fallback = NOT_LOGGED_IN_MESSAGE,
) {
  if (!err) return fallback;
  const status = err.status;
  const raw = err.data?.error ?? err.message;
  const msg = typeof raw === "string" ? raw.trim() : "";

  if (status === 401) {
    if (/invalid credentials/i.test(msg)) {
      return msg || fallback;
    }
    if (!msg || /authentication required/i.test(msg)) {
      return NOT_LOGGED_IN_MESSAGE;
    }
    return msg;
  }

  if (status >= 500) {
    return NOT_LOGGED_IN_MESSAGE;
  }

  if (!msg) return fallback;
  return msg;
}
