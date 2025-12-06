import Lottie from "lottie-react";
import { motion } from "framer-motion";

// Animation data intégrée pour éviter les appels réseau
// Ces animations sont stylisées et enfantines

const bookAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "Book",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Book",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [-5], e: [5] },
            { t: 30, s: [5], e: [-5] },
            { t: 60, s: [-5] }
          ]
        },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 100], e: [105, 105, 100] },
            { t: 30, s: [105, 105, 100], e: [100, 100, 100] },
            { t: 60, s: [100, 100, 100] }
          ]
        }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [80, 100] },
              p: { a: 0, k: [0, 0] },
              r: { a: 0, k: 8 }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.42, 0.36, 0.86, 1] },
              o: { a: 0, k: 100 }
            }
          ]
        },
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [70, 90] },
              p: { a: 0, k: [0, 0] },
              r: { a: 0, k: 4 }
            },
            {
              ty: "fl",
              c: { a: 0, k: [1, 1, 1, 1] },
              o: { a: 0, k: 100 }
            }
          ]
        },
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [50, 6] },
              p: { a: 0, k: [0, -25] },
              r: { a: 0, k: 3 }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.42, 0.36, 0.86, 0.5] },
              o: { a: 0, k: 100 }
            }
          ]
        },
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [40, 6] },
              p: { a: 0, k: [0, -10] },
              r: { a: 0, k: 3 }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.42, 0.36, 0.86, 0.3] },
              o: { a: 0, k: 100 }
            }
          ]
        },
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [55, 6] },
              p: { a: 0, k: [0, 5] },
              r: { a: 0, k: 3 }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.42, 0.36, 0.86, 0.3] },
              o: { a: 0, k: 100 }
            }
          ]
        }
      ],
      ip: 0,
      op: 60,
      st: 0
    }
  ]
};

const tutorAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 90,
  w: 200,
  h: 200,
  nm: "Tutor",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Hand Wave",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [15] },
            { t: 15, s: [15], e: [-15] },
            { t: 30, s: [-15], e: [15] },
            { t: 45, s: [15], e: [-15] },
            { t: 60, s: [-15], e: [0] },
            { t: 90, s: [0] }
          ]
        },
        p: { a: 0, k: [140, 100, 0] },
        a: { a: 0, k: [0, 20, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              s: { a: 0, k: [25, 25] },
              p: { a: 0, k: [0, 0] }
            },
            {
              ty: "fl",
              c: { a: 0, k: [1, 0.85, 0.72, 1] },
              o: { a: 0, k: 100 }
            }
          ]
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Body",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 120, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 100], e: [100, 102, 100] },
            { t: 45, s: [100, 102, 100], e: [100, 100, 100] },
            { t: 90, s: [100, 100, 100] }
          ]
        }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [60, 50] },
              p: { a: 0, k: [0, 20] },
              r: { a: 0, k: 10 }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.42, 0.36, 0.86, 1] },
              o: { a: 0, k: 100 }
            }
          ]
        },
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              s: { a: 0, k: [50, 50] },
              p: { a: 0, k: [0, -25] }
            },
            {
              ty: "fl",
              c: { a: 0, k: [1, 0.85, 0.72, 1] },
              o: { a: 0, k: 100 }
            }
          ]
        },
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              s: { a: 0, k: [8, 8] },
              p: { a: 0, k: [-10, -28] }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.2, 0.2, 0.2, 1] },
              o: { a: 0, k: 100 }
            }
          ]
        },
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              s: { a: 0, k: [8, 8] },
              p: { a: 0, k: [10, -28] }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.2, 0.2, 0.2, 1] },
              o: { a: 0, k: 100 }
            }
          ]
        },
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              s: { a: 0, k: [20, 10] },
              p: { a: 0, k: [0, -15] }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.95, 0.6, 0.5, 1] },
              o: { a: 0, k: 100 }
            }
          ]
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    }
  ]
};

const heartAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "Heart",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Heart",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 105, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 100], e: [115, 115, 100] },
            { t: 15, s: [115, 115, 100], e: [100, 100, 100] },
            { t: 30, s: [100, 100, 100], e: [110, 110, 100] },
            { t: 45, s: [110, 110, 100], e: [100, 100, 100] },
            { t: 60, s: [100, 100, 100] }
          ]
        }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "sh",
              d: 1,
              ks: {
                a: 0,
                k: {
                  c: true,
                  v: [[0, 25], [-40, -15], [-40, -35], [0, -15], [40, -35], [40, -15]],
                  i: [[0, 0], [-25, 20], [0, -20], [0, 20], [0, -20], [25, 20]],
                  o: [[0, 0], [0, 20], [-25, 0], [0, -20], [25, 0], [0, 20]]
                }
              }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.93, 0.35, 0.45, 1] },
              o: { a: 0, k: 100 }
            }
          ]
        }
      ],
      ip: 0,
      op: 60,
      st: 0
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Sparkle1",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [100] },
            { t: 15, s: [100], e: [0] },
            { t: 30, s: [0], e: [100] },
            { t: 45, s: [100], e: [0] },
            { t: 60, s: [0] }
          ]
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [145, 65, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [60, 60, 100] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "sr",
              sy: 1,
              d: 1,
              pt: { a: 0, k: 4 },
              p: { a: 0, k: [0, 0] },
              r: { a: 0, k: 0 },
              ir: { a: 0, k: 3 },
              is: { a: 0, k: 0 },
              or: { a: 0, k: 10 },
              os: { a: 0, k: 0 }
            },
            {
              ty: "fl",
              c: { a: 0, k: [1, 0.85, 0.3, 1] },
              o: { a: 0, k: 100 }
            }
          ]
        }
      ],
      ip: 0,
      op: 60,
      st: 0
    }
  ]
};

const globeAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 120,
  w: 200,
  h: 200,
  nm: "Globe",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Globe",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [360] },
            { t: 120, s: [360] }
          ]
        },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              s: { a: 0, k: [80, 80] },
              p: { a: 0, k: [0, 0] }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.35, 0.75, 0.85, 1] },
              o: { a: 0, k: 100 }
            }
          ]
        },
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              s: { a: 0, k: [80, 30] },
              p: { a: 0, k: [0, 0] }
            },
            {
              ty: "st",
              c: { a: 0, k: [0.3, 0.65, 0.4, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 3 }
            }
          ]
        },
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              s: { a: 0, k: [30, 80] },
              p: { a: 0, k: [0, 0] }
            },
            {
              ty: "st",
              c: { a: 0, k: [0.3, 0.65, 0.4, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 3 }
            }
          ]
        }
      ],
      ip: 0,
      op: 120,
      st: 0
    }
  ]
};

const familyAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 90,
  w: 200,
  h: 200,
  nm: "Family",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Adult1",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [70, 110, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 100], e: [100, 98, 100] },
            { t: 45, s: [100, 98, 100], e: [100, 100, 100] },
            { t: 90, s: [100, 100, 100] }
          ]
        }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [35, 45] },
              p: { a: 0, k: [0, 15] },
              r: { a: 0, k: 8 }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.42, 0.36, 0.86, 1] },
              o: { a: 0, k: 100 }
            }
          ]
        },
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              s: { a: 0, k: [30, 30] },
              p: { a: 0, k: [0, -15] }
            },
            {
              ty: "fl",
              c: { a: 0, k: [1, 0.85, 0.72, 1] },
              o: { a: 0, k: 100 }
            }
          ]
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Adult2",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [130, 110, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 100], e: [100, 98, 100] },
            { t: 45, s: [100, 98, 100], e: [100, 100, 100] },
            { t: 90, s: [100, 100, 100] }
          ]
        }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [35, 45] },
              p: { a: 0, k: [0, 15] },
              r: { a: 0, k: 8 }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.93, 0.35, 0.45, 1] },
              o: { a: 0, k: 100 }
            }
          ]
        },
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              s: { a: 0, k: [30, 30] },
              p: { a: 0, k: [0, -15] }
            },
            {
              ty: "fl",
              c: { a: 0, k: [1, 0.85, 0.72, 1] },
              o: { a: 0, k: 100 }
            }
          ]
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    },
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: "Child",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            { t: 0, s: [100, 130, 0], e: [100, 125, 0] },
            { t: 22, s: [100, 125, 0], e: [100, 130, 0] },
            { t: 45, s: [100, 130, 0], e: [100, 125, 0] },
            { t: 67, s: [100, 125, 0], e: [100, 130, 0] },
            { t: 90, s: [100, 130, 0] }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [25, 30] },
              p: { a: 0, k: [0, 10] },
              r: { a: 0, k: 6 }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.35, 0.75, 0.85, 1] },
              o: { a: 0, k: 100 }
            }
          ]
        },
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              s: { a: 0, k: [22, 22] },
              p: { a: 0, k: [0, -8] }
            },
            {
              ty: "fl",
              c: { a: 0, k: [1, 0.85, 0.72, 1] },
              o: { a: 0, k: 100 }
            }
          ]
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    }
  ]
};

const starAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "Star",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Star",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [15] },
            { t: 30, s: [15], e: [0] },
            { t: 60, s: [0] }
          ]
        },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 100], e: [110, 110, 100] },
            { t: 30, s: [110, 110, 100], e: [100, 100, 100] },
            { t: 60, s: [100, 100, 100] }
          ]
        }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "sr",
              sy: 1,
              d: 1,
              pt: { a: 0, k: 5 },
              p: { a: 0, k: [0, 0] },
              r: { a: 0, k: 0 },
              ir: { a: 0, k: 20 },
              is: { a: 0, k: 0 },
              or: { a: 0, k: 45 },
              os: { a: 0, k: 0 }
            },
            {
              ty: "fl",
              c: { a: 0, k: [1, 0.8, 0.2, 1] },
              o: { a: 0, k: 100 }
            }
          ]
        }
      ],
      ip: 0,
      op: 60,
      st: 0
    }
  ]
};

export type AnimationType = "book" | "tutor" | "heart" | "globe" | "family" | "star";

interface LottieAnimationProps {
  type: AnimationType;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const animations: Record<AnimationType, object> = {
  book: bookAnimation,
  tutor: tutorAnimation,
  heart: heartAnimation,
  globe: globeAnimation,
  family: familyAnimation,
  star: starAnimation
};

const sizes = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-40 h-40"
};

export const LottieAnimation = ({ 
  type, 
  className = "",
  size = "md"
}: LottieAnimationProps) => {
  return (
    <motion.div 
      className={`${sizes[size]} ${className}`}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Lottie 
        animationData={animations[type]} 
        loop={true}
        className="w-full h-full"
      />
    </motion.div>
  );
};
