import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export const FloatingShapes = () => {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [12, 45]);
  const scale1 = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Cercle principal avec parallaxe */}
      <motion.div
        className="absolute top-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 blur-3xl"
        style={{ y: y1 }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Cercle secondaire avec parallaxe */}
      <motion.div
        className="absolute bottom-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-secondary/10 to-secondary/5 blur-3xl"
        style={{ y: y2 }}
        animate={{
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      
      {/* Petit cercle flottant 1 avec parallaxe */}
      <motion.div
        className="absolute top-1/3 right-1/4 w-4 h-4 rounded-full bg-primary/30"
        style={{ y: y3, scale: scale1 }}
        animate={{
          x: [0, 10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Petit cercle flottant 2 avec parallaxe */}
      <motion.div
        className="absolute top-1/2 left-1/4 w-3 h-3 rounded-full bg-secondary/40"
        style={{ y: y1 }}
        animate={{
          x: [0, -15, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      {/* Petit cercle flottant 3 avec parallaxe */}
      <motion.div
        className="absolute bottom-1/3 right-1/3 w-2 h-2 rounded-full bg-success/50"
        style={{ y: y2 }}
        animate={{
          x: [0, 8, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      
      {/* Forme géométrique douce avec parallaxe et rotation */}
      <motion.div
        className="absolute top-1/4 right-[20%] w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent"
        style={{ rotate: rotate1, y: y3 }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Nouvelle forme avec parallaxe inverse */}
      <motion.div
        className="absolute bottom-1/4 left-[15%] w-16 h-16 rounded-2xl bg-gradient-to-tr from-success/10 to-transparent rotate-45"
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, 80]) }}
        animate={{
          rotate: [45, 60, 45],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};
