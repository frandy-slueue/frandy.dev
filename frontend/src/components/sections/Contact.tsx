"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Loader2,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { FaPhone, FaWhatsapp } from "react-icons/fa";
import {
  FaLinkedin, FaGithub, FaXTwitter,
  FaFacebook, FaMedium, FaHashnode, FaDev,
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

interface ContactInfo {
  contact_email: string | null;
  contact_phone: string | null;
  contact_whatsapp: string | null;
}

const INITIAL: FormState = {
  name: "", email: "", subject: "", message: "", phone: "", company: "",
};

const SOCIAL_CONFIG = [
  { key: "social_linkedin",  icon: <FaLinkedin size={20} />,  label: "LinkedIn" },
  { key: "social_github",    icon: <FaGithub size={20} />,    label: "GitHub" },
  { key: "social_x",        icon: <FaXTwitter size={20} />,  label: "X" },
  { key: "social_facebook",  icon: <FaFacebook size={20} />,  label: "Facebook" },
  { key: "social_medium",    icon: <FaMedium size={20} />,    label: "Medium" },
  { key: "social_hashnode",  icon: <FaHashnode size={20} />,  label: "Hashnode" },
  { key: "social_devto",     icon: <FaDev size={20} />,       label: "Dev.to" },
];

function EmailIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 28 L8 54 L56 54 L56 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="var(--bg-elevated)"
      />
      <path
        d="M8 28 L32 44 L56 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M8 54 L28 38 M56 54 L36 38"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
      <rect
        x="20" y="8"
        width="24" height="30"
        rx="1"
        fill="var(--bg-secondary)"
        stroke="currentColor"
        strokeWidth="2"
      />
      <text
        x="32"
        y="28"
        textAnchor="middle"
        fill="currentColor"
        fontSize="14"
        fontWeight="900"
        fontFamily="monospace"
      >
        @
      </text>
      <path
        d="M20 8 L32 18 L44 8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="var(--bg-elevated)"
      />
    </svg>
  );
}

