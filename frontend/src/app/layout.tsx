import type { Metadata } from "next";
import { Bebas_Neue, Rajdhani, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import ThemeProvider from "@/components/ThemeProvider";
import BackToTop from "@/components/ui/BackToTop";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const rajdhani = Rajdhani({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Frandy Slueue — Full Stack Software Engineer",
  description:
    "Portfolio of Frandy Slueue — Full Stack Software Engineer trained at Atlas School of Tulsa.",
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
    <html
      lang="en"
      data-theme="silver"
      className={`${bebasNeue.variable} ${rajdhani.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <ThemeProvider>
          <Nav />
          <main style={{ paddingTop: "52px" }}>{children}</main>
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
