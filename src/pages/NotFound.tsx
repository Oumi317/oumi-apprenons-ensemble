import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8 max-w-lg"
      >
        {/* Animated 404 SVG */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          <svg
            className="w-64 h-64 mx-auto"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.circle
              cx="100"
              cy="100"
              r="80"
              stroke="currentColor"
              strokeWidth="4"
              className="text-white/20"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            <motion.text
              x="100"
              y="115"
              textAnchor="middle"
              className="fill-white font-bold"
              style={{ fontSize: "48px" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              404
            </motion.text>
            <motion.path
              d="M60 140 Q100 160 140 140"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className="text-white/60"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            />
            <motion.circle
              cx="70"
              cy="85"
              r="8"
              className="fill-white/80"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            />
            <motion.circle
              cx="130"
              cy="85"
              r="8"
              className="fill-white/80"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
            />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
            Page introuvable
          </h1>
          <p className="text-xl text-white/80">
            Oups ! La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="hover:scale-105 transition-transform"
          >
            <Link to="/">
              <Home className="mr-2 h-5 w-5" />
              Retour à l'accueil
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="text-white border-white/30 hover:bg-white/10"
          >
            <Link to="/lessons">
              <Search className="mr-2 h-5 w-5" />
              Explorer les cours
            </Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-white/60"
        >
          Besoin d'aide ?{" "}
          <Link to="/faq" className="underline hover:text-white transition-colors">
            Consultez notre FAQ
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default NotFound;
