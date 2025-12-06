import { motion } from "framer-motion";

interface IllustrationProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm: 64,
  md: 96,
  lg: 128,
  xl: 160
};

// Illustration: Livre animé
export const BookIllustration = ({ className = "", size = "md" }: IllustrationProps) => {
  const s = sizes[size];
  return (
    <motion.svg
      width={s}
      height={s}
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      initial={{ rotate: -5 }}
      animate={{ rotate: [-5, 5, -5] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Livre corps */}
      <motion.rect
        x="25"
        y="20"
        width="70"
        height="80"
        rx="6"
        fill="hsl(var(--primary))"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Page intérieure */}
      <rect x="32" y="28" width="56" height="64" rx="3" fill="white" />
      {/* Lignes de texte */}
      <motion.rect
        x="40"
        y="40"
        width="40"
        height="5"
        rx="2"
        fill="hsl(var(--primary) / 0.3)"
        initial={{ width: 30 }}
        animate={{ width: [30, 40, 30] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <rect x="40" y="52" width="35" height="5" rx="2" fill="hsl(var(--primary) / 0.2)" />
      <rect x="40" y="64" width="38" height="5" rx="2" fill="hsl(var(--primary) / 0.2)" />
      <rect x="40" y="76" width="32" height="5" rx="2" fill="hsl(var(--primary) / 0.2)" />
      {/* Sparkles */}
      <motion.circle
        cx="95"
        cy="25"
        r="4"
        fill="hsl(var(--secondary))"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
      <motion.circle
        cx="105"
        cy="40"
        r="3"
        fill="hsl(var(--success))"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      />
    </motion.svg>
  );
};

// Illustration: Tuteur bienveillant
export const TutorIllustration = ({ className = "", size = "md" }: IllustrationProps) => {
  const s = sizes[size];
  return (
    <motion.svg
      width={s}
      height={s}
      viewBox="0 0 120 120"
      fill="none"
      className={className}
    >
      {/* Corps */}
      <motion.ellipse
        cx="60"
        cy="85"
        rx="28"
        ry="20"
        fill="hsl(var(--primary))"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Tête */}
      <circle cx="60" cy="45" r="22" fill="#FFD5C2" />
      {/* Cheveux */}
      <path
        d="M38 40 C38 25, 82 25, 82 40 C82 35, 75 30, 60 30 C45 30, 38 35, 38 40"
        fill="hsl(var(--foreground) / 0.8)"
      />
      {/* Yeux */}
      <motion.ellipse
        cx="52"
        cy="45"
        rx="3"
        ry="4"
        fill="hsl(var(--foreground))"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: [1, 0.1, 1] }}
        transition={{ duration: 3, repeat: Infinity, delay: 2 }}
      />
      <motion.ellipse
        cx="68"
        cy="45"
        rx="3"
        ry="4"
        fill="hsl(var(--foreground))"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: [1, 0.1, 1] }}
        transition={{ duration: 3, repeat: Infinity, delay: 2 }}
      />
      {/* Sourire */}
      <path
        d="M50 55 Q60 65, 70 55"
        stroke="hsl(var(--destructive))"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Main qui salue */}
      <motion.g
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, 20, -20, 20, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        style={{ originX: "85px", originY: "60px" }}
      >
        <ellipse cx="95" cy="50" rx="10" ry="10" fill="#FFD5C2" />
      </motion.g>
      {/* Cœur flottant */}
      <motion.path
        d="M100 25 C100 20, 95 18, 92 22 C89 18, 84 20, 84 25 C84 30, 92 35, 92 35 C92 35, 100 30, 100 25"
        fill="hsl(var(--destructive))"
        initial={{ y: 0, opacity: 1, scale: 0.8 }}
        animate={{ y: [-5, 5, -5], opacity: [0.7, 1, 0.7], scale: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.svg>
  );
};

