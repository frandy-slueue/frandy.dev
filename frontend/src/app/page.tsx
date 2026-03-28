import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";

export default function Home() {
  return (
    <>
      <Hero />
      <About/>

      {/* Placeholder sections — will be built one by one */}
      <section id="about"    style={{ minHeight: "100vh", background: "var(--bg-secondary)" }} />
      <section id="skills"   style={{ minHeight: "100vh", background: "var(--bg-primary)" }} />
      <section id="projects" style={{ minHeight: "100vh", background: "var(--bg-secondary)" }} />
      <section id="timeline" style={{ minHeight: "100vh", background: "var(--bg-primary)" }} />
      <section id="contact"  style={{ minHeight: "100vh", background: "var(--bg-secondary)" }} />
    </>
  );
}