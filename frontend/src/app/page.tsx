"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Timeline from "@/components/sections/Timeline";
import Contact from "@/components/sections/Contact";

interface SectionVisibility {
  section_about:    boolean;
  section_skills:   boolean;
  section_projects: boolean;
  section_timeline: boolean;
  section_contact:  boolean;
}

const ALL_VISIBLE: SectionVisibility = {
  section_about:    true,
  section_skills:   true,
  section_projects: true,
  section_timeline: true,
  section_contact:  true,
};

export default function Home() {
  const [visibility, setVisibility] = useState<SectionVisibility>(ALL_VISIBLE);

  useEffect(() => {
    fetch("/api/settings/sections")
      .then((r) => r.json())
      .then((data: SectionVisibility) => setVisibility(data))
      .catch(() => {}); // Fall back to all visible on error
  }, []);

  return (
    <>
      {/* Hero is always shown — not togglable */}
      <Hero />
      {visibility.section_about    && <About />}
      {visibility.section_skills   && <Skills />}
      {visibility.section_projects && <Projects />}
      {visibility.section_timeline && <Timeline />}
      {visibility.section_contact  && <Contact />}
    </>
  );
}
