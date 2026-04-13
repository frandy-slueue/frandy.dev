"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BackToTop from "@/components/ui/BackToTop";
import { ThemeToggleMobile } from "@/components/ui/ThemeToggle";
import ThemeProvider from "@/components/ThemeProvider";

export default function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin  = pathname?.startsWith("/admin");
  const isResume = pathname === "/resume";

  // Lifted scroll state — shared between BackToTop and ThemeToggleMobile
  const [bttVisible, setBttVisible]         = useState(false);
  const [themeBtnVisible, setThemeVisible]  = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isAdmin) return;
    const onScroll = () => {
      const scrolled = window.scrollY > 300;
      setBttVisible(scrolled);
      // Theme button is inverse of BackToTop
      setThemeVisible(!scrolled);
      if (scrolled) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setBttVisible(false);
          setThemeVisible(true);
        }, 2500);
      }
    };
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAdmin]);

  return (
    <ThemeProvider>
      {!isAdmin && !isResume && <Nav />}
      <main style={{ paddingTop: isAdmin || isResume ? "0" : "92px" }}>{children}</main>
      {!isAdmin && !isResume && <Footer />}
      {!isAdmin && <BackToTop visible={bttVisible} />}
      {!isAdmin && !isResume && <ThemeToggleMobile visible={themeBtnVisible} />}
    </ThemeProvider>
  );
}
