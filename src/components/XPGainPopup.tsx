import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star } from "lucide-react";

interface XPGainPopupProps {
  amount: number;
  show: boolean;
  onComplete: () => void;
}

export function XPGainPopup({ amount, show, onComplete }: XPGainPopupProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20 
          }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="relative">
            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0.5],
                  x: Math.cos(i * 60 * Math.PI / 180) * 60,
                  y: Math.sin(i * 60 * Math.PI / 180) * 60 - 30,
                }}
                transition={{ 
                  duration: 1.5, 
                  delay: 0.1 * i,
                  ease: "easeOut"
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              </motion.div>
            ))}
            
            {/* Main popup */}
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(234, 179, 8, 0.4)",
                  "0 0 0 20px rgba(234, 179, 8, 0)",
                  "0 0 0 0 rgba(234, 179, 8, 0)"
                ]
              }}
              transition={{ duration: 1.5, repeat: 1 }}
              className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 text-white px-8 py-4 rounded-2xl shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  <Sparkles className="h-8 w-8" />
                </motion.div>
                <div className="text-center">
                  <motion.p 
                    className="text-3xl font-bold"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    +{amount} XP
                  </motion.p>
                  <p className="text-sm opacity-90">Bravo !</p>
                </div>
                <motion.div
                  animate={{ rotate: [0, -15, 15, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  <Sparkles className="h-8 w-8" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
