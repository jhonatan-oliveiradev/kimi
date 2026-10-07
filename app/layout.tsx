import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Space_Grotesk, Noto_Serif_JP } from "next/font/google";
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
  title: "ORIMAE — Between Nature and Skin",
  description:
    "ORIMAE Nº 01 is a botanical fragrance concept exploring the space between nature, memory and skin.",
};

export const viewport: Viewport = {
  themeColor: "#FDFCFF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${jp.variable}`}>
      <body>{children}</body>
    </html>
  );
}
