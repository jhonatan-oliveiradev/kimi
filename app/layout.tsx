import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Space_Grotesk, Noto_Serif_JP } from "next/font/google";
import {
  PRODUCT_NAME,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  SOCIAL_TITLE,
} from "@/lib/site";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--ff-serif",
});

const sans = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--ff-sans",
});

const jp = Noto_Serif_JP({
  weight: ["400"],
  variable: "--ff-jp",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: "/manifest.webmanifest",
  keywords: SITE_KEYWORDS,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "beauty",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_NAME,
    title: SOCIAL_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/media/poster.jpg",
        alt: "ORIMAE Nº 01 — Between Nature and Skin",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SOCIAL_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/media/poster.jpg"],
  },
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
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#FDFCFF",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Brand",
      "@id": `${SITE_URL}/#brand`,
      name: SITE_NAME,
      url: SITE_URL,
      slogan: "Between Nature and Skin",
      description: SITE_DESCRIPTION,
    },
    {
      "@type": "Product",
      "@id": `${SITE_URL}/#orimae-no-01`,
      name: PRODUCT_NAME,
      description: SITE_DESCRIPTION,
      category: "Eau de Parfum",
      size: "50 ml",
      brand: {
        "@id": `${SITE_URL}/#brand`,
      },
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Opening",
          value: "Mineral accord · morning air",
        },
        {
          "@type": "PropertyValue",
          name: "Heart",
          value: "Violet · iris · soft florals",
        },
        {
          "@type": "PropertyValue",
          name: "Base",
          value: "Soft woods · resin",
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      publisher: {
        "@id": `${SITE_URL}/#brand`,
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${jp.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
