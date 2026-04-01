"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      router.push("/admin");
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__header">
          <h1>frandy.dev</h1>
          <p>Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login__form">
          {error && <div className="admin-login__error">{error}</div>}

          <div className="admin-login__field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              autoFocus
            />
          </div>

          <div className="admin-login__field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            className="admin-login__btn"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .admin-login {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg);
          padding: 1rem;
        }
        .admin-login__card {
          width: 100%;
          max-width: 400px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 2.5rem;
        }
        .admin-login__header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .admin-login__header h1 {
          font-family: var(--font-display);
          font-size: 2rem;
          color: var(--color-accent);
          margin: 0;
        }
        .admin-login__header p {
          color: var(--color-text-muted);
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
        }
        .admin-login__error {
          background: rgba(255, 80, 80, 0.1);
          border: 1px solid rgba(255, 80, 80, 0.3);
          color: #ff5050;
          padding: 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }
        .admin-login__form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .admin-login__field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .admin-login__field label {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          font-family: var(--font-mono);
        }
        .admin-login__field input {
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          padding: 0.75rem 1rem;
          color: var(--color-text);
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .admin-login__field input:focus {
          border-color: var(--color-accent);
        }
        .admin-login__btn {
          background: var(--color-accent);
          color: var(--color-bg);
          border: none;
          border-radius: 4px;
          padding: 0.875rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
          margin-top: 0.5rem;
        }
        .admin-login__btn:hover {
          opacity: 0.85;
        }
        .admin-login__btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
