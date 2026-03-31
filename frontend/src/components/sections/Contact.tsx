"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Loader2,
  CheckCircle,
  Check,
  ExternalLink,
  AtSign,
} from "lucide-react";
import {
  FaLinkedin,
  FaGithub,
  FaXTwitter,
  FaFacebook,
  FaMedium,
  FaHashnode,
  FaDev,
} from "react-icons/fa6";
import { contactApi, settingsApi } from "@/lib/api";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone: string;
  company: string;
}

interface SocialLinks {
  social_github: string | null;
  social_linkedin: string | null;
  social_x: string | null;
  social_facebook: string | null;
  social_medium: string | null;
  social_hashnode: string | null;
  social_devto: string | null;
}

const INITIAL: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
  phone: "",
  company: "",
};

const EMAIL = "frandyslueue@gmail.com";

const SOCIAL_CONFIG = [
  { key: "social_linkedin", icon: <FaLinkedin size={18} />, label: "LinkedIn" },
  { key: "social_github", icon: <FaGithub size={18} />, label: "GitHub" },
  { key: "social_x", icon: <FaXTwitter size={18} />, label: "X" },
  { key: "social_facebook", icon: <FaFacebook size={18} />, label: "Facebook" },
  { key: "social_medium", icon: <FaMedium size={18} />, label: "Medium" },
  { key: "social_hashnode", icon: <FaHashnode size={18} />, label: "Hashnode" },
  { key: "social_devto", icon: <FaDev size={18} />, label: "Dev.to" },
];

