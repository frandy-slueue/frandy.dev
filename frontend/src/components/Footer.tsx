"use client";

import { useEffect, useState } from "react";

interface SocialLinks {
  social_github: string | null;
  social_linkedin: string | null;
  social_x: string | null;
  social_facebook: string | null;
  social_medium: string | null;
}

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const MediumIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
  </svg>
);

const CodeBreederDiamond = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <polygon
      points="16,2 30,16 16,30 2,16"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      opacity="0.8"
    />
    <polygon
      points="16,6 26,16 16,26 6,16"
      stroke="currentColor"
      strokeWidth="0.5"
      fill="none"
      opacity="0.3"
    />
    <text
      x="16"
      y="20"
      textAnchor="middle"
      fill="currentColor"
      fontSize="9"
      fontFamily="var(--font-display)"
      letterSpacing="1"
    >
      CB
    </text>
  </svg>
);

export default function Footer() {
  const [social, setSocial] = useState<SocialLinks>({
    social_github: null,
    social_linkedin: null,
    social_x: null,
    social_facebook: null,
    social_medium: null,
  });

  useEffect(() => {
    fetch("/api/settings/social")
      .then((r) => r.json())
      .then((data) => setSocial(data))
      .catch(() => {});
  }, []);

  const socialLinks = [
    { key: "social_github", icon: <GitHubIcon />, label: "GitHub" },
    { key: "social_linkedin", icon: <LinkedInIcon />, label: "LinkedIn" },
    { key: "social_x", icon: <XIcon />, label: "X" },
    { key: "social_facebook", icon: <FacebookIcon />, label: "Facebook" },
    { key: "social_medium", icon: <MediumIcon />, label: "Medium" },
  ];

  return (
    <>
      <footer className="site-footer">
        <div className="site-footer__inner site-container">
          {/* Left — CodeBreeder brand */}
          <div className="site-footer__brand">
            <div className="site-footer__logo">
              <CodeBreederDiamond />
            </div>
            <div className="site-footer__brand-text">
              <span className="site-footer__name">frandy.dev</span>
              <span className="site-footer__tagline">CodeBreeder</span>
            </div>
          </div>

          {/* Center — copyright */}
          <div className="site-footer__copy">
            <span>© {new Date().getFullYear()} Frandy Slueue</span>
            <span className="site-footer__dot">·</span>
            <span>CodeBreeder</span>
          </div>

          {/* Right — social links */}
          <div className="site-footer__social">
            {socialLinks.map(({ key, icon, label }) => {
              const url = social[key as keyof SocialLinks];
              if (!url) return null;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer__social-link"
                  aria-label={label}
                >
                  {icon}
                </a>
              );
            })}
          </div>
        </div>
      </footer>

      <style>{`
        .site-footer {
          display: none;
          border-top: 1px solid var(--border);
          background: var(--bg-secondary);
          padding: 1.5rem 0;
        }

        @media (min-width: 768px) {
          .site-footer {
            display: block;
          }
        }

        .site-footer__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .site-footer__brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .site-footer__logo {
          color: var(--accent);
          opacity: 0.8;
          transition: opacity 0.2s;
        }

        .site-footer__logo:hover {
          opacity: 1;
        }

        .site-footer__brand-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .site-footer__name {
          font-family: var(--font-display);
          font-size: 1rem;
          color: var(--text-primary);
          letter-spacing: 2px;
        }

        .site-footer__tagline {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--accent-muted);
          letter-spacing: 1px;
        }

        .site-footer__copy {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .site-footer__dot {
          color: var(--border);
        }

        .site-footer__social {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .site-footer__social-link {
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }

        .site-footer__social-link:hover {
          color: var(--accent);
        }
      `}</style>
    </>
  );
}
