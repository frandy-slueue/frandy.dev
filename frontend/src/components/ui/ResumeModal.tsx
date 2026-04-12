"use client";

import { useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  FileDown,
  Share2,
  FileText,
} from "lucide-react";

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeUrl: string | null;
  docxUrl?: string | null;
  shareUrl?: string | null;
}

export default function ResumeModal({ isOpen, onClose, resumeUrl, docxUrl, shareUrl }: ResumeModalProps) {

  // Close on Escape
  const handleKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKey]);

  function handleShare() {
    const url = shareUrl || `${window.location.origin}/resume`;
    if (navigator.share) {
      navigator.share({ title: "Frandy Slueue — Resume", url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        const btn = document.getElementById("resume-share-btn");
        if (btn) {
          btn.classList.add("copied");
          setTimeout(() => btn.classList.remove("copied"), 2000);
        }
      });
    }
  }

  function handleDownload(format: "pdf" | "docx") {
    const url = format === "pdf" ? resumeUrl : (docxUrl || resumeUrl);
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `Frandy_Slueue_Resume.${format}`;
    a.click();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="resume-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            aria-hidden
          />

          {/* Modal — rises from depth */}
          <div className="resume-modal-stage" aria-modal role="dialog" aria-label="Resume viewer">
            <motion.div
              className="resume-modal-sheet"
              initial={{ opacity: 0, scale: 0.6, rotateX: "15deg", y: 60 }}
              animate={{ opacity: 1, scale: 1, rotateX: "0deg", y: 0 }}
              exit={{ opacity: 0, scale: 0.7, rotateX: "10deg", y: 40 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
            >

              {/* ── Sticky top bar ───────────────────────────────────── */}
              <div className="resume-modal-bar">
                <div className="resume-modal-bar__left">
                  <span className="resume-modal-bar__title">
                    <span className="resume-modal-bar__dot" aria-hidden />
                    Frandy Slueue — Resume
                  </span>
                </div>
                <div className="resume-modal-bar__actions">

                  {/* View full page */}
                  <a
                    href="/resume"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resume-modal-btn"
                    title="View full page"
                    aria-label="View resume as full page"
                  >
                    <ExternalLink size={15} />
                    <span className="resume-modal-btn__label">View</span>
                  </a>

                  {/* Download PDF */}
                  <button
                    className="resume-modal-btn"
                    onClick={() => handleDownload("pdf")}
                    title="Download PDF"
                    aria-label="Download resume as PDF"
                    disabled={!resumeUrl}
                  >
                    <FileText size={15} />
                    <span className="resume-modal-btn__label">PDF</span>
                    <FileDown size={11} className="resume-modal-btn__arrow" />
                  </button>

                  {/* Download DOCX */}
                  <button
                    className="resume-modal-btn"
                    onClick={() => handleDownload("docx")}
                    title="Download DOCX"
                    aria-label="Download resume as DOCX"
                    disabled={!docxUrl && !resumeUrl}
                  >
                    <FileText size={15} />
                    <span className="resume-modal-btn__label">DOCX</span>
                    <FileDown size={11} className="resume-modal-btn__arrow" />
                  </button>

                  {/* Share */}
                  <button
                    id="resume-share-btn"
                    className="resume-modal-btn resume-modal-btn--share"
                    onClick={handleShare}
                    title="Copy resume link"
                    aria-label="Share resume link"
                  >
                    <Share2 size={15} />
                    <span className="resume-modal-btn__label">Share</span>
                    <span className="resume-modal-btn__copied">Copied!</span>
                  </button>

                  {/* Close */}
                  <button
                    className="resume-modal-close"
                    onClick={onClose}
                    aria-label="Close resume"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* ── Resume content — scrollable ───────────────────────── */}
              <div className="resume-modal-body">
                <ResumeDocument />
              </div>

            </motion.div>
          </div>

          <style>{`
            /* ── Perspective stage ─────────────────────────────────── */
            .resume-modal-backdrop {
              position: fixed; inset: 0;
              background: rgba(0,0,0,0.82);
              backdrop-filter: blur(6px);
              -webkit-backdrop-filter: blur(6px);
              z-index: 900;
            }
            .resume-modal-stage {
              position: fixed; inset: 0;
              z-index: 901;
              display: flex;
              align-items: center;
              justify-content: center;
              perspective: 1200px;
              padding: 20px;
            }
            .resume-modal-sheet {
              width: 100%;
              max-width: 860px;
              max-height: calc(100vh - 40px);
              background: #ffffff;
              display: flex;
              flex-direction: column;
              overflow: hidden;
              transform-style: preserve-3d;
              border: 1px solid rgba(16,185,129,0.3);
            }

            /* ── Top bar ───────────────────────────────────────────── */
            .resume-modal-bar {
              background: #0a0a0a;
              border-bottom: 2px solid #10b981;
              padding: 10px 20px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 16px;
              flex-shrink: 0;
              position: sticky;
              top: 0;
              z-index: 10;
            }
            .resume-modal-bar__left {
              display: flex;
              align-items: center;
              gap: 10px;
              min-width: 0;
            }
            .resume-modal-bar__title {
              font-family: 'JetBrains Mono', monospace;
              font-size: 11px;
              letter-spacing: 2px;
              color: rgba(255,255,255,0.5);
              text-transform: uppercase;
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .resume-modal-bar__dot {
              width: 6px; height: 6px;
              border-radius: 50%;
              background: #10b981;
              box-shadow: 0 0 6px #10b981;
              flex-shrink: 0;
            }
            .resume-modal-bar__actions {
              display: flex;
              align-items: center;
              gap: 4px;
              flex-shrink: 0;
            }

            /* Action buttons */
            .resume-modal-btn {
              display: flex;
              align-items: center;
              gap: 5px;
              padding: 6px 10px;
              background: transparent;
              border: 1px solid rgba(255,255,255,0.1);
              color: rgba(255,255,255,0.55);
              font-family: 'JetBrains Mono', monospace;
              font-size: 10px;
              letter-spacing: 1px;
              text-transform: uppercase;
              text-decoration: none;
              cursor: pointer;
              transition: color 200ms ease, border-color 200ms ease, background 200ms ease;
              position: relative;
            }
            .resume-modal-btn:hover:not(:disabled) {
              color: #10b981;
              border-color: rgba(16,185,129,0.5);
              background: rgba(16,185,129,0.06);
            }
            .resume-modal-btn:disabled {
              opacity: 0.3;
              cursor: not-allowed;
            }
            .resume-modal-btn__label { line-height: 1; }
            .resume-modal-btn__arrow { opacity: 0.6; }

            /* Share — copied state */
            .resume-modal-btn__copied {
              display: none;
              position: absolute;
              inset: 0;
              align-items: center;
              justify-content: center;
              background: rgba(16,185,129,0.15);
              color: #10b981;
              font-size: 10px;
              letter-spacing: 1px;
            }
            .resume-modal-btn--share.copied .resume-modal-btn__copied { display: flex; }
            .resume-modal-btn--share.copied svg,
            .resume-modal-btn--share.copied .resume-modal-btn__label { visibility: hidden; }

            /* Close button */
            .resume-modal-close {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 32px; height: 32px;
              background: transparent;
              border: 1px solid rgba(255,255,255,0.1);
              color: rgba(255,255,255,0.45);
              cursor: pointer;
              margin-left: 8px;
              transition: color 200ms ease, border-color 200ms ease, background 200ms ease;
            }
            .resume-modal-close:hover {
              color: #ff5555;
              border-color: rgba(255,85,85,0.4);
              background: rgba(255,85,85,0.06);
            }

            /* ── Scrollable resume body ─────────────────────────────── */
            .resume-modal-body {
              overflow-y: auto;
              flex: 1;
              background: #ffffff;
              -webkit-overflow-scrolling: touch;
            }
            .resume-modal-body::-webkit-scrollbar { width: 4px; }
            .resume-modal-body::-webkit-scrollbar-track { background: #f0f0f0; }
            .resume-modal-body::-webkit-scrollbar-thumb { background: #10b981; }

            /* ── Mobile ─────────────────────────────────────────────── */
            @media (max-width: 600px) {
              .resume-modal-stage { padding: 0; align-items: flex-end; }
              .resume-modal-sheet { max-height: 95vh; border-left: none; border-right: none; border-bottom: none; }
              .resume-modal-bar__title { display: none; }
              .resume-modal-btn__label { display: none; }
              .resume-modal-btn { padding: 6px 8px; }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Inline digital resume document ─────────────────────────────────────── */
function ResumeDocument() {
  return (
    <div style={{ fontFamily: "'Space Grotesk', 'Rajdhani', sans-serif", color: "#1a1a1a" }}>

      {/* Hero header */}
      <div style={{
        background: "#0a0a0a",
        padding: "36px 48px 28px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Dot grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle, #1a3a2a 1.2px, transparent 1.2px)",
          backgroundSize: "20px 20px",
          opacity: 0.45,
          pointerEvents: "none",
        }} />
        {/* Jade bloom */}
        <div style={{
          position: "absolute", top: -80, left: -80,
          width: 340, height: 340,
          background: "radial-gradient(ellipse, rgba(16,185,129,0.1) 0%, transparent 68%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 28 }}>
          {/* FS Diamond */}
          <FSDiamond />
          {/* Name block */}
          <div style={{ flex: 1 }}>
            <div style={{ lineHeight: 1, marginBottom: 6 }}>
              <span style={{ fontFamily: "'Bebas Neue', 'Space Grotesk', sans-serif", fontSize: 42, fontWeight: 700, letterSpacing: 4, color: "#ffffff", textTransform: "uppercase" }}>FRANDY </span>
              <span style={{ fontFamily: "'Bebas Neue', 'Space Grotesk', sans-serif", fontSize: 42, fontWeight: 700, letterSpacing: 4, color: "#10b981", textTransform: "uppercase" }}>SLUEUE</span>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.38)", textTransform: "uppercase", marginBottom: 10 }}>
              IT Operations&nbsp;&nbsp;·&nbsp;&nbsp;Security&nbsp;&nbsp;·&nbsp;&nbsp;Software Engineering
            </div>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 12 }}>
              {["(918) 800-4855", "frandyslueue@gmail.com", "Broken Arrow, OK", "English · French"].map(c => (
                <span key={c} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.48)", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#10b981", display: "inline-block", flexShrink: 0 }} />
                  {c}
                </span>
              ))}
            </div>
            {/* · frandy.dev · */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(16,185,129,0.22)" }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#10b981", letterSpacing: 4, textTransform: "uppercase", whiteSpace: "nowrap" }}>· frandy.dev ·</span>
              <div style={{ flex: 1, height: 1, background: "rgba(16,185,129,0.22)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Jade rule */}
      <div style={{ height: 2, background: "linear-gradient(90deg, #10b981, #059669 40%, transparent)" }} />

      {/* Body */}
      <div style={{ background: "#ffffff" }}>

        {/* Summary */}
        <ResSection label="Professional Summary" tinted={false}>
          <p style={{ fontSize: 13, lineHeight: 1.82, color: "#374151", margin: 0 }}>
            Security-focused IT professional with 10+ years of enterprise technology experience, including 4 years as a GS-11 IT Specialist at the US Department of Veterans Affairs within a DevSecOps framework. Proven in vulnerability analysis, risk assessment, network security enforcement, and ServiceNow operations. Currently completing a full-stack software engineering and DevOps program — bridging deep IT security operations with modern development and systems thinking. Holds multiple VA Certificates of Appreciation for leading enterprise-scale projects under pressure.
          </p>
        </ResSection>

        {/* Competencies */}
        <ResSection label="Core Competencies" tinted>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7 }}>
            {[
              "Vulnerability Analysis & Risk Assessment","ServiceNow Ticketing & Workflows","Network Security (TCP/IP, VPN, DNS)",
              "AIS Security Planning & DR","Active Directory & Identity Management","VLAN Architecture & Cisco Management",
              "Compliance Auditing & Security SOPs","Endpoint Security (Intune / Azure MDM)","CI/CD · Docker · Bash · Python",
            ].map(item => (
              <div key={item} style={{ background: "#f0fdf4", border: "0.5px solid #bbf7d0", borderRadius: 3, padding: "7px 11px", fontSize: 11, color: "#065f46", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#10b981", fontSize: 9 }}>▪</span>{item}
              </div>
            ))}
          </div>
        </ResSection>

        {/* Experience */}
        <ResSection label="Professional Experience" tinted={false}>
          <JobBlock title="IT Specialist GS-11 — US Dept. of Veterans Affairs (DevSecOps)" org="Office of Information & Technology · Muskogee, OK · Full-time" dates="Sep 2019 – Aug 2023" bullets={[
            "Conducted vulnerability analysis and risk assessments across VA information systems; ensured AIS security plans complied with VA federal statutes and NIST-aligned standards.",
            "Developed AIS security contingency plans and disaster recovery procedures as part of the focal business continuity team.",
            "Managed ServiceNow (SNOW) workflows for Tier 2/3 resolution, BioMed activations, and escalation routing across a 400+ staff enterprise.",
            "Performed Cisco switch management via SecureCRT, PUTTY, TelNet; maintained VLAN architecture, RDP, DNS, DHCP, VPN, and TCP/IP across multi-site VA network.",
            "Configured Cisco AnyConnect VPN and enforced two-factor authentication policies — applying SSH, RDP, DNS, SSL/TLS protocol expertise directly.",
            "Deployed endpoints via Microsoft Intune/Azure MDM; led 300+ laptop and 600+ monitor refresh across VISN16 for COVID-19 and Cerner initiatives.",
            "Served as project lead for VA 91st St Clinic activation and Ernest Childers OPC decommission — managing 1,800+ pieces of sensitive equipment.",
            "Created cybersecurity threat management training materials; selected within 90 days of hire to train fellow technicians.",
          ]} />
          <JobBlock title="IT Support — U.S. Cellular" org="Tulsa, OK · Full-time" dates="Sep 2014 – Apr 2018" bullets={[
            "Maintained Help Desk tracking, IT asset accuracy, and patch cabling; configured telecom systems for moves, adds, and changes (MAC) in a multi-site environment.",
            "Developed problem tracking and resolution databases; determined internal service measures and communicated SLAs across support tiers.",
            "Installed and configured workstations on network operating systems; managed device drivers, hardware configurations, and communication networking.",
            "Investigated and recommended tools and technologies to improve responsiveness to customer and security requirements.",
          ]} />
          <JobBlock title="IT Customer Service — DishNetwork (Future Vision)" org="Tulsa, OK · Full-time" dates="Dec 2012 – Aug 2014" bullets={[
            "Served as primary technical specialist for all automated systems; resolved network and system issues via phone, email, and in-person channels.",
            "Provided training on desktops, laptops, and mobile devices; led system upgrade projects involving new software features and structural component changes.",
          ]} />
        </ResSection>

        {/* Education */}
        <ResSection label="Education" tinted>
          <JobBlock title="Full-Stack Software Engineering — Atlas School of Tulsa" org="Tulsa, OK · Hands-on, project-based curriculum" dates="2023 – Present" bullets={[
            "Core stack: Python, JavaScript, React, Node.js, C, PostgreSQL, MongoDB, GraphQL, Docker, REST APIs, Git, Figma, system design.",
            "Production-deployed portfolio: FastAPI + Next.js + Docker on DigitalOcean with CI/CD via GitHub Actions.",
          ]}>
            {/* DevOps sub-block */}
            <div style={{ marginTop: 12, background: "#f0fdf4", borderLeft: "2.5px solid #10b981", padding: "13px 15px", borderRadius: "0 4px 4px 0" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: "#10b981", fontWeight: 700, textTransform: "uppercase", marginBottom: 9 }}>DevOps & Systems Engineering</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 18px" }}>
                {[
                  "Infrastructure as Code (IaC) fundamentals","CI/CD pipeline design & integration",
                  "Containerization with Docker","Linux & OS internals",
                  "Scripting: Python & Bash","System health monitoring (metrics, logs, traces)",
                  "Security scans & secret management in pipelines","SRE principles & root-cause analysis (RCA)",
                ].map(item => (
                  <div key={item} style={{ fontSize: 11, color: "#374151", lineHeight: 1.62, paddingLeft: 13, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, top: 7, width: 4, height: 4, background: "#10b981", transform: "rotate(45deg)", display: "inline-block" }} />
                    {item}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 10, color: "#6b7280", fontStyle: "italic", marginTop: 9, lineHeight: 1.65 }}>
                Emphasis on cross-functional collaboration — fluent in both developer and sysadmin contexts. Rapid learner actively tracking AIOps and Platform Engineering paradigms. No cloud certifications yet; strong hands-on foundation with continuous self-directed learning.
              </p>
            </div>
          </JobBlock>
          <JobBlock title="Certification — Avionics, Airframe & Powerplant · Spartan College" org="Tulsa, OK · GPA 3.6 / 4.0 · Certified in Aviation Maintenance, Management & Operation" dates="2007 – 2009" bullets={[]} />
        </ResSection>

        {/* Tools */}
        <ResSection label="Tools & Technologies" tinted={false}>
          <p style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, margin: "0 0 6px" }}>Security & Network</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {["ServiceNow","Active Directory","Cisco SecureCRT","Cisco AnyConnect VPN","Intune / Azure MDM","DHCP · DNS · TCP/IP","VLANs · RDP · SSL/TLS","ACL · DICOM · PACS"].map(t => (
              <span key={t} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, background: "#f9fafb", border: "0.5px solid #d1d5db", borderRadius: 2, padding: "4px 9px", color: "#374151" }}>{t}</span>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, margin: "0 0 6px" }}>Development & DevOps</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["Python","JavaScript","Bash","C","React","Node.js","FastAPI","PostgreSQL","MongoDB","GraphQL","Docker","Git","GitHub Actions","Linux","Figma"].map(t => (
              <span key={t} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, background: "#f9fafb", border: "0.5px solid #d1d5db", borderRadius: 2, padding: "4px 9px", color: "#374151" }}>{t}</span>
            ))}
          </div>
        </ResSection>

        {/* Awards */}
        <ResSection label="Awards & Recognition" tinted>
          {[
            ["Certificate of Appreciation", "COVID-19 Pandemic IT Support (Jan 2022) · VA Area Manager, DevSecOps EUO · Recognized for clinic activation, decommissioning & area-wide inventory."],
            ["Certificate of Appreciation", "THCC Clinic Activation (Dec 2021) · State-of-the-art technical systems delivery enabling day-one readiness for VHA staff."],
            ["Certificate of Appreciation", "Ernest Childers OPC Decommission (Dec 2021) · Managed 1,800+ pieces of sensitive equipment; recovered tens of thousands in IT asset value."],
            ['Certificate of Achievement — "Fully Successful"', "Nov 2021 · VA IT Supervisor annual performance rating for world-class IT customer support."],
          ].map(([title, detail]) => (
            <div key={title + detail} style={{ display: "flex", gap: 10, marginBottom: 7, alignItems: "flex-start" }}>
              <span style={{ width: 8, height: 8, background: "#10b981", transform: "rotate(45deg)", flexShrink: 0, marginTop: 5, display: "inline-block" }} />
              <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.58, margin: 0 }}>
                <strong style={{ color: "#0a0a0a" }}>{title}</strong>{" — "}{detail}
              </p>
            </div>
          ))}
        </ResSection>

      </div>

      {/* Jade rule */}
      <div style={{ height: 2, background: "linear-gradient(90deg, #10b981, #059669 40%, transparent)" }} />

      {/* Footer */}
      <div style={{ background: "#0a0a0a", padding: "18px 48px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", alignItems: "center", gap: 12, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #1a3a2a 1px, transparent 1px)", backgroundSize: "18px 18px", opacity: 0.3, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 2, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", marginBottom: 3 }}>Frandy G. Slueue</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#10b981", letterSpacing: 2 }}>@CodeBreeder</div>
        </div>
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <a href="https://github.com/frandy-slueue" target="_blank" rel="noopener noreferrer" style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.38)", letterSpacing: 0.5, textDecoration: "none", marginBottom: 4 }}>github.com/frandy-slueue</a>
          <a href="https://www.linkedin.com/in/frandyslueuewebdevitpro/" target="_blank" rel="noopener noreferrer" style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.38)", letterSpacing: 0.5, textDecoration: "none" }}>linkedin.com/in/frandyslueuewebdevitpro</a>
        </div>
        <div style={{ position: "relative", zIndex: 1, textAlign: "right" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, color: "#10b981", letterSpacing: 3 }}>frandy.dev</span>
        </div>
      </div>

    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function ResSection({ label, tinted, children }: { label: string; tinted: boolean; children: React.ReactNode }) {
  const bg = tinted
    ? "linear-gradient(90deg, rgba(13,31,23,0.055) 0%, rgba(240,253,244,0.45) 14%, #fff 100%)"
    : "#ffffff";
  return (
    <div style={{ background: bg, padding: "22px 48px" }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, borderBottom: "1px solid #10b981", paddingBottom: 6 }}>
        <span style={{ width: 8, height: 8, background: "#10b981", transform: "rotate(45deg)", flexShrink: 0, display: "inline-block" }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: 4, color: "#059669", textTransform: "uppercase" }}>{label}</span>
      </div>
      {children}
      {/* Thin divider */}
      <div style={{ height: 1, background: "#e5e7eb", marginTop: 4 }} />
    </div>
  );
}

function JobBlock({ title, org, dates, bullets, children }: {
  title: string; org: string; dates: string;
  bullets: string[]; children?: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2, flexWrap: "wrap", gap: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#0a0a0a" }}>{title}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#10b981", whiteSpace: "nowrap", fontStyle: "italic" }}>{dates}</span>
      </div>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8, fontStyle: "italic" }}>{org}</div>
      {bullets.map((b, i) => (
        <div key={i} style={{ fontSize: 12, color: "#374151", lineHeight: 1.68, padding: "2px 0 2px 15px", position: "relative" }}>
          <span style={{ position: "absolute", left: 0, top: 9, width: 5, height: 5, background: "#10b981", transform: "rotate(45deg)", display: "inline-block" }} />
          {b}
        </div>
      ))}
      {children}
    </div>
  );
}

function FSDiamond() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const W = 92, H = 92, CX = W / 2, CY = H / 2, R = 40;
    const F_SIZE = 11; // large enough for "0"/"1" to be legible
    const COL_W  = F_SIZE * 1.1;
    const NUM_COLS = Math.floor(W / COL_W);
    const TOTAL    = Math.ceil(H / F_SIZE) + 2;

    const cols = Array.from({ length: NUM_COLS }, () => ({
      offset: Math.random() * TOTAL,
      speed:  0.28 + Math.random() * 0.38,
    }));

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Clip to diamond shape
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(CX, CY - R); ctx.lineTo(CX + R, CY);
      ctx.lineTo(CX, CY + R); ctx.lineTo(CX - R, CY);
      ctx.closePath();
      ctx.clip();

      // Background
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, W, H);

      // Binary rain — 1s and 0s
      ctx.font = `700 ${F_SIZE}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (let c = 0; c < NUM_COLS; c++) {
        const col = cols[c];
        const x = (c + 0.5) * COL_W;
        for (let r = 0; r < TOTAL; r++) {
          const y = ((r - col.offset % TOTAL) * F_SIZE) % (H + F_SIZE) - F_SIZE;
          const dx = x - CX, dy = y + F_SIZE / 2 - CY;
          const alpha = Math.max(0, 1 - (Math.sqrt(dx * dx + dy * dy) / R) * 1.35);
          if (alpha < 0.05) continue;
          ctx.fillStyle = (c + r) % 3 !== 0
            ? `rgba(16,185,129,${alpha})`
            : `rgba(6,182,212,${alpha})`;
          ctx.fillText(["0", "1"][(c + r) % 2], x, y);
        }
      }
      ctx.restore();

      // Outer border
      const i2 = 5;
      ctx.beginPath();
      ctx.moveTo(CX, CY - R); ctx.lineTo(CX + R, CY);
      ctx.lineTo(CX, CY + R); ctx.lineTo(CX - R, CY);
      ctx.closePath();
      ctx.strokeStyle = "rgba(210,210,210,0.88)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner border
      ctx.beginPath();
      ctx.moveTo(CX, CY - R + i2); ctx.lineTo(CX + R - i2, CY);
      ctx.lineTo(CX, CY + R - i2); ctx.lineTo(CX - R + i2, CY);
      ctx.closePath();
      ctx.strokeStyle = "rgba(16,185,129,0.45)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // FS knockout text
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(CX, CY - R + i2 + 2); ctx.lineTo(CX + R - i2 - 2, CY);
      ctx.lineTo(CX, CY + R - i2 - 2); ctx.lineTo(CX - R + i2 + 2, CY);
      ctx.closePath();
      ctx.clip();
      ctx.globalCompositeOperation = "destination-out";
      ctx.font = "900 28px 'Bebas Neue', 'Space Grotesk', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(0,0,0,0.92)";
      ctx.fillText("FS", CX, CY + 1);
      ctx.restore();

      // FS ghost text on top
      ctx.globalCompositeOperation = "source-over";
      ctx.font = "900 28px 'Bebas Neue', 'Space Grotesk', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillText("FS", CX, CY + 1);
    }

    let rafId: number;
    function loop() {
      cols.forEach(col => { col.offset += col.speed * 0.016; });
      draw();
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div style={{ flexShrink: 0, width: 92, height: 92 }}>
      <canvas ref={canvasRef} width={92} height={92} style={{ width: 92, height: 92 }} />
    </div>
  );
}
