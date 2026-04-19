import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const fieldStyle = {
  display: "block",
  width: "100%",
  maxWidth: "20rem",
  padding: "0.5rem 0.6rem",
  marginTop: "0.25rem",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  font: "inherit",
};

export function RegisterPage() {
  const navigate = useNavigate();
  const { refresh, isLoggedIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const trimmedUser = username.trim();
  const anyBlank =
    !trimmedUser || !password || !verifyPassword;
  const submitDisabled = submitting || anyBlank;

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitDisabled) return;
    if (password !== verifyPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.register({ username: trimmedUser, password });
      await refresh();
      navigate("/games", { replace: true });
    } catch (err) {
      if (err?.status === 409) {
        setError(err?.data?.error || "Username already taken");
      } else {
        setError(err?.data?.error || "Registration failed");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h1>Register</h1>
      <p style={{ color: "#64748b", marginBottom: "1.25rem" }}>
        After a successful registration, you are signed in using the same
        session cookie as login.
      </p>
      {isLoggedIn ? (
        <p>
          You are already signed in.{" "}
          <Link to="/games">Go to games</Link>
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ maxWidth: "22rem" }}
          noValidate
        >
          <label style={{ display: "block", marginBottom: "0.75rem" }}>
            Username
            <input
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={fieldStyle}
            />
          </label>
          <label style={{ display: "block", marginBottom: "0.75rem" }}>
            Password
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={fieldStyle}
            />
          </label>
          <label style={{ display: "block", marginBottom: "1rem" }}>
            Verify password
            <input
              name="verifyPassword"
              type="password"
              autoComplete="new-password"
              value={verifyPassword}
              onChange={(e) => setVerifyPassword(e.target.value)}
              style={fieldStyle}
            />
          </label>
          {error ? (
            <p role="alert" style={{ color: "#b91c1c", marginBottom: "0.75rem" }}>
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={submitDisabled}>
            {submitting ? "Creating account…" : "Submit"}
          </button>
        </form>
      )}
    </section>
  );
}
