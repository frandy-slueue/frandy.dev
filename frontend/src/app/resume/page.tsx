"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, FileDown, FileText, Share2, ChevronUp } from "lucide-react";
import { fadeUp, fadeLeft, fadeRight, VIEWPORT } from "@/lib/animations";
import SectionLabel from "@/components/ui/SectionLabel";
import { BtnPrimary, BtnSecondary } from "@/components/ui/Button";
import { settingsApi } from "@/lib/api";
import ResumeModal from "@/components/ui/ResumeModal";

// ── Animated FS Diamond (canvas) ────────────────────────────────────────────
function FSDiamond({ size = 92 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const W = size, H = size, CX = W / 2, CY = H / 2, R = W * 0.435;
    const F_SIZE = Math.max(11, Math.round(size * 0.115)); // legible character size
    const NUM_COLS = Math.floor((W * 0.88) / (F_SIZE * 0.95));
    const COL_W = (W * 0.88) / NUM_COLS;
    const TOTAL = Math.ceil(H / F_SIZE) + 2;

    const cols = Array.from({ length: NUM_COLS }, () => ({
      offset: Math.random() * TOTAL,
      speed: 0.28 + Math.random() * 0.38,
    }));

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(CX, CY - R); ctx.lineTo(CX + R, CY);
      ctx.lineTo(CX, CY + R); ctx.lineTo(CX - R, CY);
      ctx.closePath();
      ctx.clip();

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, W, H);

      ctx.font = `700 ${F_SIZE}px monospace`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      for (let c = 0; c < NUM_COLS; c++) {
        const col = cols[c];
        const x = W * 0.06 + c * COL_W;
        for (let r = 0; r < TOTAL; r++) {
          const y = ((r - col.offset % TOTAL) * F_SIZE) % (H + F_SIZE) - F_SIZE;
          const dx = x + COL_W / 2 - CX, dy = y + F_SIZE / 2 - CY;
          const alpha = Math.max(0, 1 - (Math.sqrt(dx * dx + dy * dy) / R) * 1.35);
          if (alpha < 0.05) continue;
          ctx.fillStyle = (c + r) % 3 !== 0
            ? `rgba(16,185,129,${alpha})`
            : `rgba(6,182,212,${alpha})`;
          ctx.fillText(["0", "1"][(c + r) % 2], x, y);
        }
      }
      ctx.restore();

      const i2 = size * 0.054;
      ctx.beginPath();
      ctx.moveTo(CX, CY - R); ctx.lineTo(CX + R, CY);
      ctx.lineTo(CX, CY + R); ctx.lineTo(CX - R, CY);
      ctx.closePath();
      ctx.strokeStyle = "rgba(210,210,210,0.88)";
      ctx.lineWidth = size > 60 ? 1.5 : 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(CX, CY - R + i2); ctx.lineTo(CX + R - i2, CY);
      ctx.lineTo(CX, CY + R - i2); ctx.lineTo(CX - R + i2, CY);
      ctx.closePath();
      ctx.strokeStyle = "rgba(16,185,129,0.45)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(CX, CY - R + i2 + 2); ctx.lineTo(CX + R - i2 - 2, CY);
      ctx.lineTo(CX, CY + R - i2 - 2); ctx.lineTo(CX - R + i2 + 2, CY);
      ctx.closePath();
      ctx.clip();
      ctx.globalCompositeOperation = "destination-out";
      ctx.font = `900 ${size * 0.3}px 'Bebas Neue', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(0,0,0,0.92)";
      ctx.fillText("FS", CX, CY + 1);
      ctx.restore();

      ctx.globalCompositeOperation = "source-over";
      ctx.font = `900 ${size * 0.3}px 'Bebas Neue', sans-serif`;
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
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: size, height: size, display: "block" }}
    />
  );
}

// ── Section header ───────────────────────────────────────────────────────────
function ResHead({ label }: { label: string }) {
  return (
    <div className="res-sec-head">
      <span className="res-sec-gem" aria-hidden />
      <span className="res-sec-label">{label}</span>
      <div className="res-sec-rule" />
    </div>
  );
}

// ── Job block ────────────────────────────────────────────────────────────────
function JobBlock({
  title, org, dates, bullets, children,
}: {
  title: string; org: string; dates: string;
  bullets?: string[]; children?: React.ReactNode;
}) {
  return (
    <div className="res-job">
      <div className="res-job-header">
        <span className="res-job-title">{title}</span>
        <span className="res-job-dates">{dates}</span>
      </div>
      <p className="res-job-org">{org}</p>
      {bullets?.map((b, i) => (
        <div key={i} className="res-bullet">
          <span className="res-bullet-gem" aria-hidden />
          <span>{b}</span>
        </div>
      ))}
      {children}
    </div>
  );
}

// ── Competency chip ──────────────────────────────────────────────────────────
function CompChip({ label }: { label: string }) {
  return (
    <div className="res-comp-chip">
      <span className="res-comp-gem" aria-hidden>▪</span>
      {label}
    </div>
  );
}

// ── Tool tag ─────────────────────────────────────────────────────────────────
function Tag({ label }: { label: string }) {
  return <span className="res-tag">{label}</span>;
}

// ── Award item ───────────────────────────────────────────────────────────────
function AwardItem({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="res-award">
      <span className="res-award-gem" aria-hidden />
      <p><strong>{title}</strong>{" — "}{detail}</p>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ResumePage() {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [docxUrl, setDocxUrl]     = useState<string | null>(null);
  const [shareUrl, setShareUrl]   = useState<string | null>(null);
  const [shareToast, setShareToast] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    settingsApi.getResume().then(d => {
      setResumeUrl(d.resume_url);
      setDocxUrl(d.resume_url_docx);
      setShareUrl(d.resume_url_share);
    }).catch(() => {});
  }, []);

  function handleShare() {
    const url = shareUrl || window.location.href;
    if (navigator.share) {
      navigator.share({ title: "Frandy Slueue — Resume", url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      });
    }
  }

  function scrollTop() {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      {/* ── Sticky top bar ──────────────────────────────────────────────── */}
      <div className="res-topbar">
        <div className="res-topbar__inner site-container">
          <span className="res-topbar__title">
            <a href="/" className="res-topbar__home">
              ← frandy.dev
            </a>
            <span className="res-topbar__sep" aria-hidden>·</span>
            <span className="res-topbar__dot" aria-hidden />
            Frandy Slueue — Resume
          </span>
          <div className="res-topbar__actions">
            <button
              className="res-action-btn"
              onClick={() => setModalOpen(true)}
              title="View resume"
              aria-label="View resume"
            >
              <ExternalLink size={14} />
              <span>View</span>
            </button>
            <button
              className="res-action-btn"
              onClick={() => {
                if (!resumeUrl) return;
                const a = document.createElement("a");
                a.href = resumeUrl; a.download = "Frandy_Slueue_Resume.pdf"; a.click();
              }}
              disabled={!resumeUrl}
              title="Download PDF"
              aria-label="Download PDF"
            >
              <FileText size={14} />
              <span>PDF</span>
              <FileDown size={11} style={{ opacity: 0.6 }} />
            </button>
            <button
              className="res-action-btn"
              onClick={() => {
                const url = docxUrl || resumeUrl;
                if (!url) return;
                const a = document.createElement("a");
                a.href = url; a.download = "Frandy_Slueue_Resume.docx"; a.click();
              }}
              disabled={!docxUrl && !resumeUrl}
              title="Download DOCX"
              aria-label="Download DOCX"
            >
              <FileText size={14} />
              <span>DOCX</span>
              <FileDown size={11} style={{ opacity: 0.6 }} />
            </button>
            <button
              className={`res-action-btn res-action-btn--share ${shareToast ? "copied" : ""}`}
              onClick={handleShare}
              title="Share resume"
              aria-label="Share resume"
            >
              <Share2 size={14} />
              <span className="res-action-btn__normal">Share</span>
              <span className="res-action-btn__copied">Copied!</span>
            </button>
          </div>
        </div>
      </div>

      <div ref={topRef} />

      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <section className="res-hero">
        <div className="res-hero-grid" aria-hidden />
        <div className="res-hero-bloom" aria-hidden />

        <div className="site-container res-hero-inner">
          <motion.div
            className="res-hero-logo"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <FSDiamond size={108} />
          </motion.div>

          <div className="res-hero-text">
            <motion.div
              className="res-hero-name"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="res-hero-name__first">FRANDY</span>
              <span className="res-hero-name__last">SLUEUE</span>
            </motion.div>

            <motion.p
              className="res-hero-title"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              IT Operations&nbsp;&nbsp;·&nbsp;&nbsp;Security&nbsp;&nbsp;·&nbsp;&nbsp;Software Engineering
            </motion.p>

            <motion.div
              className="res-hero-contact"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {["(918) 800-4855", "frandyslueue@gmail.com", "Broken Arrow, OK", "English · French"].map(c => (
                <span key={c} className="res-hero-chip">
                  <span className="res-hero-chip__dot" aria-hidden />
                  {c}
                </span>
              ))}
            </motion.div>

            <motion.div
              className="res-hero-site"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="res-hero-rule" />
              <span className="res-hero-url">· frandy.dev ·</span>
              <div className="res-hero-rule" />
            </motion.div>
          </div>
        </div>
      </section>

      <div className="res-jade-rule" />

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="res-body">

        {/* Summary */}
        <motion.section
          className="res-section res-section--white"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          transition={{ duration: 0.5 }}
        >
          <div className="site-container">
            <ResHead label="Professional Summary" />
            <p className="res-prose">
              Security-focused IT professional with 10+ years of enterprise technology experience,
              including 4 years as a GS-11 IT Specialist at the US Department of Veterans Affairs
              within a DevSecOps framework. Proven in vulnerability analysis, risk assessment,
              network security enforcement, and ServiceNow operations. Currently completing a
              full-stack software engineering and DevOps program — bridging deep IT security
              operations with modern development and systems thinking. Holds multiple VA
              Certificates of Appreciation for leading enterprise-scale projects under pressure.
            </p>
          </div>
        </motion.section>

        <div className="res-fade-rule" />

        {/* Competencies */}
        <motion.section
          className="res-section res-section--tinted"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          transition={{ duration: 0.5 }}
        >
          <div className="site-container">
            <ResHead label="Core Competencies" />
            <div className="res-comp-grid">
              {[
                "Vulnerability Analysis & Risk Assessment",
                "ServiceNow Ticketing & Workflows",
                "Network Security (TCP/IP, VPN, DNS)",
                "AIS Security Planning & DR",
                "Active Directory & Identity Management",
                "VLAN Architecture & Cisco Management",
                "Compliance Auditing & Security SOPs",
                "Endpoint Security (Intune / Azure MDM)",
                "CI/CD · Docker · Bash · Python",
              ].map(item => <CompChip key={item} label={item} />)}
            </div>
          </div>
        </motion.section>

        <div className="res-fade-rule" />

        {/* Experience */}
        <motion.section
          className="res-section res-section--white"
          variants={fadeLeft} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          transition={{ duration: 0.5 }}
        >
          <div className="site-container">
            <ResHead label="Professional Experience" />
            <JobBlock
              title="IT Specialist GS-11 — US Dept. of Veterans Affairs (DevSecOps)"
              org="Office of Information & Technology · Muskogee, OK · Full-time"
              dates="Sep 2019 – Aug 2023"
              bullets={[
                "Conducted vulnerability analysis and risk assessments across VA information systems; ensured AIS security plans complied with VA federal statutes and NIST-aligned standards.",
                "Developed AIS security contingency plans and disaster recovery procedures as part of the focal business continuity team.",
                "Managed ServiceNow (SNOW) workflows for Tier 2/3 resolution, BioMed activations, and escalation routing across a 400+ staff enterprise.",
                "Performed Cisco switch management via SecureCRT, PUTTY, TelNet; maintained VLAN architecture, RDP, DNS, DHCP, VPN, and TCP/IP across multi-site VA network.",
                "Configured Cisco AnyConnect VPN and enforced two-factor authentication policies — applying SSH, RDP, DNS, SSL/TLS protocol expertise directly.",
                "Deployed endpoints via Microsoft Intune/Azure MDM; led 300+ laptop and 600+ monitor refresh across VISN16 for COVID-19 and Cerner initiatives.",
                "Served as project lead for VA 91st St Clinic activation and Ernest Childers OPC decommission — managing 1,800+ pieces of sensitive equipment.",
                "Created cybersecurity threat management training materials; selected within 90 days of hire to train fellow technicians.",
              ]}
            />
            <JobBlock
              title="IT Support — U.S. Cellular"
              org="Tulsa, OK · Full-time"
              dates="Sep 2014 – Apr 2018"
              bullets={[
                "Maintained Help Desk tracking, IT asset accuracy, and patch cabling; configured telecom systems for moves, adds, and changes (MAC) in a multi-site environment.",
                "Developed problem tracking and resolution databases; determined internal service measures and communicated SLAs across support tiers.",
                "Installed and configured workstations on network operating systems; managed device drivers, hardware configurations, and communication networking.",
                "Investigated and recommended tools and technologies to improve responsiveness to customer and security requirements.",
              ]}
            />
            <JobBlock
              title="IT Customer Service — DishNetwork (Future Vision)"
              org="Tulsa, OK · Full-time"
              dates="Dec 2012 – Aug 2014"
              bullets={[
                "Served as primary technical specialist for all automated systems; resolved network and system issues via phone, email, and in-person channels.",
                "Provided training on desktops, laptops, and mobile devices; led system upgrade projects involving new software features and structural component changes.",
              ]}
            />
          </div>
        </motion.section>

        <div className="res-fade-rule" />

        {/* Education */}
        <motion.section
          className="res-section res-section--tinted"
          variants={fadeRight} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          transition={{ duration: 0.5 }}
        >
          <div className="site-container">
            <ResHead label="Education" />
            <JobBlock
              title="Full-Stack Software Engineering — Atlas School of Tulsa"
              org="Tulsa, OK · Hands-on, project-based curriculum"
              dates="2023 – 2025"
              bullets={[
                "Coursework and projects fully completed. Certification pending final capstone submission.",
                "Core stack: Python, JavaScript, React, Node.js, C, PostgreSQL, MongoDB, GraphQL, Docker, REST APIs, Git, Figma, system design.",
                "Production-deployed portfolio: FastAPI + Next.js + Docker on DigitalOcean with CI/CD via GitHub Actions.",
              ]}
            >
              {/* DevOps sub-block */}
              <div className="res-devops">
                <p className="res-devops__title">DevOps &amp; Systems Engineering</p>
                <div className="res-devops__grid">
                  {[
                    "Infrastructure as Code (IaC) fundamentals",
                    "CI/CD pipeline design & integration",
                    "Containerization with Docker",
                    "Linux & OS internals",
                    "Scripting: Python & Bash",
                    "System health monitoring (metrics, logs, traces)",
                    "Security scans & secret management in pipelines",
                    "SRE principles & root-cause analysis (RCA)",
                  ].map(item => (
                    <div key={item} className="res-devops__item">
                      <span className="res-devops__gem" aria-hidden />
                      {item}
                    </div>
                  ))}
                </div>
                <p className="res-devops__note">
                  Emphasis on cross-functional collaboration — fluent in both developer and sysadmin
                  contexts. Rapid learner actively tracking AIOps and Platform Engineering paradigms.
                  No cloud certifications yet; strong hands-on foundation with continuous
                  self-directed learning.
                </p>
              </div>
            </JobBlock>
            <JobBlock
              title="Bachelor of Science, Computer Science — Lagos State University"
              org="Lagos, Nigeria"
              dates="2015 – 2019"
            />
            <JobBlock
              title="Bachelor of Science, Technology Management (incomplete) — Spartan College"
              org="Tulsa, OK · 2 of 3 years completed"
              dates="2007 – 2009"
            />
            <JobBlock
              title="Certification — Avionics, Airframe & Powerplant — Spartan College"
              org="Tulsa, OK · GPA 3.6 / 4.0 · Certified in Aviation Maintenance, Management & Operation"
              dates="2007 – 2009"
            />
          </div>
        </motion.section>

        <div className="res-fade-rule" />

        {/* Tools */}
        <motion.section
          className="res-section res-section--white"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          transition={{ duration: 0.5 }}
        >
          <div className="site-container">
            <ResHead label="Tools & Technologies" />
            <p className="res-tools-label">Security &amp; Network</p>
            <div className="res-tags">
              {["ServiceNow","Active Directory","Cisco SecureCRT","Cisco AnyConnect VPN","Intune / Azure MDM","DHCP · DNS · TCP/IP","VLANs · RDP · SSL/TLS","ACL · DICOM · PACS"].map(t => <Tag key={t} label={t} />)}
            </div>
            <p className="res-tools-label" style={{ marginTop: 20 }}>Development &amp; DevOps</p>
            <div className="res-tags">
              {["Python","JavaScript","Bash","C","React","Node.js","FastAPI","PostgreSQL","MongoDB","GraphQL","Docker","Git","GitHub Actions","Linux","Figma"].map(t => <Tag key={t} label={t} />)}
            </div>
          </div>
        </motion.section>

        <div className="res-fade-rule" />

        {/* Awards */}
        <motion.section
          className="res-section res-section--tinted"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          transition={{ duration: 0.5 }}
        >
          <div className="site-container">
            <ResHead label="Awards & Recognition" />
            <AwardItem
              title="Certificate of Appreciation"
              detail="COVID-19 Pandemic IT Support (Jan 2022) · VA Area Manager, DevSecOps EUO · Recognized for clinic activation, decommissioning & area-wide inventory."
            />
            <AwardItem
              title="Certificate of Appreciation"
              detail="THCC Clinic Activation (Dec 2021) · State-of-the-art technical systems delivery enabling day-one readiness for VHA staff."
            />
            <AwardItem
              title="Certificate of Appreciation"
              detail='Ernest Childers OPC Decommission (Dec 2021) · Managed 1,800+ pieces of sensitive equipment; recovered tens of thousands in IT asset value.'
            />
            <AwardItem
              title='Certificate of Achievement — "Fully Successful"'
              detail="Nov 2021 · VA IT Supervisor annual performance rating for world-class IT customer support."
            />
          </div>
        </motion.section>

      </div>

      <div className="res-jade-rule" />

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="res-footer">
        <div className="res-footer-grid" aria-hidden />
        <div className="site-container res-footer-inner">
          <div className="res-footer-left">
            <p className="res-footer-name">Frandy G. Slueue</p>
            <p className="res-footer-brand">@CodeBreeder</p>
          </div>
          <div className="res-footer-center">
            <a href="https://github.com/frandy-slueue" target="_blank" rel="noopener noreferrer" className="res-footer-link">
              github.com/frandy-slueue
            </a>
            <a href="https://www.linkedin.com/in/frandyslueuewebdevitpro/" target="_blank" rel="noopener noreferrer" className="res-footer-link">
              linkedin.com/in/frandyslueuewebdevitpro
            </a>
          </div>
          <div className="res-footer-right">
            <span className="res-footer-site">frandy.dev</span>
          </div>
        </div>
      </div>

      {/* ── Back to top ─────────────────────────────────────────────────── */}
      <button className="res-back-top" onClick={scrollTop} aria-label="Back to top">
        <ChevronUp size={18} />
      </button>

      {/* ── Download CTA strip ──────────────────────────────────────────── */}
      {(resumeUrl || docxUrl) && (
        <motion.div
          className="res-cta-strip"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="site-container res-cta-strip__inner">
            <p className="res-cta-strip__label">Save a copy for your records</p>
            <div className="res-cta-strip__btns">
              {resumeUrl && (
                <BtnPrimary onClick={() => {
                  const a = document.createElement("a");
                  a.href = resumeUrl; a.download = "Frandy_Slueue_Resume.pdf"; a.click();
                }}>
                  <FileDown size={14} /> Download PDF
                </BtnPrimary>
              )}
              {docxUrl && (
                <BtnSecondary onClick={() => {
                  const a = document.createElement("a");
                  a.href = docxUrl; a.download = "Frandy_Slueue_Resume.docx"; a.click();
                }}>
                  <FileDown size={14} /> Download DOCX
                </BtnSecondary>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Resume modal — triggered by View button */}
      <ResumeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        resumeUrl={resumeUrl}
        docxUrl={docxUrl}
        shareUrl={shareUrl}
      />

      {/* Share toast */}
      {shareToast && (
        <motion.div
          className="res-toast"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
        >
          Link copied to clipboard
        </motion.div>
      )}

      <style>{`
        /* ── Top bar ─────────────────────────────────────────────────────── */
        .res-topbar {
          position: sticky;
          top: 92px;
          z-index: 40;
          background: rgba(8,8,8,0.95);
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .res-topbar__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          height: 48px;
        }
        .res-topbar__title {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }
        .res-topbar__home {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 2px;
          color: var(--accent);
          text-decoration: none;
          text-transform: uppercase;
          white-space: nowrap;
          transition: opacity 200ms ease;
        }
        .res-topbar__home:hover { opacity: 0.7; }
        .res-topbar__sep {
          color: var(--border);
          margin: 0 4px;
        }
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 6px var(--accent);
          flex-shrink: 0;
        }
        .res-topbar__actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .res-action-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          background: transparent;
          border: 1px solid transparent;
          color: rgba(255,255,255,0.45);
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 1px;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
          transition: color 200ms ease, border-color 200ms ease, background 200ms ease;
          position: relative;
          white-space: nowrap;
        }
        .res-action-btn:hover:not(:disabled) {
          color: var(--accent);
          border-color: var(--border);
          background: var(--bg-elevated);
        }
        .res-action-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .res-action-btn__copied { display: none; }
        .res-action-btn--share.copied .res-action-btn__normal { display: none; }
        .res-action-btn--share.copied .res-action-btn__copied {
          display: inline;
          color: var(--accent);
        }

        /* ── Hero ─────────────────────────────────────────────────────────── */
        .res-hero {
          background: var(--bg-primary);
          padding: 80px 0 64px;
          position: relative;
          overflow: hidden;
        }
        .res-hero-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, var(--border) 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.35;
          pointer-events: none;
        }
        .res-hero-bloom {
          position: absolute;
          top: -100px; left: -100px;
          width: 500px; height: 500px;
          background: radial-gradient(ellipse, var(--accent-glow) 0%, transparent 68%);
          pointer-events: none;
        }
        .res-hero-inner {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 40px;
        }
        .res-hero-logo { flex-shrink: 0; }
        .res-hero-text { flex: 1; min-width: 0; }
        .res-hero-name {
          display: flex;
          align-items: baseline;
          gap: 14px;
          line-height: 1;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        .res-hero-name__first {
          font-family: var(--font-display);
          font-size: clamp(36px, 6vw, 56px);
          letter-spacing: 4px;
          color: var(--text-primary);
          text-transform: uppercase;
        }
        .res-hero-name__last {
          font-family: var(--font-display);
          font-size: clamp(36px, 6vw, 56px);
          letter-spacing: 4px;
          color: var(--accent);
          text-transform: uppercase;
        }
        .res-hero-title {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 3px;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .res-hero-contact {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .res-hero-chip {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .res-hero-chip__dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: var(--accent);
          flex-shrink: 0;
        }
        .res-hero-site {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .res-hero-rule {
          flex: 1;
          height: 1px;
          background: rgba(var(--accent), 0.2);
          background: color-mix(in srgb, var(--accent) 25%, transparent);
        }
        .res-hero-url {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 4px;
          color: var(--accent);
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* ── Rules ─────────────────────────────────────────────────────────── */
        .res-jade-rule {
          height: 2px;
          background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 60%, transparent) 50%, transparent);
        }
        .res-fade-rule {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border) 20%, var(--border) 80%, transparent);
        }

        /* ── Sections ──────────────────────────────────────────────────────── */
        .res-body { background: var(--bg-primary); }
        .res-section {
          padding: 64px 0;
        }
        .res-section--white {
          background: var(--bg-primary);
        }
        .res-section--tinted {
          background: var(--bg-secondary);
        }

        /* Section header */
        .res-sec-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--accent);
        }
        .res-sec-gem {
          width: 8px; height: 8px;
          background: var(--accent);
          transform: rotate(45deg);
          flex-shrink: 0;
          display: inline-block;
        }
        .res-sec-label {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 4px;
          color: var(--accent);
          text-transform: uppercase;
        }
        .res-sec-rule {
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        /* Prose */
        .res-prose {
          font-family: var(--font-body);
          font-size: 16px;
          line-height: 1.9;
          color: var(--text-secondary);
          max-width: 760px;
          font-weight: 400;
        }

        /* Competency grid */
        .res-comp-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .res-comp-chip {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          padding: 8px 12px;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
          transition: border-color 200ms ease, color 200ms ease;
        }
        .res-comp-chip:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
        .res-comp-gem { color: var(--accent); font-size: 10px; flex-shrink: 0; }

        /* Job blocks */
        .res-job { margin-bottom: 36px; }
        .res-job:last-child { margin-bottom: 0; }
        .res-job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 4px;
          flex-wrap: wrap;
        }
        .res-job-title {
          font-family: var(--font-body);
          font-size: 17px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: 0.3px;
        }
        .res-job-dates {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--accent);
          white-space: nowrap;
          flex-shrink: 0;
          font-style: italic;
        }
        .res-job-org {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 12px;
          font-style: italic;
          font-weight: 400;
        }
        .res-bullet {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          margin-bottom: 7px;
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 400;
          color: var(--text-secondary);
          line-height: 1.75;
        }
        .res-bullet-gem {
          width: 5px; height: 5px;
          background: var(--accent);
          transform: rotate(45deg);
          flex-shrink: 0;
          margin-top: 9px;
          display: inline-block;
        }

        /* DevOps sub-block */
        .res-devops {
          margin-top: 16px;
          background: var(--bg-elevated);
          border-left: 2px solid var(--accent);
          padding: 16px 20px;
        }
        .res-devops__title {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 3px;
          color: var(--accent);
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .res-devops__grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 24px;
          margin-bottom: 12px;
        }
        .res-devops__item {
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.6;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .res-devops__gem {
          width: 4px; height: 4px;
          background: var(--accent);
          transform: rotate(45deg);
          flex-shrink: 0;
          margin-top: 7px;
          display: inline-block;
        }
        .res-devops__note {
          font-family: var(--font-body);
          font-size: 12px;
          color: var(--text-muted);
          font-style: italic;
          line-height: 1.7;
          opacity: 0.8;
        }

        /* Tools */
        .res-tools-label {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 2px;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .res-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .res-tag {
          font-family: var(--font-mono);
          font-size: 11px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          padding: 5px 10px;
          color: var(--text-muted);
          transition: border-color 200ms ease, color 200ms ease;
        }
        .res-tag:hover { border-color: var(--accent); color: var(--accent); }

        /* Awards */
        .res-award {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .res-award-gem {
          width: 8px; height: 8px;
          background: var(--accent);
          transform: rotate(45deg);
          flex-shrink: 0;
          margin-top: 6px;
          display: inline-block;
        }
        .res-award p {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.65;
          margin: 0;
        }
        .res-award strong {
          color: var(--text-primary);
          font-weight: 700;
        }

        /* ── Footer ─────────────────────────────────────────────────────────── */
        .res-footer {
          background: var(--bg-primary);
          border-top: 1px solid var(--border);
          padding: 24px 0;
          position: relative;
          overflow: hidden;
        }
        .res-footer-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, var(--border-subtle) 1px, transparent 1px);
          background-size: 18px 18px;
          opacity: 0.6;
          pointer-events: none;
        }
        .res-footer-inner {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          align-items: center;
          gap: 16px;
        }
        .res-footer-name {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .res-footer-brand {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--accent);
          letter-spacing: 2px;
        }
        .res-footer-center { text-align: center; }
        .res-footer-link {
          display: block;
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          text-decoration: none;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
          transition: color 200ms ease;
        }
        .res-footer-link:hover { color: var(--accent); }
        .res-footer-right { text-align: right; }
        .res-footer-site {
          font-family: var(--font-mono);
          font-size: 14px;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: 3px;
        }

        /* ── Download CTA strip ─────────────────────────────────────────────── */
        .res-cta-strip {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          padding: 32px 0;
        }
        .res-cta-strip__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }
        .res-cta-strip__label {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 2px;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .res-cta-strip__btns {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        /* ── Back to top ────────────────────────────────────────────────────── */
        .res-back-top {
          position: fixed;
          bottom: 32px;
          right: 32px;
          width: 40px; height: 40px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 30;
          transition: color 200ms ease, border-color 200ms ease, background 200ms ease;
        }
        .res-back-top:hover {
          color: var(--accent);
          border-color: var(--accent);
          background: var(--bg-primary);
        }

        /* ── Toast ──────────────────────────────────────────────────────────── */
        .res-toast {
          position: fixed;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-elevated);
          border: 1px solid var(--accent);
          color: var(--accent);
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 10px 20px;
          z-index: 200;
          white-space: nowrap;
        }

        /* ── Responsive ─────────────────────────────────────────────────────── */
        @media (max-width: 768px) {
          .res-hero-inner { flex-direction: column; align-items: flex-start; gap: 24px; }
          .res-hero { padding: 48px 0 40px; }
          .res-comp-grid { grid-template-columns: 1fr 1fr; }
          .res-devops__grid { grid-template-columns: 1fr; }
          .res-footer-inner { grid-template-columns: 1fr; gap: 12px; }
          .res-footer-center, .res-footer-right { text-align: left; }
          .res-cta-strip__inner { flex-direction: column; align-items: flex-start; }
          .res-topbar__title { display: none; }
          .res-topbar__home { display: inline !important; }
          .res-topbar__sep { display: none; }
          .res-topbar__dot { display: none; }
          .res-action-btn span:not(.res-action-btn__copied) { display: none; }
          .res-action-btn { padding: 5px 8px; }
          .res-back-top { bottom: 88px; }
        }
        @media (max-width: 480px) {
          .res-comp-grid { grid-template-columns: 1fr; }
          .res-hero-name__first,
          .res-hero-name__last { font-size: 32px; }
        }
      `}</style>
    </>
  );
}
