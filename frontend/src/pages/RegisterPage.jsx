import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";

export function RegisterPage() {
  const navigate = useNavigate();
  const { refresh, isLoggedIn } = useAuth();
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
  const canSubmit = !anyBlank && !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }
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
    <div className="container page">
      <h1 className="page-title">Register</h1>
      <p className="muted" style={{ maxWidth: "52ch" }}>
        After a successful registration, you are signed in with the same
        session cookie as login.
      </p>
      {isLoggedIn ? (
        <p>
          You are already signed in. <Link to="/games">Go to games</Link>
        </p>
      ) : (
        <div className="card">
          <form className="form-p2" onSubmit={handleSubmit} noValidate>
            {error ? <div className="banner-error">{error}</div> : null}
            {!anyBlank && !passwordsMatch ? (
              <div className="banner-error">Passwords do not match.</div>
            ) : null}
            <label className="field-p2">
              <div className="label-p2">Username</div>
              <input
                className="input-p2"
                id="reg-username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label className="field-p2">
              <div className="label-p2">Password</div>
              <input
                className="input-p2"
                id="reg-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label className="field-p2">
              <div className="label-p2">Verify password</div>
              <input
                className="input-p2"
                id="reg-password2"
                name="password2"
                type="password"
                autoComplete="new-password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
              {submitting ? "Creating account…" : "Submit"}
            </button>
            <p className="muted" style={{ marginBottom: 0 }}>
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
