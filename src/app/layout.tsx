import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";

import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FONDR",
  description: "Deutschsprachige Web-App für ETF-basiertes Wealth Planning.",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html
      lang="de"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable}`}
    >
      <body className={`${inter.className} font-sans`}>
        {children}
      </body>
    </html>
  );
}
