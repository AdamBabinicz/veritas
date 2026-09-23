import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://veritas-io.netlify.app/";
const shareImage = "/og-image.jpg";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090b",
};

// Dokładnie 50 znaków
const metaTitle = "VeritasAI – Autonomous Real-Time Truth Intelligence";

// Dokładnie 150 znaków
const metaDescription =
  "Autonomous truth synthesis console. Real-time claims verification grounded by NVIDIA Nemotron-70B on Nebius and Tavily Search with calibrated dossiers.";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  manifest: "/site.webmanifest",
  keywords: [
    "VeritasAI",
    "NVIDIA Nemotron",
    "Llama-3.1-Nemotron-70B",
    "Nebius Token Factory",
    "Tavily Search Grounding",
    "Fact-Checking AI",
    "Autonomous Verification",
    "Truth Intelligence",
    "Real-time Evidence Grounding",
  ],
  authors: [{ name: "Adam Gierczak" }],
  creator: "Adam Gierczak",
  publisher: "VeritasAI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: metaTitle,
    description: metaDescription,
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
    title: metaTitle,
    description: metaDescription,
    images: [shareImage],
    creator: "@VeritasAI",
  },
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/favicon.svg",
        color: "#10b981",
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}#software`,
      name: "VeritasAI",
      url: siteUrl,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: metaDescription,
      image: `${siteUrl}og-image.jpg`,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      creator: {
        "@type": "Person",
        name: "Adam Gierczak",
      },
      featureList: [
        "Autonomous 4-stage fact-checking pipeline",
        "NVIDIA Nemotron-70B adversarial reasoning via Nebius Token Factory",
        "Real-time Tavily search evidence grounding",
        "Calibrated confidence scoring with SVG verification ring",
        "Native bilingual EN/PL architecture",
      ],
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}#organization`,
      name: "VeritasAI",
      url: siteUrl,
      logo: `${siteUrl}web-app-manifest-512x512.png`,
      sameAs: [
        "https://github.com/AdamBabinicz/veritas",
        "https://youtu.be/DwpJtKu9bpA",
      ],
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-emerald-500/20">
        {children}
      </body>
    </html>
  );
}
