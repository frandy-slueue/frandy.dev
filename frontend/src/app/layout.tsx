import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Frandy Slueue — Full Stack Software Engineer",
  description:
    "Portfolio of Frandy Slueue — Full Stack Software Engineer trained at Atlas School of Tulsa. React, Next.js, FastAPI, PostgreSQL, Docker.",
  keywords: [
    "Frandy Slueue",
    "Full Stack Engineer",
    "React",
    "Next.js",
    "FastAPI",
    "Python",
    "PostgreSQL",
    "Docker",
    "Atlas School",
    "Tulsa",
  ],
  authors: [{ name: "Frandy Slueue" }],
  openGraph: {
    title: "Frandy Slueue — Full Stack Software Engineer",
    description: "Portfolio of Frandy Slueue — Full Stack Software Engineer.",
    url: "https://frandy.dev",
    siteName: "frandy.dev",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="silver">
      <body>
        <ThemeProvider>
          <Nav />
          <main style={{ paddingTop: "52px" }}>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
