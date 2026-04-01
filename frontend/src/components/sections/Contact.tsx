"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { FaPhone, FaWhatsapp } from "react-icons/fa";
import { FaLinkedin, FaGithub, FaXTwitter, FaFacebook, FaMedium, FaHashnode, FaDev } from "react-icons/fa6";
import { contactApi, settingsApi } from "@/lib/api";
import SectionLabel from "@/components/ui/SectionLabel";
import { fadeLeft, fadeRight, fadeUp, VIEWPORT } from "@/lib/animations";

// ── Types ─────────────────────────────────────────────────────────────
interface FormState {
  name: string; email: string; subject: string;
  message: string; phone: string; company: string;
}

interface SocialLinks {
  social_github: string | null; social_linkedin: string | null;
  social_x: string | null; social_facebook: string | null;
  social_medium: string | null; social_hashnode: string | null;
  social_devto: string | null;
}

interface ContactInfo {
  contact_email: string | null;
  contact_phone: string | null;
  contact_whatsapp: string | null;
}

// ── Constants ─────────────────────────────────────────────────────────
const INITIAL: FormState = { name: "", email: "", subject: "", message: "", phone: "", company: "" };

const SOCIAL_CONFIG = [
  { key: "social_linkedin", icon: <FaLinkedin size={20} />, label: "LinkedIn" },
  { key: "social_github",   icon: <FaGithub size={20} />,   label: "GitHub" },
  { key: "social_x",        icon: <FaXTwitter size={20} />, label: "X" },
  { key: "social_facebook", icon: <FaFacebook size={20} />, label: "Facebook" },
  { key: "social_medium",   icon: <FaMedium size={20} />,   label: "Medium" },
  { key: "social_hashnode", icon: <FaHashnode size={20} />, label: "Hashnode" },
  { key: "social_devto",    icon: <FaDev size={20} />,      label: "Dev.to" },
];

// ── Email icon ────────────────────────────────────────────────────────
function EmailIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 28 L8 54 L56 54 L56 28" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="var(--bg-elevated)" />
      <path d="M8 28 L32 44 L56 28" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <path d="M8 54 L28 38 M56 54 L36 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <rect x="20" y="8" width="24" height="30" rx="1" fill="var(--bg-secondary)" stroke="currentColor" strokeWidth="2" />
      <text x="32" y="28" textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="900" fontFamily="monospace">@</text>
      <path d="M20 8 L32 18 L44 8" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="var(--bg-elevated)" />
    </svg>
  );
}