// Illustration: Cœur / Valeurs
export const HeartIllustration = ({ className = "", size = "md" }: IllustrationProps) => {
  const s = sizes[size];
  return (
    <motion.svg
      width={s}
      height={s}
      viewBox="0 0 120 120"
      fill="none"
      className={className}
    >
      {/* Cœur principal */}
      <motion.path
        d="M60 100 C20 70, 10 40, 35 25 C50 15, 60 30, 60 30 C60 30, 70 15, 85 25 C110 40, 100 70, 60 100"
        fill="hsl(var(--destructive))"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.08, 1, 1.05, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      {/* Reflet */}
      <ellipse cx="45" cy="45" rx="8" ry="6" fill="white" opacity="0.3" />
      {/* Étoiles autour */}
      <motion.path
        d="M20 30 L22 35 L27 35 L23 38 L24 43 L20 40 L16 43 L17 38 L13 35 L18 35 Z"
        fill="hsl(var(--secondary))"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.path
        d="M100 45 L102 50 L107 50 L103 53 L104 58 L100 55 L96 58 L97 53 L93 50 L98 50 Z"
        fill="hsl(var(--primary))"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
      />
      <motion.circle
        cx="95"
        cy="25"
        r="5"
        fill="hsl(var(--success))"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 1.2 }}
      />
    </motion.svg>
  );
};

// Illustration: Globe / Expatriés
export const GlobeIllustration = ({ className = "", size = "md" }: IllustrationProps) => {
  const s = sizes[size];
  return (
    <motion.svg
      width={s}
      height={s}
      viewBox="0 0 120 120"
      fill="none"
      className={className}
    >
      {/* Globe */}
      <circle cx="60" cy="60" r="40" fill="hsl(var(--secondary))" />
      {/* Continents stylisés */}
      <motion.ellipse
        cx="60"
        cy="60"
        rx="40"
        ry="15"
        fill="none"
        stroke="hsl(var(--success))"
        strokeWidth="3"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ originX: "60px", originY: "60px" }}
      />
      <motion.ellipse
        cx="60"
        cy="60"
        rx="15"
        ry="40"
        fill="none"
        stroke="hsl(var(--success))"
        strokeWidth="3"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ originX: "60px", originY: "60px" }}
      />
      {/* Petits points sur le globe */}
      <circle cx="45" cy="50" r="6" fill="hsl(var(--success))" />
      <circle cx="75" cy="65" r="5" fill="hsl(var(--success))" />
      <circle cx="55" cy="75" r="4" fill="hsl(var(--success))" />
      {/* Avion */}
      <motion.g
        initial={{ x: -20, y: 20 }}
        animate={{ x: [-20, 40, -20], y: [20, -20, 20] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M0 0 L15 5 L5 8 L8 15 L0 10 L-8 15 L-5 8 L-15 5 Z"
          fill="hsl(var(--primary))"
          transform="translate(30, 30) rotate(-45)"
        />
      </motion.g>
    </motion.svg>
  );
};

