import { ImageResponse } from "next/og";

export const dynamic = "force-static";
import { SocialCard } from "@/lib/social-card";

export const alt = "ORIMAE Nº 01 — Between Nature and Skin";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<SocialCard />, {
    width: size.width,
    height: size.height,
  });
}
