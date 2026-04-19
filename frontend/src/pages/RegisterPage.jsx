import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";

export function RegisterPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const trimmedUser = username.trim();
  const passwordsMatch = password === password2;
  const anyBlank =
    trimmedUser.length === 0 ||
    password.length === 0 ||
    password2.length === 0;
  const canSubmit = !anyBlank && passwordsMatch && !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await api.register({ username: trimmedUser, password });
      await refresh();
      navigate("/games", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not register."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page page-narrow">
      <h1>Register</h1>
      <p className="muted">Choose a username and password for this app.</p>
      <form className="card stack" onSubmit={handleSubmit} noValidate>
        {error ? <div className="banner-error">{error}</div> : null}
        {!anyBlank && !passwordsMatch ? (
          <div className="banner-error">Passwords do not match.</div>
        ) : null}
        <div className="form-field">
          <label htmlFor="reg-username">Username</label>
          <input
            id="reg-username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="reg-password2">Verify password</label>
          <input
            id="reg-password2"
            name="password2"
            type="password"
            autoComplete="new-password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
          {submitting ? "Creating account…" : "Create account"}
        </button>
        <p className="muted" style={{ marginBottom: 0 }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
