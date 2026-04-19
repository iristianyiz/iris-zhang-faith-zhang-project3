import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";

export function LoginPage() {
  const navigate = useNavigate();
  const { refresh, isLoggedIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const trimmedUser = username.trim();
  const canSubmit =
    trimmedUser.length > 0 && password.length > 0 && !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await api.login({ username: trimmedUser, password });
      await refresh();
      navigate("/games", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not log in."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container page">
      <h1 className="page-title">Login</h1>
      <p className="muted" style={{ maxWidth: "52ch" }}>
        Your session is stored in an HTTP-only cookie after a successful login.
      </p>
      {isLoggedIn ? (
        <p>
          You are already signed in. <Link to="/games">Go to games</Link>
        </p>
      ) : (
        <div className="card">
          <form className="form-p2" onSubmit={handleSubmit} noValidate>
            {error ? <div className="banner-error">{error}</div> : null}
            <label className="field-p2">
              <div className="label-p2">Username</div>
              <input
                className="input-p2"
                id="login-username"
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
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
              {submitting ? "Signing in…" : "Submit"}
            </button>
            <p className="muted" style={{ marginBottom: 0 }}>
              No account? <Link to="/register">Register</Link>
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