export default function Contact() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [social, setSocial] = useState<SocialLinks>({
    social_github: null,
    social_linkedin: null,
    social_x: null,
    social_facebook: null,
    social_medium: null,
    social_hashnode: null,
    social_devto: null,
  });

  useEffect(() => {
    settingsApi.getResume().then((d) => setResumeUrl(d.resume_url)).catch(() => {});
    fetch("/api/settings/social")
      .then((r) => r.json())
      .then((data) => setSocial(data))
      .catch(() => {});
  }, []);

  const activeSocials = SOCIAL_CONFIG.filter(
    ({ key }) => !!social[key as keyof SocialLinks]
  );

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email address";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.message.trim()) e.message = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await contactApi.submit({
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        phone: form.phone || undefined,
        company: form.company || undefined,
      });
      setSubmitted(true);
      setForm(INITIAL);
    } catch {
      setSubmitError("Something went wrong. Please try again or email me directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const inputStyle = (hasError: boolean) => ({
    width: "100%",
    padding: "12px 14px",
    backgroundColor: "var(--bg-elevated)",
    border: `1px solid ${hasError ? "#e05252" : "var(--border)"}`,
    color: "var(--text-primary)",
    fontFamily: "var(--font-body)",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 250ms ease",
    borderRadius: "0",
  });

  const labelStyle = {
    fontFamily: "var(--font-body)",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    color: "var(--text-muted)",
    display: "block",
    marginBottom: "6px",
  };

  const errorStyle = {
    fontFamily: "var(--font-body)",
    fontSize: "11px",
    color: "#e05252",
    marginTop: "4px",
    letterSpacing: "0.5px",
  };

  return (
    <section
      id="contact"
      className="section-pad"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="site-container">

        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            letterSpacing: "6px",
            textTransform: "uppercase",
            color: "var(--accent-muted)",
            marginBottom: "16px",
          }}
        >
          05 — Contact
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            color: "var(--text-primary)",
            letterSpacing: "2px",
            lineHeight: 1,
            marginBottom: "12px",
          }}
        >
          Open to Opportunities,
          <br />
          <span style={{ color: "var(--accent)" }}>
            Collaborations & Conversations
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "15px",
            color: "var(--text-muted)",
            lineHeight: 1.7,
            maxWidth: "560px",
            marginBottom: "56px",
          }}
        >
          Whether you have a project in mind or just want to connect —
          my inbox is always open.
        </motion.p>

        {/* Two-column split */}
        <div className="contact-grid">

          {/* Left — Form */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  border: "1px solid var(--accent)",
                  padding: "48px 32px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px",
                  backgroundColor: "var(--bg-elevated)",
                }}
              >
                <CheckCircle size={40} style={{ color: "var(--accent)" }} />
                <h3 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "28px",
                  color: "var(--text-primary)",
                  letterSpacing: "2px",
                }}>
                  Message Sent
                </h3>
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  color: "var(--text-muted)",
                  lineHeight: 1.7,
                  maxWidth: "320px",
                }}>
                  Thanks for reaching out. I'll get back to you as soon as possible.
                </p>
                <button onClick={() => setSubmitted(false)} className="btn-ghost" style={{ marginTop: "8px" }}>
                  Send Another
                </button>
              </motion.div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div className="form-row">
                  <div>
                    <label style={labelStyle}>Name *</label>
                    <input
                      name="name" value={form.name} onChange={handleChange}
                      placeholder="Your name" style={inputStyle(!!errors.name)}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent-muted)")}
                      onBlur={(e) => (e.target.style.borderColor = errors.name ? "#e05252" : "var(--border)")}
                    />
                    {errors.name && <p style={errorStyle}>{errors.name}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input
                      name="email" type="email" value={form.email} onChange={handleChange}
                      placeholder="your@email.com" style={inputStyle(!!errors.email)}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent-muted)")}
                      onBlur={(e) => (e.target.style.borderColor = errors.email ? "#e05252" : "var(--border)")}
                    />
                    {errors.email && <p style={errorStyle}>{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Subject *</label>
                  <input
                    name="subject" value={form.subject} onChange={handleChange}
                    placeholder="What's this about?" style={inputStyle(!!errors.subject)}
                    onFocus={(e) => (e.target.style.borderColor = "var(--accent-muted)")}
                    onBlur={(e) => (e.target.style.borderColor = errors.subject ? "#e05252" : "var(--border)")}
                  />
                  {errors.subject && <p style={errorStyle}>{errors.subject}</p>}
                </div>

                <div className="form-row">
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input
                      name="phone" value={form.phone} onChange={handleChange}
                      placeholder="Optional" style={inputStyle(false)}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent-muted)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Company</label>
                    <input
                      name="company" value={form.company} onChange={handleChange}
                      placeholder="Optional" style={inputStyle(false)}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent-muted)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Message *</label>
                  <textarea
                    name="message" value={form.message} onChange={handleChange}
                    placeholder="Tell me about your project or opportunity..."
                    rows={6}
                    style={{ ...inputStyle(!!errors.message), resize: "vertical", minHeight: "140px" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--accent-muted)")}
                    onBlur={(e) => (e.target.style.borderColor = errors.message ? "#e05252" : "var(--border)")}
                  />
                  {errors.message && <p style={errorStyle}>{errors.message}</p>}
                </div>

                {submitError && (
                  <p style={{
                    fontFamily: "var(--font-body)", fontSize: "13px", color: "#e05252",
                    padding: "12px 14px", border: "1px solid #e05252",
                    backgroundColor: "rgba(224,82,82,0.06)",
                  }}>
                    {submitError}
                  </p>
                )}

                <button
                  onClick={handleSubmit} disabled={submitting}
                  className="btn-primary"
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    alignSelf: "flex-start",
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {submitting ? (
                      <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />Sending...</>
                    ) : (
                      <><Send size={14} />Send Message</>
                    )}
                  </span>
                </button>
              </div>
            )}
          </motion.div>

          {/* Right — Links */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: "flex", flexDirection: "column", gap: "0" }}
          >
            {/* Email — copy to clipboard */}
            <button
              onClick={copyEmail}
              style={{
                display: "flex", alignItems: "center", gap: "16px",
                padding: "20px 0",
                borderBottom: "1px solid var(--border-subtle)",
                background: "none", border: "none",
                cursor: "pointer", textAlign: "left",
                transition: "padding-left 200ms ease", width: "100%",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.paddingLeft = "8px"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.paddingLeft = "0"; }}
            >
              <span style={{ color: "var(--accent)", display: "flex", alignItems: "center" }}>
                {copied ? <Check size={18} /> : <AtSign size={18} />}
              </span>
              <div>
                <p style={{
                  fontFamily: "var(--font-body)", fontSize: "11px",
                  letterSpacing: "2px", textTransform: "uppercase",
                  color: "var(--text-muted)", marginBottom: "2px",
                }}>
                  Email {copied && "— Copied!"}
                </p>
                <p style={{
                  fontFamily: "var(--font-body)", fontSize: "14px",
                  color: copied ? "var(--accent)" : "var(--text-secondary)",
                  transition: "color 200ms ease",
                }}>
                  {EMAIL}
                </p>
              </div>
            </button>

            {/* Dynamic social links list */}
            {activeSocials.map(({ key, icon, label }) => (
              <a
                key={key}
                href={social[key as keyof SocialLinks]!}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "16px",
                  padding: "20px 0",
                  borderBottom: "1px solid var(--border-subtle)",
                  textDecoration: "none", color: "var(--text-muted)",
                  transition: "padding-left 200ms ease, color 200ms ease",
                  fontFamily: "var(--font-body)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.paddingLeft = "8px";
                  (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.paddingLeft = "0";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                }}
              >
                <span style={{ color: "var(--accent)", display: "flex", alignItems: "center" }}>
                  {icon}
                </span>
                <div>
                  <p style={{
                    fontSize: "11px", letterSpacing: "2px",
                    textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "2px",
                  }}>
                    {label}
                  </p>
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    {social[key as keyof SocialLinks]}
                  </p>
                </div>
                <ExternalLink size={14} style={{ marginLeft: "auto", opacity: 0.4 }} />
              </a>
            ))}

            {/* Follow me on — mobile social icons row */}
            {activeSocials.length > 0 && (
              <div className="contact-follow">
                <p className="contact-follow__label">Follow me on</p>
                <div className="contact-follow__icons">
                  {activeSocials.map(({ key, icon, label }) => (
                    <a
                      key={key}
                      href={social[key as keyof SocialLinks]!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className="contact-follow__icon"
                    >
                      {icon}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Resume download */}
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{
                  marginTop: "32px", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  gap: "8px", textAlign: "center",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ExternalLink size={14} />
                  Download Resume
                </span>
              </a>
            )}

            {/* Availability indicator */}
            <div style={{
              marginTop: "40px", padding: "16px 20px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-elevated)",
              display: "flex", alignItems: "center", gap: "12px",
            }}>
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                backgroundColor: "#3d9970", boxShadow: "0 0 8px #3d9970",
                animation: "pulse 2s ease-in-out infinite", flexShrink: 0,
              }} />
              <p style={{
                fontFamily: "var(--font-body)", fontSize: "13px",
                color: "var(--text-muted)", letterSpacing: "0.5px",
              }}>
                Available for full-time roles and freelance projects
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 80px;
          align-items: start;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .contact-follow {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--border-subtle);
        }
        .contact-follow__label {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 16px;
        }
        .contact-follow__icons {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        .contact-follow__icon {
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s, transform 0.2s;
          display: flex;
          align-items: center;
        }
        .contact-follow__icon:hover {
          color: var(--accent);
          transform: translateY(-2px);
        }
        @media (max-width: 900px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 48px;
          }
        }
        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
