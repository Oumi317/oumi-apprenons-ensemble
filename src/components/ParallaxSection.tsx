import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, ReactNode } from "react";

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: "up" | "down";
}

export const ParallaxSection = ({
  children,
  className = "",
  speed = 0.3,
  direction = "up"
}: ParallaxSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const multiplier = direction === "up" ? -1 : 1;
  const y = useTransform(scrollYProgress, [0, 1], [speed * 100 * multiplier, speed * -100 * multiplier]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
};

interface ParallaxBackgroundProps {
  className?: string;
  speed?: number;
}

export const ParallaxBackground = ({
  className = "",
  speed = 0.2
}: ParallaxBackgroundProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 0.6, 0.6, 0.3]);

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      className={`absolute inset-0 pointer-events-none ${className}`}
    />
  );
};

interface ParallaxFloatingElementProps {
  children?: ReactNode;
  className?: string;
  speed?: number;
  rotate?: boolean;
}

export const ParallaxFloatingElement = ({
  children,
  className = "",
  speed = 0.5,
  rotate = false
}: ParallaxFloatingElementProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [speed * 80, speed * -80]);
  const rotation = useTransform(scrollYProgress, [0, 1], [0, rotate ? 15 : 0]);

  return (
    <motion.div
      ref={ref}
      style={{ y, rotate: rotation }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
