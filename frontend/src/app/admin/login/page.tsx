"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);

  // Stagger mount animation
  useEffect(() => { setMounted(true); }, []);

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
    <div className="login-page">
      {/* Ambient grid background */}
      <div className="login-page__grid" aria-hidden />

      {/* Left — brand panel (desktop only) */}
      <div className={`login-brand ${mounted ? "visible" : ""}`} aria-hidden>
        <div className="login-brand__inner">
          {/* Diamond logo */}
          <div className="login-brand__diamond">
            <div className="login-brand__diamond-inner">
              <div className="login-brand__diamond-border" />
              <span className="login-brand__diamond-text">FS</span>
            </div>
          </div>

          <div className="login-brand__wordmark">
            <span className="login-brand__name">FRANDY</span>
            <span className="login-brand__sub">· dev</span>
          </div>

          <p className="login-brand__tagline">
            Admin access only.<br />
            Unauthorized entry is logged.
          </p>

          {/* Decorative corner lines */}
          <div className="login-brand__corner login-brand__corner--tl" aria-hidden />
          <div className="login-brand__corner login-brand__corner--br" aria-hidden />
        </div>
      </div>

      {/* Right — form panel */}
      <div className={`login-form-panel ${mounted ? "visible" : ""}`}>
        <div className="login-form-wrap">

          {/* Mobile logo — only shows below 768px */}
          <div className="login-mobile-logo">
            <div className="login-brand__diamond login-brand__diamond--sm">
              <div className="login-brand__diamond-inner">
                <div className="login-brand__diamond-border" />
                <span className="login-brand__diamond-text">FS</span>
              </div>
            </div>
            <span className="login-brand__name">FRANDY<span className="login-brand__sub"> · dev</span></span>
          </div>

          <div className="login-form-header">
            <p className="login-form-eyebrow">Admin Dashboard</p>
            <h1 className="login-form-title">Sign In</h1>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {error && (
              <div className="login-error" role="alert">
                <span className="login-error__icon">!</span>
                {error}
              </div>
            )}

            <div className="login-field">
              <label className="login-field__label" htmlFor="username">
                Username
              </label>
              <div className="login-field__frame">
                <input
                  id="username"
                  type="text"
                  className="login-field__input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  autoFocus
                  autoComplete="username"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-field__label" htmlFor="password">
                Password
              </label>
              <div className="login-field__frame">
                <input
                  id="password"
                  type="password"
                  className="login-field__input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="admin-btn-primary login-submit"
              disabled={loading || !username || !password}
            >
              <span>
                {loading ? "Authenticating..." : "Sign In →"}
              </span>
            </button>
          </form>

          <p className="login-back">
            <a href="/" className="login-back__link">← Back to site</a>
          </p>
        </div>
      </div>

      <style>{`
        /* ── Page layout ────────────────────────────────── */
        .login-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--bg-primary);
          position: relative;
          overflow: hidden;
        }

        .login-page__grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px);
          background-size: 48px 48px;
          opacity: 0.5;
          pointer-events: none;
        }

        /* ── Brand panel ────────────────────────────────── */
        .login-brand {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 1px solid var(--border);
          background: var(--bg-secondary);
          opacity: 0;
          transform: translateX(-16px);
          transition: opacity 600ms ease, transform 600ms ease;
        }

        .login-brand.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .login-brand__inner {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 48px;
        }

        /* Diamond logo */
        .login-brand__diamond {
          width: 64px;
          height: 64px;
          transform: rotate(45deg);
          border: 1.5px solid var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
        }

        .login-brand__diamond--sm {
          width: 32px;
          height: 32px;
        }

        .login-brand__diamond-inner {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        .login-brand__diamond-border {
          position: absolute;
          inset: 5px;
          border: 0.5px solid var(--border);
        }

        .login-brand__diamond--sm .login-brand__diamond-border {
          inset: 3px;
        }

        .login-brand__diamond-text {
          transform: rotate(-45deg);
          font-family: var(--font-display);
          font-size: 18px;
          color: var(--accent);
          letter-spacing: 1px;
          line-height: 1;
          position: relative;
          z-index: 1;
        }

        .login-brand__diamond--sm .login-brand__diamond-text {
          font-size: 10px;
        }

        .login-brand__wordmark {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .login-brand__name {
          font-family: var(--font-display);
          font-size: 36px;
          color: var(--text-primary);
          letter-spacing: 6px;
          line-height: 1;
        }

        .login-brand__sub {
          font-family: var(--font-body);
          font-size: 11px;
          letter-spacing: 4px;
          color: var(--accent-muted);
          text-transform: uppercase;
          line-height: 1;
        }

        .login-brand__tagline {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-muted);
          letter-spacing: 1px;
          text-align: center;
          line-height: 1.8;
          margin-top: 12px;
        }

        /* Decorative corner brackets */
        .login-brand__corner {
          position: absolute;
          width: 24px;
          height: 24px;
        }

        .login-brand__corner--tl {
          top: 24px;
          left: 24px;
          border-top: 1px solid var(--accent);
          border-left: 1px solid var(--accent);
        }

        .login-brand__corner--br {
          bottom: 24px;
          right: 24px;
          border-bottom: 1px solid var(--accent);
          border-right: 1px solid var(--accent);
        }

        /* ── Form panel ─────────────────────────────────── */
        .login-form-panel {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          opacity: 0;
          transform: translateX(16px);
          transition: opacity 600ms 150ms ease, transform 600ms 150ms ease;
        }

        .login-form-panel.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .login-form-wrap {
          width: 100%;
          max-width: 380px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* Mobile logo — hidden on desktop */
        .login-mobile-logo {
          display: none;
          align-items: center;
          gap: 12px;
        }

        .login-form-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .login-form-eyebrow {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--accent-muted);
        }

        .login-form-title {
          font-family: var(--font-display);
          font-size: 3rem;
          color: var(--text-primary);
          letter-spacing: 2px;
          line-height: 1;
          margin: 0;
        }

        /* ── Form ───────────────────────────────────────── */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 80, 80, 0.08);
          border: 1px solid rgba(255, 80, 80, 0.3);
          color: #ff5555;
          padding: 12px 14px;
          font-family: var(--font-body);
          font-size: 13px;
          letter-spacing: 0.5px;
        }

        .login-error__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border: 1px solid #ff5555;
          border-radius: 50%;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .login-field__label {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        /* Field wrapper — dframe style */
        .login-field__frame {
          position: relative;
          border: 1px solid var(--border);
          transition: border-color 200ms ease;
        }
        .login-field__frame::before {
          content: '';
          position: absolute;
          inset: 3px;
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 6px;
          pointer-events: none;
          z-index: 0;
          transition: border-color 200ms ease;
        }
        .login-field__frame::after {
          content: '';
          position: absolute;
          inset: -1px;
          background:
            linear-gradient(var(--accent), var(--accent)) top left / 12px 1.5px no-repeat,
            linear-gradient(var(--accent), var(--accent)) top left / 1.5px 12px no-repeat,
            linear-gradient(var(--accent), var(--accent)) bottom right / 12px 1.5px no-repeat,
            linear-gradient(var(--accent), var(--accent)) bottom right / 1.5px 12px no-repeat;
          pointer-events: none;
          z-index: 2;
          transition: opacity 200ms ease;
        }
        .login-field__frame:focus-within { border-color: var(--accent); }
        .login-field__frame:focus-within::after { opacity: 0; }

        .login-field__input {
          position: relative;
          z-index: 1;
          width: 100%;
          padding: 14px 16px;
          background: var(--bg-elevated);
          border: none;
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 15px;
          outline: none;
          -webkit-appearance: none;
        }

        .login-field__input::placeholder {
          color: var(--text-muted);
          font-size: 14px;
        }

        /* Sign-in button — full width override on admin-btn-primary */
        .login-submit {
          width: 100%;
          justify-content: center;
          padding: 15px 28px;
          margin-top: 4px;
          font-size: 13px;
          letter-spacing: 3px;
        }

        /* ── Back link ──────────────────────────────────── */
        .login-back {
          margin: 0;
        }

        .login-back__link {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 200ms ease;
        }

        .login-back__link:hover {
          color: var(--accent);
        }

        /* ── Responsive — tablet/mobile ─────────────────── */
        @media (max-width: 768px) {
          .login-page {
            grid-template-columns: 1fr;
          }

          .login-brand {
            display: none;
          }

          .login-form-panel {
            align-items: flex-start;
            padding: 3rem 1.5rem;
          }

          .login-mobile-logo {
            display: flex;
          }

          .login-form-title {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
}
