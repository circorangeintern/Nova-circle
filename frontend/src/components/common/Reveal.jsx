import { motion } from 'framer-motion'

/**
 * Reveal — scroll-triggered fade + rise (max 20px translation, ~250ms per
 * Landing §3.1). Wrap any section/card. `delay` staggers grouped children.
 * Framer Motion automatically respects prefers-reduced-motion via MotionConfig.
 */
export function Reveal({ children, delay = 0, y = 16, className, as = 'div' }) {
  const MotionTag = motion[as] ?? motion.div
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  )
}