// ── Main section ──────────────────────────────────────────────────────
export default function Contact() {
  const [form, setForm]           = useState<FormState>(INITIAL);
  const [errors, setErrors]       = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [social, setSocial]       = useState<SocialLinks>({ social_github: null, social_linkedin: null, social_x: null, social_facebook: null, social_medium: null, social_hashnode: null, social_devto: null });
  const [contactInfo, setContactInfo] = useState<ContactInfo>({ contact_email: null, contact_phone: null, contact_whatsapp: null });
  const [activeReveal, setActiveReveal] = useState<string | null>(null);
  const [lockedReveal, setLockedReveal] = useState<string | null>(null);

  useEffect(() => {
    settingsApi.getResume().then((d) => setResumeUrl(d.resume_url)).catch(() => {});
    fetch("/api/settings/social").then((r) => r.json()).then(setSocial).catch(() => {});
    fetch("/api/settings/contact-info").then((r) => r.json()).then(setContactInfo).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: Event) {
      if (!(e.target as HTMLElement).closest(".contact-btn-wrap")) {
        setLockedReveal(null);
        setActiveReveal(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const activeSocials = SOCIAL_CONFIG.filter(({ key }) => !!social[key as keyof SocialLinks]);

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.name.trim())    e.name    = "Name is required";
    if (!form.email.trim())   e.email   = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email address";
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

  function handleContactClick(type: string, value: string) {
    if (type === "email")     window.location.href = `mailto:${value}`;
    else if (type === "phone") window.location.href = `tel:${value}`;
    else if (type === "whatsapp") window.open(`https://wa.me/${value.replace(/\D/g, "")}`, "_blank");
  }

  function toggleReveal(key: string) {
    if (lockedReveal === key) { setLockedReveal(null); setActiveReveal(null); }
    else { setLockedReveal(key); setActiveReveal(key); }
  }

  const contactButtons = [
    { key: "email",    value: contactInfo.contact_email,    icon: <EmailIcon size={48} />,  label: "Email Me",  hint: "Send an email" },
    { key: "phone",    value: contactInfo.contact_phone,    icon: <FaPhone size={32} />,    label: "Call Me",   hint: "Place a direct call" },
    { key: "whatsapp", value: contactInfo.contact_whatsapp, icon: <FaWhatsapp size={36} />, label: "WhatsApp",  hint: "Chat on WhatsApp" },
  ].filter(({ value }) => !!value);

  return (
    <section
      id="contact"
      className="section-pad"
      aria-labelledby="contact-heading"
      style={{ backgroundColor: "var(--bg-secondary)", overflowX: "hidden" }}
    >
      <div className="site-container">
        <SectionLabel>05 — Contact</SectionLabel>

        <motion.h2
          id="contact-heading"
          className="contact-heading"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Open to Opportunities,
          <br />
          <span style={{ color: "var(--accent)" }}>
            Collaborations &amp; Conversations
          </span>
        </motion.h2>

        <motion.p
          className="contact-sub"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Whether you have a project in mind or just want to connect —
          my inbox is always open.
        </motion.p>

        <div className="contact-grid">
          {/* Left — Form */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {submitted ? (
              <motion.div
                className="contact-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <CheckCircle size={40} style={{ color: "var(--accent)" }} />
                <h3 className="contact-success__title">Message Sent</h3>
                <p className="contact-success__body">
                  Thanks for reaching out. I'll get back to you as soon as possible.
                </p>
                <button onClick={() => setSubmitted(false)} className="btn-ghost" style={{ marginTop: "8px" }}>
                  Send Another
                </button>
              </motion.div>
            ) : (
              <div className="contact-form">
                <div className="form-row">
                  <div>
                    <label className="field__label" htmlFor="name">Name *</label>
                    <input
                      id="name" name="name" value={form.name} onChange={handleChange}
                      placeholder="Your name"
                      className={`field__input ${errors.name ? "is-error" : ""}`}
                    />
                    {errors.name && <p className="field__error">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="field__label" htmlFor="email">Email *</label>
                    <input
                      id="email" name="email" type="email" value={form.email} onChange={handleChange}
                      placeholder="your@email.com"
                      className={`field__input ${errors.email ? "is-error" : ""}`}
                    />
                    {errors.email && <p className="field__error">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="field__label" htmlFor="subject">Subject *</label>
                  <input
                    id="subject" name="subject" value={form.subject} onChange={handleChange}
                    placeholder="What's this about?"
                    className={`field__input ${errors.subject ? "is-error" : ""}`}
                  />
                  {errors.subject && <p className="field__error">{errors.subject}</p>}
                </div>

                <div className="form-row">
                  <div>
                    <label className="field__label" htmlFor="phone">Phone</label>
                    <input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Optional" className="field__input" />
                  </div>
                  <div>
                    <label className="field__label" htmlFor="company">Company</label>
                    <input id="company" name="company" value={form.company} onChange={handleChange} placeholder="Optional" className="field__input" />
                  </div>
                </div>

                <div>
                  <label className="field__label" htmlFor="message">Message *</label>
                  <textarea
                    id="message" name="message" value={form.message} onChange={handleChange}
                    placeholder="Tell me about your project or opportunity..."
                    rows={6}
                    className={`field__input ${errors.message ? "is-error" : ""}`}
                    style={{ minHeight: "140px" }}
                  />
                  {errors.message && <p className="field__error">{errors.message}</p>}
                </div>

                {submitError && (
                  <p className="contact-form__error">{submitError}</p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary contact-form__submit"
                  style={{ opacity: submitting ? 0.7 : 1 }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {submitting
                      ? <><Loader2 size={14} className="spin" /> Sending...</>
                      : <><Send size={14} /> Send Message</>
                    }
                  </span>
                </button>
              </div>
            )}
          </motion.div>

          {/* Right — Contact options */}
          <motion.div
            className="contact-right"
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {contactButtons.length > 0 && (
              <div className="contact-buttons">
                {contactButtons.map(({ key, value, icon, label, hint }) => (
                  <div key={key} className="contact-btn-wrap">
                    <button
                      className={`contact-btn contact-btn--${key} ${(activeReveal === key || lockedReveal === key) ? "active" : ""}`}
                      onClick={() => toggleReveal(key)}
                      onMouseEnter={() => { if (window.matchMedia("(hover: hover)").matches) setActiveReveal(key); }}
                      onMouseLeave={() => { if (window.matchMedia("(hover: hover)").matches && lockedReveal !== key) setActiveReveal(null); }}
                      aria-label={label}
                    >
                      <span className="contact-btn__icon">{icon}</span>
                    </button>
                    <div className={`contact-btn__reveal ${(activeReveal === key || lockedReveal === key) ? "visible" : ""}`}>
                      <p className="contact-btn__hint">{hint}</p>
                      <button className="contact-btn__action" onClick={() => handleContactClick(key, value!)}>
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
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", textAlign: "center" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ExternalLink size={14} /> Download Resume
                </span>
              </a>
            )}

            <div className="contact-availability">
              <div className="contact-availability__dot pulse" />
              <p className="contact-availability__text">
                Available for full-time roles and freelance projects
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .contact-heading {
          font-family: var(--font-display);
          font-size: clamp(2rem, 5vw, 3.5rem);
          color: var(--text-primary);
          letter-spacing: 2px;
          line-height: 1;
          margin-bottom: 12px;
        }
        .contact-sub {
          font-family: var(--font-body);
          font-size: 15px;
          color: var(--text-muted);
          line-height: 1.7;
          max-width: 560px;
          margin-bottom: 56px;
        }
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr min(380px, 100%);
          gap: 80px;
          align-items: start;
          width: 100%;
          overflow: hidden;
        }
        .contact-form { display: flex; flex-direction: column; gap: 20px; }
        .contact-form__error {
          font-family: var(--font-body);
          font-size: 13px;
          color: #e05252;
          padding: 12px 14px;
          border: 1px solid #e05252;
          background: rgba(224,82,82,0.06);
        }
        .contact-form__submit { align-self: flex-start; cursor: pointer; }
        .contact-form__submit:disabled { cursor: not-allowed; }

        .contact-success {
          border: 1px solid var(--accent);
          padding: 48px 32px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          background: var(--bg-elevated);
        }
        .contact-success__title {
          font-family: var(--font-display);
          font-size: 28px;
          color: var(--text-primary);
          letter-spacing: 2px;
        }
        .contact-success__body {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.7;
          max-width: 320px;
        }

        .contact-right { display: flex; flex-direction: column; gap: 48px; overflow: visible; }

        .contact-buttons { display: flex; gap: 32px; align-items: flex-start; flex-wrap: wrap; padding: 24px 16px 8px; }
        .contact-btn-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; flex: 1; min-width: 80px; padding: 0 8px; }
        .contact-btn {
          width: 80px; height: 80px; border-radius: 50%;
          border: 1px solid var(--border); background: var(--bg-elevated);
          color: var(--text-muted); display: flex; align-items: center;
          justify-content: center; cursor: pointer;
          transition: all 300ms ease;
        }
        .contact-btn:hover, .contact-btn.active {
          border-color: var(--accent); color: var(--accent);
          transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .contact-btn--whatsapp:hover, .contact-btn--whatsapp.active { border-color: #25d366; color: #25d366; box-shadow: 0 8px 24px rgba(37,211,102,0.2); }
        .contact-btn--email:hover,    .contact-btn--email.active    { border-color: #c0c0c0; color: #c0c0c0; box-shadow: 0 8px 24px rgba(192,192,192,0.2); }
        .contact-btn--phone:hover,    .contact-btn--phone.active    { border-color: #3b82f6; color: #3b82f6; box-shadow: 0 8px 24px rgba(59,130,246,0.2); }
        .contact-btn__icon { display: flex; align-items: center; justify-content: center; }
        .contact-btn__reveal {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          opacity: 0; transform: translateY(8px);
          transition: opacity 250ms ease, transform 250ms ease;
          pointer-events: none; text-align: center; width: 100%;
        }
        .contact-btn__reveal.visible { opacity: 1; transform: translateY(0); pointer-events: all; }
        .contact-btn__hint { font-family: var(--font-mono); font-size: 11px; letter-spacing: 1px; color: var(--text-muted); text-transform: uppercase; white-space: nowrap; }
        .contact-btn__action {
          background: none; border: 1px solid var(--accent); color: var(--accent);
          font-family: var(--font-body); font-size: 12px; font-weight: 600;
          letter-spacing: 1px; text-transform: uppercase; padding: 6px 14px;
          border-radius: 4px; cursor: pointer; transition: background 200ms, color 200ms;
          white-space: nowrap;
        }
        .contact-btn__action:hover { background: var(--accent); color: var(--bg-primary); }

        .contact-follow__label { font-family: var(--font-mono); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 16px; }
        .contact-follow__icons { display: flex; flex-wrap: wrap; gap: 20px; }
        .contact-follow__icon { color: var(--text-muted); text-decoration: none; transition: color 0.2s, transform 0.2s; display: flex; align-items: center; }
        .contact-follow__icon:hover { color: var(--accent); transform: translateY(-2px); }

        .contact-availability { padding: 16px 20px; border: 1px solid var(--border); background: var(--bg-elevated); display: flex; align-items: center; gap: 12px; }
        .contact-availability__dot { width: 8px; height: 8px; border-radius: 50%; background: #3d9970; box-shadow: 0 0 8px #3d9970; flex-shrink: 0; }
        .contact-availability__text { font-family: var(--font-body); font-size: 13px; color: var(--text-muted); letter-spacing: 0.5px; }

        @media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr; gap: 48px; } }
        @media (max-width: 600px) {
          .contact-grid { gap: 32px; }
          .form-row { grid-template-columns: 1fr; }
          .contact-buttons { justify-content: center; gap: 16px; }
          .contact-btn { width: 60px; height: 60px; }
          .contact-follow__icons { gap: 14px; }
        }
      `}</style>
    </section>
  );
}
