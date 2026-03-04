"use client";

import NextLink from "next/link";
import { Button } from "@heroui/button";

interface HeroSectionProps {
  onStartTyping?: () => void;
  /** If set, "Start Typing" redirects to this URL instead of calling onStartTyping */
  startHref?: string;
}

export function HeroSection({ onStartTyping, startHref = "/typing-test" }: HeroSectionProps) {
  return (
    <section className="flex-1 flex flex-col items-center justify-center text-center px-4 min-h-0">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-foreground">
        Test Your English Typing Speed
      </h1>
      <p className="text-lg md:text-xl text-default-500 max-w-2xl mb-10">
        Challenge yourself with a timed typing test. Measure your words per
        minute and accuracy to improve your skills.
      </p>
      <Button
        as={NextLink}
        href={startHref}
        color="primary"
        size="lg"
        className="font-semibold px-8"
      >
        Start Typing
      </Button>
    </section>
  );
}
