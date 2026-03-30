"use client";

import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import BackToTop from "@/components/ui/BackToTop";

export default function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Nav />}
      <main style={{ paddingTop: isAdmin ? "0" : "52px" }}>{children}</main>
      {!isAdmin && <BackToTop />}
    </>
  );
}
