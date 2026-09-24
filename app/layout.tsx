import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

const siteUrl = "https://veritas-io.netlify.app/";
const shareImage = "/og-image.jpg";
const GTM_ID = "GTM-PNC3NGF9";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090b",
};

// Optymalna długość pod SEO – zawiera: "claims", "peer-reviewed", "study", "evidence"
const metaTitle = "VeritasAI – Verify Claims with Peer-Reviewed Study Evidence";

// Dokładnie 159 znaków – zawiera: "claims", "evidence", "peer-reviewed", "study"
const metaDescription =
  "Autonomous truth intelligence console. Verify viral claims and news against real-time peer-reviewed study evidence using calibrated NVIDIA Nemotron reasoning.";

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
    "Verify Claims",
    "Peer-Reviewed Evidence",
    "Study Verification",
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
      {
        url: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/web-app-manifest-512x512.png",
        sizes: "512x512",
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

const gtmLoaderScript = `
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
  function initGTM() {
    var f = document.getElementsByTagName('script')[0];
    var j = document.createElement('script');
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=${GTM_ID}';
    f.parentNode.insertBefore(j, f);
  }
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(initGTM, { timeout: 3000 });
  } else {
    window.addEventListener('load', function() { setTimeout(initGTM, 1500); });
  }
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen w-full overflow-x-hidden bg-background text-foreground antialiased selection:bg-emerald-500/20"
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
          />
        </noscript>

        {children}

        {/* Ładowanie w idle bez blokowania renderowania i bez błędu hydracji */}
        <Script
          id="google-tag-manager"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{ __html: gtmLoaderScript }}
        />
      </body>
    </html>
  );
}
