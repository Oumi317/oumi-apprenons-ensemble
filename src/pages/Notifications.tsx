import { Layout } from "@/components/Layout";
import { NotificationCenter } from "@/components/NotificationCenter";
import { motion } from "framer-motion";

export default function Notifications() {
  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold font-display mb-2">Centre de notifications</h1>
          <p className="text-muted-foreground">
            Gérez toutes vos notifications en un seul endroit
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          <NotificationCenter />
        </motion.div>
      </div>
    </Layout>
  );
}
