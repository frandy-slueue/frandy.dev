"use client";

import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BackToTop from "@/components/ui/BackToTop";
import ThemeProvider from "@/components/ThemeProvider";

export default function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <ThemeProvider>
      {!isAdmin && <Nav />}
      <main style={{ paddingTop: isAdmin ? "0" : "52px" }}>{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && <BackToTop />}
    </ThemeProvider>
  );
}
