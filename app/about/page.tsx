import { siteConfig } from "@/config/site";
import { AboutContent } from "@/components/about-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${siteConfig.name} — test your English typing speed, track WPM and accuracy, and improve your skills.`,
};

export default function AboutPage() {
  return <AboutContent />;
}