export default function Contact() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [social, setSocial] = useState<SocialLinks>({
    social_github: null, social_linkedin: null, social_x: null,
    social_facebook: null, social_medium: null,
    social_hashnode: null, social_devto: null,
  });
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    contact_email: null, contact_phone: null, contact_whatsapp: null,
  });
  const [activeReveal, setActiveReveal] = useState<string | null>(null);

  useEffect(() => {
    settingsApi.getResume().then((d) => setResumeUrl(d.resume_url)).catch(() => {});
    fetch("/api/settings/social").then((r) => r.json()).then(setSocial).catch(() => {});
    fetch("/api/settings/contact-info").then((r) => r.json()).then(setContactInfo).catch(() => {});
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState])
      setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await contactApi.submit({
        name: form.name, email: form.email,
        subject: form.subject, message: form.message,
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

  const inputStyle = (hasError: boolean) => ({
    width: "100%", padding: "12px 14px",
    backgroundColor: "var(--bg-elevated)",
    border: `1px solid ${hasError ? "#e05252" : "var(--border)"}`,
    color: "var(--text-primary)", fontFamily: "var(--font-body)",
    fontSize: "14px", outline: "none",
    transition: "border-color 250ms ease", borderRadius: "0",
  });

  const labelStyle = {
    fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 600,
    letterSpacing: "2px", textTransform: "uppercase" as const,
    color: "var(--text-muted)", display: "block", marginBottom: "6px",
  };

  const errorStyle = {
    fontFamily: "var(--font-body)", fontSize: "11px",
    color: "#e05252", marginTop: "4px", letterSpacing: "0.5px",
  };

  function handleContactClick(type: string, value: string) {
    if (type === "email") window.location.href = `mailto:${value}`;
    else if (type === "phone") window.location.href = `tel:${value}`;
    else if (type === "whatsapp") window.open(`https://wa.me/${value.replace(/\D/g, "")}`, "_blank");
  }

  function toggleReveal(key: string) {
    setActiveReveal((prev) => (prev === key ? null : key));
  }

  const contactButtons = [
    {
      key: "email",
      value: contactInfo.contact_email,
      icon: <EmailIcon size={48} />,
      label: "Email Me",
      hint: "Send an email",
    },
    {
      key: "phone",
      value: contactInfo.contact_phone,
      icon: <FaPhone size={32} />,
      label: "Call Me",
      hint: "Place a direct call",
    },
    {
      key: "whatsapp",
      value: contactInfo.contact_whatsapp,
      icon: <FaWhatsapp size={36} />,
      label: "WhatsApp",
      hint: "Chat on WhatsApp",
    },
  ].filter(({ value }) => !!value);

  return (
    <section
      id="contact"
      className="section-pad"
      style={{ backgroundColor: "var(--bg-secondary)", overflowX: "hidden" }}
    >
      <div className="site-container">

        <motion.p
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: "var(--font-body)", fontSize: "12px",
            letterSpacing: "6px", textTransform: "uppercase",
            color: "var(--accent-muted)", marginBottom: "16px",
          }}
        >
          05 — Contact
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            color: "var(--text-primary)", letterSpacing: "2px",
            lineHeight: 1, marginBottom: "12px",
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
            fontFamily: "var(--font-body)", fontSize: "15px",
            color: "var(--text-muted)", lineHeight: 1.7,
            maxWidth: "560px", marginBottom: "56px",
          }}
        >
          Whether you have a project in mind or just want to connect —
          my inbox is always open.
        </motion.p>

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
                  border: "1px solid var(--accent)", padding: "48px 32px",
                  textAlign: "center", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: "16px",
                  backgroundColor: "var(--bg-elevated)",
                }}
              >
                <CheckCircle size={40} style={{ color: "var(--accent)" }} />
                <h3 style={{
                  fontFamily: "var(--font-display)", fontSize: "28px",
                  color: "var(--text-primary)", letterSpacing: "2px",
                }}>Message Sent</h3>
                <p style={{
                  fontFamily: "var(--font-body)", fontSize: "14px",
                  color: "var(--text-muted)", lineHeight: 1.7, maxWidth: "320px",
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
                    <input name="name" value={form.name} onChange={handleChange}
                      placeholder="Your name" style={inputStyle(!!errors.name)}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent-muted)")}
                      onBlur={(e) => (e.target.style.borderColor = errors.name ? "#e05252" : "var(--border)")}
                    />
                    {errors.name && <p style={errorStyle}>{errors.name}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange}
                      placeholder="your@email.com" style={inputStyle(!!errors.email)}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent-muted)")}
                      onBlur={(e) => (e.target.style.borderColor = errors.email ? "#e05252" : "var(--border)")}
                    />
                    {errors.email && <p style={errorStyle}>{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Subject *</label>
                  <input name="subject" value={form.subject} onChange={handleChange}
                    placeholder="What's this about?" style={inputStyle(!!errors.subject)}
                    onFocus={(e) => (e.target.style.borderColor = "var(--accent-muted)")}
                    onBlur={(e) => (e.target.style.borderColor = errors.subject ? "#e05252" : "var(--border)")}
                  />
                  {errors.subject && <p style={errorStyle}>{errors.subject}</p>}
                </div>

                <div className="form-row">
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input name="phone" value={form.phone} onChange={handleChange}
                      placeholder="Optional" style={inputStyle(false)}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent-muted)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Company</label>
                    <input name="company" value={form.company} onChange={handleChange}
                      placeholder="Optional" style={inputStyle(false)}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent-muted)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Message *</label>
                  <textarea name="message" value={form.message} onChange={handleChange}
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
                  }}>{submitError}</p>
                )}

                <button onClick={handleSubmit} disabled={submitting}
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

          {/* Right panel */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: "flex", flexDirection: "column", gap: "48px" }}
          >
            {contactButtons.length > 0 && (
              <div className="contact-buttons">
                {contactButtons.map(({ key, value, icon, label, hint }) => (
                  <div key={key} className="contact-btn-wrap">
                    <button
                      className={`contact-btn ${activeReveal === key ? "active" : ""} contact-btn--${key}`}
                      onClick={() => toggleReveal(key)}
                      onMouseEnter={() => {
                        if (window.matchMedia("(hover: hover)").matches) setActiveReveal(key);
                      }}
                      onMouseLeave={() => {
                        if (window.matchMedia("(hover: hover)").matches) setActiveReveal(null);
                      }}
                      aria-label={label}
                    >
                      <span className="contact-btn__icon">{icon}</span>
                    </button>
                    <div className={`contact-btn__reveal ${activeReveal === key ? "visible" : ""}`}>
                      <p className="contact-btn__hint">{hint}</p>
                      <button
                        className="contact-btn__action"
                        onClick={() => handleContactClick(key, value!)}
                      >
                        {label} →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

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

            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: "8px", textAlign: "center",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ExternalLink size={14} />
                  Download Resume
                </span>
              </a>
            )}

            <div style={{
              padding: "16px 20px",
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
          grid-template-columns: 1fr min(380px, 100%);
          gap: 80px;
          align-items: start;
          width: 100%;
          overflow: hidden;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .contact-buttons {
          display: flex;
          gap: 32px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .contact-btn-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 80px;
        }
        .contact-btn {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--bg-elevated);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 300ms ease;
        }
        .contact-btn:hover,
        .contact-btn.active {
          border-color: var(--accent);
          color: var(--accent);
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .contact-btn--whatsapp:hover,
        .contact-btn--whatsapp.active {
          border-color: #25d366;
          color: #25d366;
          box-shadow: 0 8px 24px rgba(37,211,102,0.2);
        }
        .contact-btn--email:hover,
        .contact-btn--email.active {
          border-color: #c0c0c0;
          color: #c0c0c0;
          box-shadow: 0 8px 24px rgba(192,192,192,0.2);
        }

        .contact-btn--phone:hover,
        .contact-btn--phone.active {
          border-color: #3b82f6;
          color: #3b82f6;
          box-shadow: 0 8px 24px rgba(59,130,246,0.2);
        }
        .contact-btn__icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .contact-btn__reveal {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 250ms ease, transform 250ms ease;
          pointer-events: none;
          text-align: center;
          width: 100%;
        }
        .contact-btn__reveal.visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: all;
        }
        .contact-btn__hint {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 1px;
          color: var(--text-muted);
          text-transform: uppercase;
          white-space: nowrap;
        }
        .contact-btn__action {
          background: none;
          border: 1px solid var(--accent);
          color: var(--accent);
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 200ms ease, color 200ms ease;
          white-space: nowrap;
        }
        .contact-btn__action:hover {
          background: var(--accent);
          color: var(--bg-primary);
        }
        .contact-btn-wrap:has(.contact-btn--email.active) .contact-btn__action {
          border-color: #c0c0c0;
          color: #c0c0c0;
        }
        .contact-btn-wrap:has(.contact-btn--email.active) .contact-btn__action:hover {
          background: #c0c0c0;
          color: #080808;
        }
        .contact-btn-wrap:has(.contact-btn--phone.active) .contact-btn__action {
          border-color: #3b82f6;
          color: #3b82f6;
        }
        .contact-btn-wrap:has(.contact-btn--phone.active) .contact-btn__action:hover {
          background: #3b82f6;
          color: #fff;
        }
        .contact-btn-wrap:has(.contact-btn--whatsapp.active) .contact-btn__action {
          border-color: #25d366;
          color: #25d366;
        }
        .contact-btn-wrap:has(.contact-btn--whatsapp.active) .contact-btn__action:hover {
          background: #25d366;
          color: #fff;
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
          gap: 20px;
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
          .contact-grid {
            gap: 32px;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
          .contact-buttons {
            justify-content: center;
            gap: 16px;
          }
          .contact-btn {
            width: 60px;
            height: 60px;
          }
          .contact-btn__icon svg {
            width: 22px !important;
            height: 22px !important;
          }
          .contact-btn__hint {
            font-size: 10px;
          }
          .contact-btn__action {
            font-size: 11px;
            padding: 5px 10px;
          }
          .contact-follow__icons {
            gap: 14px;
          }
        }
      `}</style>
    </section>
  );
}
