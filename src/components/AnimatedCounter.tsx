import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: string;
  label: string;
  duration?: number;
}

export const AnimatedCounter = ({ value, label, duration = 2 }: AnimatedCounterProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState("0");
  
  useEffect(() => {
    if (!isInView) return;
    
    // Parse the value to extract numeric part and suffix
    const numericMatch = value.match(/^([\d.]+)/);
    const suffix = value.replace(/^[\d.]+/, "");
    
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }
    
    const targetValue = parseFloat(numericMatch[1]);
    const isDecimal = value.includes(".");
    const startTime = Date.now();
    const durationMs = duration * 1000;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      
      // Easing function for smooth deceleration
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = targetValue * easeOutQuart;
      
      if (isDecimal) {
        setDisplayValue(currentValue.toFixed(1) + suffix);
      } else {
        setDisplayValue(Math.floor(currentValue) + suffix);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);
  
  return (
    <motion.div 
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <div className="text-2xl md:text-3xl font-bold font-display text-primary">
        {displayValue}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
};
