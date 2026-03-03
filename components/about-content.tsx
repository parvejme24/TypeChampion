"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { siteConfig } from "@/config/site";
import { motion } from "framer-motion";

const FEATURES = [
  { label: "Timed tests", detail: "30 or 60 sec" },
  { label: "Live WPM", detail: "As you type" },
  { label: "Results", detail: "Score & errors" },
  { label: "Save scores", detail: "Google sign-in" },
  { label: "Profile", detail: "Track progress" },
  { label: "Themes", detail: "Dark & light" },
];

const TYPING_FACTS = [
  "Average typist: ~40 WPM",
  "Professional: 65–95 WPM",
  "World record: 200+ WPM",
  "Practice improves speed and accuracy",
];

export function AboutContent() {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setFactIndex((i) => (i + 1) % TYPING_FACTS.length),
      4000,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full">
      {/* Hero strip */}
      <motion.section
        className="bg-gradient-to-b from-primary-100/50 to-transparent dark:from-primary-500/10 dark:to-transparent border-b border-default-200 dark:border-default-100"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-full mx-auto px-4 py-10 md:py-14 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            About {siteConfig.name}
          </h1>
          <p className="text-default-500 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            {siteConfig.description}
          </p>
          <Button
            as={NextLink}
            href="/"
            color="primary"
            size="lg"
            className="font-semibold px-8"
          >
            Try typing test →
          </Button>
        </div>
      </motion.section>

      {/* Two-column content */}
      <div className="container mx-auto w-full py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left column */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="border border-default-200 dark:border-default-100 overflow-hidden">
                <CardBody className="p-6 md:p-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    What is TypeChampion?
                  </h2>
                  <div className="space-y-4 text-default-600 text-sm md:text-base">
                    <p>
                      TypeChampion is a free typing speed test for English. You
                      get a paragraph to type against the clock, and we measure
                      your words per minute (WPM) and accuracy so you can track
                      your progress over time.
                    </p>
                    <p>
                      Whether you’re learning to type, preparing for a job, or
                      just want to get faster, TypeChampion gives you quick,
                      clear feedback to improve.
                    </p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div
              className="rounded-xl p-5 bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <p className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
                Did you know?
              </p>
              <motion.p
                key={factIndex}
                className="text-foreground font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                {TYPING_FACTS[factIndex]}
              </motion.p>
            </motion.div>
          </div>

          {/* Right column: bento feature grid + how to use */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Features
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {FEATURES.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.04 }}
                  >
                    <Card
                      className="h-full w-full border border-default-200 dark:border-default-100 transition-all hover:border-primary-300 dark:hover:border-primary-500/40 hover:shadow-md"
                      isPressable
                    >
                      <CardBody className="p-4">
                        <p className="font-medium text-foreground text-sm">
                          {item.label}
                        </p>
                        <p className="text-default-500 text-xs mt-0.5">
                          {item.detail}
                        </p>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <Card className="border border-default-200 dark:border-default-100 bg-default-50/50 dark:bg-default-100/5">
                <CardBody className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-3">
                    How to use
                  </h2>
                  <p className="text-default-600 text-sm mb-4">
                    From the home page, click <strong>Start Typing</strong>,
                    choose your duration, and type the paragraph as accurately
                    as you can. When the time is up, you’ll see your WPM and
                    accuracy. Sign in to save results and compare over time.
                  </p>
                  <Button as={NextLink} href="/" variant="bordered" size="sm">
                    Go to home
                  </Button>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
