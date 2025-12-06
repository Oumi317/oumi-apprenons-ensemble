import { motion } from "framer-motion";

export const FloatingShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Cercle principal */}
      <motion.div
        className="absolute top-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 blur-3xl"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Cercle secondaire */}
      <motion.div
        className="absolute bottom-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-secondary/10 to-secondary/5 blur-3xl"
        animate={{
          y: [0, 20, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      
      {/* Petit cercle flottant 1 */}
      <motion.div
        className="absolute top-1/3 right-1/4 w-4 h-4 rounded-full bg-primary/30"
        animate={{
          y: [0, -30, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Petit cercle flottant 2 */}
      <motion.div
        className="absolute top-1/2 left-1/4 w-3 h-3 rounded-full bg-secondary/40"
        animate={{
          y: [0, 20, 0],
          x: [0, -15, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      {/* Petit cercle flottant 3 */}
      <motion.div
        className="absolute bottom-1/3 right-1/3 w-2 h-2 rounded-full bg-success/50"
        animate={{
          y: [0, -25, 0],
          x: [0, 8, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      
      {/* Forme géométrique douce */}
      <motion.div
        className="absolute top-1/4 right-1/5 w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent rotate-12"
        animate={{
          rotate: [12, 20, 12],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};
