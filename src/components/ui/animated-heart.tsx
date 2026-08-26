// Heart animation adapted from Heroicons Animated (MIT): https://github.com/Aniket-508/heroicons-animated
"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes, MouseEvent } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";

export interface AnimatedHeartHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface AnimatedHeartProps extends HTMLAttributes<HTMLDivElement> {
  filled?: boolean;
  size?: number;
}

const SVG_VARIANTS: Variants = {
  normal: { scale: 1 },
  animate: { scale: [1, 1.16, 0.94, 1.08, 1] },
};

const AnimatedHeart = forwardRef<AnimatedHeartHandle, AnimatedHeartProps>(
  ({ filled = false, onClick, onMouseEnter, onMouseLeave, className, size = 18, ...props }, ref) => {
    const controls = useAnimation();
    const previousFilledRef = useRef(filled);
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    }, [controls]);

    useEffect(() => {
      if (previousFilledRef.current !== filled) {
        controls.start("animate");
        previousFilledRef.current = filled;
      }
    }, [controls, filled]);

    const handleClick = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        controls.start("animate");
        onClick?.(event);
      },
      [controls, onClick],
    );

    const handleMouseEnter = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        if (!isControlledRef.current) controls.start("animate");
        onMouseEnter?.(event);
      },
      [controls, onMouseEnter],
    );

    const handleMouseLeave = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        if (!isControlledRef.current) controls.start("normal");
        onMouseLeave?.(event);
      },
      [controls, onMouseLeave],
    );

    return (
      <div
        aria-hidden="true"
        className={className}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <motion.svg
          animate={controls}
          fill={filled ? "currentColor" : "none"}
          height={size}
          initial="normal"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
          transition={{ duration: 0.45, ease: "easeOut" }}
          variants={SVG_VARIANTS}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
        >
          <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </motion.svg>
      </div>
    );
  },
);

AnimatedHeart.displayName = "AnimatedHeart";

export { AnimatedHeart };
