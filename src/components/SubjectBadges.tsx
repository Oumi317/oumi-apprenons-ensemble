import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Calculator, BookOpen, FlaskConical, Globe, Palette, Music, 
  Languages, History, Dumbbell, Code 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const subjects = [
  { name: "Mathématiques", icon: Calculator, color: "bg-primary/10 text-primary hover:bg-primary/20" },
  { name: "Français", icon: BookOpen, color: "bg-secondary/10 text-secondary hover:bg-secondary/20" },
  { name: "Sciences", icon: FlaskConical, color: "bg-success/10 text-success hover:bg-success/20" },
  { name: "Géographie", icon: Globe, color: "bg-primary/10 text-primary hover:bg-primary/20" },
  { name: "Arts plastiques", icon: Palette, color: "bg-secondary/10 text-secondary hover:bg-secondary/20" },
  { name: "Musique", icon: Music, color: "bg-success/10 text-success hover:bg-success/20" },
  { name: "Anglais", icon: Languages, color: "bg-primary/10 text-primary hover:bg-primary/20" },
  { name: "Histoire", icon: History, color: "bg-secondary/10 text-secondary hover:bg-secondary/20" },
  { name: "Sport", icon: Dumbbell, color: "bg-success/10 text-success hover:bg-success/20" },
  { name: "Informatique", icon: Code, color: "bg-primary/10 text-primary hover:bg-primary/20" },
];

export const SubjectBadges = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="flex flex-wrap justify-center gap-3"
    >
      {subjects.map((subject, index) => (
        <motion.div 
          key={subject.name}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ 
            delay: index * 0.05,
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          <Link to={`/tutors?subject=${encodeURIComponent(subject.name)}`}>
            <Badge
              className={`${subject.color} cursor-pointer px-4 py-2.5 text-sm font-medium rounded-full border-0 transition-all hover:scale-105 hover:shadow-md flex items-center gap-2`}
            >
              <subject.icon className="h-4 w-4" />
              {subject.name}
            </Badge>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};
