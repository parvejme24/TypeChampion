"use client";

import { Button } from "@heroui/button";
interface HeroSectionProps {
  onStartTyping: () => void;
}

export function HeroSection({ onStartTyping }: HeroSectionProps) {
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
        color="primary"
        size="lg"
        onPress={onStartTyping}
        className="font-semibold px-8"
      >
        Start Typing
      </Button>
    </section>
  );
}
