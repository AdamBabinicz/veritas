import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://veritas-io.netlify.app/";
const shareImage = "/og-image.jpg";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1117",
};

export const metadata: Metadata = {
  title: "VeritasAI – Separate Signal from Noise",
  description:
    "Autonomous real-time verification and truth synthesis research agent. Evidence-grounded claim inspection powered by NVIDIA Nemotron & Tavily Search.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  keywords: [
    "VeritasAI",
    "NVIDIA Nemotron",
    "Llama-3.1-Nemotron-70B",
    "Nebius Token Factory",
    "Tavily Search Grounding",
    "Fact-Checking AI",
    "Autonomous Verification",
    "Truth Intelligence",
  ],
  authors: [{ name: "Adam Gierczak" }],
  creator: "Adam Gierczak",
  publisher: "VeritasAI",
  robots:
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  openGraph: {
    title: "VeritasAI – Separate Signal from Noise",
    description:
      "Autonomous real-time verification and truth synthesis research agent. Evidence-grounded claim inspection powered by NVIDIA Nemotron & Tavily Search.",
    url: siteUrl,
    siteName: "VeritasAI",
    locale: "en_US",
    alternateLocale: ["pl_PL"],
    type: "website",
    images: [
      {
        url: shareImage,
        width: 1200,
        height: 630,
        alt: "VeritasAI - Autonomous Real-Time Verification Console",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VeritasAI – Separate Signal from Noise",
    description:
      "Autonomous real-time verification and truth synthesis agent powered by NVIDIA Nemotron & Tavily Search.",
    images: [shareImage],
  },
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-emerald-500/20">
        {children}
      </body>
    </html>
  );
}
