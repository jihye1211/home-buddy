import { motion } from "framer-motion";
import type { DayPhase } from "@/types";
import { faceForPhase } from "@/utils/character";

interface CharacterFaceProps {
  character: string;
  phase: DayPhase;
  overtimeMs?: number;
}

/**
 * The big buddy at the top of the popover. Renders the expression emoji over
 * the chosen character (e.g. "💻🐰") with a gentle breathing animation.
 */
export function CharacterFace({
  character,
  phase,
  overtimeMs = 0,
}: CharacterFaceProps) {
  const face = faceForPhase(phase, overtimeMs);

  return (
    <motion.div
      className="relative flex items-center justify-center text-5xl leading-none"
      animate={{ scale: [1, 1.04, 1] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      aria-label={`${phase} ${character}`}
    >
      <span className="select-none">{character}</span>
      <motion.span
        key={face}
        className="absolute -right-1 -top-1 text-2xl"
        initial={{ scale: 0, rotate: -20, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {face}
      </motion.span>
    </motion.div>
  );
}
