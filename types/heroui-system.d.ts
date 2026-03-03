declare module "@heroui/system" {
  import type { ReactNode } from "react";

  export interface HeroUIProviderProps {
    children: ReactNode;
    navigate?: (path: string, routerOptions?: any) => void;
    disableAnimation?: boolean;
    skipFramerMotionAnimations?: boolean;
    reducedMotion?: "user" | "always" | "never";
    locale?: string;
    useHref?: (href: string) => string;
  }

  export const HeroUIProvider: React.FC<HeroUIProviderProps>;
}
