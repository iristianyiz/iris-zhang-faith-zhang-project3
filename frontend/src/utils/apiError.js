/**
 * Maps fetch/API errors to safe user-facing messages (no stack traces).
 */
export function getApiErrorMessage(err, fallback = "Something went wrong.") {
  if (!err) return fallback;
  const raw = err.data?.error ?? err.message;
  const msg = typeof raw === "string" ? raw.trim() : "";
  if (!msg) return fallback;
  if (err.status >= 500) {
    return "Something went wrong. Please try again.";
  }
  return msg;
}
