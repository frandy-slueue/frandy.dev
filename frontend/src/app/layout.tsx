import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Rajdhani, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import NavWrapper from "@/components/NavWrapper";

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
  title: "Frandy Slueue — Software Engineer & IT Security Professional",
  description:
    "Full-stack software engineer and IT security professional based in Tulsa, Oklahoma. Building production-grade web and mobile applications using React, Next.js, FastAPI, React Native, and Docker.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${rajdhani.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <NavWrapper>{children}</NavWrapper>
      </body>
    </html>
  );
}
