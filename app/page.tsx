"use client";

import { HeroSection } from "@/components/hero-section";

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1">
      <HeroSection startHref="/typing-test" />
    </div>
  );
}
