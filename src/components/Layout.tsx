import { ReactNode } from "react";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  className?: string;
}

export const Layout = ({ children, showFooter = true, className = "" }: LayoutProps) => {
  return (
    <div className={`min-h-screen bg-background flex flex-col ${className}`}>
      <NavigationHeader />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex-grow"
      >
        {children}
      </motion.main>
      {showFooter && <Footer />}
    </div>
  );
};
