"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedGridPatternProps {
  width?: number;
  height?: number;
  numSquares?: number;
  maxOpacity?: number;
  duration?: number;
  repeatDelay?: number;
  className?: string;
}

export function AnimatedGridPattern({
  width = 40,
  height = 40,
  numSquares = 50,
  maxOpacity = 0.5,
  duration = 4,
  repeatDelay = 0.5,
  className,
}: AnimatedGridPatternProps) {
  const id = "animated-grid-pattern";

  const squares = Array.from({ length: numSquares }, (_, i) => ({
    id: i,
    x: Math.floor(Math.random() * 100),
    y: Math.floor(Math.random() * 100),
    delay: Math.random() * duration,
  }));

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-current stroke-current",
        className,
      )}
      {...({ width: "100%", height: "100%" } as any)}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x="50%"
          y="50%"
        >
          <path
            d={`M.5,${height}V.5H${width}`}
            fill="none"
            strokeDasharray="0"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x="50%" y="50%" className="overflow-visible">
        {squares.map(({ id, x, y, delay }) => (
          <motion.rect
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, maxOpacity, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              repeatDelay,
              ease: "easeInOut",
            }}
            key={id}
            width={width - 1}
            height={height - 1}
            x={x * width - width / 2}
            y={y * height - height / 2}
            fill="currentColor"
            strokeWidth="0"
          />
        ))}
      </svg>
    </svg>
  );
}