// Illustration: Famille
export const FamilyIllustration = ({ className = "", size = "md" }: IllustrationProps) => {
  const s = sizes[size];
  return (
    <motion.svg
      width={s}
      height={s}
      viewBox="0 0 120 120"
      fill="none"
      className={className}
    >
      {/* Parent 1 */}
      <motion.g
        initial={{ y: 0 }}
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
      >
        <ellipse cx="35" cy="85" rx="15" ry="18" fill="hsl(var(--primary))" />
        <circle cx="35" cy="55" r="14" fill="#FFD5C2" />
        <ellipse cx="31" cy="54" rx="2" ry="2.5" fill="hsl(var(--foreground))" />
        <ellipse cx="39" cy="54" rx="2" ry="2.5" fill="hsl(var(--foreground))" />
        <path d="M30 61 Q35 66, 40 61" stroke="hsl(var(--destructive))" strokeWidth="2" strokeLinecap="round" fill="none" />
      </motion.g>

      {/* Parent 2 */}
      <motion.g
        initial={{ y: 0 }}
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      >
        <ellipse cx="85" cy="85" rx="15" ry="18" fill="hsl(var(--destructive))" />
        <circle cx="85" cy="55" r="14" fill="#FFD5C2" />
        <ellipse cx="81" cy="54" rx="2" ry="2.5" fill="hsl(var(--foreground))" />
        <ellipse cx="89" cy="54" rx="2" ry="2.5" fill="hsl(var(--foreground))" />
        <path d="M80 61 Q85 66, 90 61" stroke="hsl(var(--destructive))" strokeWidth="2" strokeLinecap="round" fill="none" />
      </motion.g>

      {/* Enfant au milieu */}
      <motion.g
        initial={{ y: 0 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ellipse cx="60" cy="95" rx="12" ry="12" fill="hsl(var(--secondary))" />
        <circle cx="60" cy="72" r="11" fill="#FFD5C2" />
        <ellipse cx="57" cy="71" rx="1.5" ry="2" fill="hsl(var(--foreground))" />
        <ellipse cx="63" cy="71" rx="1.5" ry="2" fill="hsl(var(--foreground))" />
        <path d="M56 77 Q60 81, 64 77" stroke="hsl(var(--destructive))" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </motion.g>

      {/* Cœurs flottants */}
      <motion.path
        d="M50 35 C50 32, 47 31, 45 33 C43 31, 40 32, 40 35 C40 38, 45 42, 45 42 C45 42, 50 38, 50 35"
        fill="hsl(var(--destructive) / 0.6)"
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: [0, -10, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.path
        d="M80 30 C80 27, 77 26, 75 28 C73 26, 70 27, 70 30 C70 33, 75 37, 75 37 C75 37, 80 33, 80 30"
        fill="hsl(var(--primary) / 0.6)"
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: [0, -10, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      />
    </motion.svg>
  );
};

// Illustration: Étoile / Prix
export const StarIllustration = ({ className = "", size = "md" }: IllustrationProps) => {
  const s = sizes[size];
  return (
    <motion.svg
      width={s}
      height={s}
      viewBox="0 0 120 120"
      fill="none"
      className={className}
    >
      {/* Étoile principale */}
      <motion.path
        d="M60 15 L70 45 L102 45 L76 65 L86 98 L60 78 L34 98 L44 65 L18 45 L50 45 Z"
        fill="hsl(var(--secondary))"
        initial={{ rotate: 0, scale: 1 }}
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ originX: "60px", originY: "60px" }}
      />
      {/* Reflet */}
      <path
        d="M60 25 L55 40 L50 45 L60 40 Z"
        fill="white"
        opacity="0.4"
      />
      {/* Petites étoiles autour */}
      <motion.path
        d="M20 25 L22 30 L27 30 L23 33 L24 38 L20 35 L16 38 L17 33 L13 30 L18 30 Z"
        fill="hsl(var(--primary))"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.path
        d="M100 70 L102 75 L107 75 L103 78 L104 83 L100 80 L96 83 L97 78 L93 75 L98 75 Z"
        fill="hsl(var(--success))"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
      />
      <motion.circle
        cx="105"
        cy="30"
        r="4"
        fill="hsl(var(--destructive))"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
      />
    </motion.svg>
  );
};

export type IllustrationType = "book" | "tutor" | "heart" | "globe" | "family" | "star";

interface AnimatedIllustrationProps extends IllustrationProps {
  type: IllustrationType;
}

export const AnimatedIllustration = ({ type, ...props }: AnimatedIllustrationProps) => {
  const illustrations = {
    book: BookIllustration,
    tutor: TutorIllustration,
    heart: HeartIllustration,
    globe: GlobeIllustration,
    family: FamilyIllustration,
    star: StarIllustration
  };

  const Component = illustrations[type];
  return <Component {...props} />;
};
